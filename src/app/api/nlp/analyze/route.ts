import { NextRequest, NextResponse } from 'next/server'
import { callAIHarness } from '@/lib/ai-harness'

export interface NlpAnalysisResult {
  verdict: string
  confidence: string
  threatType: string
  category: string
  urgencyScore: number
  impersonationScore: number
  linkRiskScore: number
  flags: string[]
  recommendation: string
  provider: string
  model: string
  latencyMs: number
}

const NLP_SYSTEM_PROMPT = `You are TRINETRA NLP Threat Forensics Engine. Analyze SMS, WhatsApp forwards, and emails in English, Hindi, or Hinglish for phishing, banking fraud, utility scams, and government impersonation.

Respond ONLY with a valid JSON object matching this exact schema (no markdown, no backticks):
{
  "verdict": "HIGH CONFIDENCE PHISHING SCAM" | "SUSPICIOUS LURE" | "BENIGN / LOW RISK MESSAGE",
  "confidence": "XX.X%",
  "threatType": "concise threat classification",
  "category": "BANKING FRAUD" | "UTILITY SCAM" | "GOVT IMPERSONATION" | "SOCIAL ENGINEERING" | "BENIGN",
  "urgencyScore": 0-100,
  "impersonationScore": 0-100,
  "linkRiskScore": 0-100,
  "flags": ["specific red flag 1", "specific red flag 2", "specific red flag 3"],
  "recommendation": "clear defensive action for an Indian citizen (mention 1930 helpline if financial fraud)"
}`

function analyzeDeterministically(text: string): Omit<NlpAnalysisResult, 'provider' | 'model' | 'latencyMs'> {
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
  const suspiciousLinkRegex = /https?:\/\/[^\s]+/gi
  const links = text.match(suspiciousLinkRegex) ?? []

  const urgencyHits = urgencyMarkers.filter(k => lower.includes(k))
  const impHits = impersonationMarkers.filter(k => lower.includes(k))

  let linkRisk = 12
  const riskyTlds = ['.xyz', '.site', '.online', '.top', '.club', '.buzz', '.tk', '.ml']
  const hasRiskyTld = links.some(u => riskyTlds.some(tld => u.toLowerCase().includes(tld)))
  const hasIpLink = links.some(u => /https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(u))
  const hasInsecureHttp = links.some(u => u.toLowerCase().startsWith('http://'))

  if (hasRiskyTld) linkRisk += 55
  if (hasIpLink) linkRisk += 60
  if (hasInsecureHttp) linkRisk += 22
  if (links.length > 0 && linkRisk < 40) linkRisk = 45
  linkRisk = Math.min(99, linkRisk)

  const urgencyScore = Math.min(98, urgencyHits.length > 0 ? 52 + urgencyHits.length * 14 : 14)
  const impersonationScore = Math.min(99, impHits.length > 0 ? 50 + impHits.length * 13 : 12)
  const overall = Math.round(urgencyScore * 0.34 + impersonationScore * 0.36 + linkRisk * 0.30)

  const flags: string[] = []
  if (urgencyHits.length > 0) {
    flags.push(`Artificial Panic Trigger detected (${urgencyHits.slice(0, 3).join(', ')})`)
  }
  if (impHits.length > 0) {
    flags.push(`Institutional / Statutory Keyword Impersonation (${impHits.slice(0, 3).join(', ')})`)
  }
  if (hasRiskyTld || hasIpLink) {
    flags.push(`High-risk unofficial link infrastructure (${links[0]})`)
  } else if (hasInsecureHttp) {
    flags.push(`Unencrypted HTTP credential link embedded (${links[0]})`)
  }
  if (/\+91[-\s]?\d{10}|\b[6-9]\d{9}\b/.test(text)) {
    flags.push('Unverified 10-digit personal mobile number used for official support claims')
  }
  if (flags.length === 0) {
    flags.push('No known urgency coercion, spoofed TLD, or institutional lure patterns matched')
  }

  let category = 'BENIGN'
  if (lower.includes('tax') || lower.includes('refund') || lower.includes('govt')) {
    category = 'GOVT IMPERSONATION'
  } else if (lower.includes('electricity') || lower.includes('bill') || lower.includes('bijli')) {
    category = 'UTILITY SCAM'
  } else if (impHits.length > 0) {
    category = 'BANKING FRAUD'
  } else if (overall >= 50) {
    category = 'SOCIAL ENGINEERING'
  }

  const verdict =
    overall >= 70
      ? 'HIGH CONFIDENCE PHISHING SCAM'
      : overall >= 45
      ? 'SUSPICIOUS LURE'
      : 'BENIGN / LOW RISK MESSAGE'

  const threatType =
    overall >= 70
      ? 'Credential Harvesting & Urgency Coercion'
      : overall >= 45
      ? 'Unverified Social Engineering Prompt'
      : 'Standard Non-Coercive Communication'

  const recommendation =
    overall >= 45
      ? 'Do NOT click embedded links, share OTP/UPI PIN, or call unverified numbers. Verify directly via official bank/gov.in portals and dial 1930 or report on cybercrime.gov.in if compromised.'
      : 'No active social engineering lures detected. Continue verifying sender identity before sharing sensitive details.'

  return {
    verdict,
    confidence: `${Math.max(15, Math.min(99.2, overall)).toFixed(1)}%`,
    threatType,
    category,
    urgencyScore,
    impersonationScore,
    linkRiskScore: linkRisk,
    flags,
    recommendation,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text = typeof body?.text === 'string' ? body.text.trim() : ''

    if (text.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Message text must be at least 5 characters' },
        { status: 400 }
      )
    }

    const start = performance.now()
    const deterministic = analyzeDeterministically(text)

    try {
      const harnessRes = await callAIHarness(
        [{ role: 'user', content: `Analyze this message:\n\n${text.slice(0, 2500)}` }],
        {
          systemPrompt: NLP_SYSTEM_PROMPT,
          temperature: 0.15,
          maxTokens: 600,
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
              provider: harnessRes.provider,
              model: harnessRes.model,
              latencyMs: harnessRes.latencyMs,
            } satisfies NlpAnalysisResult,
          })
        }
      }
    } catch {
      // Fall back cleanly to multilingual deterministic heuristics
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...deterministic,
        provider: 'deterministic-kernel',
        model: 'trinetra-nlp-heuristics',
        latencyMs: Math.max(1, Math.round(performance.now() - start)),
      } satisfies NlpAnalysisResult,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
