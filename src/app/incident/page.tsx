'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { jsPDF } from 'jspdf'
import {
  FileText, PhoneCall, Clock, ShieldCheck, AlertTriangle, Download,
  Upload, Lock, CheckCircle2, UserCheck, EyeOff, RefreshCw, Copy, Check
} from 'lucide-react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { useLang } from '@/lib/i18n-context'

interface FIRFormData {
  stateUt: string
  districtStation: string
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
}

const INDIAN_STATES_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi (NCT)',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
]

const IT_ACT_OPTIONS = [
  { code: '§43', label: '§43 Unauthorized Access / Data Damage' },
  { code: '§66', label: '§66 Computer-Related Offences' },
  { code: '§66C', label: '§66C Identity Theft / Credential Misuse' },
  { code: '§66D', label: '§66D Cheating by Personation (Phishing/UPI)' },
  { code: '§70B(6)', label: '§70B(6) Mandatory 6-Hr CERT-In Reporting' },
]

const BNS_OPTIONS = [
  { code: '§318(4)', label: 'BNS §318(4) Cheating & Dishonest Delivery (Fraud)' },
  { code: '§319(2)', label: 'BNS §319(2) Cheating by Personation' },
  { code: '§336(3)', label: 'BNS §336(3) Electronic Record Forgery' },
  { code: '§351', label: 'BNS §351 Criminal Intimidation / Sextortion' },
]

const BSA_OPTIONS = [
  { code: '§63(1)', label: 'BSA §63(1) Admissibility of Electronic Records' },
  { code: '§63(4)', label: 'BSA §63(4) Mandatory SHA-256 Hash Certificate' },
]

function buildDeterministicFIR(
  data: FIRFormData,
  mode: 'track' | 'anonymous',
  attachedSha256: string | null,
  attachedFileName: string | null
): string {
  const istNow = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  const docketId = `NCRP-TRN-${Math.floor(100000 + Math.random() * 900000)}`
  const complainantLine =
    mode === 'anonymous'
      ? 'Complainant Identity  : ANONYMOUS CITIZEN REPORT (Cybercrime.gov.in Protected Track)'
      : `Complainant Name      : ${data.complainantName || 'Not Provided'}\nMobile / Email        : ${data.complainantPhone || 'N/A'} | ${data.complainantEmail || 'N/A'}\nGovt ID Ref (Masked)  : XXXX-XXXX-${data.aadhaarLast4 || '0000'}`

  return `================================================================================
FIRST INFORMATION / STATUTORY CYBER INCIDENT DOSSIER (DRAFT)
Aligned with Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 & Cybercrime.gov.in
================================================================================
Reference Draft ID    : ${docketId}
Generated Timestamp   : ${istNow} IST
Reporting Mode        : ${mode === 'anonymous' ? 'ANONYMOUS TIP / REPORT' : 'REPORT & TRACK (OTP VERIFIED)'}
Jurisdiction          : ${data.stateUt} — ${data.districtStation || 'Cyber Crime Police Station'}
Helpline Escalation   : 1930 (Financial Freeze Desk) / CERT-In Incident Desk

1. COMPLAINANT DETAILS
--------------------------------------------------------------------------------
${complainantLine}

2. INCIDENT & FINANCIAL LOSS PARTICULARS
--------------------------------------------------------------------------------
Offence Category      : ${data.attackType}
Date & Time (IST)     : ${data.incidentDate || 'Not specified'} ${data.incidentTime || ''}
Bank / Wallet Entity  : ${data.victimBank || 'Not applicable'}
Masked Account / UPI  : ${data.accountNumber || 'Not applicable'}
Financial Loss (INR)  : Rs. ${data.lossAmount || '0'}
Transaction / UTR ID  : ${data.transactionId || 'N/A'}
Suspect IOC / URL/IP  : ${data.attackerIp || 'Pending ISP / NPCI trace'}

3. INVOKED STATUTORY PROVISIONS
--------------------------------------------------------------------------------
IT Act 2000           : ${(data.itActSections || []).join(', ') || '§43, §66, §66D'}
BNS 2023              : ${(data.bnsSections || []).join(', ') || '§318(4), §319(2)'}
BSA 2023 Evidence     : ${(data.bsaSections || []).join(', ') || '§63(1), §63(4)'}

4. INCIDENT NARRATIVE
--------------------------------------------------------------------------------
${data.evidenceDescription}

5. ELECTRONIC EVIDENCE PRESERVATION (BSA 2023 §63)
--------------------------------------------------------------------------------
Attached Artifact     : ${attachedFileName || 'Textual & Transaction Log Submission'}
SHA-256 Digest        : ${attachedSha256 || 'Computed upon final certificate issuance'}
CERT-In Mandate       : Must be logged within 6 hours under IT Act §70B(6) directions.

NOTE: AI/template assisted statutory draft — verify manually with Investigating Officer
before formal registration under BNSS 2023.
================================================================================`
}

export default function IncidentFirPage() {
  const { t } = useLang()
  const [reportMode, setReportMode] = useState<'track' | 'anonymous'>('track')
  const [submitting, setSubmitting] = useState(false)
  const [firOutput, setFirOutput] = useState<string | null>(null)
  const [firMeta, setFirMeta] = useState<{
    usedAI: boolean
    provider: string
    model: string
    requestId: string | null
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // Evidence SHA-256 attachment state
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null)
  const [attachedSha256, setAttachedSha256] = useState<string | null>(null)
  const [certStatus, setCertStatus] = useState<string | null>(null)
  const [issuingCert, setIssuingCert] = useState(false)

  // Mobile OTP workflow state (30-min validity notice)
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)
  const [otpInput, setOtpInput] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0)

  // Live 6-Hour CERT-In Statutory Countdown (21,600 seconds)
  const [certInSeconds, setCertInSeconds] = useState(6 * 3600)

  useEffect(() => {
    const timer = setInterval(() => {
      setCertInSeconds((prev) => (prev > 0 ? prev - 1 : 0))
      setOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FIRFormData>({
    defaultValues: {
      stateUt: 'Delhi (NCT)',
      districtStation: 'Cyber Crime Cell — IFSO Special Cell',
      complainantName: '',
      complainantPhone: '',
      complainantEmail: '',
      aadhaarLast4: '',
      victimBank: 'State Bank of India (SBI)',
      lossAmount: '',
      accountNumber: '',
      incidentDate: new Date().toISOString().slice(0, 10),
      incidentTime: '14:30',
      transactionId: '',
      attackType: 'UPI / Banking KYC Phishing Scam',
      attackerIp: '',
      evidenceDescription: '',
      itActSections: ['§66C', '§66D', '§70B(6)'],
      bnsSections: ['§318(4)', '§319(2)'],
      bsaSections: ['§63(1)', '§63(4)'],
    },
  })

  const watchPhone = watch('complainantPhone')
  const watchItAct = watch('itActSections')
  const watchBns = watch('bnsSections')
  const watchBsa = watch('bsaSections')

  const toggleSection = (field: 'itActSections' | 'bnsSections' | 'bsaSections', code: string, current: string[]) => {
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
    setValue(field, next)
  }

  const handleSendOtp = () => {
    if (!watchPhone || watchPhone.replace(/\D/g, '').length < 10) return
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setGeneratedOtp(code)
    setOtpVerified(false)
    setOtpInput('')
    setOtpSecondsLeft(30 * 60) // 30-min validity
  }

  const handleVerifyOtp = () => {
    if (generatedOtp && otpInput.trim() === generatedOtp && otpSecondsLeft > 0) {
      setOtpVerified(true)
    }
  }

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const buf = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', buf)
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    setAttachedFileName(file.name)
    setAttachedSha256(hex)
  }

  const onSubmit = async (data: FIRFormData) => {
    setSubmitting(true)
    setCertStatus(null)
    const enrichedNarrative = attachedSha256
      ? `${data.evidenceDescription}\n\n[Attached Evidence File: ${attachedFileName} | Client SHA-256: ${attachedSha256}]`
      : data.evidenceDescription

    const payload = {
      ...data,
      complainantName: reportMode === 'anonymous' ? 'Anonymous Reporter' : data.complainantName,
      complainantPhone: reportMode === 'anonymous' ? 'WITHHELD' : data.complainantPhone,
      complainantEmail: reportMode === 'anonymous' ? 'WITHHELD' : data.complainantEmail,
      evidenceDescription: enrichedNarrative,
    }

    try {
      const res = await fetch('/api/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok && json.success && json.firDraft) {
        setFirOutput(json.firDraft)
        setFirMeta({
          usedAI: !!json.usedAI,
          provider: json.provider || 'bharatcode',
          model: json.model || 'qwen-3.8-27b',
          requestId: json.requestId || null,
        })
      } else {
        setFirOutput(buildDeterministicFIR(data, reportMode, attachedSha256, attachedFileName))
        setFirMeta({
          usedAI: false,
          provider: json.provider || 'deterministic-kernel',
          model: json.model || 'bnss-2023-template-v2',
          requestId: json.requestId || null,
        })
      }
    } catch {
      setFirOutput(buildDeterministicFIR(data, reportMode, attachedSha256, attachedFileName))
      setFirMeta({
        usedAI: false,
        provider: 'deterministic-kernel',
        model: 'bnss-2023-template-v2',
        requestId: null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadFirPdf = () => {
    if (!firOutput) return
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFont('Courier', 'bold')
    doc.setFontSize(11)
    doc.text('TRINETRA // STATUTORY CYBER INCIDENT FIR DRAFT', 40, 44)
    doc.setFont('Courier', 'normal')
    doc.setFontSize(8.5)
    const wrapped = doc.splitTextToSize(firOutput, 515)
    let y = 66
    for (const line of wrapped) {
      if (y > 790) {
        doc.addPage()
        y = 44
      }
      doc.text(line, 40, y)
      y += 12
    }
    doc.save(`TRINETRA_FIR_DRAFT_${Date.now()}.pdf`)
  }

  const handleExportBsa63Certificate = async () => {
    if (!firOutput) return
    setIssuingCert(true)
    setCertStatus(null)
    try {
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePanel: '04 // Incident Response & FIR',
          payload: firOutput,
          verdict: 'STATUTORY FIR & EVIDENCE PRESERVATION',
          confidence: 'DETERMINISTIC SHA-256',
          category: watch('attackType'),
          flags: [...(watchItAct || []), ...(watchBns || []), ...(watchBsa || [])],
          requestId: firMeta?.requestId || undefined,
          model: firMeta?.model || 'bnss-2023-kernel',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.certificate?.downloadUrl) {
        throw new Error(data.error || 'Certificate error')
      }
      const link = document.createElement('a')
      link.href = data.certificate.downloadUrl
      link.download = `TRINETRA_BSA63_${data.certificate.certId}.pdf`
      link.click()
      setCertStatus(`Issued ${data.certificate.certId} · SHA-256: ${data.certificate.sha256Hash.slice(0, 16)}...`)
    } catch (err: unknown) {
      setCertStatus(err instanceof Error ? err.message : 'Failed to issue certificate')
    } finally {
      setIssuingCert(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top 1930 Helpline + CERT-In 6-Hour Countdown Banner */}
      <section className="rounded-xl bg-[#0A0A12] border border-[#1A1A2E] p-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#03030A] border border-[#1A1A2E] text-[10px] font-mono font-bold text-[#FF9F1C]">
                04 // INCIDENT RESPONSE &amp; STATUTORY FIR
              </span>
              <span className="px-2.5 py-1 rounded bg-[#00D4FF]/15 border border-[#00D4FF]/35 text-[10px] font-mono text-[#00D4FF]">
                BNS 2023 · IT Act 2000 · BSA 2023 §63 · cybercrime.gov.in Compatible
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] font-serif">
              {t('National Cyber Incident Filing & Statutory FIR Desk', 'राष्ट्रीय साइबर घटना एवं वैधानिक एफआईआर डेस्क')}
            </h1>
            <p className="text-xs text-[#888888] leading-relaxed">
              {t(
                'Generate structured FIR complaints mapped to Bharatiya Nyaya Sanhita (BNS 2023) & IT Act sections, compute client-side SHA-256 hashes, and export BSA 2023 §63 certificates.',
                'भारतीय न्याय संहिता (बीएनएस 2023) और आईटी एक्ट धाराओं के अनुरूप एफआईआर ड्राफ्ट तथा बीएसए §63 प्रमाणपत्र तैयार करें।'
              )}
            </p>
          </div>

          {/* 1930 Emergency Callout & 6-Hour CERT-In SLA Countdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div className="px-4 py-3 rounded-lg bg-[#03030A] border border-[#FF1B1B]/45 flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-[#FF1B1B] shrink-0" />
              <div>
                <div className="text-[10px] font-mono uppercase text-[#FF1B1B] font-bold">
                  Golden Hour Financial Freeze
                </div>
                <div className="text-base font-mono font-bold text-[#F5F5F5]">Call 1930 Now</div>
                <div className="text-[10px] text-[#888888]">cybercrime.gov.in</div>
              </div>
            </div>

            <div className="px-4 py-3 rounded-lg bg-[#03030A] border border-[#FF9F1C]/45 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#FF9F1C] shrink-0" />
              <div>
                <div className="text-[10px] font-mono uppercase text-[#FF9F1C] font-bold">
                  CERT-In §70B(6) SLA
                </div>
                <div className="text-base font-mono font-bold text-[#F5F5F5] tabular-nums">
                  {formatDuration(certInSeconds)}
                </div>
                <div className="text-[10px] text-[#888888]">6-Hour Mandatory Window</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form & FIR Output Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <TerminalCard
            title={t('Complaint & Incident Registration Form', 'शिकायत एवं घटना पंजीकरण फॉर्म')}
            label={reportMode === 'track' ? 'REPORT & TRACK' : 'ANONYMOUS REPORT'}
            labelColor={reportMode === 'track' ? 'amber' : 'cyan'}
            headerRight={
              <div className="flex items-center gap-1 bg-[#03030A] p-0.5 rounded-lg border border-[#1A1A2E]">
                <button
                  type="button"
                  onClick={() => setReportMode('track')}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    reportMode === 'track' ? 'bg-[#FF9F1C] text-[#03030A]' : 'text-[#888888] hover:text-[#F5F5F5]'
                  }`}
                >
                  <UserCheck className="w-3 h-3" /> Track
                </button>
                <button
                  type="button"
                  onClick={() => setReportMode('anonymous')}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    reportMode === 'anonymous' ? 'bg-[#00D4FF] text-[#03030A]' : 'text-[#888888] hover:text-[#F5F5F5]'
                  }`}
                >
                  <EyeOff className="w-3 h-3" /> Anonymous
                </button>
              </div>
            }
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('State / Union Territory', 'राज्य / केंद्र शासित प्रदेश')} <span className="text-[#FF1B1B]">*</span>
                  </label>
                  <select
                    {...register('stateUt', { required: true })}
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                  >
                    {INDIAN_STATES_UTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('District / Cyber Police Station', 'जिला / साइबर थाना')} <span className="text-[#FF1B1B]">*</span>
                  </label>
                  <input
                    {...register('districtStation', { required: true })}
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              {/* Citizen Track Fields + Mobile OTP Verification */}
              {reportMode === 'track' && (
                <div className="p-4 rounded-lg bg-[#03030A]/70 border border-[#1A1A2E] space-y-4">
                  <div className="text-[11px] font-mono uppercase text-[#00D4FF] font-semibold">
                    {t('Complainant Verification (cybercrime.gov.in Citizen Flow)', 'शिकायतकर्ता सत्यापन')}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                        {t('Full Name', 'पूरा नाम')} <span className="text-[#FF1B1B]">*</span>
                      </label>
                      <input
                        {...register('complainantName', { required: reportMode === 'track' })}
                        placeholder="e.g. Rajesh Kumar Sharma"
                        className="w-full rounded-lg bg-[#0A0A12] border border-[#1A1A2E] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                        {t('Email ID', 'ईमेल आईडी')}
                      </label>
                      <input
                        type="email"
                        {...register('complainantEmail')}
                        placeholder="citizen@example.in"
                        className="w-full rounded-lg bg-[#0A0A12] border border-[#1A1A2E] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                      />
                    </div>
                  </div>

                  {/* Mobile + OTP Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                        {t('Mobile Number (+91)', 'मोबाइल नंबर')} <span className="text-[#FF1B1B]">*</span>
                      </label>
                      <input
                        {...register('complainantPhone', { required: reportMode === 'track' })}
                        placeholder="9876543210"
                        className="w-full rounded-lg bg-[#0A0A12] border border-[#1A1A2E] px-3 py-2 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full py-2 px-3 rounded-lg bg-[#0A0A12] hover:bg-[#121222] border border-[#FF9F1C]/50 text-[#FF9F1C] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Send OTP
                      </button>
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                        {t('Aadhaar Last 4 Digits', 'आधार के अंतिम 4 अंक')}
                      </label>
                      <input
                        maxLength={4}
                        {...register('aadhaarLast4')}
                        placeholder="4321"
                        className="w-full rounded-lg bg-[#0A0A12] border border-[#1A1A2E] px-3 py-2 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                      />
                    </div>
                  </div>

                  {generatedOtp && (
                    <div className="p-3 rounded-lg bg-[#0A0A12] border border-[#00D4FF]/35 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="font-mono text-[#00D4FF]">
                        Session Demo OTP: <strong className="text-[#FF9F1C]">{generatedOtp}</strong>{' '}
                        <span className="text-[10px] text-[#888888]">
                          (Valid for {formatDuration(otpSecondsLeft)} / 30m limit)
                        </span>
                      </div>
                      {otpVerified ? (
                        <span className="inline-flex items-center gap-1 text-[#00D4FF] font-mono font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OTP VERIFIED
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-28 rounded bg-[#03030A] border border-[#1A1A2E] px-2 py-1 text-xs font-mono text-[#F5F5F5]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="px-2.5 py-1 rounded bg-[#00D4FF] text-[#03030A] text-[11px] font-bold cursor-pointer"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Incident & Financial Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('Incident Category', 'अपराध श्रेणी')} <span className="text-[#FF1B1B]">*</span>
                  </label>
                  <select
                    {...register('attackType')}
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                  >
                    <option value="UPI / Banking KYC Phishing Scam">UPI / Banking KYC Phishing Scam</option>
                    <option value="Deepfake Video KYC / Voice Impersonation">Deepfake / Voice Impersonation</option>
                    <option value="Ransomware / Critical Infra Intrusion">Ransomware / CII Intrusion</option>
                    <option value="Social Media Account Takeover / Extortion">Social Media Extortion / Takeover</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('Incident Date', 'घटना तिथि')} <span className="text-[#FF1B1B]">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('incidentDate', { required: true })}
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs font-mono text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('Time (IST)', 'समय (IST)')}
                  </label>
                  <input
                    type="time"
                    {...register('incidentTime')}
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs font-mono text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('Bank / Payment Wallet', 'बैंक / पेमेंट वॉलेट')}
                  </label>
                  <input
                    {...register('victimBank')}
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('Loss Amount (INR)', 'नुकसान राशि (INR)')}
                  </label>
                  <input
                    {...register('lossAmount')}
                    placeholder="25000"
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs font-mono text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                    {t('UTR / Transaction Reference', 'यूटीआर / लेनदेन आईडी')}
                  </label>
                  <input
                    {...register('transactionId')}
                    placeholder="428910348219"
                    className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs font-mono text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                  {t('Suspect URL / Phone / Attacker IP', 'संदिग्ध यूआरएल / फोन / आईपी')}
                </label>
                <input
                  {...register('attackerIp')}
                  placeholder="https://sbi-kyc-verif.top | +91-XXXXXXXXXX"
                  className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] px-3 py-2 text-xs font-mono text-[#F5F5F5]"
                />
              </div>

              {/* Mandatory Incident Narrative */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F5F5] mb-1">
                  {t('Detailed Incident Narrative', 'घटना का विस्तृत विवरण')} <span className="text-[#FF1B1B]">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register('evidenceDescription', {
                    required: 'Detailed narrative is required (minimum 10 characters)',
                    minLength: { value: 10, message: 'Enter at least 10 characters describing the incident' },
                  })}
                  placeholder="Describe chronologically how the fraud or intrusion occurred, URLs clicked, and unauthorized debits..."
                  className="w-full rounded-lg bg-[#03030A] border border-[#1A1A2E] p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
                />
                {errors.evidenceDescription && (
                  <p className="text-[11px] text-[#FF1B1B] mt-1">{errors.evidenceDescription.message}</p>
                )}
              </div>

              {/* Client-Side SHA-256 File Hashing */}
              <div className="p-3.5 rounded-lg bg-[#03030A] border border-[#1A1A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00D4FF]" />
                    Attach Digital Evidence (Client-Side SHA-256 Digest)
                  </div>
                  <div className="text-[11px] text-[#888888] font-mono">
                    {attachedSha256
                      ? `${attachedFileName} · SHA-256: ${attachedSha256.slice(0, 24)}...`
                      : 'Select SMS screenshot, bank PDF, or PCAP — hashed locally in browser'}
                  </div>
                </div>
                <label className="px-3 py-2 rounded-lg bg-[#0A0A12] hover:bg-[#121222] border border-[#1A1A2E] text-xs font-semibold text-[#00D4FF] flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  Select File
                  <input type="file" onChange={handleFileAttach} className="hidden" />
                </label>
              </div>

              {/* Statutory Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#03030A] border border-[#1A1A2E] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#FF9F1C] font-bold">IT Act 2000 Sections</div>
                  {IT_ACT_OPTIONS.map((opt) => (
                    <label key={opt.code} className="flex items-start gap-2 text-[11px] text-[#F5F5F5] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watchItAct.includes(opt.code)}
                        onChange={() => toggleSection('itActSections', opt.code, watchItAct)}
                        className="mt-0.5 accent-[#FF9F1C]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-[#03030A] border border-[#1A1A2E] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#00D4FF] font-bold">BNS 2023 Provisions</div>
                  {BNS_OPTIONS.map((opt) => (
                    <label key={opt.code} className="flex items-start gap-2 text-[11px] text-[#F5F5F5] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watchBns.includes(opt.code)}
                        onChange={() => toggleSection('bnsSections', opt.code, watchBns)}
                        className="mt-0.5 accent-[#00D4FF]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-[#03030A] border border-[#1A1A2E] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#00FF9D] font-bold">BSA 2023 Admissibility</div>
                  {BSA_OPTIONS.map((opt) => (
                    <label key={opt.code} className="flex items-start gap-2 text-[11px] text-[#F5F5F5] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watchBsa.includes(opt.code)}
                        onChange={() => toggleSection('bsaSections', opt.code, watchBsa)}
                        className="mt-0.5 accent-[#00FF9D]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-5 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-[#03030A] text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Statutory FIR Draft...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" /> Generate Statutory FIR Draft &amp; Legal Dossier
                  </>
                )}
              </button>
            </form>
          </TerminalCard>
        </div>

        {/* Right: Synthesized FIR Draft + PDF / BSA §63 Export */}
        <div className="xl:col-span-5">
          <TerminalCard
            title="Synthesized FIR Complaint & BSA §63 Output"
            label={firMeta ? firMeta.provider.toUpperCase() : 'STANDBY'}
            labelColor={firOutput ? 'green' : 'white'}
          >
            {!firOutput ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#03030A] border border-[#1A1A2E] mx-auto flex items-center justify-center text-[#00D4FF]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[#F5F5F5]">Statutory Dossier Preview</div>
                <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
                  Complete the mandatory fields marked with <span className="text-[#FF1B1B] font-bold">*</span> and submit to generate a BNSS 2023 / BNS 2023 / IT Act compliant FIR draft and BSA §63 certificate.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <pre className="p-4 rounded-lg bg-[#03030A] border border-[#1A1A2E] text-[11px] font-mono text-[#F5F5F5] whitespace-pre-wrap max-h-[520px] overflow-y-auto leading-relaxed">
                  {firOutput}
                </pre>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadFirPdf}
                    className="px-4 py-2 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-[#03030A] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download FIR PDF
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBsa63Certificate}
                    disabled={issuingCert}
                    className="px-3.5 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00b8de] text-[#03030A] text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {issuingCert ? 'Signing...' : 'Export BSA 2023 §63 Cert'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firOutput)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="px-3 py-2 rounded-lg bg-[#03030A] border border-[#1A1A2E] text-[#F5F5F5] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00D4FF]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {certStatus && (
                  <div className="p-2.5 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[11px] font-mono text-[#00D4FF]">
                    {certStatus}
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[#03030A] border border-[#FF9F1C]/30 flex items-start gap-2 text-[11px] text-[#888888]">
                  <AlertTriangle className="w-4 h-4 text-[#FF9F1C] shrink-0 mt-0.5" />
                  <span>
                    AI-assisted indication — verify all statutory sections, amounts, and transaction references manually before submission to Police or cybercrime.gov.in.
                  </span>
                </div>
              </div>
            )}
          </TerminalCard>
        </div>
      </div>
    </div>
  )
}
