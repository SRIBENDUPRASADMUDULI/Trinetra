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
  { id: 'overview', labelEn: 'National SOC', labelHi: 'राष्ट्रीय एसओसी', path: '/' },
  { id: 'nlp', labelEn: 'Phishing Inspector', labelHi: 'फ़िशिंग जांच', path: '/nlp' },
  { id: 'incident', labelEn: 'Incident & FIR', labelHi: 'घटना और एफआईआर', path: '/incident' },
  { id: 'mentor', labelEn: 'AI Copilot', labelHi: 'एआई सहपायलट', path: '/mentor' },
  { id: 'deepfake-xai', labelEn: 'Deepfake Forensics', labelHi: 'डीपफेक फोरेंसिक', path: '/deepfake-xai' },
  { id: 'devsec', labelEn: 'Code Auditor', labelHi: 'कोड ऑडिटर', path: '/devsec' },
  { id: 'research', labelEn: 'Research', labelHi: 'अनुसंधान', path: '/research' },
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
        className="sticky top-0 z-40 w-full select-none bg-[#0A192F]/95 backdrop-blur-md border-b border-[#233554]"
        aria-label="Official Portal Top Navigation Bar"
      >
        {/* Top Statutory Authority Sub-Bar */}
        <div className="px-3 sm:px-6 py-1.5 border-b border-[#233554]/80 bg-[#071222] flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield size={13} className="text-[#FF9F1C] shrink-0" />
            <span className="font-legal font-bold text-[#F8F9FA] tracking-wide truncate">
              {t(
                'TRINETRA · National Cyber Defense Console',
                'त्रिनेत्र · राष्ट्रीय साइबर रक्षा कंसोल'
              )}
            </span>
            <span className="hidden md:inline text-[#233554]">|</span>
            <span className="hidden md:inline text-[#8D99AE] font-mono text-[10px]">
              IT Act §70A · BNS 2023 · BSA 2023 §63
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#172A45] border border-[#233554] text-[#FF9F1C] text-[10px] font-bold">
              DEF CON: 3
            </span>
            {istTime && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-[#8D99AE]">
                <Clock size={11} className="text-[#00A896]" />
                {istTime}
              </span>
            )}
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#172A45] hover:bg-[#1E3554] border border-[#233554] text-[10px] font-bold text-[#F8F9FA] cursor-pointer transition-colors"
              title="Switch Language (English / Hindi)"
            >
              <Languages size={11} className="text-[#FF9F1C]" />
              <span className={lang === 'en' ? 'text-[#FF9F1C]' : 'text-[#8D99AE]'}>EN</span>
              <span className="text-[#8D99AE]">|</span>
              <span className={lang === 'hi' ? 'text-[#FF9F1C]' : 'text-[#8D99AE]'}>हिं</span>
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
                      ? 'text-[#F8F9FA] font-semibold'
                      : 'text-[#8D99AE] hover:text-[#F8F9FA]'
                  }`}
                >
                  <span className={lang === 'hi' ? 'font-hindi' : ''}>
                    {lang === 'hi' ? tab.labelHi : tab.labelEn}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#FF9F1C] rounded-t" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg bg-[#172A45] hover:bg-[#1E3554] border border-[#233554] text-[#8D99AE] hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Open Search"
            >
              <Search size={14} />
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-[#172A45] hover:bg-[#1E3554] border border-[#233554] text-[#8D99AE] text-xs transition-colors w-40 lg:w-44 cursor-pointer text-left"
              title="Search departments & IOCs (⌘K / Ctrl+K)"
            >
              <Search size={13} className="shrink-0" />
              <span className="truncate text-[11px]">{t('Search modules...', 'मॉड्यूल खोजें...')}</span>
              <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0A192F] border border-[#233554]">
                ⌘K
              </span>
            </button>

            <AIHarnessBar />

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-mono font-semibold text-[#FF9F1C] bg-[#172A45] hover:bg-[#1E3554] border border-[#FF9F1C]/40 transition-colors shrink-0"
              title="National Cyber Crime Reporting Portal & 1930 Helpline"
            >
              <PhoneCall size={12} />
              <span>1930 Helpline</span>
            </a>

            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#8D99AE] hover:text-white bg-[#172A45] hover:bg-[#1E3554] border border-[#233554] transition-colors cursor-pointer shrink-0"
              aria-label="Platform Documentation"
            >
              <HelpCircle size={15} />
            </button>

            <Link
              href="/incident"
              className="h-8 px-3 rounded-lg bg-[#FF9F1C] hover:bg-[#F08C00] text-[#0A192F] font-bold text-xs flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[88dvh] flex flex-col rounded-xl bg-[#172A45] border border-[#233554] shadow-2xl overflow-hidden text-[#F8F9FA]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#233554] bg-[#0A192F] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FF9F1C]/15 border border-[#FF9F1C]/40 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-[#FF9F1C]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-legal text-sm font-bold text-[#F8F9FA] truncate">
                    TRINETRA — Official Console Architecture
                  </h3>
                  <p className="text-[11px] text-[#8D99AE] truncate">
                    Aligned to IT Act 2000, BNS 2023, BSA 2023 §63 &amp; DPDP Act 2023
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close guide"
                className="text-[#8D99AE] hover:text-white p-1.5 rounded-lg hover:bg-[#1E3554] transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-[#F8F9FA]/90 flex-1 overflow-y-auto text-xs">
              <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554]">
                <p className="font-bold text-sm text-[#F8F9FA] mb-1">Statutory Mandate &amp; AI Harness</p>
                <p className="text-[#8D99AE] leading-relaxed">
                  TRINETRA integrates NCIIPC critical sector telemetry, BNS 2023 e-FIR synthesis, BSA 2023 §63 SHA-256 electronic evidence certification, and stateless BharatCode AI routing (<code className="text-[#00A896]">qwen-3.8-27b</code> + <code className="text-[#00A896]">deepseek-v4.1-flash</code>, <code className="text-[#FF9F1C]">store: false</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#233554]">
                  <p className="text-[#FF9F1C] font-bold mb-1">00 // National SOC</p>
                  <p className="text-[#8D99AE]">DEF CON posture, IT Act §70 sector table, and CERT-In advisories.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#233554]">
                  <p className="text-[#00A896] font-bold mb-1">08 // Phishing &amp; Link Inspector</p>
                  <p className="text-[#8D99AE]">Live SMS/URL analysis, Levenshtein spoofing check, and BSA §63 PDF.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#233554]">
                  <p className="text-[#2E8B57] font-bold mb-1">04 // Incident Response &amp; FIR</p>
                  <p className="text-[#8D99AE]">Bilingual cybercrime complaint drafting with 1930 helpline workflow.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#233554]">
                  <p className="text-[#F8F9FA] font-bold mb-1">11 // Deepfake Forensics</p>
                  <p className="text-[#8D99AE]">Grad-CAM facial saliency and CGFD/FADI research benchmarks.</p>
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
