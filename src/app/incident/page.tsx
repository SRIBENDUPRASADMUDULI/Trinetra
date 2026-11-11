'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { jsPDF } from 'jspdf'
import {
  FileText, PhoneCall, Clock, AlertTriangle, Download,
  Upload, Lock, CheckCircle2, UserCheck, EyeOff, RefreshCw, Copy, Check
} from 'lucide-react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { InfoExplain } from '@/components/ui/InfoExplain'
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
  { code: '§66C', label: '§66C Identity Theft' },
  { code: '§66D', label: '§66D Online Cheating / Phishing' },
  { code: '§70B(6)', label: '§70B(6) CERT-In 6-Hour Reporting' },
]

const BNS_OPTIONS = [
  { code: '§318(4)', label: 'BNS §318(4) Cheating / Online Fraud' },
  { code: '§319(2)', label: 'BNS §319(2) Impersonation' },
  { code: '§336(3)', label: 'BNS §336(3) Electronic Forgery' },
  { code: '§351', label: 'BNS §351 Threat / Extortion' },
]

const BSA_OPTIONS = [
  { code: '§63(1)', label: 'BSA §63(1) Digital Record Admissibility' },
  { code: '§63(4)', label: 'BSA §63(4) Hash Evidence Certificate' },
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
      ? 'Complainant Identity  : ANONYMOUS REPORT'
      : `Complainant Name      : ${data.complainantName || 'Not Provided'}\nMobile / Email        : ${data.complainantPhone || 'N/A'} | ${data.complainantEmail || 'N/A'}\nGovt ID Ref (Masked)  : XXXX-XXXX-${data.aadhaarLast4 || '0000'}`

  return `================================================================================
CYBER INCIDENT POLICE COMPLAINT DRAFT
Aligned with BNS 2023, IT Act 2000 & cybercrime.gov.in
================================================================================
Reference Draft ID    : ${docketId}
Generated Timestamp   : ${istNow} IST
Reporting Mode        : ${mode === 'anonymous' ? 'ANONYMOUS' : 'REPORT & TRACK'}
Jurisdiction          : ${data.stateUt} — ${data.districtStation || 'Cyber Crime Police Station'}
Helpline Escalation   : 1930 / cybercrime.gov.in

1. COMPLAINANT DETAILS
--------------------------------------------------------------------------------
${complainantLine}

2. INCIDENT & LOSS DETAILS
--------------------------------------------------------------------------------
Incident Type         : ${data.attackType}
Date & Time (IST)     : ${data.incidentDate || 'Not specified'} ${data.incidentTime || ''}
Bank / Wallet         : ${data.victimBank || 'Not applicable'}
Money Lost (INR)      : Rs. ${data.lossAmount || '0'}
Transaction / UTR ID  : ${data.transactionId || 'N/A'}
Suspect Link / Phone  : ${data.attackerIp || 'Not provided'}

3. RELEVANT INDIAN LAWS
--------------------------------------------------------------------------------
IT Act 2000           : ${(data.itActSections || []).join(', ') || '§43, §66, §66D'}
BNS 2023              : ${(data.bnsSections || []).join(', ') || '§318(4), §319(2)'}
BSA 2023 Evidence     : ${(data.bsaSections || []).join(', ') || '§63(1), §63(4)'}

4. WHAT HAPPENED (NARRATIVE)
--------------------------------------------------------------------------------
${data.evidenceDescription}

5. DIGITAL EVIDENCE HASH (BSA 2023 §63)
--------------------------------------------------------------------------------
Attached File         : ${attachedFileName || 'Text Submission'}
SHA-256 Fingerprint   : ${attachedSha256 || 'Generated upon saving evidence certificate'}

NOTE: Automated draft — please review all details carefully before submitting to
Police or cybercrime.gov.in.
================================================================================`
}

export default function FileComplaintPage() {
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

  const [attachedFileName, setAttachedFileName] = useState<string | null>(null)
  const [attachedSha256, setAttachedSha256] = useState<string | null>(null)
  const [certStatus, setCertStatus] = useState<string | null>(null)
  const [issuingCert, setIssuingCert] = useState(false)

  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)
  const [otpInput, setOtpInput] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0)
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
      districtStation: 'Cyber Crime Police Station',
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
    setOtpSecondsLeft(30 * 60)
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
      ? `${data.evidenceDescription}\n\n[Attached File: ${attachedFileName} | SHA-256: ${attachedSha256}]`
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
    doc.text('TRINETRA // CYBER INCIDENT POLICE COMPLAINT DRAFT', 40, 44)
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
    doc.save(`TRINETRA_COMPLAINT_${Date.now()}.pdf`)
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
          sourcePanel: 'File Complaint',
          payload: firOutput,
          verdict: 'COMPLAINT & DIGITAL EVIDENCE RECORD',
          confidence: 'SHA-256 VERIFIED',
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
      setCertStatus(`Saved Evidence Receipt (${data.certificate.certId}) · SHA-256: ${data.certificate.sha256Hash.slice(0, 16)}...`)
    } catch (err: unknown) {
      setCertStatus(err instanceof Error ? err.message : 'Failed to issue certificate')
    } finally {
      setIssuingCert(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + 1930 Emergency Callout */}
      <section className="rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] p-6 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1E2420]">
                {t('File a Police Complaint (Cybercrime)', 'साइबर अपराध पुलिस शिकायत दर्ज करें')}
              </h1>
              <InfoExplain
                title="File Complaint (FIR Draft)"
                whatIsIt="Prepares a structured complaint letter using Indian cyber laws (BNS 2023 & IT Act 2000) and saves a digital proof receipt."
                whoShouldUse="Victims of UPI scams, fake KYC links, hacked social accounts, or online impersonation."
                whatResultMeans="You get a ready-to-submit PDF complaint to take to your nearest Cyber Police Station or upload on cybercrime.gov.in."
              />
            </div>
            <p className="text-xs text-[#5C645E] leading-relaxed">
              {t(
                'Fill in what happened below to create a ready-to-submit complaint PDF and digital evidence receipt for Indian Police or cybercrime.gov.in.',
                'नीचे विवरण भरें और पुलिस या cybercrime.gov.in के लिए औपचारिक शिकायत PDF तैयार करें।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <a
              href="tel:1930"
              className="px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors flex items-center gap-3"
            >
              <PhoneCall className="w-5 h-5 text-[#DC2626] shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-[#991B1B]">Lost Money? Call First</div>
                <div className="text-base font-bold text-[#DC2626]">Dial 1930</div>
                <div className="text-[10px] text-[#7F1D1D]">Freeze fraud transactions</div>
              </div>
            </a>

            <div className="px-4 py-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#D97706] shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-[#92400E]">6-Hour Reporting Window</div>
                <div className="text-base font-mono font-bold text-[#1E2420] tabular-nums">
                  {formatDuration(certInSeconds)}
                </div>
                <div className="text-[10px] text-[#92400E]">CERT-In / Golden Hour target</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <TerminalCard
            title={t('Complaint Details Form', 'शिकायत विवरण फॉर्म')}
            label={reportMode === 'track' ? 'With Tracking' : 'Anonymous'}
            labelColor={reportMode === 'track' ? 'cyan' : 'amber'}
            headerRight={
              <div className="flex items-center gap-1 bg-[#FFFFFF] p-0.5 rounded-lg border border-[#E0DDD5]">
                <button
                  type="button"
                  onClick={() => setReportMode('track')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    reportMode === 'track' ? 'bg-[#059669] text-white' : 'text-[#5C645E] hover:text-[#1E2420]'
                  }`}
                >
                  <UserCheck className="w-3 h-3" /> Report &amp; Track
                </button>
                <button
                  type="button"
                  onClick={() => setReportMode('anonymous')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    reportMode === 'anonymous' ? 'bg-[#D97706] text-white' : 'text-[#5C645E] hover:text-[#1E2420]'
                  }`}
                >
                  <EyeOff className="w-3 h-3" /> Anonymous
                </button>
              </div>
            }
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                    State / Union Territory <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    {...register('stateUt', { required: true })}
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs text-[#1E2420] focus:outline-none focus:border-[#059669]"
                  >
                    {INDIAN_STATES_UTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                    District / Cyber Police Station <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    {...register('districtStation', { required: true })}
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs text-[#1E2420] focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              {reportMode === 'track' && (
                <div className="p-4 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] space-y-4">
                  <div className="text-xs font-semibold text-[#059669]">
                    Your Contact Information (Required to track complaint status)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                        Full Name <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        {...register('complainantName', { required: reportMode === 'track' })}
                        placeholder="e.g. Rajesh Kumar Sharma"
                        className="w-full rounded-lg bg-[#FFFFFF] border border-[#E0DDD5] px-3 py-2 text-xs text-[#1E2420] focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...register('complainantEmail')}
                        placeholder="you@example.com"
                        className="w-full rounded-lg bg-[#FFFFFF] border border-[#E0DDD5] px-3 py-2 text-xs text-[#1E2420] focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                        Mobile Number <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        {...register('complainantPhone', { required: reportMode === 'track' })}
                        placeholder="9876543210"
                        className="w-full rounded-lg bg-[#FFFFFF] border border-[#E0DDD5] px-3 py-2 text-xs font-mono text-[#1E2420] focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full py-2 px-3 rounded-lg bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Send OTP
                      </button>
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                        Aadhaar Last 4 Digits (Optional)
                      </label>
                      <input
                        maxLength={4}
                        {...register('aadhaarLast4')}
                        placeholder="4321"
                        className="w-full rounded-lg bg-[#FFFFFF] border border-[#E0DDD5] px-3 py-2 text-xs font-mono text-[#1E2420] focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>

                  {generatedOtp && (
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#A7F3D0] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-[#065F46]">
                        Demo OTP: <strong className="font-mono text-[#059669]">{generatedOtp}</strong>{' '}
                        <span className="text-[11px] text-[#5C645E]">
                          (Valid for {formatDuration(otpSecondsLeft)})
                        </span>
                      </div>
                      {otpVerified ? (
                        <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-32 rounded border border-[#E0DDD5] px-2 py-1 text-xs font-mono text-[#1E2420]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="px-3 py-1 rounded bg-[#059669] text-white text-xs font-semibold cursor-pointer"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                    Type of Scam / Incident <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    {...register('attackType')}
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs text-[#1E2420] focus:outline-none focus:border-[#059669]"
                  >
                    <option value="UPI / Banking KYC Phishing Scam">UPI / Banking KYC Phishing Scam</option>
                    <option value="Deepfake Video KYC / Voice Impersonation">Deepfake / Voice Impersonation</option>
                    <option value="Ransomware / Device Hacked">Ransomware / Device Hacked</option>
                    <option value="Social Media Hack / Blackmail">Social Media Hack / Blackmail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                    Date <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('incidentDate', { required: true })}
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs font-mono text-[#1E2420]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">Time</label>
                  <input
                    type="time"
                    {...register('incidentTime')}
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs font-mono text-[#1E2420]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">Bank / UPI App</label>
                  <input
                    {...register('victimBank')}
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs text-[#1E2420]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">Money Lost (INR)</label>
                  <input
                    {...register('lossAmount')}
                    placeholder="25000"
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs font-mono text-[#1E2420]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2420] mb-1">Transaction / UTR ID</label>
                  <input
                    {...register('transactionId')}
                    placeholder="428910348219"
                    className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs font-mono text-[#1E2420]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                  Scammer Link, Phone Number, or UPI ID
                </label>
                <input
                  {...register('attackerIp')}
                  placeholder="https://sbi-kyc-verif.top | +91-XXXXXXXXXX"
                  className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] px-3 py-2 text-xs font-mono text-[#1E2420]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2420] mb-1">
                  Describe What Happened <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register('evidenceDescription', {
                    required: 'Please describe what happened (at least 10 characters)',
                    minLength: { value: 10, message: 'Enter at least 10 characters' },
                  })}
                  placeholder="Write step by step how the scam happened, what link you clicked, and how much money was taken..."
                  className="w-full rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] p-3 text-xs text-[#1E2420] focus:outline-none focus:border-[#059669]"
                />
                {errors.evidenceDescription && (
                  <p className="text-xs text-[#DC2626] mt-1">{errors.evidenceDescription.message}</p>
                )}
              </div>

              {/* Optional Evidence File Upload */}
              <div className="p-3.5 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#1E2420] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#15803D]" />
                    Attach Screenshot or Bank Receipt (Optional)
                  </div>
                  <div className="text-[11px] text-[#5C645E] font-mono">
                    {attachedSha256
                      ? `${attachedFileName} · Fingerprint: ${attachedSha256.slice(0, 20)}...`
                      : 'Creates a tamper-proof fingerprint locally on your device'}
                  </div>
                </div>
                <label className="px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F3F4F6] border border-[#E0DDD5] text-xs font-semibold text-[#059669] flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  Choose File
                  <input type="file" onChange={handleFileAttach} className="hidden" />
                </label>
              </div>

              {/* Law Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] space-y-2">
                  <div className="text-[11px] font-bold text-[#1E2420]">IT Act 2000</div>
                  {IT_ACT_OPTIONS.map((opt) => (
                    <label key={opt.code} className="flex items-start gap-2 text-[11px] text-[#374151] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watchItAct.includes(opt.code)}
                        onChange={() => toggleSection('itActSections', opt.code, watchItAct)}
                        className="mt-0.5 accent-[#059669]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] space-y-2">
                  <div className="text-[11px] font-bold text-[#1E2420]">BNS 2023 Laws</div>
                  {BNS_OPTIONS.map((opt) => (
                    <label key={opt.code} className="flex items-start gap-2 text-[11px] text-[#374151] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watchBns.includes(opt.code)}
                        onChange={() => toggleSection('bnsSections', opt.code, watchBns)}
                        className="mt-0.5 accent-[#059669]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] space-y-2">
                  <div className="text-[11px] font-bold text-[#1E2420]">Digital Evidence</div>
                  {BSA_OPTIONS.map((opt) => (
                    <label key={opt.code} className="flex items-start gap-2 text-[11px] text-[#374151] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watchBsa.includes(opt.code)}
                        onChange={() => toggleSection('bsaSections', opt.code, watchBsa)}
                        className="mt-0.5 accent-[#15803D]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Creating Complaint Letter...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" /> Create Police Complaint Draft
                  </>
                )}
              </button>
            </form>
          </TerminalCard>
        </div>

        {/* Output Preview */}
        <div className="xl:col-span-5">
          <TerminalCard
            title="Your Complaint Draft & PDF"
            label={firOutput ? 'Ready' : 'Waiting'}
            labelColor={firOutput ? 'green' : 'white'}
          >
            {!firOutput ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="w-10 h-10 text-[#9CA3AF] mx-auto" />
                <div className="text-sm font-semibold text-[#1E2420]">No Draft Created Yet</div>
                <p className="text-xs text-[#5C645E] max-w-sm mx-auto leading-relaxed">
                  Fill in the fields marked with <span className="text-[#DC2626] font-bold">*</span> on the left and click{' '}
                  <strong>Create Police Complaint Draft</strong> to download your PDF.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <pre className="p-4 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] text-[11px] font-mono text-[#1E2420] whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                  {firOutput}
                </pre>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadFirPdf}
                    className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Complaint PDF
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBsa63Certificate}
                    disabled={issuingCert}
                    className="px-3.5 py-2 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {issuingCert ? 'Saving...' : 'Save Evidence Receipt (BSA §63)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firOutput)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5] text-[#1E2420] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {certStatus && (
                  <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-mono text-[#15803D]">
                    {certStatus}
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2 text-xs text-[#92400E]">
                  <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <span>
                    AI-assisted draft — review all details carefully before submitting to Police or cybercrime.gov.in.
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
