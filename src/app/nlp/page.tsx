'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { jsPDF } from 'jspdf'
import { TerminalCard } from '@/components/ui/terminal-card'
import { extractUrlFeatures, sha256, type UrlFeatures } from '@/lib/crypto-utils'
import type { UrlReputationResult } from '@/app/api/analyze/route'
import {
  ShieldAlert,
  Sparkles,
  Globe,
  MessageSquare,
  AlertTriangle,
  FileCheck2,
  Scale,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'

interface LiveAnalysis {
  verdict: string
  category: string
  confidence: string
  threatType: string
  flags: string[]
  recommendation: string
  urgencyScore: number
  impersonationScore: number
  linkRiskScore: number
  extractedUrls?: string[]
  urlReputations?: UrlReputationResult[]
  provider?: string
  model?: string
  latencyMs?: number
  requestId?: string
}

interface EvidenceReceipt {
  certId: string
  sha256Hash: string
  timestampIso: string
}

const EXAMPLE_MESSAGES = [
  {
    title: 'SBI KYC Expiry Scam (SMS / WhatsApp)',
    category: 'BANKING FRAUD',
    text: 'प्रिय ग्राहक, आपका SBI खाता आज रात 12:00 बजे ब्लॉक कर दिया जाएगा। तुरंत अपना आधार और पैन अपडेट करें: http://sbi-kyc-update-portal.xyz/verify नहीं करने पर आपका बैलेंस फ्रीज हो जाएगा। — SBI Helpdesk Team',
  },
  {
    title: 'Electricity Disconnection Warning',
    category: 'UTILITY SCAM',
    text: 'Dear Consumer, Your electricity connection will be DISCONNECTED tonight at 9:30 PM from the power sub-station because previous bill was not updated. Please immediately contact power officer at +91-9876543210 or settle bill: http://bijli-bill-payment.site/pay',
  },
  {
    title: 'Income Tax Refund Approval Notice',
    category: 'GOVT IMPERSONATION',
    text: 'Income Tax Department Notice: Your tax refund of Rs 18,420 has been approved. Please verify your bank account details within 24 hours to receive direct deposit in UPI: http://incometax-refund-portal.online/claim?ref=ITX998472',
  },
]

const EXAMPLE_URLS = [
  { url: 'http://sbi-kyc-update-portal.xyz/verify?acc=998827', label: 'Fake Banking Portal (.xyz TLD)' },
  { url: 'http://185.220.101.47:8080/secure/login.php', label: 'Raw IP Address Host' },
  { url: 'https://www.onlinesbi.sbi', label: 'Official Genuine SBI Portal' },
]

export default function NLPPage() {
  const [selectedSampleIdx, setSelectedSampleIdx] = useState<number | null>(0)
  const [msgText, setMsgText] = useState(EXAMPLE_MESSAGES[0].text)
  const [msgLoading, setMsgLoading] = useState(true)
  const [msgError, setMsgError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<LiveAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState<'message' | 'url'>('message')

  const [url, setUrl] = useState(EXAMPLE_URLS[0].url)
  const [urlFeatures, setUrlFeatures] = useState<UrlFeatures | null>(() => extractUrlFeatures(EXAMPLE_URLS[0].url))
  const [urlReputation, setUrlReputation] = useState<UrlReputationResult | null>(null)
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const [exportingCert, setExportingCert] = useState(false)
  const [evidenceReceipt, setEvidenceReceipt] = useState<EvidenceReceipt | null>(null)

  async function runLiveAnalyze(textToScan: string, explicitUrl?: string) {
    setMsgLoading(true)
    setMsgError(null)
    setEvidenceReceipt(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToScan, url: explicitUrl }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Analysis endpoint returned an error')
      }
      setAnalysisResult(data.analysis)
    } catch (err: unknown) {
      setMsgError(err instanceof Error ? err.message : 'Failed to analyze message')
    } finally {
      setMsgLoading(false)
    }
  }

  useEffect(() => {
    runLiveAnalyze(EXAMPLE_MESSAGES[0].text)
  }, [])

  function handleSelectSample(idx: number) {
    setSelectedSampleIdx(idx)
    const sampleText = EXAMPLE_MESSAGES[idx].text
    setMsgText(sampleText)
    runLiveAnalyze(sampleText)
  }

  function handleCustomMessageChange(val: string) {
    setMsgText(val)
    if (selectedSampleIdx !== null && val !== EXAMPLE_MESSAGES[selectedSampleIdx]?.text) {
      setSelectedSampleIdx(null)
    }
  }

  async function analyzeUrl(targetUrl?: string) {
    const query = (targetUrl ?? url).trim()
    if (!query) return
    setUrlLoading(true)
    setUrlError(null)
    setUrlFeatures(extractUrlFeatures(query))
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Inspect URL: ${query}`, url: query }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'URL reputation check failed')
      }
      const rep = data.analysis?.urlReputations?.[0] ?? null
      setUrlReputation(rep)
    } catch (err: unknown) {
      setUrlError(err instanceof Error ? err.message : 'URL inspection failed')
    } finally {
      setUrlLoading(false)
    }
  }

  function handleSelectUrl(targetUrl: string) {
    setUrl(targetUrl)
    analyzeUrl(targetUrl)
  }

  async function handleExportEvidenceCertificate() {
    if (!analysisResult) return
    setExportingCert(true)
    try {
      const targetPayload = activeTab === 'url' ? url : msgText
      try {
        const res = await fetch('/api/certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourcePanel: '08 // NLP Phishing & Link Risk',
            payload: targetPayload,
            verdict: analysisResult.verdict,
            confidence: analysisResult.confidence,
            category: analysisResult.category,
            flags: analysisResult.flags,
            requestId: analysisResult.requestId,
            model: analysisResult.model,
          }),
        })
        const data = await res.json()
        if (res.ok && data.success && data.certificate) {
          const a = document.createElement('a')
          a.href = data.certificate.downloadUrl
          a.download = `TRINETRA_${data.certificate.certId}.pdf`
          a.click()
          setEvidenceReceipt({
            certId: data.certificate.certId,
            sha256Hash: data.certificate.sha256Hash,
            timestampIso: data.certificate.timestampIso,
          })
          return
        }
      } catch {
        // Fallback to local Web Crypto PDF signing if API unavailable
      }
      const timestampIso = new Date().toISOString()
      const canonicalRecord = JSON.stringify({
        platform: 'TRINETRA CyberShield Bharat',
        statute: 'Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63',
        timestampIso,
        inputPayload: targetPayload,
        verdict: analysisResult.verdict,
        confidence: analysisResult.confidence,
        category: analysisResult.category,
        flags: analysisResult.flags,
      })
      const sha256Hash = await sha256(canonicalRecord)
      const certId = `BSA63-${sha256Hash.slice(0, 10).toUpperCase()}`

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      doc.setFont('Courier', 'bold')
      doc.setFontSize(13)
      doc.text('CERTIFICATE UNDER SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023', 40, 50)

      doc.setFont('Courier', 'normal')
      doc.setFontSize(9)
      const lines = [
        `Certificate ID    : ${certId}`,
        `Generated UTC     : ${timestampIso}`,
        `Generated IST     : ${new Date(timestampIso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
        `Engine / Model    : ${analysisResult.model || 'trinetra-nlp'} (${analysisResult.provider || 'hybrid'})`,
        `SHA-256 Digest    : ${sha256Hash}`,
        '',
        '--------------------------------------------------------------------------------',
        '1. FORENSIC VERDICT & PROBABILISTIC INDICATION',
        '--------------------------------------------------------------------------------',
        `Verdict           : ${analysisResult.verdict} (${analysisResult.confidence})`,
        `Category          : ${analysisResult.category}`,
        `Threat Vector     : ${analysisResult.threatType}`,
        `Risk Breakdown    : Urgency ${analysisResult.urgencyScore}% | Impersonation ${analysisResult.impersonationScore}% | Link ${analysisResult.linkRiskScore}%`,
        '',
        '--------------------------------------------------------------------------------',
        '2. CAPTURED DIGITAL ARTIFACT (RAW PAYLOAD)',
        '--------------------------------------------------------------------------------',
        ...doc.splitTextToSize(targetPayload, 510),
        '',
        '--------------------------------------------------------------------------------',
        '3. DETECTED INDICATORS / RED FLAGS',
        '--------------------------------------------------------------------------------',
        ...analysisResult.flags.flatMap((f, idx) => doc.splitTextToSize(`${idx + 1}. ${f}`, 510)),
        '',
        '--------------------------------------------------------------------------------',
        '4. STATUTORY ATTESTATION & DISCLAIMER',
        '--------------------------------------------------------------------------------',
        ...doc.splitTextToSize(
          'This electronic record digest was generated locally via Web Crypto SHA-256 for evidentiary integrity preservation. AI-assisted verdicts are probabilistic indications and should be manually verified by an authorized officer before legal or enforcement action.',
          510
        ),
      ]

      let y = 78
      for (const line of lines) {
        if (y > 790) {
          doc.addPage()
          y = 45
        }
        doc.text(line, 40, y)
        y += 14
      }

      doc.save(`TRINETRA_${certId}.pdf`)
      setEvidenceReceipt({ certId, sha256Hash, timestampIso })
    } finally {
      setExportingCert(false)
    }
  }

  const isBenignVerdict = analysisResult?.verdict?.toUpperCase().includes('BENIGN')

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-bold">
              08 // NLP PHISHING &amp; LINK RISK
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">•</span>
            <span className="text-[11px] font-mono text-slate-300">ENG · HIN · HINGLISH</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            NLP Phishing &amp; Link Risk Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Live analysis of SMS, WhatsApp forwards, email warnings, and embedded links via BharatCode AI, VirusTotal / Google Safe Browsing reputation feeds, and lexical forensics.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="px-3.5 sm:px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{analysisResult?.provider === 'bharatcode' ? 'BHARATCODE AI LIVE' : 'PROBABILISTIC NLP ENGINE'}</span>
          </div>
        </div>
      </div>

      {/* Honest Accuracy Framing Disclaimer */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start sm:items-center gap-2.5">
        <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          <strong>Probabilistic Indication:</strong> AI-assisted indication — verify sender identity, domains, and transaction references manually before taking legal or enforcement action.
        </span>
      </div>

      {/* Navigation Switcher Pills */}
      <div className="flex flex-wrap sm:flex-nowrap p-1 rounded-2xl sm:rounded-full bg-white/[0.04] border border-white/[0.08] w-full sm:w-fit gap-1 sm:gap-0">
        <button
          onClick={() => setActiveTab('message')}
          className={`flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2 rounded-xl sm:rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'message'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare size={14} className="shrink-0" />
          <span>SMS &amp; WhatsApp Message Scanner</span>
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2 rounded-xl sm:rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'url'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe size={14} className="shrink-0" />
          <span>Deep Link &amp; URL Risk Engine</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: SMS & WHATSAPP MESSAGE SCANNER                      */}
      {/* ========================================================== */}
      {activeTab === 'message' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Left Column: Input & Example Autofills */}
          <div className="lg:col-span-6 flex flex-col min-w-0">
            <TerminalCard title="Message Analysis Input" label="LIVE PAYLOAD" labelColor="red" className="flex-1">
              <div className="space-y-4 text-xs flex flex-col h-full">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-slate-400 font-medium">Example scenarios (auto-fill &amp; scan live):</span>
                    <span className="text-[11px] font-mono text-rose-400">Example Inputs</span>
                  </div>
                  <div className="space-y-2">
                    {EXAMPLE_MESSAGES.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 group cursor-pointer ${
                          selectedSampleIdx === idx
                            ? 'bg-indigo-500/15 border-indigo-500/30 shadow-sm shadow-indigo-950/20'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold text-xs ${selectedSampleIdx === idx ? 'text-white' : 'text-slate-200 group-hover:text-indigo-300'}`}>
                            {sample.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                            {sample.text}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] text-slate-300 font-semibold shrink-0 w-fit">
                          {sample.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col">
                  <label className="text-slate-300 font-medium block">
                    Paste or edit any SMS, WhatsApp forward, or email body:
                  </label>
                  <textarea
                    value={msgText}
                    onChange={e => handleCustomMessageChange(e.target.value)}
                    rows={5}
                    placeholder="Paste suspicious SMS, WhatsApp forward, or email text here..."
                    className="w-full p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 text-xs transition-colors leading-relaxed font-sans resize-none flex-1"
                  />
                </div>

                {msgError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
                    <span>{msgError}</span>
                    <button onClick={() => setMsgError(null)} className="text-[10px] underline cursor-pointer">Dismiss</button>
                  </div>
                )}

                <button
                  onClick={() => runLiveAnalyze(msgText.trim())}
                  disabled={msgLoading || !msgText.trim()}
                  className="w-full py-3 px-6 font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 rounded-full shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{msgLoading ? 'Running Live Threat Analysis...' : 'Analyze Message & Embedded URLs'}</span>
                </button>
              </div>
            </TerminalCard>
          </div>

          {/* Right Column: Live Threat Breakdown */}
          <div className="lg:col-span-6 flex flex-col min-w-0">
            <TerminalCard
              title="Live Threat Breakdown & Evidence"
              label={analysisResult?.latencyMs ? `${analysisResult.latencyMs} MS` : 'ANALYZING'}
              labelColor="green"
              className="flex-1"
            >
              {msgLoading ? (
                <div className="space-y-4 animate-pulse py-2">
                  <div className="h-20 rounded-2xl bg-white/[0.05] border border-white/[0.06]" />
                  <div className="h-36 rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
                  <div className="h-28 rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
                  <div className="h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
                </div>
              ) : analysisResult ? (
                <div className="space-y-4 text-xs">
                  {/* Verdict Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                      isBenignVerdict
                        ? 'bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-transparent border-emerald-500/20'
                        : 'bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-transparent border-rose-500/20'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                        isBenignVerdict
                          ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/25 text-rose-300'
                      }`}
                    >
                      <ShieldAlert size={20} />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {analysisResult.verdict}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                            isBenignVerdict
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/25'
                          }`}
                        >
                          {analysisResult.confidence}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {analysisResult.threatType} · <span className="font-mono text-slate-400">{analysisResult.category}</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        Engine: {analysisResult.model} {analysisResult.requestId ? `· req:${analysisResult.requestId}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Risk Meters */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-mono">
                      Psychological &amp; Technical Risk Meters
                    </span>

                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between gap-2 text-[11px] mb-1">
                          <span className="text-slate-400">Manufactured Panic / Urgency Pressure</span>
                          <span className="text-rose-400 font-mono font-bold shrink-0">
                            {analysisResult.urgencyScore}% [{analysisResult.urgencyScore >= 70 ? 'CRITICAL' : analysisResult.urgencyScore >= 40 ? 'ELEVATED' : 'LOW'}]
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                          <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all" style={{ width: `${analysisResult.urgencyScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between gap-2 text-[11px] mb-1">
                          <span className="text-slate-400">Authority / Institutional Impersonation</span>
                          <span className="text-rose-400 font-mono font-bold shrink-0">
                            {analysisResult.impersonationScore}% [{analysisResult.impersonationScore >= 70 ? 'CRITICAL' : analysisResult.impersonationScore >= 40 ? 'ELEVATED' : 'LOW'}]
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                          <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all" style={{ width: `${analysisResult.impersonationScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between gap-2 text-[11px] mb-1">
                          <span className="text-slate-400">Link Typosquatting &amp; Unofficial TLD</span>
                          <span className="text-amber-400 font-mono font-bold shrink-0">
                            {analysisResult.linkRiskScore}% [{analysisResult.linkRiskScore >= 70 ? 'CRITICAL' : analysisResult.linkRiskScore >= 40 ? 'ELEVATED' : 'LOW'}]
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${analysisResult.linkRiskScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extracted URL Reputation Checks */}
                  {analysisResult.urlReputations && analysisResult.urlReputations.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <span className="text-xs font-bold text-slate-200 block font-mono">
                        Embedded URL Reputation &amp; Lexical Audit:
                      </span>
                      {analysisResult.urlReputations.map((rep, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05] space-y-1.5 font-mono text-[11px]">
                          <div className="text-indigo-300 truncate">{rep.url}</div>
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                              Lexical Risk: {rep.lexical.riskScore}/100
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                              Safe Browsing: {rep.safeBrowsing.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                              VirusTotal: {rep.virusTotal.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                              URLhaus: {rep.urlhaus?.status ?? 'NOT_LISTED'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                              OpenPhish: {rep.openPhish?.status ?? 'NOT_LISTED'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extracted Red Flags */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <span className="text-xs font-bold text-slate-200 block font-mono">
                      Detected Forensic Red Flags:
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {analysisResult.flags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                          <span className="break-words">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety Protocol */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-emerald-300 block">Recommended Action Protocol:</span>
                    <p className="leading-relaxed">{analysisResult.recommendation}</p>
                  </div>

                  {/* Action Buttons: BSA 2023 §63 Certificate Export + FIR Draft */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <button
                      onClick={handleExportEvidenceCertificate}
                      disabled={exportingCert}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <FileCheck2 size={14} />
                      <span>{exportingCert ? 'Signing SHA-256 PDF...' : 'Export BSA 2023 §63 Evidence Certificate'}</span>
                    </button>
                    <Link
                      href="/cyber-ir"
                      onClick={() => {
                        try {
                          sessionStorage.setItem(
                            'trinetra_fir_prefill',
                            JSON.stringify({
                              incident_type: 'online_financial_fraud',
                              incident_description: `[NLP Verdict: ${analysisResult.verdict} (${analysisResult.confidence}) | Category: ${analysisResult.category}]\n\nCaptured Message / Artifact:\n${msgText.trim()}\n\nDetected Indicators:\n- ${analysisResult.flags.join('\n- ')}`,
                            })
                          )
                        } catch {}
                      }}
                      className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all shrink-0"
                    >
                      <Scale size={14} className="text-indigo-400" />
                      <span>Generate FIR Draft →</span>
                    </Link>
                  </div>

                  {evidenceReceipt && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 size={13} />
                        <span>Certificate Exported: {evidenceReceipt.certId}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 break-all">
                        SHA-256: {evidenceReceipt.sha256Hash}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </TerminalCard>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: DEEP LINK & URL SCANNER                             */}
      {/* ========================================================== */}
      {activeTab === 'url' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          <div className="lg:col-span-6 flex flex-col min-w-0">
            <TerminalCard title="URL Inspection Input" label="WEB LINK" labelColor="red" className="flex-1">
              <div className="space-y-4 text-xs flex flex-col h-full">
                <div>
                  <label className="text-slate-400 block mb-2 font-medium">
                    Example URLs (auto-fill &amp; run reputation audit):
                  </label>
                  <div className="space-y-2">
                    {EXAMPLE_URLS.map((demo, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectUrl(demo.url)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 group cursor-pointer ${
                          url === demo.url
                            ? 'bg-indigo-500/15 border-indigo-500/30 shadow-sm'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                        }`}
                      >
                        <span className="font-mono text-xs text-indigo-300 truncate min-w-0">{demo.url}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{demo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="text-slate-300 block font-medium">
                    Or enter any web address:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') analyzeUrl() }}
                      placeholder="https://suspicious-website.xyz/login?ref=..."
                      className="flex-1 min-w-0 p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl font-mono text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      onClick={() => analyzeUrl()}
                      disabled={urlLoading || !url.trim()}
                      className="px-5 py-3 sm:py-0 font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                    >
                      {urlLoading ? 'Checking...' : 'Inspect'}
                    </button>
                  </div>
                </div>

                {urlError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {urlError}
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-slate-400 space-y-1">
                  <span className="font-bold text-slate-200 block font-mono">Zero-Visit Lexical &amp; Reputation Pipeline:</span>
                  <p className="leading-relaxed">
                    Inspects 12 structural markers locally (Unicode homoglyphs, Shannon entropy, raw IP masquerading, risky TLDs) alongside VirusTotal and Google Safe Browsing reputation lookups when keys are configured.
                  </p>
                </div>
              </div>
            </TerminalCard>
          </div>

          <div className="lg:col-span-6 flex flex-col min-w-0">
            <TerminalCard title="Link Risk Intelligence Report" label="LEXICAL + REPUTATION" labelColor="green" className="flex-1">
              {urlLoading ? (
                <div className="space-y-4 animate-pulse py-2">
                  <div className="h-20 rounded-2xl bg-white/[0.05]" />
                  <div className="h-32 rounded-2xl bg-white/[0.04]" />
                  <div className="h-24 rounded-2xl bg-white/[0.04]" />
                </div>
              ) : urlFeatures ? (
                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    urlFeatures.riskScore > 60
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-sm">
                        {urlFeatures.riskScore > 60 ? 'MALICIOUS / HIGH RISK DOMAIN' : 'BENIGN / LOW RISK DOMAIN'}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        Target: {url}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-extrabold font-mono">{urlFeatures.riskScore}</span>
                      <span className="text-xs text-slate-500 block">/ 100 Risk</span>
                    </div>
                  </div>

                  {/* External Reputation Feeds */}
                  {urlReputation && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                        <ShieldCheck size={14} className="text-indigo-400" />
                        External Threat Reputation Checks
                      </span>
                      <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px]">
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                          <span className="text-slate-500 block text-[10px]">Google Safe Browsing</span>
                          <strong className={urlReputation.safeBrowsing.status === 'THREAT_DETECTED' ? 'text-rose-400' : 'text-slate-200'}>
                            {urlReputation.safeBrowsing.status}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                          <span className="text-slate-500 block text-[10px]">VirusTotal v3</span>
                          <strong className={urlReputation.virusTotal.status === 'MALICIOUS' ? 'text-rose-400' : 'text-slate-200'}>
                            {urlReputation.virusTotal.status}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                          <span className="text-slate-500 block text-[10px]">Abuse.ch URLhaus</span>
                          <strong className={urlReputation.urlhaus?.status === 'LISTED_MALWARE' ? 'text-rose-400' : 'text-emerald-300'}>
                            {urlReputation.urlhaus?.status ?? 'NOT_LISTED'}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                          <span className="text-slate-500 block text-[10px]">OpenPhish Feed</span>
                          <strong className={urlReputation.openPhish?.status === 'LISTED_PHISHING' ? 'text-rose-400' : 'text-emerald-300'}>
                            {urlReputation.openPhish?.status ?? 'NOT_LISTED'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-mono">
                      Extracted Lexical Markers
                    </span>

                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[11px]">Shannon Entropy:</span>
                        <strong className="text-white font-mono">{urlFeatures.entropy.toFixed(2)}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[11px]">TLD Abuse Risk:</span>
                        <strong className={urlFeatures.tldRiskScore > 50 ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                          {urlFeatures.tldRiskScore} / 100
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[11px]">Homoglyph Spoof:</span>
                        <strong className="text-white font-mono">{urlFeatures.homoglyphScore > 0 ? 'DETECTED' : 'NONE'}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[11px]">Raw IP Host:</span>
                        <strong className="text-white font-mono">{urlFeatures.isIp ? 'YES (HIGH RISK)' : 'NO'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-slate-200 block">Investigative Verdict:</span>
                    <p className="leading-relaxed text-slate-400">
                      {urlFeatures.riskScore > 60
                        ? 'Domain exhibits indicators commonly associated with phishing kits (non-standard registrar, high entropy query string). Block at firewall proxy.'
                        : 'Domain exhibits standard structural entropy and verified root infrastructure.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Awaiting URL input...
                </div>
              )}
            </TerminalCard>
          </div>
        </div>
      )}
    </div>
  )
}
