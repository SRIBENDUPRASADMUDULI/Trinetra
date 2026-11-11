'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  HelpCircle,
  PhoneCall,
  Shield,
  X,
  Languages,
  FileText,
  Sun,
  Moon,
} from 'lucide-react'
import { AIHarnessBar } from '@/components/shell/AIHarnessBar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useLang } from '@/lib/i18n-context'
import { useTheme } from '@/lib/theme-context'

interface TopNavTab {
  id: string
  labelEn: string
  labelHi: string
  path: string
}

const TOP_NAV_TABS: TopNavTab[] = [
  { id: 'overview', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', path: '/' },
  { id: 'nlp', labelEn: 'Check Message', labelHi: 'संदेश जांचें', path: '/nlp' },
  { id: 'deepfake-xai', labelEn: 'Fake Video Checker', labelHi: 'वीडियो जांचें', path: '/deepfake-xai' },
]

export function TopBar() {
  const pathname = usePathname()
  const { lang, toggleLang, t } = useLang()
  const { isDark, toggleTheme } = useTheme()
  const [showHelp, setShowHelp] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

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
        className="sticky top-0 z-40 w-full bg-[#1E2420] dark:bg-[#090D0A] border-b border-[#323D36] dark:border-[#1E2821] text-white transition-colors duration-200"
        aria-label="Top Navigation Bar"
      >
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/" className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white flex items-center justify-center">
                <Shield size={16} />
              </div>
              <span className="font-bold text-sm text-white">TRINETRA</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
              {TOP_NAV_TABS.map(tab => {
                const isActive =
                  tab.path === '/'
                    ? pathname === '/'
                    : pathname === tab.path || pathname?.startsWith(tab.path + '/')

                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#2A332D] text-[#F59E0B] font-semibold border border-[#3E4B42]'
                        : 'text-[#CBD5E1] hover:text-white hover:bg-[#2A332D]/70'
                    }`}
                  >
                    <span className={lang === 'hi' ? 'font-hindi' : ''}>
                      {lang === 'hi' ? tab.labelHi : tab.labelEn}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-[#E5E2DA] text-xs transition-colors cursor-pointer"
              title="Search tools"
            >
              <Search size={14} className="text-[#94A3B8]" />
              <span className="hidden sm:inline">{t('Search tools', 'टूल खोजें')}</span>
            </button>

            <AIHarnessBar />

            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-xs font-semibold text-white cursor-pointer transition-colors"
              title="Switch Language (English / Hindi)"
            >
              <Languages size={14} className="text-[#F59E0B]" />
              <span className={lang === 'en' ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}>EN</span>
              <span className="text-[#5C645E]">|</span>
              <span className={lang === 'hi' ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}>हिन्दी</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-xs font-semibold text-white cursor-pointer transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun size={14} className="text-[#F59E0B]" />
                  <span className="hidden xl:inline text-[#F59E0B]">{t('Light', 'लाइट')}</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-[#34D399]" />
                  <span className="hidden xl:inline text-[#E5E2DA]">{t('Dark', 'डार्क')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-xs font-medium text-[#E5E2DA] hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle size={14} className="text-[#34D399]" />
              <span>{t('Help', 'सहायता')}</span>
            </button>

            <Link
              href="/incident"
              className="h-9 px-3.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">{t('File Complaint', 'शिकायत दर्ज करें')}</span>
            </Link>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {showHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] shadow-xl overflow-hidden text-[#1C201D]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E0DDD5] bg-[#F2F1EC]">
              <div className="flex items-center gap-2.5">
                <Shield size={18} className="text-[#1E2420]" />
                <h3 className="text-sm font-bold text-[#1E2420]">
                  How to Use TRINETRA
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
                className="text-[#6B726D] hover:text-[#1C201D] p-1 rounded-lg hover:bg-[#E5E2DA] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-[#5C645E] leading-relaxed">
              <p>
                <strong className="text-[#1C201D]">1. Check Suspicious Messages:</strong> Go to{' '}
                <strong>Message Checker</strong>, paste any strange SMS or WhatsApp link, and click{' '}
                <strong>Check Now</strong>.
              </p>
              <p>
                <strong className="text-[#1C201D]">2. Lost Money or Hacked?</strong> Dial{' '}
                <strong className="text-[#DC2626]">1930</strong> immediately and use{' '}
                <strong>File Complaint</strong> to download a formal complaint letter for Indian Police.
              </p>
              <p>
                <strong className="text-[#1C201D]">3. Your Privacy is Safe:</strong> Passwords, photos, and ID numbers are checked locally in your browser or automatically masked before reaching BharatCode AI.
              </p>
              <div className="pt-2 flex justify-end">
                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] font-semibold"
                >
                  <PhoneCall size={13} />
                  Emergency Helpline: 1930
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TopBar
