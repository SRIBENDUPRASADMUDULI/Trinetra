'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  Plus,
  HelpCircle,
  PhoneCall,
  Shield,
  X,
} from 'lucide-react'
import { AIHarnessBar } from '@/components/shell/AIHarnessBar'
import { CommandPalette } from '@/components/ui/CommandPalette'

interface TopNavTab {
  id: string
  label: string
  path: string
}

const TOP_NAV_TABS: TopNavTab[] = [
  { id: 'overview', label: 'Overview', path: '/' },
  { id: 'intel', label: 'Threat Intelligence', path: '/intel' },
  { id: 'incident', label: 'Incident & FIR', path: '/incident' },
  { id: 'mentor', label: 'AI SecOps Copilot', path: '/mentor' },
  { id: 'deepfake-xai', label: 'Deepfake XAI', path: '/deepfake-xai' },
  { id: 'academy', label: 'Cyber Range', path: '/academy' },
  { id: 'devsec', label: 'DevSecOps', path: '/devsec' },
]

export function TopBar() {
  const pathname = usePathname()
  const [showHelp, setShowHelp] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Listen for global Cmd+K / Ctrl+K keyboard shortcut and Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      } else if (e.key === 'Escape' && showHelp) {
        setShowHelp(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showHelp])

  return (
    <>
      <header
        className="sticky top-0 z-40 h-14 sm:h-16 w-full flex items-center justify-between px-3 sm:px-6 select-none bg-[#1E2235]/95 backdrop-blur-md border-b border-white/[0.06] gap-2 sm:gap-4"
        aria-label="Top Navigation Bar"
      >
        {/* LEFT / CENTER: Horizontal Navigation Tabs with Active Coral-Pink Bottom Indicator */}
        <nav className="flex items-center gap-1 sm:gap-2 h-full overflow-x-auto no-scrollbar min-w-0 flex-1">
          {TOP_NAV_TABS.map(tab => {
            const isActive =
              tab.path === '/'
                ? pathname === '/'
                : pathname === tab.path || pathname?.startsWith(tab.path + '/')

            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`relative h-full flex items-center px-2.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-colors font-medium shrink-0 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>

                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#FF5A79] rounded-t-full shadow-[0_-2px_6px_rgba(255,90,121,0.5)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* RIGHT: Search, AI Harness, 1930 Helpline, Guide & Circular Coral-Pink '+' CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Icon Trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl bg-[#262B40] hover:bg-[#2E344E] border border-white/[0.08] text-slate-300 transition-all cursor-pointer shrink-0"
            title="Search modules & IOCs"
            aria-label="Open Command Search"
          >
            <Search size={15} />
          </button>

          {/* Interactive Search Pill opening Command Palette */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-[#262B40] hover:bg-[#2E344E] border border-white/[0.07] hover:border-white/15 text-slate-300 text-xs transition-all w-40 lg:w-48 cursor-pointer select-none text-left"
            title="Search modules & IOCs (⌘K / Ctrl+K)"
          >
            <Search size={14} className="text-slate-400 shrink-0" />
            <span className="text-slate-400 truncate text-[11px]">Search IOC, IP...</span>
            <span className="ml-auto text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06]">
              ⌘K
            </span>
          </button>

          {/* AI Harness Live Status Capsule */}
          <AIHarnessBar />

          {/* National Cyber Helpline 1930 Official Portal Link */}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-amber-300 bg-[#262B40] hover:bg-[#2E344E] border border-amber-500/25 transition-all shrink-0 cursor-pointer"
            title="National Cyber Crime Reporting Portal & 1930 Helpline (Govt of India)"
          >
            <PhoneCall size={12} className="text-amber-400" />
            <span className="text-[11px] font-mono">1930 Helpline</span>
          </a>

          {/* Platform Guide Trigger */}
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white bg-[#262B40] hover:bg-[#2E344E] border border-white/[0.08] transition-all cursor-pointer shrink-0"
            title="Platform Guide & Architecture"
            aria-label="Open Platform Guide"
          >
            <HelpCircle size={16} />
          </button>

          {/* PRIMARY ACCENT CTA: Circular Coral-Pink '+' Button */}
          <Link
            href="/incident"
            className="w-9 h-9 rounded-full bg-[#FF5A79] hover:bg-[#FF4065] text-white flex items-center justify-center shadow-lg shadow-[#FF5A79]/30 transition-all hover:scale-105 active:scale-95 shrink-0 group relative cursor-pointer"
            title="New Incident / Generate Statutory BNS 2023 FIR"
            aria-label="New Incident Report"
          >
            <Plus size={18} strokeWidth={2.5} className="transition-transform group-hover:rotate-90 duration-200" />

            <div className="hidden md:block absolute right-0 top-11 px-3 py-1.5 rounded-xl bg-[#262B40] border border-white/10 text-white text-xs whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
              <span className="font-semibold text-white">New Incident Report</span>
              <span className="text-[10px] text-slate-400 block">Synthesize BNS 2023 FIR</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Modern Platform Guide Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[88dvh] flex flex-col rounded-2xl bg-[#262B40] border border-white/10 shadow-2xl overflow-hidden text-slate-200 font-sans"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#1E2235]/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#FF5A79]/15 border border-[#FF5A79]/30 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-[#FF5A79]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">TRINETRA — Platform Guide</h3>
                  <p className="text-[11px] text-slate-400 truncate">Sovereign Cyber Defense &amp; Forensic Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close guide"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 text-slate-300 flex-1 overflow-y-auto">
              <div className="p-4 rounded-xl bg-[#1E2235] border border-white/[0.06]">
                <p className="font-bold text-sm text-white mb-1">Executive Summary</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  TRINETRA combines real-time threat monitoring across NCIIPC critical infrastructure sectors, automated FIR synthesis under Bharatiya Nyaya Sanhita (BNS) 2023, digital media authenticity verification, and the BharatCode stateless AI Copilot (<code className="text-indigo-300">qwen-3.8-27b</code> + <code className="text-indigo-300">deepseek-v4.1-flash</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#1E2235] border border-white/[0.06]">
                  <p className="text-[#FF5A79] font-bold mb-1">00 // Command Center</p>
                  <p className="text-slate-400">High-level national telemetry, sector status, and threat feed.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1E2235] border border-white/[0.06]">
                  <p className="text-[#9ED5F0] font-bold mb-1">11 // Deepfake XAI</p>
                  <p className="text-slate-400">CGFD &amp; FADI metrics, Grad-CAM maps, and BNS §319(2) briefs.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1E2235] border border-white/[0.06]">
                  <p className="text-[#CBE8BA] font-bold mb-1">04 &amp; 09 // Legal FIR &amp; Crisis</p>
                  <p className="text-slate-400">Court-admissible PDF dossiers with digital hash verification.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1E2235] border border-white/[0.06]">
                  <p className="text-[#F3C19D] font-bold mb-1">02 // AI SecOps Copilot</p>
                  <p className="text-slate-400">Sovereign defense copilot with zero cloud PII retention.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TopBar
