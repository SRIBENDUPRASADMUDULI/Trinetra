'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, PhoneCall, X, Lock } from 'lucide-react'
import { useLang } from '@/lib/i18n-context'

export function OfficialFooter() {
  const { t } = useLang()
  const [policyModal, setPolicyModal] = useState<'policies' | 'terms' | null>(null)

  return (
    <>
      <footer className="bg-[#1E2420] border-t border-[#323D36] text-[#CBD5E1] text-xs px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
              <Shield size={14} className="text-[#F59E0B]" />
              TRINETRA
            </span>
            <button
              onClick={() => setPolicyModal('policies')}
              className="hover:text-[#F59E0B] transition-colors cursor-pointer"
            >
              {t('Privacy', 'गोपनीयता')}
            </button>
            <button
              onClick={() => setPolicyModal('terms')}
              className="hover:text-[#F59E0B] transition-colors cursor-pointer"
            >
              {t('Terms', 'नियम')}
            </button>
            <Link href="/research" className="hover:text-[#F59E0B] transition-colors">
              {t('Research & Sources', 'शोध और स्रोत')}
            </Link>
            <span className="inline-flex items-center gap-1 text-[#34D399] font-medium">
              <Lock size={12} />
              Zero Cloud Storage (store: false)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7F1D1D]/45 border border-[#DC2626]/60 text-[#FECACA] font-semibold hover:bg-[#991B1B]/60 transition-colors"
            >
              <PhoneCall size={12} />
              <span>{t('Emergency: 1930', 'आपातकालीन: 1930')}</span>
            </a>
          </div>
        </div>
      </footer>

      {policyModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setPolicyModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] shadow-xl overflow-hidden text-[#1C201D]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E0DDD5] bg-[#F2F1EC]">
              <h3 className="text-sm font-bold text-[#1E2420]">
                {policyModal === 'policies'
                  ? 'Privacy & Data Protection'
                  : 'Terms of Use & Disclaimer'}
              </h3>
              <button
                onClick={() => setPolicyModal(null)}
                className="text-[#6B726D] hover:text-[#1C201D] p-1 cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#5C645E] leading-relaxed">
              {policyModal === 'policies' ? (
                <>
                  <p>
                    <strong className="text-[#1C201D]">Local Checks First:</strong> Password leak checks, photo metadata inspection, and file SHA-256 hashing run directly on your device.
                  </p>
                  <p>
                    <strong className="text-[#1C201D]">Private AI Routing:</strong> Requests routed through BharatCode AI use <code className="font-mono text-[#059669]">store: false</code> and automatically mask 12-digit ID numbers and card numbers.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong className="text-[#1C201D]">AI Assistance Disclaimer:</strong> Scam checks and deepfake heatmaps are automated helpers and are not 100% guaranteed. Always confirm directly with your bank or official website.
                  </p>
                  <p>
                    <strong className="text-[#1C201D]">Police Reporting:</strong> Complaint letters generated here can be submitted on <strong>cybercrime.gov.in</strong> or by calling <strong>1930</strong>.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
