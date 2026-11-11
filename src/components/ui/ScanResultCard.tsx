'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert, CheckCircle2, AlertTriangle, Download,
  FileJson, RotateCcw, ChevronDown, ChevronUp, FileText, Lock
} from 'lucide-react'

interface ScanResultCardProps {
  verdictKind: 'scam' | 'suspicious' | 'safe'
  headline: string
  subheadline?: string
  whyList: string[]
  todoList: string[]
  disclaimer?: string
  onSaveReport?: () => void
  savingReport?: boolean
  onExportJson?: () => void
  onReset?: () => void
  reportPoliceHref?: string
  certNote?: string | null
  extraContent?: React.ReactNode
}

export function ScanResultCard({
  verdictKind,
  headline,
  subheadline,
  whyList,
  todoList,
  disclaimer = 'AI tool. Verify with your bank or official source before taking legal action.',
  onSaveReport,
  savingReport = false,
  onExportJson,
  onReset,
  reportPoliceHref = '/incident',
  certNote,
  extraContent,
}: ScanResultCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const tone =
    verdictKind === 'scam'
      ? {
          bannerBg: 'bg-[#FEF2F2] border-[#FECACA]',
          badgeBg: 'bg-[#DC2626] text-white',
          badgeText: 'SCAM / HIGH RISK',
          titleColor: 'text-[#991B1B]',
          Icon: ShieldAlert,
        }
      : verdictKind === 'suspicious'
        ? {
            bannerBg: 'bg-[#FFFBEB] border-[#FDE68A]',
            badgeBg: 'bg-[#D97706] text-white',
            badgeText: 'SUSPICIOUS — BE CAREFUL',
            titleColor: 'text-[#92400E]',
            Icon: AlertTriangle,
          }
        : {
            bannerBg: 'bg-[#F0FDF4] border-[#BBF7D0]',
            badgeBg: 'bg-[#15803D] text-white',
            badgeText: 'LOOKS SAFE',
            titleColor: 'text-[#166534]',
            Icon: CheckCircle2,
          }

  const VerdictIcon = tone.Icon

  return (
    <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Top Plain-Language Verdict Banner */}
      <div className={`p-5 border-b ${tone.bannerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-lg ${tone.badgeBg} shrink-0`}>
            <VerdictIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${tone.badgeBg}`}>
              {tone.badgeText}
            </span>
            <h2 className={`text-lg font-bold ${tone.titleColor}`}>{headline}</h2>
            {subheadline && <p className="text-xs text-[#4B5563]">{subheadline}</p>}
          </div>
        </div>
      </div>

      {/* Why + What To Do Two-Column Plain Guidance */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            Why we flagged this
          </h3>
          <ul className="space-y-2 text-xs text-[#374151]">
            {whyList.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            What you should do
          </h3>
          <ul className="space-y-2 text-xs text-[#374151]">
            {todoList.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="px-5 py-4 bg-[#F8F9FA] border-t border-[#E5E7EB] flex flex-wrap items-center gap-2.5">
        <Link
          href={reportPoliceHref}
          className="px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Report to Police (FIR)
        </Link>

        {onSaveReport && (
          <button
            type="button"
            onClick={onSaveReport}
            disabled={savingReport}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {savingReport ? 'Saving PDF...' : 'Save Evidence Report (PDF)'}
          </button>
        )}

        {onExportJson && (
          <button
            type="button"
            onClick={onExportJson}
            className="px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-[#1A1A1A] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-[#2563EB]" />
            Download JSON
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1A1A1A] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Scan Another
          </button>
        )}

        {extraContent && (
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] flex items-center gap-1 cursor-pointer"
          >
            <span>{showDetails ? 'Hide Technical Details' : 'Show Technical Details'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {certNote && (
        <div className="mx-5 mt-3 mb-1 p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-mono text-[#15803D] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>{certNote}</span>
        </div>
      )}

      {showDetails && extraContent && (
        <div className="p-5 border-t border-[#E5E7EB] bg-[#FFFFFF] space-y-4">
          {extraContent}
        </div>
      )}

      {/* Honest Disclaimer */}
      <div className="px-5 py-3 bg-[#FFFFFF] border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
        {disclaimer}
      </div>
    </div>
  )
}
