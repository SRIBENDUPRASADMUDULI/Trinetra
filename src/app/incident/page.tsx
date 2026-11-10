'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { FileText, Download, AlertCircle, Clock, Shield, Sparkles, CheckCircle2, PhoneCall, HelpCircle, ChevronRight, Check } from 'lucide-react'

interface FIRFormData {
  complainantName: string
  complainantPhone: string
  complainantEmail: string
  aadhaarLast4: string
  victimBank: string
  lossAmount: string
  accountNumber: string
  incidentDate: string
  incidentTime: string
  transactionId: string
  attackType: string
  attackerIp: string
  evidenceDescription: string
  itActSections: string[]
  bnsSections: string[]
  bsaSections: string[]
  ipcSections?: string[]
}

const BNS_SECTIONS = [
  { id: '318_4', label: 'BNS 318(4) — Cheating & Dishonestly Inducing Delivery of Property (Formerly IPC 420)' },
  { id: '319_2', label: 'BNS 319(2) — Cheating by Personation & Identity Impersonation (Formerly IPC 419)' },
  { id: '308_2', label: 'BNS 308(2) — Extortion via Ransomware & Threats of Injury / Data Leak (Formerly IPC 384)' },
  { id: '303_2', label: 'BNS 303(2) — Theft of Digital Assets, Funds & Intellectual Property (Formerly IPC 379)' },
  { id: '336_3', label: 'BNS 336(3) — Forgery for Purpose of Cheating & Fake KYC Portals (Formerly IPC 468)' },
  { id: '340_2', label: 'BNS 340(2) — Using Forged Electronic Records & Spoofed Documents as Genuine (Formerly IPC 471)' },
  { id: '61_2', label: 'BNS 61(2) — Criminal Conspiracy in Organized Cybercrime Syndicates (Formerly IPC 120B)' },
  { id: '351_2', label: 'BNS 351(2) — Criminal Intimidation via Digital Messaging & Sextortion (Formerly IPC 506)' },
]

const IT_ACT_SECTIONS = [
  { id: '43', label: 'Section 43 — Unauthorized Access & Data Damage (Civil Penalty up to ₹1 Cr)' },
  { id: '43A', label: 'Section 43A — Failure to Protect Sensitive Personal Data (Corporate Liability)' },
  { id: '66', label: 'Section 66 — Computer-Related Fraudulent Offences & Hacking' },
  { id: '66B', label: 'Section 66B — Receiving Stolen Computer Resource / Device / Data' },
  { id: '66C', label: 'Section 66C — Punishment for Identity Theft & Digital Impersonation' },
  { id: '66D', label: 'Section 66D — Cheating by Personation using Computer (Phishing / UPI Scam)' },
  { id: '66E', label: 'Section 66E — Violation of Bodily Privacy & Unlawful Transmission' },
  { id: '66F', label: 'Section 66F — Cyber Terrorism (Attacks on Critical Infrastructure / Sovereign Security)' },
  { id: '70', label: 'Section 70 — Unauthorized Access to Protected Systems (Up to 10 Yrs Imprisonment)' },
  { id: '72', label: 'Section 72 — Breach of Confidentiality & Electronic Records Privacy' },
]

const BSA_SECTIONS = [
  { id: '63_4', label: 'BSA Section 63(4) — Mandatory Certificate of Admissibility for Electronic Evidence (Replaces Sec 65B IEA)' },
]

const RUNBOOKS = [
  {
    id: 'RB-001', label: 'Unauthorized UPI / Net Banking Fraud', severity: 'CRITICAL',
    eta: '15 min window',
    actionItem: 'Immediate financial freeze window',
    steps: [
      'IMMEDIATELY dial 1930 (National Cybercrime Reporting Helpline). Mention your Bank, Account, and UPI UTR ID.',
      'Call your Bank’s 24x7 Fraud Desk to block NetBanking, ATM card, and freeze beneficiary transfer account.',
      'Take clear screenshots of the SMS debit notification, transaction history, and fraudulent WhatsApp/call record.',
      'File an official complaint at cybercrime.gov.in within 24 to 72 hours for high recovery probability.',
      'Download the auto-generated FIR from this portal and submit a physical signed copy to your nearest Cyber Cell.',
    ],
  },
  {
    id: 'RB-002', label: 'Ransomware Outbreak & Data Lock', severity: 'CRITICAL',
    eta: '5 min immediate',
    actionItem: 'Prevent lateral spread',
    steps: [
      'IMMEDIATELY unplug the physical Ethernet cable from all infected machines (do NOT merely turn off Wi-Fi).',
      'Do NOT restart or power down the machine completely (volatile RAM holds decryption keys and process forensics).',
      'Photograph the ransom note and encrypted file extensions on your mobile camera for evidentiary records.',
      'Never pay the ransom — contact CERT-In (incident@cert-in.org.in | 1800-11-4949) immediately.',
      'Check nomoreransom.org for public decryption keys released by international cyber police task forces.',
    ],
  },
  {
    id: 'RB-003', label: 'Social Media / Email Account Hacked', severity: 'HIGH',
    eta: '10 min',
    actionItem: 'Session termination',
    steps: [
      'From a separate clean device, go to Account Security and select "Log out of all active sessions / devices".',
      'Immediately change the account password and check for unauthorized recovery email or phone number additions.',
      'Enable Multi-Factor Authentication (2FA) using an Authenticator app instead of SMS OTP.',
      'Alert close contacts on other channels that your profile was compromised and to ignore any money requests.',
    ],
  },
]

function generateFIR(data: FIRFormData): string {
  const firNo = `CYB/FIR/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000) + 1000}`
  const certRef = `CERTIN-INC-${Date.now().toString().slice(-8)}`
  
  const itList = (data.itActSections || []).map(s => {
    const item = IT_ACT_SECTIONS.find(x => x.id === s)
    return item ? item.label.split(' — ')[0] + ' IT Act 2000' : `Section ${s} IT Act`
  })
  const bnsList = (data.bnsSections || []).map(s => {
    const item = BNS_SECTIONS.find(x => x.id === s)
    return item ? item.label.split(' — ')[0] : `Section ${s} BNS 2023`
  })
  const bsaList = (data.bsaSections || []).map(s => {
    const item = BSA_SECTIONS.find(x => x.id === s)
    return item ? item.label.split(' — ')[0] : `Section ${s} BSA 2023`
  })
  
  const allSections = [...itList, ...bnsList, ...bsaList].join(', ')

  return `NATIONAL CYBER CRIME REPORTING PORTAL — INDIA
Government of India | Ministry of Home Affairs
National Crime Records Bureau (NCRB)
FIR Reference: ${firNo}
CERT-In Incident Dispatch: ${certRef}
Classification: TLP:AMBER // FORMAL CYBERCRIME COMPLAINT

════════════════════════════════════════════════════════════════════════════
FIRST INFORMATION REPORT (Section 154 CrPC / BNSS 2023)
════════════════════════════════════════════════════════════════════════════

To,
The Station House Officer (SHO),
Cyber Crime Police Station, [Jurisdiction District], India.

Subject: Formal complaint regarding cybercrime offence under Information Technology Act 2000 and Bharatiya Nyaya Sanhita (BNS 2023).

════════════════════════════════════════════════════════════════════════════
1. COMPLAINANT PARTICULARS
════════════════════════════════════════════════════════════════════════════
Full Name:           ${data.complainantName}
Contact Phone:       ${data.complainantPhone}
Email Address:       ${data.complainantEmail}
Aadhaar (Last 4):    XXXX-XXXX-${data.aadhaarLast4 || 'XXXX'}
Filing Date & Time:  ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN')} IST

════════════════════════════════════════════════════════════════════════════
2. PARTICULARS OF INCIDENT & FINANCIAL LOSS
════════════════════════════════════════════════════════════════════════════
Date of Incident:    ${data.incidentDate}
Time of Incident:    ${data.incidentTime} IST
Offence Category:    ${data.attackType}
Total Loss Incurred: INR ${data.lossAmount ? Number(data.lossAmount).toLocaleString('en-IN') : 'Under assessment'}
Victim Bank:         ${data.victimBank || 'N/A'}
Affected Account:    XXXX-XXXX-${data.accountNumber?.slice(-4) || 'XXXX'}
Transaction UTR/ID:  ${data.transactionId || 'Pending Bank Statement'}

════════════════════════════════════════════════════════════════════════════
3. NARRATIVE & CHRONOLOGY OF FACTS
════════════════════════════════════════════════════════════════════════════
${data.evidenceDescription}

Alleged Attacker Coordinate: ${data.attackerIp || 'Under electronic trace'}

════════════════════════════════════════════════════════════════════════════
4. STATUTORY PROVISIONS & APPLICABLE LAWS
════════════════════════════════════════════════════════════════════════════
The above acts constitute cognizable offences under:
${allSections || 'Section 66, 66D IT Act 2000 read with Section 318(4), 319(2) BNS 2023 and Section 63 BSA 2023'}

════════════════════════════════════════════════════════════════════════════
5. PRAYER & INVESTIGATIVE RELIEF SOUGHT
════════════════════════════════════════════════════════════════════════════
1. Immediate registration of FIR under Section 173 BNSS 2023 (Section 154 CrPC).
2. Issuance of Notice under Section 94 BNSS 2023 (Section 91 CrPC) to beneficiary banks/payment gateways for immediate freeze of fraudulent accounts.
3. Order under Section 67C IT Act to intermediaries for preservation of IPDR/CDR logs.
4. Admissibility Certificate generated under Section 63(4) Bharatiya Sakshya Adhiniyam (BSA 2023).

Verification & Declaration:
I, ${data.complainantName}, hereby verify that the facts stated above are true and accurate to the best of my personal knowledge.

Complainant Signature: _______________________
Date: ${new Date().toLocaleDateString('en-IN')}

Official Reference: ${firNo} | Portal: cybercrime.gov.in | Helpline: 1930`
}

export default function IncidentPage() {
  const [tab, setTab] = useState<'runbooks' | 'fir'>('fir')
  const [firText, setFirText] = useState<string | null>(null)
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FIRFormData>({
    defaultValues: {
      itActSections: ['43', '66', '66D'],
      bnsSections: ['318_4', '319_2'],
      bsaSections: ['63_4'],
    },
  })

  const selectedBns = watch('bnsSections') || []
  const selectedIt = watch('itActSections') || []
  const selectedBsa = watch('bsaSections') || []

  function fillDemo() {
    setValue('complainantName', 'Ramesh Kumar Sharma')
    setValue('complainantPhone', '+91-9876543210')
    setValue('complainantEmail', 'ramesh.sharma@example.com')
    setValue('aadhaarLast4', '8492')
    setValue('victimBank', 'State Bank of India')
    setValue('lossAmount', '48500')
    setValue('accountNumber', '38491029482')
    setValue('incidentDate', '2026-09-17')
    setValue('incidentTime', '18:45')
    setValue('transactionId', 'UPI/384729184719/SBIN')
    setValue('attackType', 'Financial Fraud / UPI Fraud')
    setValue('attackerIp', '45.33.32.156 / Unofficial SMS handle')
    setValue('evidenceDescription', 'Received an urgent SMS claiming my SBI account would be permanently blocked if KYC was not updated within 24 hours. The SMS contained link http://sbi-kyc-update-portal.xyz. After entering details, two unauthorized debit transactions of Rs 25,000 and Rs 23,500 occurred via UPI to beneficiary handle fastpay@icici.')
    setValue('itActSections', ['43', '66', '66D'])
    setValue('bnsSections', ['318_4', '319_2', '336_3'])
    setValue('bsaSections', ['63_4'])
  }

  function onSubmit(data: FIRFormData) {
    const fir = generateFIR(data)
    setFirText(fir)
  }

  async function downloadPDF() {
    if (!firText) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFont('Courier', 'normal')
    doc.setFontSize(8)
    const lines = doc.splitTextToSize(firText, 520)
    let y = 40
    lines.forEach((line: string) => {
      if (y > 800) { doc.addPage(); y = 40 }
      doc.text(line, 40, y)
      y += 11
    })
    doc.save(`TRINETRA_Cyber_FIR_${Date.now()}.pdf`)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-semibold">
                LEGAL EV-04 // INCIDENT COMMAND
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono text-slate-300 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                SEC. 154 CrPC & BNS 2023
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              04 // Incident Command & Cyber FIR Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Step-by-step crisis runbooks for active cyber attacks and automated drafting of court-admissible First Information Reports (FIR) for immediate police, bank, and cyber cell filing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <a
              href="tel:1930"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <PhoneCall size={14} className="text-amber-400" />
              <span>Helpline 1930</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-fit">
        <button
          onClick={() => setTab('fir')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            tab === 'fir'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <FileText size={15} />
          <span>Indian Cybercrime FIR Generator (PDF)</span>
        </button>
        <button
          onClick={() => setTab('runbooks')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            tab === 'runbooks'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          <Clock size={15} />
          <span>Crisis Response Playbooks</span>
        </button>
      </div>

      {tab === 'fir' && (
        <div className="space-y-6">
          {!firText ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Demo Helper Banner */}
              <div className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Sparkles size={16} className="text-indigo-400 flex-shrink-0" />
                  <span>Don't want to type manually? Click to pre-fill with a realistic Indian banking fraud scenario.</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-indigo-300 hover:text-white transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-rose-400" />
                  <span>1-Click Pre-fill Incident</span>
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Complainant Details */}
                <TerminalCard title="Step 1: Complainant Information" labelColor="cyan">
                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Full Legal Name *</label>
                      <input
                        {...register('complainantName', { required: true })}
                        placeholder="e.g. Ramesh Kumar Sharma"
                        className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-cyan-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Phone Number *</label>
                        <input
                          {...register('complainantPhone', { required: true })}
                          placeholder="+91-XXXXXXXXXX"
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-cyan-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Email Address *</label>
                        <input
                          {...register('complainantEmail', { required: true })}
                          placeholder="victim@email.com"
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-cyan-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Aadhaar (Last 4 Digits)</label>
                      <input
                        {...register('aadhaarLast4')}
                        placeholder="e.g. 8492 (Optional for identity verification)"
                        maxLength={4}
                        className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-cyan-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                      />
                    </div>
                  </div>
                </TerminalCard>

                {/* Financial & Occurrence */}
                <TerminalCard title="Step 2: Incident & Financial Loss" labelColor="red">
                  <div className="space-y-3 font-sans text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Victim Bank / Service *</label>
                        <input
                          {...register('victimBank', { required: true })}
                          placeholder="e.g. State Bank of India / Paytm"
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-rose-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Total Loss (INR ₹) *</label>
                        <input
                          {...register('lossAmount', { required: true })}
                          placeholder="e.g. 48500"
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-rose-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Account Number (Optional)</label>
                        <input
                          {...register('accountNumber')}
                          placeholder="XXXX-XXXX-XXXX"
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-rose-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">UPI Ref / UTR / Txn ID</label>
                        <input
                          {...register('transactionId')}
                          placeholder="e.g. UPI/1234567890/..."
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-rose-500 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none font-mono text-xs transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Date of Incident *</label>
                        <input
                          {...register('incidentDate', { required: true })}
                          type="date"
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-rose-500 rounded-xl text-slate-100 outline-none font-mono text-xs color-scheme-dark transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Time of Incident *</label>
                        <input
                          {...register('incidentTime', { required: true })}
                          type="time"
                          className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] focus:border-rose-500 rounded-xl text-slate-100 outline-none font-mono text-xs color-scheme-dark transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </TerminalCard>
              </div>

              {/* Legal Sections & Narrative */}
              <TerminalCard title="Step 3: Incident Narrative & Statutory Classification" labelColor="red">
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Cybercrime Category *</label>
                      <select
                        {...register('attackType', { required: true })}
                        className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] rounded-xl text-slate-200 outline-none text-xs focus:border-indigo-500 transition-colors font-mono"
                      >
                        <option value="">Select crime type...</option>
                        <option value="Financial Fraud / UPI Fraud">Financial Fraud / UPI Fraud</option>
                        <option value="Phishing / Fake KYC Link">Phishing / Fake KYC Link</option>
                        <option value="Identity Theft / Impersonation">Identity Theft / Impersonation</option>
                        <option value="Ransomware & System Extortion">Ransomware & System Extortion</option>
                        <option value="Unauthorized Access & Data Leak">Unauthorized Access & Data Leak</option>
                        <option value="Social Media Account Hijack">Social Media Account Hijack</option>
                        <option value="SIM Swap & OTP Bypass">SIM Swap & OTP Bypass</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Attacker Contact / Website</label>
                      <input
                        {...register('attackerIp')}
                        placeholder="e.g. +91-9876543210 or fake URL"
                        className="w-full p-2.5 bg-[#090D16] border border-white/[0.08] rounded-xl text-slate-200 placeholder:text-slate-500 outline-none text-xs focus:border-indigo-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Statutory Classification Frameworks with Tactical Chips */}
                  <div className="space-y-4 pt-1">
                    {/* BNS 2023 Section */}
                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-indigo-300 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          Bharatiya Nyaya Sanhita (BNS 2023 — Substantive Criminal Code)
                        </label>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                          Replaced IPC (1860)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {BNS_SECTIONS.map(s => {
                          const isChecked = selectedBns.includes(s.id)
                          const parts = s.label.split(' — ')
                          return (
                            <label
                              key={s.id}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.2)] text-white'
                                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all flex-shrink-0 ${
                                isChecked ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-white/[0.2] bg-white/[0.04]'
                              }`}>
                                {isChecked && <Check size={11} strokeWidth={3} />}
                              </div>
                              <input type="checkbox" value={s.id} {...register('bnsSections')} className="sr-only" />
                              <div className="space-y-0.5">
                                <span className="font-mono text-[11px] font-bold text-indigo-300 block">
                                  {parts[0]}
                                </span>
                                <span className="text-[11px] text-slate-300 leading-snug block font-sans">
                                  {parts[1] || s.label}
                                </span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* IT Act 2000 Section */}
                    <div className="p-4 rounded-xl bg-cyan-950/15 border border-cyan-500/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-cyan-300 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          Information Technology Act, 2000 (Amended 2008 — Cyber Law)
                        </label>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                          Primary Cyber Statute
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {IT_ACT_SECTIONS.map(s => {
                          const isChecked = selectedIt.includes(s.id)
                          const parts = s.label.split(' — ')
                          return (
                            <label
                              key={s.id}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)] text-white'
                                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all flex-shrink-0 ${
                                isChecked ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-white/[0.2] bg-white/[0.04]'
                              }`}>
                                {isChecked && <Check size={11} strokeWidth={3} />}
                              </div>
                              <input type="checkbox" value={s.id} {...register('itActSections')} className="sr-only" />
                              <div className="space-y-0.5">
                                <span className="font-mono text-[11px] font-bold text-cyan-300 block">
                                  {parts[0]}
                                </span>
                                <span className="text-[11px] text-slate-300 leading-snug block font-sans">
                                  {parts[1] || s.label}
                                </span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* BSA 2023 Electronic Evidence Section */}
                    <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-500/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-amber-300 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Bharatiya Sakshya Adhiniyam (BSA 2023 — Digital Evidence Admissibility)
                        </label>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                          Replaced Sec 65B IEA
                        </span>
                      </div>
                      <div className="text-xs">
                        {BSA_SECTIONS.map(s => {
                          const isChecked = selectedBsa.includes(s.id)
                          const parts = s.label.split(' — ')
                          return (
                            <label
                              key={s.id}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)] text-white'
                                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all flex-shrink-0 ${
                                isChecked ? 'bg-amber-500 border-amber-400 text-white' : 'border-white/[0.2] bg-white/[0.04]'
                              }`}>
                                {isChecked && <Check size={11} strokeWidth={3} />}
                              </div>
                              <input type="checkbox" value={s.id} {...register('bsaSections')} className="sr-only" />
                              <div className="space-y-0.5">
                                <span className="font-mono text-[11px] font-bold text-amber-300 block">
                                  {parts[0]}
                                </span>
                                <span className="text-[11px] text-slate-300 leading-snug block font-sans">
                                  {parts[1] || s.label}
                                </span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      Detailed Incident Narrative (What happened? Chronological order) *
                    </label>
                    <textarea
                      {...register('evidenceDescription', { required: true })}
                      placeholder="Explain step-by-step: how you were contacted, what link was clicked, what OTP was shared, and the exact debit amounts..."
                      rows={4}
                      className="w-full p-3 bg-[#090D16] border border-white/[0.08] rounded-xl text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 text-xs transition-colors font-mono"
                    />
                  </div>
                </div>
              </TerminalCard>

              {/* Tactical Defense Command Action Button (Palantir Gotham Style) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#0E1424] hover:bg-[#141C32] border border-indigo-500/40 hover:border-indigo-400 text-white rounded-2xl shadow-xl shadow-indigo-950/50 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                    <FileText size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold text-white tracking-wide flex items-center gap-2">
                      <span>[EXECUTE_STATUTORY_FIR_SYNTHESIS]</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Generates court-admissible PDF under Sec. 173 BNSS 2023 &amp; Sec. 63 BSA 2023
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 font-mono text-[11px] text-indigo-200">
                  <span>COMPOSE DOSSIER</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-300">FIR COMPLAINT GENERATED SUCCESSFULLY</p>
                    <p className="text-xs text-slate-400">
                      Formatted under Section 154 CrPC & BNS 2023. Valid for direct submission to Cyber Crime Police Station.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFirText(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all"
                  >
                    ← Edit Form
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-emerald-950/40"
                  >
                    <Download size={14} />
                    <span>Download Official PDF</span>
                  </button>
                </div>
              </div>

              <TerminalCard title="Generated Legal Dossier Preview" label="PRINT-READY" labelColor="green" noPadding>
                <pre
                  className="p-5 font-mono text-xs leading-relaxed overflow-auto max-h-[600px] text-emerald-400 bg-slate-950 whitespace-pre-wrap select-text"
                >
                  {firText}
                </pre>
              </TerminalCard>
            </div>
          )}
        </div>
      )}

      {/* Runbooks Tab */}
      {tab === 'runbooks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {RUNBOOKS.map(rb => (
            <TerminalCard
              key={rb.id}
              title={rb.label}
              label={`[${rb.severity}]`}
              labelColor={rb.severity === 'CRITICAL' ? 'red' : 'amber'}
              headerRight={
                <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock size={11} />
                  {rb.eta}
                </span>
              }
            >
              <div className="space-y-3 font-sans text-xs">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 font-mono text-[11px]">
                  <strong>Primary Objective:</strong> {rb.actionItem}
                </div>

                <div className="space-y-2">
                  {rb.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="font-mono text-emerald-400 font-bold flex-shrink-0 text-xs">
                        {i + 1}.
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TerminalCard>
          ))}
        </div>
      )}
    </div>
  )
}
