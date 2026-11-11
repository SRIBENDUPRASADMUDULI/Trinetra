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
  Clock,
  Languages,
} from 'lucide-react'
import { AIHarnessBar } from '@/components/shell/AIHarnessBar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useLang } from '@/lib/i18n-context'

interface TopNavTab {
  id: string
  labelEn: string
  labelHi: string
  path: string
}

const TOP_NAV_TABS: TopNavTab[] = [
  { id: 'overview', labelEn: 'Command Center', labelHi: 'कमांड सेंटर', path: '/' },
  { id: 'intel', labelEn: '3D Threat Radar', labelHi: '3D थ्रेट रडार', path: '/intel' },
  { id: 'nlp', labelEn: 'Phishing Inspector', labelHi: 'फ़िशिंग जांच', path: '/nlp' },
  { id: 'incident', labelEn: 'Incident & FIR', labelHi: 'घटना और एफआईआर', path: '/incident' },
  { id: 'mentor', labelEn: 'AI Copilot', labelHi: 'एआई सहपायलट', path: '/mentor' },
  { id: 'deepfake-xai', labelEn: 'Deepfake XAI', labelHi: 'डीपफेक XAI', path: '/deepfake-xai' },
  { id: 'devsec', labelEn: 'DevSecOps', labelHi: 'देवसेकऑप्स', path: '/devsec' },
]

export function TopBar() {
  const pathname = usePathname()
  const { lang, toggleLang, t } = useLang()
  const [showHelp, setShowHelp] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [istTime, setIstTime] = useState('')

  useEffect(() => {
    function tick() {
      setIstTime(
        new Date().toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

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
        className="sticky top-0 z-40 w-full select-none bg-[#0A0A12]/90 backdrop-blur-md border-b border-[#1A1A2E]"
        aria-label="Cinematic Portal Top Navigation Bar"
      >
        {/* Top Statutory & Telemetry Sub-Bar */}
        <div className="px-3 sm:px-6 py-1.5 border-b border-[#1A1A2E] bg-[#03030A]/90 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield size={13} className="text-[#FF1B1B] shrink-0" />
            <span className="font-legal font-bold text-[#F5F5F5] tracking-wide truncate">
              {t(
                'TRINETRA · Cyber Defense Console',
                'त्रिनेत्र · साइबर डिफेंस कंसोल'
              )}
            </span>
            <span className="hidden md:inline text-[#1A1A2E]">|</span>
            <span className="hidden md:inline text-[#888888] font-mono text-[10px]">
              IT Act §70A · BNS 2023 · BSA 2023 §63
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF1B1B]/10 border border-[#FF1B1B]/40 text-[#FF1B1B] text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF1B1B] animate-pulse" />
              DEF CON: 3
            </span>
            {istTime && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-[#00FF9D]">
                <Clock size={11} className="text-[#00D4FF]" />
                {istTime}
              </span>
            )}
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0A0A12] hover:bg-[#121222] border border-[#1A1A2E] hover:border-[#00D4FF]/50 text-[10px] font-bold text-[#F5F5F5] cursor-pointer transition-colors"
              title="Switch Language (English / Hindi)"
            >
              <Languages size={11} className="text-[#FF9F1C]" />
              <span className={lang === 'en' ? 'text-[#00D4FF]' : 'text-[#888888]'}>EN</span>
              <span className="text-[#666666]">|</span>
              <span className={lang === 'hi' ? 'text-[#FF9F1C]' : 'text-[#888888]'}>हिं</span>
            </button>
          </div>
        </div>

        {/* Main Navigation & Action Strip */}
        <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
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
                  className={`relative h-full flex items-center px-2.5 sm:px-3.5 text-xs whitespace-nowrap transition-colors font-medium shrink-0 ${
                    isActive
                      ? 'text-[#00D4FF] font-semibold'
                      : 'text-[#888888] hover:text-[#F5F5F5]'
                  }`}
                >
                  <span className={lang === 'hi' ? 'font-hindi' : ''}>
                    {lang === 'hi' ? tab.labelHi : tab.labelEn}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#00D4FF] shadow-[0_0_10px_#00D4FF] rounded-t" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg bg-[#03030A] border border-[#1A1A2E] text-[#888888] hover:text-[#00D4FF] transition-colors cursor-pointer shrink-0"
              aria-label="Open Search"
            >
              <Search size={14} />
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-[#03030A] hover:border-[#00D4FF]/50 border border-[#1A1A2E] text-[#888888] text-xs transition-colors w-40 lg:w-44 cursor-pointer text-left"
              title="Search departments & IOCs (⌘K / Ctrl+K)"
            >
              <Search size={13} className="shrink-0 text-[#00D4FF]" />
              <span className="truncate text-[11px]">{t('Search modules...', 'मॉड्यूल खोजें...')}</span>
              <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0A0A12] border border-[#1A1A2E] text-[#00FF9D]">
                ⌘K
              </span>
            </button>

            <AIHarnessBar />

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-mono font-semibold text-[#FF9F1C] bg-[#03030A] hover:border-[#FF9F1C]/60 border border-[#FF9F1C]/35 transition-colors shrink-0"
              title="National Cyber Crime Reporting Portal & 1930 Helpline"
            >
              <PhoneCall size={12} />
              <span>1930 Helpline</span>
            </a>

            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#888888] hover:text-[#00D4FF] bg-[#03030A] border border-[#1A1A2E] hover:border-[#00D4FF]/50 transition-colors cursor-pointer shrink-0"
              aria-label="Platform Documentation"
            >
              <HelpCircle size={15} />
            </button>

            <Link
              href="/incident"
              className="h-8 px-3 rounded-lg bg-[#FF1B1B] hover:bg-[#e01414] text-[#F5F5F5] font-bold text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-[0_0_16px_rgba(255,27,27,0.4)]"
              title="File Statutory BNS 2023 FIR"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">{t('File FIR', 'एफआईआर दर्ज करें')}</span>
            </Link>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {showHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[88dvh] flex flex-col rounded-xl bg-[#0A0A12] border border-[#1A1A2E] shadow-[0_0_32px_rgba(0,212,255,0.2)] overflow-hidden text-[#F5F5F5]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1A1A2E] bg-[#03030A] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FF1B1B]/15 border border-[#FF1B1B]/40 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-[#FF1B1B]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-legal text-sm font-bold text-[#F5F5F5] truncate">
                    TRINETRA — Cinematic 3D Cyber Architecture
                  </h3>
                  <p className="text-[11px] text-[#888888] truncate">
                    Aligned to IT Act 2000, BNS 2023, BSA 2023 §63 &amp; DPDP Act 2023
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close guide"
                className="text-[#888888] hover:text-white p-1.5 rounded-lg hover:bg-[#1A1A2E] transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-[#F5F5F5]/90 flex-1 overflow-y-auto text-xs">
              <div className="p-4 rounded-lg bg-[#03030A] border border-[#1A1A2E]">
                <p className="font-bold text-sm text-[#F5F5F5] mb-1">Statutory Core + WebGL Depth</p>
                <p className="text-[#888888] leading-relaxed">
                  Combines interactive React Three Fiber 3D threat telemetry, BNS 2023 e-FIR synthesis, BSA 2023 §63 SHA-256 certificates, and stateless BharatCode AI routing (<code className="text-[#00FF9D]">qwen-3.8-27b</code> + <code className="text-[#00D4FF]">deepseek-v4.1-flash</code>, <code className="text-[#FF9F1C]">store: false</code>).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TopBar
