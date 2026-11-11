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
  { id: 'overview', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', path: '/' },
  { id: 'nlp', labelEn: 'Check Message', labelHi: 'संदेश जांचें', path: '/nlp' },
  { id: 'incident', labelEn: 'File Complaint', labelHi: 'शिकायत दर्ज करें', path: '/incident' },
  { id: 'deepfake-xai', labelEn: 'Check Fake Video', labelHi: 'वीडियो जांचें', path: '/deepfake-xai' },
  { id: 'mentor', labelEn: 'AI Assistant', labelHi: 'एआई सहायक', path: '/mentor' },
  { id: 'intel', labelEn: 'Latest Threats', labelHi: 'ताज़ा खतरे', path: '/intel' },
]

export function TopBar() {
  const pathname = usePathname()
  const { lang, toggleLang, t } = useLang()
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
        className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E5E7EB]"
        aria-label="Top Navigation Bar"
      >
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 gap-3">
          {/* Mobile Brand Mark + Primary Page Links */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/" className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
                <Shield size={16} />
              </div>
              <span className="font-bold text-sm text-[#1A1A1A]">TRINETRA</span>
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
                        ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                        : 'text-[#4B5563] hover:text-[#1A1A1A] hover:bg-[#F3F4F6]'
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

          {/* Right Controls: Search + AI Harness + Language Toggle + Help + File Complaint */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#F8F9FA] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-[#6B7280] text-xs transition-colors cursor-pointer"
              title="Search tools"
            >
              <Search size={14} className="text-[#6B7280]" />
              <span className="hidden sm:inline">{t('Search tools', 'टूल खोजें')}</span>
            </button>

            <AIHarnessBar />

            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-semibold text-[#1A1A1A] cursor-pointer transition-colors"
              title="Switch Language (English / Hindi)"
            >
              <Languages size={14} className="text-[#2563EB]" />
              <span className={lang === 'en' ? 'text-[#2563EB]' : 'text-[#6B7280]'}>EN</span>
              <span className="text-[#D1D5DB]">|</span>
              <span className={lang === 'hi' ? 'text-[#2563EB]' : 'text-[#6B7280]'}>हिन्दी</span>
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              <HelpCircle size={14} className="text-[#2563EB]" />
              <span>{t('Help', 'सहायता')}</span>
            </button>

            <Link
              href="/incident"
              className="h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
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
            className="relative w-full max-w-xl rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xl overflow-hidden text-[#1A1A1A]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <Shield size={18} className="text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  How to Use TRINETRA
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
                className="text-[#6B7280] hover:text-[#1A1A1A] p-1 rounded-lg hover:bg-[#E5E7EB]/60 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-[#4B5563] leading-relaxed">
              <p>
                <strong className="text-[#1A1A1A]">1. Check Suspicious Messages:</strong> Go to{' '}
                <strong>Message Checker</strong>, paste any strange SMS or WhatsApp link, and click{' '}
                <strong>Check Now</strong>.
              </p>
              <p>
                <strong className="text-[#1A1A1A]">2. Lost Money or Hacked?</strong> Dial{' '}
                <strong className="text-[#DC2626]">1930</strong> immediately and use{' '}
                <strong>File Complaint</strong> to download a formal complaint letter for Indian Police.
              </p>
              <p>
                <strong className="text-[#1A1A1A]">3. Your Privacy is Safe:</strong> Passwords, photos, and ID numbers are checked locally in your browser or automatically masked before reaching the BharatCode AI assistant.
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
