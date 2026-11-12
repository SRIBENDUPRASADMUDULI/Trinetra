'use client'

import React, { useState, useMemo } from 'react'
import {
  MailWarning, Link2, Search, RefreshCw, AlertTriangle, Flag, CheckCircle2
} from 'lucide-react'
import { InfoExplain } from '@/components/ui/InfoExplain'
import { ScanResultCard } from '@/components/ui/ScanResultCard'
import { useLang } from '@/lib/i18n-context'

interface UrlReputation {
  url: string
  safeBrowsing: { checked: boolean; status: string }
  virusTotal: { checked: boolean; status: string }
  urlhaus: { checked: boolean; status: string }
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
  hfSignal?: {
    checked: boolean
    model: string
    label?: string
    score?: number
    phishingProbability?: number
    status: string
  }
  provider: string
  model: string
  latencyMs: number
  requestId?: string
}

const ACCURACY_DISCLAIMER =
  'This is an AI-powered heuristic & URL-reputation tool. Results are not 100% guaranteed. Always verify with your bank or official source before entering credentials or transferring money.'

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
    label: 'Example: Fake Bank KYC SMS',
    text: 'URGENT: Dear SBI User, your YONO KYC will expire within 2 hours and account will be blocked. Update PAN immediately at https://sbi-kyc-verif.top/login to avoid freeze.',
    url: 'https://sbi-kyc-verif.top/login',
  },
  {
    label: 'Example: Fake Traffic Challan',
    text: 'Traffic Police Notice: Pending e-Challan DL09CA4421 Rs.2500 due today. Download official notice receipt: http://parivahan-challan-pay.xyz/apk',
    url: 'http://parivahan-challan-pay.xyz/apk',
  },
  {
    label: 'Example: Genuine NPCI Alert',
    text: 'Dear Customer, UPI mandate reference 41928371 for Rs.499.00 was successfully executed via your bank app. For queries visit https://npci.org.in.',
    url: 'https://npci.org.in',
  },
]

export default function MessageCheckerPage() {
  const { t } = useLang()
  const [msgText, setMsgText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [certStatus, setCertStatus] = useState<string | null>(null)
  const [exportingCert, setExportingCert] = useState(false)
  const [feedbackStatus, setFeedbackStatus] = useState<'false_positive' | 'false_negative' | null>(null)

  // Fake Website Lookalike Check (Levenshtein distance vs official Indian bank/govt domains)
  const lookalikeChecks = useMemo(() => {
    const candidateUrls: string[] = []
    if (urlInput.trim()) candidateUrls.push(urlInput.trim())
    const inlineMatches = msgText.match(/https?:\/\/[^\s"'<>]+/gi) ?? []
    for (const u of inlineMatches) candidateUrls.push(u)
    if (result?.extractedUrls) {
      for (const u of result.extractedUrls) candidateUrls.push(u)
    }

    const seenHosts = new Set<string>()
    const list: Array<{
      host: string
      closestOfficial: string
      distance: number
      isOfficial: boolean
      isLookalike: boolean
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

      const isOfficial = minDist === 0 || host.endsWith(`.${bestTarget}`)
      const isLookalike = !isOfficial && (minDist <= 5 || host.includes(bestTarget.split('.')[0]))

      list.push({
        host,
        closestOfficial: bestTarget,
        distance: minDist,
        isOfficial,
        isLookalike,
      })
    }
    return list
  }, [msgText, urlInput, result])

  const handleCheckNow = async () => {
    if (!msgText.trim() && !urlInput.trim()) {
      setErrorMsg('Please paste a message or link first before clicking Check Now.')
      return
    }

    setAnalyzing(true)
    setErrorMsg(null)
    setCertStatus(null)
    setFeedbackStatus(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msgText.trim() || `Check this website link: ${urlInput.trim()}`,
          url: urlInput.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.analysis) {
        throw new Error(data.error || 'Unable to check message right now.')
      }
      setResult(data.analysis)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong while checking.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleExportBsa63Pdf = async () => {
    if (!result) return
    setExportingCert(true)
    setCertStatus(null)
    try {
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePanel: 'Message Checker',
          payload: msgText || urlInput,
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
        throw new Error(data.error || 'Could not generate PDF report')
      }
      const link = document.createElement('a')
      link.href = data.certificate.downloadUrl
      link.download = `TRINETRA_REPORT_${data.certificate.certId}.pdf`
      link.click()
      setCertStatus(`Saved Evidence Report (${data.certificate.certId}) · SHA-256 verified`)
    } catch (err: unknown) {
      setCertStatus(err instanceof Error ? err.message : 'PDF save failed')
    } finally {
      setExportingCert(false)
    }
  }

  const handleExportJson = () => {
    if (!result) return
    const bundle = {
      platform: 'TRINETRA Cyber Safety Console',
      checkedAtIst: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      message: msgText,
      link: urlInput,
      lookalikeChecks,
      result,
      disclaimer: ACCURACY_DISCLAIMER,
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `TRINETRA_CHECK_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(href)
  }

  const handleReportFeedback = (kind: 'false_positive' | 'false_negative') => {
    if (!result) return
    setFeedbackStatus(kind)
    try {
      const storageKey = 'trinetra_nlp_feedback_v1'
      const raw = localStorage.getItem(storageKey)
      const existing = raw ? (JSON.parse(raw) as unknown[]) : []
      const entry = {
        kind,
        verdict: result.verdict,
        confidence: result.confidence,
        textSample: msgText.slice(0, 240),
        url: urlInput || undefined,
        recordedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify([entry, ...existing].slice(0, 50)))
    } catch {
      // Ignore storage quota errors
    }
  }

  // Convert technical verdict into plain-English guidance for ScanResultCard
  const cardData = useMemo(() => {
    if (!result) return null
    const upper = result.verdict.toUpperCase()
    const isScam = upper.includes('HIGH') || upper.includes('PHISHING') || upper.includes('MALICIOUS')
    const isSuspicious = !isScam && upper.includes('SUSPICIOUS')

    const verdictKind: 'scam' | 'suspicious' | 'safe' = isScam ? 'scam' : isSuspicious ? 'suspicious' : 'safe'
    const headline = isScam
      ? 'This looks like a scam — do not click the link'
      : isSuspicious
        ? 'This message looks suspicious — double-check before trusting'
        : 'No obvious scam patterns found — still verify with official sources'

    const spoofNotes = lookalikeChecks
      .filter((c) => c.isLookalike)
      .map((c) => `Fake lookalike website detected: "${c.host}" pretends to be official "${c.closestOfficial}".`)

    const whyList = [...spoofNotes, ...(result.flags || [])]
    if (whyList.length === 0) {
      whyList.push('No high-risk scam keywords or known phishing links were detected.')
    }

    const todoList = isScam || isSuspicious
      ? [
          'Do NOT click any link or download any `.apk` file from this message.',
          'Do NOT share your OTP, UPI PIN, Aadhaar, or bank details.',
          'If you already lost money, call 1930 immediately or file a police complaint.',
          'Verify using your official bank app or website instead.',
        ]
      : [
          'Still check the sender number or open your official bank app directly to confirm.',
          'Never share OTPs or passwords with anyone on a phone call or SMS.',
        ]

    return {
      verdictKind,
      headline,
      subheadline: `${result.threatType} · Confidence: ${result.confidence}`,
      whyList,
      todoList,
    }
  }, [result, lookalikeChecks])

  return (
    <div className="space-y-6">
      {/* Page Title & Plain Help Button */}
      <section className="rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1E2420]">
            {t('Check Suspicious Message or Link', 'संदिग्ध संदेश या लिंक जांचें')}
          </h1>
          <p className="text-xs text-[#5C645E] max-w-2xl">
            {t(
              'Paste an SMS, WhatsApp forward, email, or website link below. We will tell you in plain English if it looks safe or like a scam.',
              'नीचे कोई भी संदिग्ध एसएमएस, व्हाट्सएप संदेश या लिंक पेस्ट करें और जांचें कि वह सुरक्षित है या धोखाधड़ी।'
            )}
          </p>
        </div>
        <InfoExplain
          title="Message & Link Checker"
          whatIsIt="This tool reads suspicious SMS messages, emails, and website links to spot common Indian banking, KYC, lottery, and traffic-challan scams."
          whoShouldUse="Anyone who got a strange message asking to click a link, update KYC, or pay money urgently."
          whatResultMeans="SCAM means strong signs of fraud — do not click or pay. SAFE means no clear scam patterns were found, though you should always double-check on your official bank app."
        />
      </section>

      {/* Input Card */}
      <section className="rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] p-6 shadow-xs space-y-5">
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#5C645E]">
            Try an example to see how it works:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_MESSAGES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setMsgText(ex.text)
                  setUrlInput(ex.url)
                  setErrorMsg(null)
                }}
                className="px-3 py-1.5 rounded-lg bg-[#F2F1EC] hover:bg-[#ECFDF5] border border-[#E0DDD5] hover:border-[#A7F3D0] text-xs font-medium text-[#059669] transition-colors cursor-pointer"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="msg-input" className="font-semibold text-[#1E2420] flex items-center gap-1.5">
                <MailWarning className="w-4 h-4 text-[#059669]" />
                Paste SMS or Email Here
              </label>
              <span className="text-[#5C645E] font-mono text-[11px]">
                {msgText.length} / {MAX_CHARS}
              </span>
            </div>
            <textarea
              id="msg-input"
              rows={5}
              maxLength={MAX_CHARS}
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Example: Your SBI KYC is expired, click this link to verify..."
              className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] p-3.5 text-sm text-[#1E2420] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#059669] focus:bg-[#FFFFFF]"
            />
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <label htmlFor="link-input" className="font-semibold text-[#1E2420] text-xs flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-[#059669]" />
                Paste Website Link Here (Optional)
              </label>
              <input
                id="link-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example-suspicious-link.top"
                className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3.5 py-2.5 text-sm font-mono text-[#1E2420] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#059669] focus:bg-[#FFFFFF]"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCheckNow}
                disabled={analyzing}
                className="flex-1 py-3 px-6 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Checking Message...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Check Now
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
                  setFeedbackStatus(null)
                }}
                className="px-4 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F3F4F6] border border-[#E0DDD5] text-xs font-semibold text-[#4B5563] cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Plain-English ScanResultCard */}
      {result && cardData && (
        <ScanResultCard
          verdictKind={cardData.verdictKind}
          headline={cardData.headline}
          subheadline={cardData.subheadline}
          whyList={cardData.whyList}
          todoList={cardData.todoList}
          disclaimer={ACCURACY_DISCLAIMER}
          onSaveReport={handleExportBsa63Pdf}
          savingReport={exportingCert}
          onExportJson={handleExportJson}
          onReset={() => {
            setResult(null)
            setMsgText('')
            setUrlInput('')
            setCertStatus(null)
            setFeedbackStatus(null)
          }}
          certNote={certStatus}
          extraContent={
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5]">
                  <div className="text-[#5C645E]">Urgency Score</div>
                  <div className="text-base font-bold font-mono text-[#D97706]">{result.urgencyScore} / 100</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5]">
                  <div className="text-[#5C645E]">Impersonation Score</div>
                  <div className="text-base font-bold font-mono text-[#DC2626]">{result.impersonationScore} / 100</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5]">
                  <div className="text-[#5C645E]">Link Risk Score</div>
                  <div className="text-base font-bold font-mono text-[#DC2626]">{result.linkRiskScore} / 100</div>
                </div>
              </div>

              {lookalikeChecks.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-[#E0DDD5]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F2F1EC] border-b border-[#E0DDD5] text-[#5C645E]">
                        <th className="py-2 px-3">Website Host Found</th>
                        <th className="py-2 px-3">Closest Official Website</th>
                        <th className="py-2 px-3">Edit Distance</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {lookalikeChecks.map((m) => (
                        <tr key={m.host}>
                          <td className="py-2 px-3 font-mono text-[#1E2420]">{m.host}</td>
                          <td className="py-2 px-3 font-mono text-[#5C645E]">{m.closestOfficial}</td>
                          <td className="py-2 px-3 font-mono">{m.distance}</td>
                          <td className="py-2 px-3">
                            {m.isOfficial ? (
                              <span className="text-[#15803D] font-semibold">Official Website</span>
                            ) : m.isLookalike ? (
                              <span className="text-[#DC2626] font-semibold">Lookalike Spoof</span>
                            ) : (
                              <span className="text-[#D97706] font-semibold">External / Unverified</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="text-[11px] font-mono text-[#5C645E]">
                Engine: {result.provider} ({result.model}) · Latency: {result.latencyMs}ms
                {result.hfSignal?.status === 'SCORED' && typeof result.hfSignal.phishingProbability === 'number'
                  ? ` · HF ML (${result.hfSignal.model}): ${(result.hfSignal.phishingProbability * 100).toFixed(1)}%`
                  : ''}
                {result.requestId ? ` · x-request-id: ${result.requestId}` : ''}
              </div>

              <div className="pt-2 border-t border-[#E0DDD5] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#5C645E] flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-[#D97706]" />
                  Think this result is wrong?
                </span>
                {feedbackStatus ? (
                  <span className="text-xs font-medium text-[#15803D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {feedbackStatus === 'false_positive'
                      ? 'Flagged as false positive (safe message). Saved locally.'
                      : 'Reported as false negative (missed scam). Saved locally.'}
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReportFeedback('false_positive')}
                      className="px-3 py-1.5 rounded-lg bg-[#F2F1EC] hover:bg-[#ECFDF5] border border-[#E0DDD5] text-xs font-medium text-[#1E2420] transition-colors cursor-pointer"
                    >
                      Report False Positive
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReportFeedback('false_negative')}
                      className="px-3 py-1.5 rounded-lg bg-[#F2F1EC] hover:bg-[#FEF2F2] border border-[#E0DDD5] text-xs font-medium text-[#1E2420] transition-colors cursor-pointer"
                    >
                      Report False Negative
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
        />
      )}
    </div>
  )
}
