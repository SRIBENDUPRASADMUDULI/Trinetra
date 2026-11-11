'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, PhoneCall, X, Lock } from 'lucide-react'
import { useLang } from '@/lib/i18n-context'

export function OfficialFooter() {
  const { t } = useLang()
  const [policyModal, setPolicyModal] = useState<'policies' | 'terms' | null>(null)
  const lastUpdatedIst = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <>
      <footer className="bg-[#0A0A12]/90 backdrop-blur-md border-t border-[#1A1A2E] text-[#888888] text-xs px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Top Statutory & Helpline Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A1A2E]">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#03030A] border border-[#FF9F1C]/40 flex items-center justify-center text-[#FF9F1C] shrink-0">
                <Shield size={16} />
              </div>
              <div>
                <p className="font-semibold text-[#F5F5F5] text-xs">
                  {t(
                    'TRINETRA — Sovereign Cyber Defense & Forensics Console',
                    'त्रिनेत्र — संप्रभु साइबर रक्षा और फोरेंसिक कंसोल'
                  )}
                </p>
                <p className="text-[11px] text-[#888888]">
                  {t(
                    'Statutory Basis: Information Technology Act 2000 (§43, §66, §70A) · BNS 2023 · BSA 2023 §63 · DPDP Act 2023',
                    'वैधानिक आधार: सूचना प्रौद्योगिकी अधिनियम 2000 (§43, §66, §70A) · बीएनएस 2023 · बीएसए 2023 §63 · डीपीडीपी अधिनियम 2023'
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FF1B1B]/10 border border-[#FF1B1B]/45 text-[#FF1B1B] font-mono text-[11px] font-semibold hover:bg-[#FF1B1B]/20 transition-colors"
              >
                <PhoneCall size={12} />
                <span>{t('Cyber Helpline: 1930', 'साइबर हेल्पलाइन: 1930')}</span>
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#03030A] border border-[#1A1A2E] text-[#F5F5F5] font-mono text-[11px] font-semibold hover:border-[#00D4FF]/50 transition-colors"
              >
                <span>{t('Emergency: 112', 'आपातकाल: 112')}</span>
              </a>
            </div>
          </div>

          {/* Middle Data Sovereignty Statement */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-[#00FF9D] font-mono">
              <Lock size={12} className="shrink-0" />
              <span>
                Data Sovereignty: Stateless BharatCode AI Execution (store: false) · Client-Side PII Redaction · Zero Cloud Retention
              </span>
            </div>
            <div className="font-mono text-[#888888]">
              Last Updated: {lastUpdatedIst} (IST) · 3D WebGL Engine Ready
            </div>
          </div>

          {/* Bottom Policy Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setPolicyModal('policies')}
                className="hover:text-[#00D4FF] transition-colors cursor-pointer"
              >
                {t('Website Policies', 'वेबसाइट नीतियां')}
              </button>
              <span className="text-[#1A1A2E]">|</span>
              <button
                onClick={() => setPolicyModal('terms')}
                className="hover:text-[#00D4FF] transition-colors cursor-pointer"
              >
                {t('Terms of Use', 'उपयोग की शर्तें')}
              </button>
              <span className="text-[#1A1A2E]">|</span>
              <Link href="/research" className="hover:text-[#00D4FF] transition-colors">
                {t('Research & Citations', 'अनुसंधान और संदर्भ')}
              </Link>
              <span className="text-[#1A1A2E]">|</span>
              <Link href="/incident" className="hover:text-[#00D4FF] transition-colors">
                {t('Citizen Reporting (1930)', 'नागरिक रिपोर्टिंग (1930)')}
              </Link>
            </div>
            <span className="text-[#666666]">
              Designed for Sovereign Cyber Defense &amp; Statutory Triaging
            </span>
          </div>
        </div>
      </footer>

      {policyModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setPolicyModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-[#0A0A12] border border-[#1A1A2E] shadow-[0_0_32px_rgba(0,212,255,0.2)] overflow-hidden text-[#F5F5F5]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A1A2E] bg-[#03030A]">
              <h3 className="font-legal text-sm font-bold text-[#F5F5F5]">
                {policyModal === 'policies'
                  ? 'Website Privacy & Data Sovereignty Policy'
                  : 'Terms of Use & Statutory Disclaimer'}
              </h3>
              <button
                onClick={() => setPolicyModal(null)}
                className="text-[#888888] hover:text-white p-1 cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#F5F5F5]/90 leading-relaxed">
              {policyModal === 'policies' ? (
                <>
                  <p>
                    <strong>Zero Cloud Storage:</strong> Sensitive credential checks execute locally in your browser using k-Anonymity (SHA-1 prefix) via Web Crypto APIs.
                  </p>
                  <p>
                    <strong>AI Privacy Scrubbing:</strong> All prompts routed through the BharatCode AI Harness enforce <code className="text-[#00FF9D]">store: false</code> and strip 12-digit Aadhaar patterns and 16-digit card numbers prior to transmission.
                  </p>
                  <p>
                    <strong>DPDP Act 2023 Alignment:</strong> No behavioral tracking cookies or third-party advertising telemetry are embedded in this console.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Probabilistic Indication Notice:</strong> AI-assisted phishing verdicts, SAST suggestions, and deepfake saliency maps are probabilistic analytical indications and must be manually verified before legal or enforcement action.
                  </p>
                  <p>
                    <strong>Official Filing:</strong> Generated BNS 2023 / IT Act 2000 FIR dossiers and BSA 2023 §63 SHA-256 certificates are drafts intended to assist formal reporting via <strong>cybercrime.gov.in</strong> or <strong>1930</strong>.
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
