'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  Shield,
  FileText,
  Sun,
  Moon,
} from 'lucide-react'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useLang } from '@/lib/i18n-context'
import { useTheme } from '@/lib/theme-context'

const ROUTE_TITLES: Record<string, { en: string; hi: string }> = {
  '/': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  '/nlp': { en: 'Message Checker', hi: 'संदेश जांचें' },
  '/incident': { en: 'File Complaint', hi: 'शिकायत दर्ज करें' },
  '/mentor': { en: 'AI Assistant', hi: 'एआई सहायक' },
  '/deepfake-xai': { en: 'Fake Video & Photo Checker', hi: 'नकली वीडियो जांच' },
  '/exif': { en: 'File & Photo Privacy Checker', hi: 'फ़ाइल जांचें' },
  '/breach': { en: 'Identity & Leak Check', hi: 'डेटा लीक जांच' },
  '/intel': { en: 'Latest Scam Threats', hi: 'ताज़ा खतरे' },
  '/academy': { en: 'Learn & Practice', hi: 'सीखें और अभ्यास करें' },
  '/devsec': { en: 'Code & Policy Scanner', hi: 'कोड स्कैनर' },
  '/cyber-ir': { en: 'Emergency Response Guide', hi: 'आपातकालीन गाइड' },
  '/video-gen': { en: 'Awareness Video Studio', hi: 'जागरूकता वीडियो' },
  '/research': { en: 'Research & Sources', hi: 'शोध और स्रोत' },
}

export function TopBar() {
  const pathname = usePathname()
  const { t } = useLang()
  const { isDark, toggleTheme } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const routeInfo = ROUTE_TITLES[pathname || '/'] ?? { en: 'Cyber Safety Console', hi: 'साइबर सुरक्षा कंसोल' }

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full bg-[#1E2420]/95 dark:bg-[#0B100D]/95 backdrop-blur-md border-b border-[#323D36] dark:border-[#1E2821] text-white transition-colors duration-200"
        aria-label="Workspace Header"
      >
        <div className="h-13 flex items-center justify-between px-4 sm:px-6 gap-3">
          {/* Left: Current Page Context */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#D97706] text-white flex items-center justify-center">
                <Shield size={14} />
              </div>
            </Link>
            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
            <span className="text-xs font-medium text-[#94A3B8] hidden sm:inline">TRINETRA</span>
            <span className="text-[#475569] hidden sm:inline">/</span>
            <h2 className="text-sm font-semibold text-white truncate">
              {t(routeInfo.en, routeInfo.hi)}
            </h2>
          </div>

          {/* Right: Compact Search, Theme & Emergency CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 h-8 px-3 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-[#E5E2DA] text-xs transition-colors cursor-pointer"
              title="Search tools (Ctrl+K)"
            >
              <Search size={13} className="text-[#94A3B8]" />
              <span className="hidden sm:inline">{t('Search tools', 'टूल खोजें')}</span>
              <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-[#1E2420] text-[#94A3B8] border border-[#3E4B42]">
                Ctrl K
              </kbd>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-xs font-semibold text-white cursor-pointer transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun size={14} className="text-[#F59E0B]" />
              ) : (
                <Moon size={14} className="text-[#34D399]" />
              )}
              <span className="hidden sm:inline">{isDark ? t('Light', 'लाइट') : t('Dark', 'डार्क')}</span>
            </button>

            <Link
              href="/incident"
              className="h-8 px-3 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <FileText size={13} />
              <span className="hidden sm:inline">{t('File Complaint', 'शिकायत दर्ज करें')}</span>
            </Link>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
