'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Bot,
  ScanFace,
  AlertOctagon,
  GraduationCap,
  Radar,
  Microscope,
  Code2,
  KeyRound,
  MessageSquare,
  Scale,
  Video,
  BookOpen,
  Shield,
  PhoneCall,
  Search,
  Languages,
  Sun,
  Moon,
} from 'lucide-react'
import { useLang } from '@/lib/i18n-context'
import { useTheme } from '@/lib/theme-context'
import { AIHarnessBar } from '@/components/shell/AIHarnessBar'
import { CommandPalette } from '@/components/ui/CommandPalette'

interface NavItem {
  id: string
  enLabel: string
  hiLabel: string
  path: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const GENERAL_TOOLS: NavItem[] = [
  { id: '00', enLabel: 'Dashboard', hiLabel: 'डैशबोर्ड', path: '/', Icon: Home },
  { id: '08', enLabel: 'Message Checker', hiLabel: 'संदेश जांचें', path: '/nlp', Icon: MessageSquare },
  { id: '04', enLabel: 'File Complaint', hiLabel: 'शिकायत दर्ज करें', path: '/incident', Icon: AlertOctagon },
  { id: '02', enLabel: 'AI Assistant', hiLabel: 'एआई सहायक', path: '/mentor', Icon: Bot },
  { id: '11', enLabel: 'Fake Video Checker', hiLabel: 'नकली वीडियो जांच', path: '/deepfake-xai', Icon: ScanFace },
  { id: '05', enLabel: 'File Checker', hiLabel: 'फ़ाइल जांचें', path: '/exif', Icon: Microscope },
  { id: '06', enLabel: 'Identity Check', hiLabel: 'डेटा लीक जांच', path: '/breach', Icon: KeyRound },
  { id: '07', enLabel: 'Latest Threats', hiLabel: 'ताज़ा खतरे', path: '/intel', Icon: Radar },
  { id: '01', enLabel: 'Learn & Practice', hiLabel: 'सीखें और अभ्यास करें', path: '/academy', Icon: GraduationCap },
  { id: '03', enLabel: 'Code Scanner', hiLabel: 'कोड स्कैनर', path: '/devsec', Icon: Code2 },
  { id: '09', enLabel: 'Emergency Guide', hiLabel: 'आपातकालीन गाइड', path: '/cyber-ir', Icon: Scale },
  { id: '10', enLabel: 'Make Videos', hiLabel: 'जागरूकता वीडियो', path: '/video-gen', Icon: Video },
  { id: '12', enLabel: 'Research & Sources', hiLabel: 'शोध और स्रोत', path: '/research', Icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const { lang, toggleLang, t } = useLang()
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

  return (
    <>
      <aside
        className="fixed bottom-0 left-0 right-0 h-16 w-full lg:top-0 lg:bottom-auto lg:right-auto lg:h-screen lg:w-64 bg-[#1E2420] dark:bg-[#090D0A] border-t lg:border-t-0 lg:border-r border-[#323D36] dark:border-[#1E2821] flex flex-row lg:flex-col z-50 select-none overflow-x-auto lg:overflow-y-auto no-scrollbar text-white transition-colors duration-200"
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center justify-between gap-2 px-4 py-4 border-b border-[#323D36] dark:border-[#1E2821] shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#D97706] text-white flex items-center justify-center shadow-xs">
              <Shield size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight tracking-wide">TRINETRA</div>
              <div className="text-[11px] text-[#94A3B8]">Cyber Safety Console</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="p-2 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
            title={t('Search tools (Ctrl+K)', 'टूल खोजें (Ctrl+K)')}
            aria-label="Search tools"
          >
            <Search size={14} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-row lg:flex-col items-center lg:items-stretch gap-1 px-2 lg:px-3 py-2 lg:py-3 overflow-x-auto lg:overflow-y-auto no-scrollbar">
          {GENERAL_TOOLS.map(item => {
            const isActive =
              item.path === '/'
                ? pathname === '/'
                : pathname === item.path || pathname?.startsWith(item.path + '/')

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#2A332D] text-white font-semibold border-l-2 border-[#D97706] shadow-xs'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-[#2A332D]/70 border-l-2 border-transparent'
                }`}
                aria-label={item.enLabel}
              >
                <item.Icon size={16} className={`shrink-0 ${isActive ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`} />
                <span>{t(item.enLabel, item.hiLabel)}</span>
              </Link>
            )
          })}

          {/* Mobile quick toggles inside horizontal nav */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex lg:hidden items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2A332D] border border-[#3E4B42] text-xs font-semibold text-white shrink-0 cursor-pointer"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={14} className="text-[#F59E0B]" /> : <Moon size={14} className="text-[#34D399]" />}
          </button>
          <button
            type="button"
            onClick={toggleLang}
            className="flex lg:hidden items-center gap-1 px-3 py-2 rounded-lg bg-[#2A332D] border border-[#3E4B42] text-xs font-semibold text-white shrink-0 cursor-pointer"
          >
            <Languages size={14} className="text-[#F59E0B]" />
            <span>{lang === 'en' ? 'EN' : 'हि'}</span>
          </button>
        </nav>

        {/* Desktop Utility Controls & Helpline */}
        <div className="hidden lg:flex flex-col gap-2 p-3 border-t border-[#323D36] dark:border-[#1E2821] shrink-0">
          <div className="flex justify-center">
            <AIHarnessBar />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-[11px] font-semibold text-white cursor-pointer transition-colors"
              title="Switch Language (English / Hindi)"
            >
              <Languages size={13} className="text-[#F59E0B]" />
              <span className={lang === 'en' ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}>EN</span>
              <span className="text-[#5C645E]">|</span>
              <span className={lang === 'hi' ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}>हि</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-[11px] font-semibold text-white cursor-pointer transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun size={13} className="text-[#F59E0B]" />
                  <span className="text-[#F59E0B]">{t('Light', 'लाइट')}</span>
                </>
              ) : (
                <>
                  <Moon size={13} className="text-[#34D399]" />
                  <span className="text-[#E5E2DA]">{t('Dark', 'डार्क')}</span>
                </>
              )}
            </button>
          </div>

          <a
            href="tel:1930"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#7F1D1D]/45 border border-[#DC2626]/60 text-[#FECACA] hover:bg-[#991B1B]/60 transition-colors text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              <PhoneCall size={14} className="text-[#FCA5A5]" />
              <span>{t('Scam Helpline', 'हेल्पलाइन')}</span>
            </span>
            <span className="font-mono font-bold text-white">1930</span>
          </a>
        </div>
      </aside>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
