'use client'

import React, { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { useLang } from '@/lib/i18n-context'

interface InfoExplainProps {
  title: string
  whatIsIt: string
  whoShouldUse: string
  whatResultMeans: string
  buttonLabel?: string
}

export function InfoExplain({
  title,
  whatIsIt,
  whoShouldUse,
  whatResultMeans,
  buttonLabel = 'How this works',
}: InfoExplainProps) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-xs font-medium text-[#059669] shadow-xs transition-colors cursor-pointer"
        aria-label={`Explain ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{t(buttonLabel, 'यह कैसे काम करता है?')}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xl overflow-hidden text-[#1A1A1A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#059669]" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">{title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close help"
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#E5E7EB]/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs leading-relaxed">
              <div>
                <div className="font-semibold text-[#1A1A1A] mb-0.5">What is this?</div>
                <p className="text-[#4B5563]">{whatIsIt}</p>
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A] mb-0.5">Who should use it?</div>
                <p className="text-[#4B5563]">{whoShouldUse}</p>
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A] mb-0.5">What does the result mean?</div>
                <p className="text-[#4B5563]">{whatResultMeans}</p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
