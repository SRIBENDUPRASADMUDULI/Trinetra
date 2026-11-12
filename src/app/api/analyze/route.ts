import { NextRequest, NextResponse } from 'next/server'
import { callAIHarness } from '@/lib/ai-harness'
import { env } from '@/lib/env'
import { extractUrlFeatures, type UrlFeatures } from '@/lib/crypto-utils'

export interface UrlReputationResult {
  url: string
  lexical: UrlFeatures
  safeBrowsing: {
    checked: boolean
    status: 'CLEAN' | 'THREAT_DETECTED' | 'NOT_CONFIGURED' | 'ERROR'
    threatTypes?: string[]
  }
  virusTotal: {
    checked: boolean
    status: 'CLEAN' | 'MALICIOUS' | 'SUSPICIOUS' | 'NOT_CONFIGURED' | 'ERROR'
    maliciousCount?: number
    harmlessCount?: number
  }
  urlhaus: {
    checked: boolean
    status: 'LISTED_MALWARE' | 'NOT_LISTED' | 'ERROR'
    threat?: string
  }
  openPhish: {
    checked: boolean
    status: 'LISTED_PHISHING' | 'NOT_LISTED' | 'ERROR'
  }
}

export interface HfPhishingSignal {
  checked: boolean
  model: string
  label?: string
  score?: number
  phishingProbability?: number
  status: 'SCORED' | 'NOT_CONFIGURED' | 'ERROR'
}

export interface AnalyzeResponsePayload {
  verdict: string
  confidence: string
  threatType: string
  category: string
  urgencyScore: number
  impersonationScore: number
  linkRiskScore: number
  flags: string[]
  recommendation: string
  extractedUrls: string[]
  urlReputations: UrlReputationResult[]
  hfSignal?: HfPhishingSignal
  provider: string
  model: string
  latencyMs: number
  requestId?: string
}

const PHISHING_SYSTEM_PROMPT = `You are TRINETRA NLP Threat Forensics Engine. Analyze suspicious SMS, WhatsApp forwards, emails, and URLs (in English, Hindi, or Hinglish) for social engineering, phishing, banking impersonation, utility scams, and fraudulent infrastructure.

Respond ONLY with a valid JSON object matching this exact schema (no markdown, no backticks):
{
  "verdict": "HIGH CONFIDENCE PHISHING SCAM" | "SUSPICIOUS LURE" | "BENIGN / LOW RISK MESSAGE",
  "confidence": "XX.X%",
  "threatType": "concise threat classification",
  "category": "BANKING FRAUD" | "UTILITY SCAM" | "GOVT IMPERSONATION" | "SOCIAL ENGINEERING" | "BENIGN",
  "urgencyScore": 0-100,
  "impersonationScore": 0-100,
  "linkRiskScore": 0-100,
  "flags": ["specific forensic red flag 1", "specific forensic red flag 2", "specific forensic red flag 3"],
  "recommendation": "clear defensive action for an Indian citizen (cite 1930 cyber helpline / cybercrime.gov.in if financial or impersonation risk)"
}`

let openPhishCache: { fetchedAt: number; urls: Set<string> } | null = null
const OPENPHISH_TTL_MS = 10 * 60 * 1000

function extractUrlsFromText(text: string, explicitUrl?: string): string[] {
  const matches = text.match(/https?:\/\/[^\s"'<>]+/gi) ?? []
  const set = new Set<string>()
  if (explicitUrl && explicitUrl.trim()) {
    set.add(explicitUrl.trim())
  }
  for (const m of matches) {
    set.add(m.replace(/[),.;!?]+$/, ''))
  }
  return Array.from(set).slice(0, 3)
}

async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function checkSafeBrowsing(targetUrl: string): Promise<UrlReputationResult['safeBrowsing']> {
  if (!env.GOOGLE_SAFE_BROWSING_KEY) {
    return { checked: false, status: 'NOT_CONFIGURED' }
  }
  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(env.GOOGLE_SAFE_BROWSING_KEY)}`
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'trinetra-soc', clientVersion: '2.4.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: targetUrl }],
        },
      }),
    })
    if (!res.ok) return { checked: true, status: 'ERROR' }
    const data = await res.json() as { matches?: Array<{ threatType: string }> }
    if (Array.isArray(data.matches) && data.matches.length > 0) {
      return {
        checked: true,
        status: 'THREAT_DETECTED',
        threatTypes: Array.from(new Set(data.matches.map(m => m.threatType))),
      }
    }
    return { checked: true, status: 'CLEAN' }
  } catch {
    return { checked: true, status: 'ERROR' }
  }
}

async function checkVirusTotal(targetUrl: string): Promise<UrlReputationResult['virusTotal']> {
  if (!env.VIRUSTOTAL_API_KEY) {
    return { checked: false, status: 'NOT_CONFIGURED' }
  }
  try {
    const urlId = Buffer.from(targetUrl)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const res = await fetchWithTimeout(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': env.VIRUSTOTAL_API_KEY },
    })
    if (!res.ok) return { checked: true, status: 'ERROR' }
    const data = await res.json() as {
      data?: { attributes?: { last_analysis_stats?: { malicious?: number; suspicious?: number; harmless?: number } } }
    }
    const stats = data.data?.attributes?.last_analysis_stats
    const malicious = stats?.malicious ?? 0
    const suspicious = stats?.suspicious ?? 0
    const harmless = stats?.harmless ?? 0
    return {
      checked: true,
      status: malicious > 0 ? 'MALICIOUS' : suspicious > 0 ? 'SUSPICIOUS' : 'CLEAN',
      maliciousCount: malicious,
      harmlessCount: harmless,
    }
  } catch {
    return { checked: true, status: 'ERROR' }
  }
}

async function checkUrlhaus(targetUrl: string): Promise<UrlReputationResult['urlhaus']> {
  try {
    const body = new URLSearchParams({ url: targetUrl })
    const res = await fetchWithTimeout('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) return { checked: true, status: 'ERROR' }
    const data = await res.json() as { query_status?: string; threat?: string }
    if (data.query_status === 'ok') {
      return { checked: true, status: 'LISTED_MALWARE', threat: data.threat || 'malware_download' }
    }
    return { checked: true, status: 'NOT_LISTED' }
  } catch {
    return { checked: true, status: 'ERROR' }
  }
}

async function checkOpenPhish(targetUrl: string): Promise<UrlReputationResult['openPhish']> {
  try {
    const now = Date.now()
    if (!openPhishCache || now - openPhishCache.fetchedAt > OPENPHISH_TTL_MS) {
      const res = await fetchWithTimeout('https://openphish.com/feed.txt', {}, 2500)
      if (!res.ok) return { checked: true, status: 'ERROR' }
      const text = await res.text()
      const lines = text.split(/\r?\n/).map(l => l.trim().toLowerCase()).filter(Boolean)
      openPhishCache = { fetchedAt: now, urls: new Set(lines) }
    }
    const normalized = targetUrl.trim().toLowerCase()
    const listed = openPhishCache.urls.has(normalized)
    return { checked: true, status: listed ? 'LISTED_PHISHING' : 'NOT_LISTED' }
  } catch {
    return { checked: true, status: 'ERROR' }
  }
}

const HF_PHISHING_MODEL = 'Horizon-Labs/phishing-scam-detector-base'

async function checkHuggingFacePhishing(text: string): Promise<HfPhishingSignal> {
  if (!env.HF_TOKEN) {
    return { checked: false, model: HF_PHISHING_MODEL, status: 'NOT_CONFIGURED' }
  }
  const snippet = text.trim().slice(0, 512)
  if (!snippet) {
    return { checked: false, model: HF_PHISHING_MODEL, status: 'NOT_CONFIGURED' }
  }
  try {
    const res = await fetchWithTimeout(
      `https://router.huggingface.co/hf-inference/models/${HF_PHISHING_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: snippet }),
      },
      4000
    )
    if (!res.ok) {
      return { checked: true, model: HF_PHISHING_MODEL, status: 'ERROR' }
    }
    const raw = (await res.json()) as unknown
    const candidates = Array.isArray(raw)
      ? Array.isArray(raw[0])
        ? (raw[0] as Array<{ label?: string; score?: number }>)
        : (raw as Array<{ label?: string; score?: number }>)
      : []

    const valid = candidates.filter(
      (item): item is { label: string; score: number } =>
        typeof item?.label === 'string' && typeof item?.score === 'number'
    )
    if (valid.length === 0) {
      return { checked: true, model: HF_PHISHING_MODEL, status: 'ERROR' }
    }

    const sorted = [...valid].sort((a, b) => b.score - a.score)
    const top = sorted[0]
    const phishingEntry = valid.find((c) => /phish|scam|spam|malicious|fraud|label_1|positive/i.test(c.label))
    const phishingProbability = phishingEntry
      ? phishingEntry.score
      : /phish|scam|spam|malicious|fraud|label_1|positive/i.test(top.label)
      ? top.score
      : Math.max(0, 1 - top.score)

    return {
      checked: true,
      model: HF_PHISHING_MODEL,
      label: top.label,
      score: Number(top.score.toFixed(4)),
      phishingProbability: Number(phishingProbability.toFixed(4)),
      status: 'SCORED',
    }
  } catch {
    return { checked: true, model: HF_PHISHING_MODEL, status: 'ERROR' }
  }
}

async function inspectUrlReputations(urls: string[]): Promise<UrlReputationResult[]> {
  return Promise.all(
    urls.map(async u => {
      const lexical = extractUrlFeatures(u)
      const [safeBrowsing, virusTotal, urlhaus, openPhish] = await Promise.all([
        checkSafeBrowsing(u),
        checkVirusTotal(u),
        checkUrlhaus(u),
        checkOpenPhish(u),
      ])
      return { url: u, lexical, safeBrowsing, virusTotal, urlhaus, openPhish }
    })
  )
}

function analyzeDeterministically(
  text: string,
  urlReputations: UrlReputationResult[],
  hfSignal?: HfPhishingSignal
): Omit<AnalyzeResponsePayload, 'extractedUrls' | 'urlReputations' | 'hfSignal' | 'provider' | 'model' | 'latencyMs'> {
  const lower = text.toLowerCase()

  const urgencyMarkers = [
    'immediately', 'urgent', 'today', 'tonight', 'blocked', 'suspended', 'freeze',
    'disconnect', 'within 24 hours', '12:00', '9:30', 'expire', 'expiry', 'penalty',
    'तुरंत', 'ब्लॉक', 'फ्रीज', 'आज रात', 'बंद',
  ]
  const impersonationMarkers = [
    'sbi', 'hdfc', 'icici', 'axis', 'rbi', 'npci', 'upi', 'kyc', 'aadhaar', 'pan',
    'income tax', 'electricity', 'discom', 'helpdesk', 'officer', 'department', 'refund',
    'ग्राहक', 'खाता', 'आधार', 'पैन', 'बिजली',
  ]

  const urgencyHits = urgencyMarkers.filter(k => lower.includes(k))
  const impHits = impersonationMarkers.filter(k => lower.includes(k))

  const maxLexicalRisk = urlReputations.length
    ? Math.max(...urlReputations.map(r => r.lexical.riskScore))
    : 12

  const externalThreatHit = urlReputations.some(
    r =>
      r.safeBrowsing.status === 'THREAT_DETECTED' ||
      r.virusTotal.status === 'MALICIOUS' ||
      r.urlhaus.status === 'LISTED_MALWARE' ||
      r.openPhish.status === 'LISTED_PHISHING'
  )

  const linkRiskScore = externalThreatHit ? Math.max(94, maxLexicalRisk) : maxLexicalRisk
  const urgencyScore = Math.min(98, urgencyHits.length > 0 ? 52 + urgencyHits.length * 14 : 14)
  const impersonationScore = Math.min(99, impHits.length > 0 ? 50 + impHits.length * 13 : 12)
  const hfBoost =
    hfSignal?.status === 'SCORED' && typeof hfSignal.phishingProbability === 'number'
      ? Math.round(hfSignal.phishingProbability * 100 * 0.85)
      : 0
  const overall = Math.max(
    hfBoost,
    Math.round(urgencyScore * 0.34 + impersonationScore * 0.36 + linkRiskScore * 0.30)
  )

  const flags: string[] = []
  if (urgencyHits.length > 0) {
    flags.push(`Artificial Panic Trigger detected (${urgencyHits.slice(0, 3).join(', ')})`)
  }
  if (impHits.length > 0) {
    flags.push(`Institutional / Statutory Keyword Impersonation (${impHits.slice(0, 3).join(', ')})`)
  }
  for (const rep of urlReputations) {
    if (rep.safeBrowsing.status === 'THREAT_DETECTED') {
      flags.push(`Google Safe Browsing flagged ${rep.url} (${rep.safeBrowsing.threatTypes?.join(', ')})`)
    }
    if (rep.virusTotal.status === 'MALICIOUS') {
      flags.push(`VirusTotal engines flagged ${rep.url} (${rep.virusTotal.maliciousCount} malicious detections)`)
    }
    if (rep.urlhaus.status === 'LISTED_MALWARE') {
      flags.push(`Abuse.ch URLhaus active malware listing (${rep.urlhaus.threat})`)
    }
    if (rep.openPhish.status === 'LISTED_PHISHING') {
      flags.push(`OpenPhish live feed match for ${rep.url}`)
    }
    if (rep.lexical.riskScore >= 50) {
      flags.push(`High-risk link structure detected (${rep.url} — Risk ${rep.lexical.riskScore}/100, Shannon Entropy ${rep.lexical.entropy.toFixed(2)})`)
    }
  }
  if (/\+91[-\s]?\d{10}|\b[6-9]\d{9}\b/.test(text)) {
    flags.push('Unverified 10-digit personal mobile number used for official support claims')
  }
  if (
    hfSignal?.status === 'SCORED' &&
    typeof hfSignal.phishingProbability === 'number' &&
    hfSignal.phishingProbability >= 0.65
  ) {
    flags.push(
      `Hugging Face ML classifier flagged ${(hfSignal.phishingProbability * 100).toFixed(1)}% phishing probability (${hfSignal.label})`
    )
  }
  if (flags.length === 0) {
    flags.push('No urgency coercion, spoofed TLD, or institutional lure patterns detected')
  }

  let category = 'BENIGN'
  if (lower.includes('tax') || lower.includes('refund') || lower.includes('govt')) {
    category = 'GOVT IMPERSONATION'
  } else if (lower.includes('electricity') || lower.includes('bill') || lower.includes('bijli')) {
    category = 'UTILITY SCAM'
  } else if (impHits.length > 0) {
    category = 'BANKING FRAUD'
  } else if (overall >= 50 || linkRiskScore >= 60) {
    category = 'SOCIAL ENGINEERING'
  }

  const verdict =
    overall >= 68 || externalThreatHit
      ? 'HIGH CONFIDENCE PHISHING SCAM'
      : overall >= 42
      ? 'SUSPICIOUS LURE'
      : 'BENIGN / LOW RISK MESSAGE'

  const threatType =
    overall >= 68 || externalThreatHit
      ? 'Credential Harvesting & Urgency Coercion'
      : overall >= 42
      ? 'Unverified Social Engineering Prompt'
      : 'Standard Non-Coercive Communication'

  const recommendation =
    overall >= 42 || externalThreatHit
      ? 'Do NOT click embedded links, share OTP/UPI PIN, or call unverified numbers. Verify directly via official bank/gov.in portals and dial 1930 or report on cybercrime.gov.in if compromised.'
      : 'No active social engineering lures detected. Always verify sender identity independently before sharing sensitive details.'

  return {
    verdict,
    confidence: `${Math.max(15, Math.min(98.5, overall)).toFixed(1)}%`,
    threatType,
    category,
    urgencyScore,
    impersonationScore,
    linkRiskScore,
    flags: flags.slice(0, 6),
    recommendation,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text = typeof body?.text === 'string' ? body.text.trim() : ''
    const explicitUrl = typeof body?.url === 'string' ? body.url.trim() : ''

    if (text.length < 4 && explicitUrl.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Provide message text or URL to analyze' },
        { status: 400 }
      )
    }

    const start = performance.now()
    const extractedUrls = extractUrlsFromText(text, explicitUrl)
    const combinedInput = [text, explicitUrl ? `Explicit URL: ${explicitUrl}` : ''].filter(Boolean).join('\n')
    const [urlReputations, hfSignal] = await Promise.all([
      inspectUrlReputations(extractedUrls),
      checkHuggingFacePhishing(combinedInput),
    ])
    const deterministic = analyzeDeterministically(combinedInput, urlReputations, hfSignal)

    try {
      const repContext = [
        urlReputations.length ? `URL REPUTATION TELEMETRY:\n${JSON.stringify(urlReputations, null, 2)}` : '',
        hfSignal.status === 'SCORED' ? `HUGGING FACE ML CLASSIFIER SIGNAL:\n${JSON.stringify(hfSignal, null, 2)}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
      const contextBlock = repContext ? `\n\n${repContext}` : ''

      const harnessRes = await callAIHarness(
        [{ role: 'user', content: `Analyze this payload:\n\n${combinedInput.slice(0, 2500)}${contextBlock}` }],
        {
          systemPrompt: PHISHING_SYSTEM_PROMPT,
          temperature: 0.15,
          maxTokens: 650,
          jsonMode: true,
          fastTriage: true,
        }
      )

      if (
        harnessRes.provider !== 'deterministic-kernel' &&
        harnessRes.content &&
        !harnessRes.content.includes('[DETERMINISTIC_SECURITY_KERNEL]')
      ) {
        const cleaned = harnessRes.content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
        const parsed = JSON.parse(cleaned)
        if (parsed && typeof parsed.verdict === 'string' && Array.isArray(parsed.flags)) {
          return NextResponse.json({
            success: true,
            analysis: {
              verdict: parsed.verdict,
              confidence: String(parsed.confidence || deterministic.confidence),
              threatType: String(parsed.threatType || deterministic.threatType),
              category: String(parsed.category || deterministic.category),
              urgencyScore: Number(parsed.urgencyScore ?? deterministic.urgencyScore),
              impersonationScore: Number(parsed.impersonationScore ?? deterministic.impersonationScore),
              linkRiskScore: Number(parsed.linkRiskScore ?? deterministic.linkRiskScore),
              flags: parsed.flags.slice(0, 6).map(String),
              recommendation: String(parsed.recommendation || deterministic.recommendation),
              extractedUrls,
              urlReputations,
              hfSignal,
              provider: harnessRes.provider,
              model: harnessRes.model,
              latencyMs: harnessRes.latencyMs,
              requestId: harnessRes.requestId,
            } satisfies AnalyzeResponsePayload,
          })
        }
      }
    } catch {
      // Fall through to deterministic heuristic engine
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...deterministic,
        extractedUrls,
        urlReputations,
        hfSignal,
        provider: 'deterministic-kernel',
        model: 'trinetra-nlp-heuristics',
        latencyMs: Math.max(1, Math.round(performance.now() - start)),
      } satisfies AnalyzeResponsePayload,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
