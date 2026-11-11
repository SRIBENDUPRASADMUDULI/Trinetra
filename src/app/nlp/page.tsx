'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  MailWarning, Link2, ShieldAlert, CheckCircle2, AlertTriangle,
  Download, FileJson, ArrowRight, RefreshCw, Sparkles, Search, Lock
} from 'lucide-react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { useLang } from '@/lib/i18n-context'

interface UrlReputation {
  url: string
  lexical?: {
    hostname?: string
    tld?: string
    entropy?: number
    hasIpHost?: boolean
    hasPunycode?: boolean
    suspiciousKeywordCount?: number
  }
  safeBrowsing: { checked: boolean; status: string; threatTypes?: string[] }
  virusTotal: { checked: boolean; status: string; maliciousCount?: number; harmlessCount?: number }
  urlhaus: { checked: boolean; status: string; threat?: string }
  openPhish: { checked: boolean; status: string }
}

interface AnalysisResult {
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
  urlReputations: UrlReputation[]
  provider: string
  model: string
  latencyMs: number
  requestId?: string
}

const MAX_CHARS = 2500

const OFFICIAL_INDIAN_DOMAINS = [
  'onlinesbi.sbi',
  'sbi.co.in',
  'hdfcbank.com',
  'icicibank.com',
  'axisbank.com',
  'incometax.gov.in',
  'npci.org.in',
  'cybercrime.gov.in',
  'parivahan.gov.in',
  'uidai.gov.in',
]

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

function extractDomain(raw: string): string | null {
  try {
    const normalized = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`
    const host = new URL(normalized).hostname.toLowerCase().replace(/^www\./, '')
    return host || null
  } catch {
    return null
  }
}

const EXAMPLE_MESSAGES = [
  {
    label: 'SBI KYC Suspension Lure',
    text: 'URGENT: Dear SBI User, your YONO KYC will expire within 2 hours and account will be blocked. Update PAN immediately at https://sbi-kyc-verif.top/login to avoid freeze.',
    url: 'https://sbi-kyc-verif.top/login',
  },
  {
    label: 'RTO e-Challan APK Bait',
    text: 'Traffic Police Notice: Pending e-Challan DL09CA4421 Rs.2500 due today. Download official notice receipt: http://parivahan-challan-pay.xyz/apk',
    url: 'http://parivahan-challan-pay.xyz/apk',
  },
  {
    label: 'Genuine NPCI Alert (Benign)',
    text: 'Dear Customer, UPI mandate reference 41928371 for Rs.499.00 was successfully executed via your bank app. For queries visit https://npci.org.in.',
    url: 'https://npci.org.in',
  },
]

const EXAMPLE_URLS = [
  { label: 'Spoofed SBI Top-Level', url: 'https://on1inesbi-kyc.top/auth' },
  { label: 'Spoofed Income Tax Portal', url: 'https://incometax-gov-refund.xyz/claim' },
  { label: 'Official Cybercrime Portal', url: 'https://cybercrime.gov.in' },
]

export default function NlpInspectorPage() {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState<'sms' | 'url'>('sms')
  const [msgText, setMsgText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [certStatus, setCertStatus] = useState<string | null>(null)
  const [exportingCert, setExportingCert] = useState(false)

  // Client-side Levenshtein Typosquatting check on live inputs + extracted URLs
  const typosquatMatches = useMemo(() => {
    const candidateUrls: string[] = []
    if (urlInput.trim()) candidateUrls.push(urlInput.trim())
    const inlineMatches = msgText.match(/https?:\/\/[^\s"'<>]+/gi) ?? []
    for (const u of inlineMatches) candidateUrls.push(u)
    if (result?.extractedUrls) {
      for (const u of result.extractedUrls) candidateUrls.push(u)
    }

    const seenHosts = new Set<string>()
    const evaluations: Array<{
      host: string
      closestOfficial: string
      distance: number
      classification: 'EXACT_OFFICIAL' | 'TYPOSQUAT_SUSPECT' | 'UNRELATED_DOMAIN'
    }> = []

    for (const rawUrl of candidateUrls) {
      const host = extractDomain(rawUrl)
      if (!host || seenHosts.has(host)) continue
      seenHosts.add(host)

      let bestTarget = OFFICIAL_INDIAN_DOMAINS[0]
      let minDist = Infinity
      for (const official of OFFICIAL_INDIAN_DOMAINS) {
        const d = levenshtein(host, official)
        if (d < minDist) {
          minDist = d
          bestTarget = official
        }
      }

      const classification =
        minDist === 0 || host.endsWith(`.${bestTarget}`)
          ? 'EXACT_OFFICIAL'
          : minDist <= 5 || host.includes(bestTarget.split('.')[0])
            ? 'TYPOSQUAT_SUSPECT'
            : 'UNRELATED_DOMAIN'

      evaluations.push({
        host,
        closestOfficial: bestTarget,
        distance: minDist,
        classification,
      })
    }
    return evaluations
  }, [msgText, urlInput, result])

  const handleAnalyze = async () => {
    const payloadText = activeTab === 'sms' ? msgText.trim() : urlInput.trim()
    if (!payloadText && !urlInput.trim()) {
      setErrorMsg('Please enter an SMS/email body or suspicious URL before analyzing.')
      return
    }

    setAnalyzing(true)
    setErrorMsg(null)
    setCertStatus(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeTab === 'sms' ? msgText : `Inspect URL risk: ${urlInput}`,
          url: urlInput.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.analysis) {
        throw new Error(data.error || 'Analysis request failed')
      }
      setResult(data.analysis)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to complete analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleExportJson = () => {
    if (!result) return
    const bundle = {
      platform: 'TRINETRA CyberShield Bharat',
      statute: 'BSA 2023 §63 Preliminary Forensic Dump',
      exportedAtIst: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      inputMessage: msgText,
      targetUrl: urlInput,
      typosquatAnalysis: typosquatMatches,
      analysis: result,
      disclaimer: 'AI-assisted indication — verify manually before legal action.',
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `TRINETRA_NLP_REPORT_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(href)
  }

  const handleExportBsa63Pdf = async () => {
    if (!result) return
    setExportingCert(true)
    setCertStatus(null)
    try {
      const payloadSummary = activeTab === 'sms' ? msgText : urlInput
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePanel: '08 // Phishing & Link Inspector',
          payload: payloadSummary || urlInput,
          verdict: result.verdict,
          confidence: result.confidence,
          category: result.category,
          flags: result.flags,
          requestId: result.requestId,
          model: result.model,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.certificate?.downloadUrl) {
        throw new Error(data.error || 'Failed to generate BSA 2023 §63 PDF')
      }
      const link = document.createElement('a')
      link.href = data.certificate.downloadUrl
      link.download = `TRINETRA_BSA63_${data.certificate.certId}.pdf`
      link.click()
      setCertStatus(`Issued ${data.certificate.certId} · SHA-256: ${data.certificate.sha256Hash.slice(0, 16)}...`)
    } catch (err: unknown) {
      setCertStatus(err instanceof Error ? err.message : 'PDF generation failed')
    } finally {
      setExportingCert(false)
    }
  }

  const verdictTone = useMemo(() => {
    if (!result) return null
    const v = result.verdict.toUpperCase()
    if (v.includes('HIGH') || v.includes('PHISHING') || v.includes('MALICIOUS')) {
      return {
        bg: 'bg-[#D64045]/15 border-[#D64045]/40',
        text: 'text-[#D64045]',
        badge: 'HIGH RISK SCAM',
      }
    }
    if (v.includes('SUSPICIOUS')) {
      return {
        bg: 'bg-[#FF9F1C]/15 border-[#FF9F1C]/40',
        text: 'text-[#FF9F1C]',
        badge: 'SUSPICIOUS',
      }
    }
    return {
      bg: 'bg-[#00A896]/15 border-[#00A896]/40',
      text: 'text-[#00A896]',
      badge: 'LOW RISK / BENIGN',
    }
  }, [result])

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-xl bg-[#172A45] border border-[#233554] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#0A192F] border border-[#233554] text-[10px] font-mono font-bold text-[#FF9F1C]">
                08 // PHISHING &amp; LINK INSPECTOR
              </span>
              <span className="px-2.5 py-1 rounded bg-[#00A896]/15 border border-[#00A896]/35 text-[10px] font-mono text-[#00A896]">
                BharatCode Live Analysis · URLhaus · OpenPhish · Levenshtein Spoof Check
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#F8F9FA] font-serif">
              {t('SMS, Email & Suspicious URL Forensic Triage', 'एसएमएस, ईमेल और संदिग्ध लिंक फोरेंसिक निरीक्षण')}
            </h1>
            <p className="text-xs text-[#8D99AE] max-w-3xl">
              {t(
                'Inspect multilingual Indian cyber fraud messages (English, Hindi, Hinglish) and evaluate URL domains against official banking/government registers.',
                'भारतीय साइबर धोखाधड़ी संदेशों और संदिग्ध लिंक का आधिकारिक बैंकिंग एवं सरकारी डोमेन के साथ विश्लेषण करें।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sms')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer ${
                activeTab === 'sms'
                  ? 'bg-[#FF9F1C] text-[#0A192F] border-[#FF9F1C]'
                  : 'bg-[#0A192F] text-[#8D99AE] border-[#233554] hover:text-[#F8F9FA]'
              }`}
            >
              <MailWarning className="w-3.5 h-3.5" /> SMS / Email Text
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-[#FF9F1C] text-[#0A192F] border-[#FF9F1C]'
                  : 'bg-[#0A192F] text-[#8D99AE] border-[#233554] hover:text-[#F8F9FA]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" /> URL Reputation Scan
            </button>
          </div>
        </div>
      </section>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Input Form (Empty initial state + Load Example chips) */}
        <div className="xl:col-span-5 space-y-5">
          <TerminalCard
            title={activeTab === 'sms' ? 'Message & Embedded Link Input' : 'Target URL Inspection'}
            label="STATELESS INPUT"
            labelColor="amber"
          >
            <div className="space-y-4">
              {/* Example Autofill Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D99AE]">
                  Load Example Input (Autofill only — click Analyze to run):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTab === 'sms'
                    ? EXAMPLE_MESSAGES.map((ex) => (
                        <button
                          key={ex.label}
                          type="button"
                          onClick={() => {
                            setMsgText(ex.text)
                            setUrlInput(ex.url)
                            setErrorMsg(null)
                          }}
                          className="px-2.5 py-1 rounded bg-[#0A192F] hover:bg-[#1E3554] border border-[#233554] text-[11px] font-mono text-[#00A896] transition-colors cursor-pointer"
                        >
                          + {ex.label}
                        </button>
                      ))
                    : EXAMPLE_URLS.map((ex) => (
                        <button
                          key={ex.label}
                          type="button"
                          onClick={() => {
                            setUrlInput(ex.url)
                            setErrorMsg(null)
                          }}
                          className="px-2.5 py-1 rounded bg-[#0A192F] hover:bg-[#1E3554] border border-[#233554] text-[11px] font-mono text-[#00A896] transition-colors cursor-pointer"
                        >
                          + {ex.label}
                        </button>
                      ))}
                </div>
              </div>

              {activeTab === 'sms' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="nlp-msg-input" className="font-semibold text-[#F8F9FA]">
                      Suspicious Message Content <span className="text-[#D64045]">*</span>
                    </label>
                    <span className="font-mono text-[11px] text-[#8D99AE]">
                      {msgText.length} / {MAX_CHARS}
                    </span>
                  </div>
                  <textarea
                    id="nlp-msg-input"
                    rows={6}
                    maxLength={MAX_CHARS}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Paste suspected phishing SMS, WhatsApp forward, or email text here..."
                    className="w-full rounded-lg bg-[#0A192F] border border-[#233554] p-3 text-xs font-mono text-[#F8F9FA] placeholder:text-[#8D99AE]/60 focus:outline-none focus:border-[#00A896]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="nlp-url-input" className="block text-xs font-semibold text-[#F8F9FA]">
                  Target / Extracted URL {activeTab === 'url' && <span className="text-[#D64045]">*</span>}
                </label>
                <input
                  id="nlp-url-input"
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example-suspicious-domain.top/login"
                  className="w-full rounded-lg bg-[#0A192F] border border-[#233554] px-3 py-2.5 text-xs font-mono text-[#F8F9FA] placeholder:text-[#8D99AE]/60 focus:outline-none focus:border-[#00A896]"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-[#D64045]/15 border border-[#D64045]/40 text-xs text-[#D64045] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-[#0A192F] text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running Live Analysis...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" /> Analyze Input
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMsgText('')
                    setUrlInput('')
                    setResult(null)
                    setErrorMsg(null)
                    setCertStatus(null)
                  }}
                  className="px-3.5 py-2.5 rounded-lg bg-[#0A192F] hover:bg-[#1E3554] border border-[#233554] text-xs font-medium text-[#8D99AE] hover:text-[#F8F9FA] transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </TerminalCard>

          {/* Levenshtein Typosquatting Check (runs deterministically on input URLs) */}
          <TerminalCard
            title="Levenshtein Domain Spoofing Check"
            label="DETERMINISTIC MATH"
            labelColor="cyan"
          >
            {typosquatMatches.length === 0 ? (
              <p className="text-xs text-[#8D99AE]">
                Enter or paste a URL above to compute edit-distance similarity against official Indian banking and `.gov.in` domains.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#233554] text-[10px] font-mono uppercase text-[#8D99AE]">
                      <th className="py-2 pr-3">Observed Host</th>
                      <th className="py-2 pr-3">Nearest Official</th>
                      <th className="py-2 pr-3">Edit Dist</th>
                      <th className="py-2">Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#233554]">
                    {typosquatMatches.map((m) => (
                      <tr key={m.host}>
                        <td className="py-2.5 pr-3 font-mono text-[#F8F9FA]">{m.host}</td>
                        <td className="py-2.5 pr-3 font-mono text-[#8D99AE]">{m.closestOfficial}</td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-[#F8F9FA]">{m.distance}</td>
                        <td className="py-2.5">
                          {m.classification === 'EXACT_OFFICIAL' ? (
                            <span className="px-2 py-0.5 rounded bg-[#00A896]/15 border border-[#00A896]/30 text-[#00A896] font-mono text-[10px]">
                              OFFICIAL MATCH
                            </span>
                          ) : m.classification === 'TYPOSQUAT_SUSPECT' ? (
                            <span className="px-2 py-0.5 rounded bg-[#D64045]/15 border border-[#D64045]/35 text-[#D64045] font-mono text-[10px]">
                              SPOOF SUSPECT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#FF9F1C]/15 border border-[#FF9F1C]/35 text-[#FF9F1C] font-mono text-[10px]">
                              UNVERIFIED HOST
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TerminalCard>
        </div>

        {/* Right: Structured Analytical Results Table */}
        <div className="xl:col-span-7 space-y-5">
          <TerminalCard
            title="Forensic Verdict & Statutory Triage Report"
            label={result ? result.provider.toUpperCase() : 'AWAITING ANALYSIS'}
            labelColor={result ? 'green' : 'white'}
          >
            {!result && !analyzing && (
              <div className="py-14 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#0A192F] border border-[#233554] mx-auto flex items-center justify-center text-[#8D99AE]">
                  <Sparkles className="w-6 h-6 text-[#FF9F1C]" />
                </div>
                <div className="text-sm font-semibold text-[#F8F9FA]">
                  No Input Analyzed Yet
                </div>
                <p className="text-xs text-[#8D99AE] max-w-md mx-auto leading-relaxed">
                  Paste a suspicious message or URL on the left (or select an example chip) and click{' '}
                  <strong className="text-[#FF9F1C]">Analyze Input</strong> to invoke the live BharatCode harness and threat-intel feeds.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-7 h-7 animate-spin text-[#00A896] mx-auto" />
                <div className="text-xs font-mono text-[#00A896]">
                  Executing BharatCode NLP triage + URLhaus/OpenPhish/SafeBrowsing checks...
                </div>
              </div>
            )}

            {result && verdictTone && !analyzing && (
              <div className="space-y-5">
                {/* Verdict Banner */}
                <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${verdictTone.bg}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className={`w-4 h-4 ${verdictTone.text}`} />
                      <span className={`font-mono text-xs font-bold ${verdictTone.text}`}>
                        {result.verdict}
                      </span>
                    </div>
                    <div className="text-xs text-[#F8F9FA]/85">
                      {result.threatType} · Category: <strong className="font-mono">{result.category}</strong>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[10px] text-[#8D99AE] uppercase">Model Confidence</div>
                    <div className={`text-xl font-bold ${verdictTone.text}`}>{result.confidence}</div>
                  </div>
                </div>

                {/* Formal Assessment Matrix Table */}
                <div className="overflow-x-auto rounded-lg border border-[#233554]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0A192F] border-b border-[#233554] text-[10px] font-mono uppercase text-[#8D99AE]">
                        <th className="py-2.5 px-4">Forensic Dimension</th>
                        <th className="py-2.5 px-4">Score / Telemetry</th>
                        <th className="py-2.5 px-4">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#233554] bg-[#0A192F]/40">
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-[#F8F9FA]">Psychological Urgency</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#FF9F1C]">{result.urgencyScore} / 100</td>
                        <td className="py-2.5 px-4 text-[#8D99AE]">Time-pressure / account-freeze coercion cues</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-[#F8F9FA]">Authority Impersonation</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#FF9F1C]">{result.impersonationScore} / 100</td>
                        <td className="py-2.5 px-4 text-[#8D99AE]">Bank, RBI, Telecom, Police, or Tax spoofing signals</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-[#F8F9FA]">Link Infrastructure Risk</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#D64045]">{result.linkRiskScore} / 100</td>
                        <td className="py-2.5 px-4 text-[#8D99AE]">TLD risk, IP/punycode patterns &amp; reputation feeds</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-[#F8F9FA]">Inference Provenance</td>
                        <td className="py-2.5 px-4 font-mono text-[#00A896]">{result.model} ({result.latencyMs}ms)</td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-[#8D99AE]">
                          {result.requestId ? `x-request-id: ${result.requestId}` : 'Deterministic Fallback Kernel'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Detected Indicators */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#8D99AE] font-semibold">
                    Detected Forensic Flags
                  </div>
                  <ul className="space-y-1.5">
                    {result.flags.map((flag, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#0A192F] border border-[#233554] text-xs text-[#F8F9FA] flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00A896] shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* URL Reputation Table */}
                {result.urlReputations && result.urlReputations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8D99AE] font-semibold">
                      URL Threat-Intelligence Matrix
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-[#233554]">
                      <table className="w-full text-left text-[11px] font-mono border-collapse">
                        <thead>
                          <tr className="bg-[#0A192F] border-b border-[#233554] text-[#8D99AE]">
                            <th className="py-2 px-3">URL</th>
                            <th className="py-2 px-3">URLhaus</th>
                            <th className="py-2 px-3">OpenPhish</th>
                            <th className="py-2 px-3">SafeBrowsing</th>
                            <th className="py-2 px-3">VirusTotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#233554]">
                          {result.urlReputations.map((rep) => (
                            <tr key={rep.url} className="bg-[#0A192F]/30">
                              <td className="py-2 px-3 text-[#F8F9FA] max-w-[180px] truncate">{rep.url}</td>
                              <td className="py-2 px-3 text-[#00A896]">{rep.urlhaus.status}</td>
                              <td className="py-2 px-3 text-[#00A896]">{rep.openPhish.status}</td>
                              <td className="py-2 px-3 text-[#8D99AE]">{rep.safeBrowsing.status}</td>
                              <td className="py-2 px-3 text-[#8D99AE]">{rep.virusTotal.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recommended Action & Export Strip */}
                <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#00A896]/30 text-xs text-[#F8F9FA] leading-relaxed">
                  <strong className="text-[#00A896] font-mono uppercase text-[11px] block mb-1">
                    Recommended Statutory Action
                  </strong>
                  {result.recommendation}
                </div>

                {/* Action Buttons: BSA §63 PDF, JSON, Generate FIR */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#233554]">
                  <button
                    type="button"
                    onClick={handleExportBsa63Pdf}
                    disabled={exportingCert}
                    className="px-4 py-2 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-[#0A192F] text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {exportingCert ? 'Generating PDF...' : 'Export BSA 2023 §63 PDF'}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3.5 py-2 rounded-lg bg-[#0A192F] hover:bg-[#1E3554] border border-[#233554] text-[#F8F9FA] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-[#00A896]" />
                    Export JSON
                  </button>

                  <Link
                    href="/incident"
                    className="ml-auto px-4 py-2 rounded-lg bg-[#00A896]/15 hover:bg-[#00A896]/25 border border-[#00A896]/35 text-[#00A896] text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    Generate FIR Draft <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {certStatus && (
                  <div className="p-2.5 rounded bg-[#00A896]/10 border border-[#00A896]/30 font-mono text-[11px] text-[#00A896] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>{certStatus}</span>
                  </div>
                )}

                {/* Honest Accuracy Disclaimer */}
                <p className="text-[11px] font-mono text-[#8D99AE] border-t border-[#233554] pt-3">
                  Disclaimer: AI-assisted indication — verify manually before legal action. Deterministic SHA-256 and Levenshtein calculations execute locally.
                </p>
              </div>
            )}
          </TerminalCard>
        </div>
      </div>
    </div>
  )
}
