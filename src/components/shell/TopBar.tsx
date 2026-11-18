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
  Menu,
  X,
  PhoneCall,
  Languages,
  ChevronDown,
  MessageSquare,
  ScanFace,
  Microscope,
  KeyRound,
  Radar,
  GraduationCap,
  Code2,
  BookOpen,
  Bot,
  Scale,
  Video,
} from 'lucide-react'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useLang } from '@/lib/i18n-context'
import { useTheme } from '@/lib/theme-context'

const TOP_NAV_LINKS = [
  { href: '/', en: 'Dashboard', hi: 'डैशबोर्ड' },
  { href: '/nlp', en: 'Message Checker', hi: 'संदेश जांचें' },
  { href: '/deepfake-xai', en: 'Deepfake Verifier', hi: 'नकली वीडियो जांच' },
  { href: '/intel', en: '3D Threat Globe', hi: '3D थ्रेट ग्लोब' },
  { href: '/incident', en: 'File Complaint (1930)', hi: 'शिकायत दर्ज करें' },
  { href: '/academy', en: 'Academy', hi: 'सीखें' },
  { href: '/research', en: 'APIs & Sources', hi: 'एपीआई और स्रोत' },
]

const ALL_TOOLS_MENU = [
  { href: '/nlp', en: 'Message & Link Checker', hi: 'संदेश और लिंक जांचें', icon: MessageSquare, desc: 'Detect SMS, WhatsApp & banking scams' },
  { href: '/deepfake-xai', en: 'Deepfake Photo & Video', hi: 'नकली वीडियो और फोटो', icon: ScanFace, desc: 'Verify AI-generated face and media manipulation' },
  { href: '/exif', en: 'Photo Privacy & GPS Stripper', hi: 'फोटो लोकेशन हटाएं', icon: Microscope, desc: 'Remove camera serials & home coordinates' },
  { href: '/breach', en: 'Data Leak & Password Check', hi: 'डेटा लीक जांच', icon: KeyRound, desc: 'Check if passwords were leaked online' },
  { href: '/mentor', en: 'AI Cyber Safety Advisor', hi: 'एआई साइबर सहायक', icon: Bot, desc: '24/7 instant Q&A in English & Hindi' },
  { href: '/intel', en: 'God\'s Eye 3D Threat Globe', hi: '3D अर्थ थ्रेट ग्लोब', icon: Radar, desc: 'Real-time flights, ships & cyber attack map' },
  { href: '/incident', en: 'e-FIR Complaint Letter', hi: 'e-FIR शिकायत पत्र', icon: FileText, desc: 'Police complaint generator under BNS 2023' },
  { href: '/cyber-ir', en: 'Emergency Incident Guide', hi: 'आपातकालीन रिस्पांस', icon: Scale, desc: 'First 60-minute containment checklists' },
  { href: '/devsec', en: 'Code Security Scanner', hi: 'सुरक्षित कोड स्कैनर', icon: Code2, desc: 'Find exposed API keys and security flaws' },
  { href: '/academy', en: 'Cyber Awareness Academy', hi: 'साइबर जागरूकता सीखें', icon: GraduationCap, desc: 'Interactive lessons and scam spotter quizzes' },
  { href: '/video-gen', en: 'Awareness Script Studio', hi: 'जागरूकता वीडियो स्टूडियो', icon: Video, desc: 'Generate community warning scripts' },
  { href: '/research', en: 'Academic Sources & API Keys', hi: 'शोध और लाइव एपीआई', icon: BookOpen, desc: 'Verified papers, statutes & live integrations' },
]

export function TopBar() {
  const pathname = usePathname()
  const { lang, toggleLang, t } = useLang()
  const { isDark, toggleTheme } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false)

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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setToolsDropdownOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full bg-[#1E2420]/95 dark:bg-[#090D0A]/95 backdrop-blur-md border-b border-[#323D36] dark:border-[#1E2821] text-white transition-colors duration-200 shadow-xs"
        aria-label="Main Navigation Header"
      >
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* 1. Left: Brand Logo (PayPal Style Clean Brand) */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white flex items-center justify-center shadow-xs">
                <Shield size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-white leading-none">TRINETRA</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Sovereign Shield Online" />
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8] tracking-wider uppercase leading-none mt-1 hidden sm:inline">
                  Sovereign Cyber Safety
                </span>
              </div>
            </Link>

            {/* 2. Center: Desktop Primary Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {TOP_NAV_LINKS.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#2A332D] text-emerald-400 shadow-xs'
                        : 'text-[#CBD5E1] hover:text-white hover:bg-[#2A332D]/60'
                    }`}
                  >
                    {t(item.en, item.hi)}
                  </Link>
                )
              })}

              {/* Tools Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setToolsDropdownOpen((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    toolsDropdownOpen
                      ? 'bg-[#2A332D] text-white'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#2A332D]/60'
                  }`}
                >
                  <span>{t('All Tools', 'सभी टूल्स')}</span>
                  <ChevronDown size={12} className={`transition-transform ${toolsDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {toolsDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#1E2420] border border-[#3E4B42] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setToolsDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[#323D36] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                        {t('12 Cyber Defense Tools', '12 साइबर सुरक्षा टूल्स')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">100% Free</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-[#2A332D] py-1">
                      {ALL_TOOLS_MENU.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setToolsDropdownOpen(false)}
                          className="p-2.5 rounded-xl hover:bg-[#2A332D] transition-colors flex items-start gap-2.5 group"
                        >
                          <tool.icon size={16} className="text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                              {t(tool.en, tool.hi)}
                            </div>
                            <div className="text-[11px] text-[#94A3B8] truncate">{tool.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* 3. Right: Utility Actions (Search, Lang, Theme, 1930 Helpline CTA) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Search Button (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-[#E5E2DA] text-xs transition-colors cursor-pointer"
              title="Search tools (Ctrl+K)"
            >
              <Search size={14} className="text-[#94A3B8]" />
              <span className="hidden md:inline">{t('Search tools', 'टूल खोजें')}</span>
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-[#1E2420] text-[#94A3B8] border border-[#3E4B42]">
                Ctrl K
              </kbd>
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center justify-center gap-1 h-9 px-2.5 rounded-xl bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-xs font-semibold text-white cursor-pointer transition-colors"
              title="Switch Language (English / Hindi)"
            >
              <Languages size={14} className="text-[#F59E0B]" />
              <span className={lang === 'en' ? 'text-emerald-400 font-bold' : 'text-[#94A3B8]'}>EN</span>
              <span className="text-[#5C645E]">|</span>
              <span className={lang === 'hi' ? 'text-emerald-400 font-bold' : 'text-[#94A3B8]'}>हि</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-white cursor-pointer transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} className="text-[#F59E0B]" /> : <Moon size={15} className="text-[#34D399]" />}
            </button>

            {/* Emergency Toll-Free 1930 Call Button */}
            <a
              href="tel:1930"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold transition-colors"
              title="National Cyber Crime Reporting Helpline"
            >
              <PhoneCall size={13} className="text-red-400 animate-bounce" />
              <span>1930 Helpline</span>
            </a>

            {/* File Complaint Primary Action (PayPal Style Sign Up Button) */}
            <Link
              href="/incident"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-sm hover:shadow-emerald-500/20"
            >
              <FileText size={14} />
              <span>{t('File e-FIR', 'e-FIR शिकायत')}</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="xl:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-white cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* 4. Mobile Navigation Drawer (When Hamburger is clicked) */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#323D36] bg-[#1E2420] text-white p-4 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#323D36]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                {t('Navigation Menu', 'नेविगेशन मेनू')}
              </span>
              <a
                href="tel:1930"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-900/60 border border-red-500/40 text-red-200 text-xs font-bold"
              >
                <PhoneCall size={12} className="text-red-400" />
                <span>1930 Helpline</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ALL_TOOLS_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#2A332D]/70 hover:bg-[#2A332D] border border-[#3E4B42] transition-colors"
                >
                  <item.icon size={18} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-white">{t(item.en, item.hi)}</div>
                    <div className="text-[11px] text-[#94A3B8] truncate">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
