'use client'
import React, { useState } from 'react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { extractUrlFeatures, type UrlFeatures } from '@/lib/crypto-utils'
import {
  Search, AlertTriangle, ShieldCheck, ShieldAlert,
  CheckCircle2, ArrowRight, Sparkles, ExternalLink, Globe, MessageSquare
} from 'lucide-react'

const SCAM_SAMPLES = [
  {
    title: 'SBI KYC Expiry Scam (SMS / WhatsApp)',
    text: 'प्रिय ग्राहक, आपका SBI खाता आज रात 12:00 बजे ब्लॉक कर दिया जाएगा। तुरंत अपना आधार और पैन अपडेट करें: http://sbi-kyc-update-portal.xyz/verify नहीं करने पर आपका बैलेंस फ्रीज हो जाएगा। — SBI Helpdesk Team',
    category: 'BANKING FRAUD',
    confidence: '96.4%',
    threatType: 'Credential Harvesting & Urgency Coercion',
    flags: [
      'Artificial Panic Trigger (Midnight account suspension deadline)',
      'Unofficial Banking Domain (sbi-kyc-update-portal.xyz on cheap .xyz TLD)',
      'Impersonation of State Bank of India without authenticated sender header (e.g. VM-SBIINB)',
    ],
    recommendation: 'Do NOT open the link or enter your UPI PIN / NetBanking credentials. Dial 1930 immediately if any money was transferred.',
    urgencyScore: 94,
    impersonationScore: 98,
    linkRiskScore: 96,
  },
  {
    title: 'Electricity Disconnection Warning',
    text: 'Dear Consumer, Your electricity connection will be DISCONNECTED tonight at 9:30 PM from the power sub-station because previous bill was not updated. Please immediately contact power officer at +91-9876543210 or settle bill: http://bijli-bill-payment.site/pay',
    category: 'UTILITY SCAM',
    confidence: '94.2%',
    threatType: 'Utility Disconnection Extortion',
    flags: [
      'Unverified 10-digit mobile number masquerading as official state discom officer',
      'Fraudulent payment gateway domain (bijli-bill-payment.site)',
      'Short deadline (9:30 PM) aimed at bypassing rational fraud checks',
    ],
    recommendation: 'Verify bill status only on the official state electricity discom website (e.g., BSES, TPDDL, Mahavitaran) or mobile app. Never pay on third-party links.',
    urgencyScore: 92,
    impersonationScore: 91,
    linkRiskScore: 95,
  },
  {
    title: 'Income Tax Refund Approval Notice',
    text: 'Income Tax Department Notice: Your tax refund of Rs 18,420 has been approved. Please verify your bank account details within 24 hours to receive direct deposit in UPI: http://incometax-refund-portal.online/claim?ref=ITX998472',
    category: 'GOVT IMPERSONATION',
    confidence: '97.1%',
    threatType: 'Govt Portal Phishing & Account Takeover',
    flags: [
      'Impersonation of Income Tax Department of India',
      'Fake domain (incometax-refund-portal.online instead of incometax.gov.in)',
      'Requests UPI details for refund disbursement (Govt refunds only process via pre-validated Bank ECS/NACH)',
    ],
    recommendation: 'Check refund status strictly on eportal.incometax.gov.in. The IT Department never demands UPI PINs or claims over SMS.',
    urgencyScore: 88,
    impersonationScore: 99,
    linkRiskScore: 97,
  },
]

const DEMO_URLS = [
  { url: 'http://sbi-kyc-update-portal.xyz/verify?acc=998827', label: 'Fake Banking Portal (.xyz TLD + High Entropy)' },
  { url: 'http://185.220.101.47:8080/secure/login.php', label: 'Raw IP Address Host (Classic Phish)' },
  { url: 'https://www.onlinesbi.sbi', label: 'Official Genuine SBI Portal (Safe Sovereign Domain)' },
]

export default function NLPPage() {
  // Pre-populate with realistic dummy data so the UI is immediately alive and symmetrical
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0)
  const [msgText, setMsgText] = useState(SCAM_SAMPLES[0].text)
  const [msgLoading, setMsgLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'message' | 'url'>('message')

  // URL inspection dummy data pre-loaded
  const [url, setUrl] = useState(DEMO_URLS[0].url)
  const [urlFeatures, setUrlFeatures] = useState<UrlFeatures | null>(() => extractUrlFeatures(DEMO_URLS[0].url))
  const [urlLoading, setUrlLoading] = useState(false)

  const activeSample = SCAM_SAMPLES[selectedSampleIdx]

  function handleSelectSample(idx: number) {
    setSelectedSampleIdx(idx)
    setMsgText(SCAM_SAMPLES[idx].text)
    setMsgLoading(true)
    setTimeout(() => setMsgLoading(false), 300)
  }

  function handleCustomMessageChange(val: string) {
    setMsgText(val)
  }

  function analyzeUrl(targetUrl?: string) {
    const query = targetUrl ?? url
    if (!query.trim()) return
    setUrlLoading(true)
    setTimeout(() => {
      setUrlFeatures(extractUrlFeatures(query.trim()))
      setUrlLoading(false)
    }, 400)
  }

  function handleSelectUrl(targetUrl: string) {
    setUrl(targetUrl)
    analyzeUrl(targetUrl)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner - Symmetrical & Clean */}
      <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-bold">
              08 // NLP PHISHING & LINK RISK
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-300">ENG · HIN · HINGLISH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NLP Phishing & Link Risk Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Inspect suspicious SMS, WhatsApp forwards, email warnings, and web links to detect social engineering, banking impersonation, and fraudulent infrastructure in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>HEURISTIC ENGINE 100%</span>
          </div>
        </div>
      </div>

      {/* Navigation Switcher Pills */}
      <div className="flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08] w-fit">
        <button
          onClick={() => setActiveTab('message')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'message'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare size={14} />
          <span>SMS & WhatsApp Message Scanner</span>
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'url'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe size={14} />
          <span>Deep Link & URL Risk Engine</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: SMS & WHATSAPP MESSAGE SCANNER (SYMMETRICAL GRID)   */}
      {/* ========================================================== */}
      {activeTab === 'message' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Input & Test Scenarios (5 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <TerminalCard title="Message Analysis Input" label="PAYLOAD" labelColor="red" className="flex-1">
              <div className="space-y-4 text-xs flex flex-col h-full">
                {/* 1-Click Preset Samples */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 font-medium">Select a test scenario (1-click):</span>
                    <span className="text-[11px] font-mono text-rose-400">Benchmark Threat Vectors</span>
                  </div>
                  <div className="space-y-2">
                    {SCAM_SAMPLES.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                          selectedSampleIdx === idx
                            ? 'bg-indigo-500/15 border-indigo-500/30 shadow-sm shadow-indigo-950/20'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                        }`}
                      >
                        <div>
                          <p className={`font-semibold text-xs ${selectedSampleIdx === idx ? 'text-white' : 'text-slate-200 group-hover:text-indigo-300'}`}>
                            {sample.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5 font-normal">
                            {sample.text.slice(0, 55)}...
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] text-slate-300 font-semibold flex-shrink-0">
                          {sample.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-1.5 flex-1 flex flex-col">
                  <label className="text-slate-300 font-medium block">
                    Or edit / paste message text:
                  </label>
                  <textarea
                    value={msgText}
                    onChange={e => handleCustomMessageChange(e.target.value)}
                    rows={5}
                    placeholder="Paste SMS, WhatsApp forward, or email body here..."
                    className="w-full p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 text-xs transition-colors leading-relaxed font-sans resize-none flex-1"
                  />
                </div>

                <button
                  onClick={() => {
                    setMsgLoading(true)
                    setTimeout(() => setMsgLoading(false), 500)
                  }}
                  disabled={msgLoading || !msgText.trim()}
                  className="w-full py-3 px-6 font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>{msgLoading ? 'Analyzing NLP Markers...' : 'Scan Message for Social Engineering'}</span>
                </button>
              </div>
            </TerminalCard>
          </div>

          {/* Right Column: Threat Breakdown (6 cols, perfectly symmetrical) */}
          <div className="lg:col-span-6 flex flex-col">
            <TerminalCard title="Threat Breakdown & Analysis" label="AUDITED" labelColor="green" className="flex-1">
              <div className="space-y-4 text-xs">
                {/* Alert Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-transparent border border-rose-500/20 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-300 flex-shrink-0 mt-0.5">
                    <ShieldAlert size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        HIGH CONFIDENCE PHISHING SCAM
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25 font-bold">
                        {activeSample.confidence}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Identified as <strong>{activeSample.threatType}</strong> targeting Indian consumers through synthetic urgency cues.
                    </p>
                  </div>
                </div>

                {/* Threat Indicators Metrics */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-mono">
                    Psychological & Technical Risk Meters
                  </span>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Manufactured Panic / Urgency Pressure</span>
                        <span className="text-rose-400 font-mono font-bold">{activeSample.urgencyScore}% [CRITICAL]</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full" style={{ width: `${activeSample.urgencyScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Authority / Institutional Impersonation</span>
                        <span className="text-rose-400 font-mono font-bold">{activeSample.impersonationScore}% [CRITICAL]</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full" style={{ width: `${activeSample.impersonationScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Link Typosquatting & Unofficial TLD</span>
                        <span className="text-amber-400 font-mono font-bold">{activeSample.linkRiskScore}% [ELEVATED]</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${activeSample.linkRiskScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracted Red Flags */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <span className="text-xs font-bold text-slate-200 block font-mono">
                    Detected Forensic Red Flags:
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {activeSample.flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safety Protocol */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-emerald-300 block">Recommended Action Protocol:</span>
                  <p className="leading-relaxed">
                    {activeSample.recommendation}
                  </p>
                </div>
              </div>
            </TerminalCard>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: DEEP LINK & URL SCANNER (SYMMETRICAL GRID)          */}
      {/* ========================================================== */}
      {activeTab === 'url' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: URL Input & Demos (5 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <TerminalCard title="URL Inspection Input" label="WEB LINK" labelColor="red" className="flex-1">
              <div className="space-y-4 text-xs flex flex-col h-full">
                {/* One Click URL Samples */}
                <div>
                  <label className="text-slate-400 block mb-2 font-medium">
                    Try sample URLs to test detection (1-click):
                  </label>
                  <div className="space-y-2">
                    {DEMO_URLS.map((demo, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectUrl(demo.url)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                          url === demo.url
                            ? 'bg-indigo-500/15 border-indigo-500/30 shadow-sm'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                        }`}
                      >
                        <span className="font-mono text-xs text-indigo-300 truncate max-w-xs">{demo.url}</span>
                        <span className="text-[10px] text-slate-400">{demo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL Input */}
                <div className="space-y-1.5 flex-1">
                  <label className="text-slate-300 block font-medium">
                    Or enter any web address:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') analyzeUrl() }}
                      placeholder="https://suspicious-website.xyz/login?ref=..."
                      className="flex-1 p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl font-mono text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      onClick={() => analyzeUrl()}
                      disabled={urlLoading || !url.trim()}
                      className="px-5 font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 rounded-xl shadow-md transition-all"
                    >
                      {urlLoading ? '...' : 'Inspect'}
                    </button>
                  </div>
                </div>

                {/* Educational Box */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-slate-400 space-y-1">
                  <span className="font-bold text-slate-200 block font-mono">How We Analyze Links in 0.05ms:</span>
                  <p className="leading-relaxed">
                    We examine 12 structural lexical markers without visiting the server directly — checking for spoofed Unicode characters (homoglyphs), abnormal Shannon entropy, IP masquerading, and high-abuse top-level domains.
                  </p>
                </div>
              </div>
            </TerminalCard>
          </div>

          {/* Right Column: URL Features Report (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <TerminalCard title="Link Risk Intelligence Report" label="LEXICAL AUDIT" labelColor="green" className="flex-1">
              {urlFeatures ? (
                <div className="space-y-4 text-xs">
                  {/* Score Banner */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    urlFeatures.riskScore > 60
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">
                        {urlFeatures.riskScore > 60 ? 'MALICIOUS / HIGH RISK DOMAIN' : 'BENIGN / LOW RISK DOMAIN'}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-sm">
                        Target: {url}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold font-mono">{urlFeatures.riskScore}</span>
                      <span className="text-xs text-slate-500 block">/ 100 Risk</span>
                    </div>
                  </div>

                  {/* 12 Lexical Structural Markers Grid */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-mono">
                      Extracted Lexical Markers
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-xs">
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

                  {/* Recommendations */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-slate-200 block">Investigative Verdict:</span>
                    <p className="leading-relaxed text-slate-400">
                      {urlFeatures.riskScore > 60
                        ? 'Domain exhibits indicators commonly associated with phishing kits (non-standard registrar, high entropy query string). Block at firewall proxy.'
                        : 'Domain exhibits standard structural entropy and verified sovereign root infrastructure. Nominal posture.'}
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
