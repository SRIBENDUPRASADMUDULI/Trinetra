'use client'
import React, { useState } from 'react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  FileText, Download, ShieldAlert, CheckCircle2, Sparkles,
  BookOpen, Terminal, Code, Copy, Check, ArrowRight, Clock,
  ExternalLink, Layers, Cpu, Server
} from 'lucide-react'

// Preset FIR Scenarios from cyber-ir-api
const PRESET_FIRS = [
  {
    title: 'UPI Phishing & Unauthorized Debit',
    data: {
      victim_name: 'Aarav Patel',
      victim_dob: '14/08/1992',
      victim_parent_name: 'Rajesh Patel',
      victim_email: 'aarav.patel@email.in',
      victim_address: 'Flat 402, Shanti Heights, Sector 18, Rohini, Delhi - 110085',
      incident_type: 'online_financial_fraud',
      incident_date: '2026-09-17',
      incident_time: '19:45',
      location: 'New Delhi, India',
      incident_description: 'Victim received an urgent WhatsApp forward claiming his electricity connection would be disconnected at 9:30 PM unless a pending bill of Rs. 110 was settled immediately via an attached APK payment link. After opening the link and entering UPI PIN, two unauthorized debit transactions of Rs. 25,000 and Rs. 20,000 occurred sequentially to unknown merchant VPA fastpay.merchant@icici.',
      financial_details: {
        transaction_id: 'UPI/384918293819/AXIS',
        bank_account: 'Axis Bank - A/C 918274928192',
        amount: '45000',
        upi_id: 'fastpay.merchant@icici',
        transaction_date: '2026-09-17',
      }
    }
  },
  {
    title: 'Ransomware Extortion on Diagnostic Lab',
    data: {
      victim_name: 'Dr. Sunita Deshmukh (MedScan Diagnostics)',
      victim_dob: '22/05/1978',
      victim_parent_name: 'Late Anand Deshmukh',
      victim_email: 'admin@medscandiagnostics.com',
      victim_address: 'Shop 12-14, Commercial Complex, Bandra West, Mumbai - 400050',
      incident_type: 'ransomware',
      incident_date: '2026-09-16',
      incident_time: '03:15',
      location: 'Mumbai, Maharashtra',
      incident_description: 'Core radiology database and PACS image server encrypted by LockBit 3.0 ransomware variant. Desktop wallpaper altered with ransom note HLJkNskOq.README.txt demanding 1.5 BTC to restore patient scan archives. All medical imaging operations halted across 3 diagnostic branches.',
      financial_details: {
        transaction_id: '1.5 BTC Extortion Demand',
        bank_account: 'Cryptocurrency Wallet bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        amount: '1200000',
        upi_id: 'N/A',
        transaction_date: '2026-09-16',
      }
    }
  },
  {
    title: 'SIM Swap & Corporate NetBanking Drain',
    data: {
      victim_name: 'Vikramaditya Rao',
      victim_dob: '03/11/1985',
      victim_parent_name: 'K. S. Rao',
      victim_email: 'vikram.rao@fintechcorp.in',
      victim_address: 'Villa 18, Green Meadows, Whitefield, Bengaluru - 560066',
      incident_type: 'identity_theft',
      incident_date: '2026-09-15',
      incident_time: '23:10',
      location: 'Bengaluru, Karnataka',
      incident_description: 'Victim experienced sudden mobile network disconnection (No Service). Simultaneously, attackers executed an illegal SIM Swap with the telecom operator using forged identity documents, intercepted banking 2FA OTPs, and transferred Rs. 2,50,000 via RTGS to an interstate mule account.',
      financial_details: {
        transaction_id: 'RTGS/HDFC9982749102/MULE',
        bank_account: 'HDFC Bank - A/C 50100293849182',
        amount: '250000',
        upi_id: 'N/A',
        transaction_date: '2026-09-15',
      }
    }
  },
]

// Preset Playbook Scenarios
const PRESET_PLAYBOOKS = [
  {
    title: 'Hospital Patient Database Ransomware Outbreak',
    situation: 'Critical patient database and MRI diagnostic servers infected with ransomware. Attackers claim 500GB of patient health records exfiltrated. Clinical workflows blocked.',
    organization_type: 'healthcare',
    urgency: 'critical',
    framework: 'sans_picerl',
  },
  {
    title: 'Fintech UPI Switch API Credential Stuffing',
    situation: 'High-frequency brute force attack against UPI payment collection gateway. 12,000 login attempts per minute from multiple compromised proxy IP ranges. Suspected credential stuffing.',
    organization_type: 'enterprise',
    urgency: 'critical',
    framework: 'sans_picerl',
  },
  {
    title: 'Government Cloud S3 Data Exfiltration',
    situation: 'Unsecured cloud storage bucket detected exposing 15,000 citizen verification documents. Massive outbound data transfer spike observed to unknown foreign IP.',
    organization_type: 'government',
    urgency: 'high',
    framework: 'sans_picerl',
  },
]

export default function CyberIRPage() {
  const [activeTab, setActiveTab] = useState<'fir' | 'playbook' | 'api_docs'>('fir')

  // FIR State
  const [firForm, setFirForm] = useState(PRESET_FIRS[0].data)
  const [firLoading, setFirLoading] = useState(false)
  const [firResult, setFirResult] = useState<any | null>(null)

  // Playbook State
  const [pbSituation, setPbSituation] = useState(PRESET_PLAYBOOKS[0].situation)
  const [pbOrg, setPbOrg] = useState(PRESET_PLAYBOOKS[0].organization_type)
  const [pbUrgency, setPbUrgency] = useState(PRESET_PLAYBOOKS[0].urgency)
  const [pbFramework, setPbFramework] = useState(PRESET_PLAYBOOKS[0].framework)
  const [pbLoading, setPbLoading] = useState(false)
  const [pbResult, setPbResult] = useState<any | null>(null)
  const [copiedPb, setCopiedPb] = useState(false)

  // FIR Actions
  async function generateFIR() {
    setFirLoading(true)
    try {
      const res = await fetch('/api/fir/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firForm),
      })
      const data = await res.json()
      setFirResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setFirLoading(false)
    }
  }

  // Playbook Actions
  async function generatePlaybook() {
    setPbLoading(true)
    try {
      const res = await fetch('/api/playbook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: pbSituation,
          organization_type: pbOrg,
          urgency: pbUrgency,
          framework: pbFramework,
        }),
      })
      const data = await res.json()
      setPbResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setPbLoading(false)
    }
  }

  function downloadPlaybookFile() {
    if (!pbResult?.playbook) return
    const blob = new Blob([pbResult.playbook], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Incident_Playbook_${Date.now()}.md`
    a.click()
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
                <Cpu size={13} />
                CYBER-IR ENGINE
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono text-slate-300 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                SANS PICERL & STATUTORY BNS ENGINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              09 // Autonomous Incident Response & Cyber FIR Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Automated incident triage and statutory First Information Report engine. Generates official Cybercrime FIR dossiers mapped to <strong>Bharatiya Nyaya Sanhita (BNS 2023)</strong> & <strong>IT Act 2000</strong>, alongside full <strong>SANS PICERL</strong> emergency incident playbooks.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="#sans-picerl-framework"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all hover:text-white"
            >
              <ExternalLink size={13} />
              <span>Framework Spec</span>
            </a>
            <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Modern Pill Switcher) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('fir')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'fir'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <FileText size={15} />
          <span>Legal FIR Generator (BNS 2023)</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'playbook'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <BookOpen size={15} />
          <span>SANS PICERL Playbook</span>
        </button>

        <button
          onClick={() => setActiveTab('api_docs')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'api_docs'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <Code size={15} />
          <span>API Reference & cURL Studio</span>
        </button>
      </div>

      {/* TAB 1: FIR Generator */}
      {activeTab === 'fir' && (
        <div className="space-y-5">
          {/* Preset Selectors */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-sm space-y-2">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              LOAD PRESET CYBER INCIDENT SCENARIOS (1-CLICK TEST):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_FIRS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { setFirForm(p.data); setFirResult(null) }}
                  className="text-left p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-indigo-500/40 transition-all text-xs group"
                >
                  <p className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors mb-1">{p.title}</p>
                  <p className="text-[11px] text-slate-500 font-mono line-clamp-1">{p.data.incident_type}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Form Input */}
            <div className="space-y-4">
              <TerminalCard title="FIR Incident Parameters" label="POST /api/fir/generate" labelColor="red">
                <div className="space-y-4 text-xs">
                  {/* Complainant Details */}
                  <div className="space-y-2.5 pb-4 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-indigo-400 block tracking-wider uppercase">I. Complainant Particulars</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Victim Name *</label>
                        <input
                          type="text"
                          value={firForm.victim_name}
                          onChange={e => setFirForm({ ...firForm, victim_name: e.target.value })}
                          className="w-full p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Date of Birth</label>
                        <input
                          type="text"
                          value={firForm.victim_dob}
                          onChange={e => setFirForm({ ...firForm, victim_dob: e.target.value })}
                          className="w-full p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-medium">Complete Address with PIN</label>
                      <input
                        type="text"
                        value={firForm.victim_address}
                        onChange={e => setFirForm({ ...firForm, victim_address: e.target.value })}
                        className="w-full p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Incident Specs */}
                  <div className="space-y-2.5 pb-4 border-b border-white/[0.08]">
                    <span className="text-xs font-bold text-indigo-400 block tracking-wider uppercase">II. Incident Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Type *</label>
                        <select
                          value={firForm.incident_type}
                          onChange={e => setFirForm({ ...firForm, incident_type: e.target.value })}
                          className="w-full p-2.5 bg-[#12151F] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                        >
                          <option value="online_financial_fraud">Online Financial Fraud</option>
                          <option value="ransomware">Ransomware Extortion</option>
                          <option value="identity_theft">Identity Theft / SIM Swap</option>
                          <option value="hacking">Unauthorized Access / Hacking</option>
                          <option value="data_breach">Data Breach & Exfiltration</option>
                          <option value="cyber_stalking">Cyber Stalking / Harassment</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Date *</label>
                        <input
                          type="date"
                          value={firForm.incident_date}
                          onChange={e => setFirForm({ ...firForm, incident_date: e.target.value })}
                          className="w-full p-2.5 bg-[#12151F] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Time *</label>
                        <input
                          type="text"
                          value={firForm.incident_time}
                          onChange={e => setFirForm({ ...firForm, incident_time: e.target.value })}
                          className="w-full p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-medium">Incident Narrative *</label>
                      <textarea
                        rows={4}
                        value={firForm.incident_description}
                        onChange={e => setFirForm({ ...firForm, incident_description: e.target.value })}
                        className="w-full p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Financial Particulars */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-indigo-400 block tracking-wider uppercase">III. Financial Loss Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Amount Lost (INR ₹)</label>
                        <input
                          type="text"
                          value={firForm.financial_details?.amount || ''}
                          onChange={e => setFirForm({
                            ...firForm,
                            financial_details: { ...firForm.financial_details, amount: e.target.value }
                          })}
                          className="w-full p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-medium">Transaction UTR / ID</label>
                        <input
                          type="text"
                          value={firForm.financial_details?.transaction_id || ''}
                          onChange={e => setFirForm({
                            ...firForm,
                            financial_details: { ...firForm.financial_details, transaction_id: e.target.value }
                          })}
                          className="w-full p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generateFIR}
                    disabled={firLoading}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-semibold text-xs rounded-full shadow-lg shadow-indigo-950/40 border border-indigo-400/30 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={16} />
                    <span>{firLoading ? 'Synthesizing BNS + IT Act FIR via Gemma 4 MoE...' : 'Generate Legal Cyber FIR & Court PDF'}</span>
                  </button>
                </div>
              </TerminalCard>
            </div>

            {/* FIR Result */}
            <div>
              {!firResult ? (
                <TerminalCard title="Generated FIR Dossier" label="AWAITING GENERATION" labelColor="white">
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-2">
                      <FileText size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-200">Ready to Generate Cyber FIR</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Click "Generate Legal Cyber FIR" to auto-map BNS 2023 & IT Act provisions, extract technical indicators, and prepare a court-ready PDF.
                      </p>
                    </div>
                  </div>
                </TerminalCard>
              ) : (
                <TerminalCard
                  title={`Generated FIR // ${firResult.firNumber}`}
                  label="PRINT-READY"
                  labelColor="green"
                  noPadding
                  headerRight={
                    firResult.downloadUrl && (
                      <a
                        href={firResult.downloadUrl}
                        download={`${firResult.firNumber}.pdf`}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-full shadow-sm transition-all"
                      >
                        <Download size={13} />
                        <span>Download PDF</span>
                      </a>
                    )
                  }
                >
                  <div className="p-4 bg-slate-950 space-y-4 max-h-[600px] overflow-y-auto font-mono text-xs">
                    <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-sm flex items-center justify-between">
                      <span className="text-cyan-300 font-bold">FIR Reference: {firResult.firNumber}</span>
                      <span className="text-slate-400">CERT-In Ref: {firResult.certInRef}</span>
                    </div>

                    {/* Legal Sections Stamped */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm space-y-2">
                      <span className="font-bold text-emerald-400 block text-[11px]">
                        STATUTORY PROVISIONS AUTO-MAPPED (BNS 2023 + IT ACT 2000):
                      </span>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        {firResult.fir_data?.legal_provisions?.bns_sections?.map((s: any, i: number) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-amber-400 font-semibold">{s.section}:</span>
                            <span className="text-slate-400">{s.offence}</span>
                          </div>
                        ))}
                        {firResult.fir_data?.legal_provisions?.it_act_sections?.map((s: any, i: number) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-cyan-400 font-semibold">{s.section}:</span>
                            <span className="text-slate-400">{s.offence}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Full Preview */}
                    <pre className="p-3 bg-black border border-slate-800 rounded-sm text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {firResult.markdown}
                    </pre>
                  </div>
                </TerminalCard>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Playbook Generator */}
      {activeTab === 'playbook' && (
        <div className="space-y-5">
          {/* Preset Selectors */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-sm space-y-2">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              LOAD SANS PICERL INCIDENT SCENARIOS (1-CLICK TEST):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {PRESET_PLAYBOOKS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPbSituation(p.situation)
                    setPbOrg(p.organization_type)
                    setPbUrgency(p.urgency)
                    setPbFramework(p.framework)
                    setPbResult(null)
                  }}
                  className="text-left p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-sm transition-all text-xs font-sans"
                >
                  <p className="font-semibold text-emerald-300 mb-0.5">{p.title}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Org: {p.organization_type} · {p.urgency.toUpperCase()}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Playbook Inputs */}
            <div className="space-y-4">
              <TerminalCard title="Incident Situation & Context" label="[POST /api/playbook/generate]" labelColor="green">
                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Incident Situation Description *</label>
                    <textarea
                      rows={5}
                      value={pbSituation}
                      onChange={e => setPbSituation(e.target.value)}
                      placeholder="Describe the unfolding cyber emergency in detail..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-sm text-slate-200 font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Organization Type</label>
                      <select
                        value={pbOrg}
                        onChange={e => setPbOrg(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-sm text-slate-200 font-mono text-xs"
                      >
                        <option value="enterprise">Enterprise / Tech</option>
                        <option value="healthcare">Healthcare / Hospital</option>
                        <option value="government">Government Agency</option>
                        <option value="startup">Fintech Startup</option>
                        <option value="education">Education / University</option>
                        <option value="general">General Organization</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Urgency Level</label>
                      <select
                        value={pbUrgency}
                        onChange={e => setPbUrgency(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-sm text-slate-200 font-mono text-xs"
                      >
                        <option value="critical">P1 — Critical (Immediate)</option>
                        <option value="high">P2 — High Urgency</option>
                        <option value="medium">P3 — Medium Urgency</option>
                        <option value="low">P4 — Low / Informational</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Framework</label>
                      <select
                        value={pbFramework}
                        onChange={e => setPbFramework(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-sm text-slate-200 font-mono text-xs"
                      >
                        <option value="sans_picerl">SANS PICERL (6 Phases)</option>
                        <option value="nist_800_61">NIST SP 800-61 Rev.2</option>
                        <option value="auto">Auto Selection</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={generatePlaybook}
                    disabled={pbLoading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-mono text-xs font-bold rounded-sm transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen size={15} />
                    <span>{pbLoading ? '[GENERATING SANS PICERL PLAYBOOK VIA CYBER-IR...]' : '[GENERATE EMERGENCY PLAYBOOK]'}</span>
                  </button>
                </div>
              </TerminalCard>
            </div>

            {/* Playbook Output */}
            <div>
              {!pbResult ? (
                <TerminalCard title="Generated SANS PICERL Playbook" label="[AWAITING SITUATION]" labelColor="white">
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-3">
                    <BookOpen size={40} className="text-slate-600" />
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-bold text-slate-300">Awaiting Playbook Generation</p>
                      <p className="text-xs text-slate-500 font-sans max-w-sm">
                        Specify an incident scenario on the left or select a pre-configured crisis to generate complete 6-phase response guidance.
                      </p>
                    </div>
                  </div>
                </TerminalCard>
              ) : (
                <TerminalCard
                  title={`Incident Playbook // ${pbResult.playbookId}`}
                  label="[TACTICAL GUIDANCE]"
                  labelColor="green"
                  noPadding
                  headerRight={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pbResult.playbook)
                          setCopiedPb(true)
                          setTimeout(() => setCopiedPb(false), 2000)
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-sm text-[11px] font-mono"
                      >
                        {copiedPb ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedPb ? 'COPIED' : 'COPY'}</span>
                      </button>
                      <button
                        onClick={downloadPlaybookFile}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded-sm text-[11px] font-mono font-bold"
                      >
                        <Download size={11} />
                        <span>Save .md</span>
                      </button>
                    </div>
                  }
                >
                  <div className="p-4 bg-slate-950 max-h-[600px] overflow-y-auto font-mono text-xs">
                    <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed select-text text-[11px]">
                      {pbResult.playbook}
                    </pre>
                  </div>
                </TerminalCard>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API Reference & cURL Studio */}
      {activeTab === 'api_docs' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TerminalCard title="POST /api/fir/generate" label="[CYBER-IR ENDPOINT 1]" labelColor="cyan">
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <p className="font-sans text-slate-400">
                Generate a formal First Information Report (FIR) as PDF. Auto-maps Bharatiya Nyaya Sanhita (BNS) 2023 and Information Technology Act 2000 provisions.
              </p>

              <div className="p-3 bg-black rounded-sm border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block">// cURL Request</span>
                <pre className="text-slate-400 overflow-x-auto text-[11px] leading-relaxed">
{`curl -X POST http://localhost:3000/api/fir/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "victim_name": "Aarav Patel",
    "incident_type": "online_financial_fraud",
    "incident_date": "2026-09-17",
    "incident_time": "19:45",
    "location": "New Delhi, India",
    "incident_description": "Victim received fake electricity bill SMS...",
    "financial_details": {
      "transaction_id": "UPI/384918293819/AXIS",
      "amount": "45000",
      "upi_id": "fastpay.merchant@icici"
    }
  }'`}
                </pre>
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="POST /api/playbook/generate" label="[CYBER-IR ENDPOINT 2]" labelColor="green">
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <p className="font-sans text-slate-400">
                Generate a comprehensive SANS PICERL emergency response playbook with volatile evidence preservation checklists and statutory notification templates.
              </p>

              <div className="p-3 bg-black rounded-sm border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">// cURL Request</span>
                <pre className="text-slate-400 overflow-x-auto text-[11px] leading-relaxed">
{`curl -X POST http://localhost:3000/api/playbook/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "situation": "Ransomware outbreak on patient database...",
    "organization_type": "healthcare",
    "urgency": "critical",
    "framework": "sans_picerl"
  }'`}
                </pre>
              </div>
            </div>
          </TerminalCard>
        </div>
      )}
    </div>
  )
}
