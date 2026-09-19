'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Siren, HelpCircle, X, Shield, PhoneCall, Search, Activity } from 'lucide-react'
import { TelemetryTicker } from '@/components/ui/telemetry-ticker'

export function TopBar() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-40 h-16 w-full flex items-center justify-between px-6 select-none bg-[#0A0E17]/90 backdrop-blur-xl border-b border-white/[0.07]"
      >
        {/* LEFT: Quick Search / Command Pill */}
        <div className="flex items-center gap-3 w-72">
          <Link
            href="/intel"
            className="flex items-center gap-2.5 w-full h-9 px-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 text-xs transition-all group"
          >
            <Search size={14} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-slate-400 truncate text-[11px]">Search IOC, IP, or CVE...</span>
            <span className="ml-auto text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.06]">
              ⌘K
            </span>
          </Link>
        </div>

        {/* CENTER: Clean Symmetrical Telemetry Capsule */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center h-9 px-4 rounded-full bg-white/[0.02] border border-white/[0.08] text-xs font-mono text-slate-300 gap-4">
            <TelemetryTicker />

            <div className="h-3.5 w-px bg-white/[0.1]" />

            {/* Symmetrical DEFCON Badge */}
            <div
              className="flex items-center gap-1.5 text-amber-300 font-sans font-medium text-xs whitespace-nowrap cursor-help"
              title="DEFCON 3: Elevated Readiness. Monitoring all national critical infrastructure sectors."
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>DEFCON 3 · Elevated</span>
            </div>

            <div className="h-3.5 w-px bg-white/[0.1]" />

            {/* Posture Score */}
            <div className="flex items-center gap-1.5 text-emerald-400 font-sans font-medium text-xs whitespace-nowrap">
              <span className="text-slate-500 font-mono text-[10px]">HEALTH</span>
              <span>84%</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3 w-72 justify-end">
          {/* Platform Guide */}
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            title="Open Platform Guide & Overview"
          >
            <HelpCircle size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Helpline 1930 */}
          <a
            href="tel:1930"
            className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all"
            title="National Cyber Crime Reporting Helpline (Govt of India)"
          >
            <PhoneCall size={13} className="text-amber-400" />
            <span>1930</span>
          </a>

          {/* Emergency SOS CTA */}
          <Link
            href="/incident"
            className="flex items-center gap-2 h-9 px-4 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border border-indigo-400/30 shadow-md shadow-indigo-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Siren size={14} className="text-indigo-200" />
            <span>Report Incident</span>
          </Link>
        </div>
      </header>

      {/* Modern Platform Guide Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-[#0F1523] border border-white/[0.12] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Shield size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">TRINETRA — Platform Guide</h3>
                  <p className="text-[11px] text-slate-400">The Sovereign Third Eye for Indian Cyber Defense</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-slate-300 max-h-[75vh] overflow-y-auto">
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900/40 to-transparent border border-indigo-500/20">
                <p className="font-bold text-sm text-white mb-1">What is TRINETRA?</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  TRINETRA is an enterprise-grade cyber defense ecosystem designed for threat telemetry monitoring, automated legal FIR dossier generation under Bharatiya Nyaya Sanhita (BNS) 2023, digital forensics, and proactive defense for Indian citizens and national infrastructure.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-white text-xs uppercase tracking-wider">
                  Core Operational Modules
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-indigo-300 font-bold mb-0.5">00 // Command Center</p>
                    <p className="text-slate-400">Live national threat posture, sector alerts, and quick defense actions.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-indigo-300 font-bold mb-0.5">04 & 09 // Legal FIR & Incident Response</p>
                    <p className="text-slate-400">AI-generated BNS 2023 & IT Act police dossiers with downloadable court-ready PDFs.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-indigo-300 font-bold mb-0.5">06 // Sentinel Guard</p>
                    <p className="text-slate-400">Check password breach exposure safely with SHA-1 k-anonymity (zero raw credentials transmitted).</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-indigo-300 font-bold mb-0.5">08 // NLP Phishing Inspector</p>
                    <p className="text-slate-400">Scan suspicious SMS, emails, and links for punycode homoglyphs and malicious entropy.</p>
                  </div>
                </div>
              </div>

              {/* Emergency info box */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2.5">
                <PhoneCall size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-300">Financial Cyber Fraud Emergency</p>
                  <p className="text-slate-300 mt-0.5">
                    If funds were debited, immediately dial <strong className="text-white font-mono">1930</strong> (Citizen Financial Cyber Fraud Reporting System) within the golden hour to freeze transfers.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/[0.08] flex justify-end bg-white/[0.02]">
              <button
                onClick={() => setShowHelp(false)}
                className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TopBar
