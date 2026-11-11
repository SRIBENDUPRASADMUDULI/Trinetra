'use client'
import React from 'react'
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
} from 'lucide-react'
import { useLang } from '@/lib/i18n-context'

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
  const { t } = useLang()

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 h-16 w-full lg:top-0 lg:bottom-auto lg:right-auto lg:h-screen lg:w-60 bg-[#FFFFFF] border-t lg:border-t-0 lg:border-r border-[#E5E7EB] flex flex-row lg:flex-col z-50 select-none overflow-x-auto lg:overflow-y-auto no-scrollbar"
      aria-label="Main Navigation"
    >
      {/* Desktop Brand Header */}
      <div className="hidden lg:flex items-center gap-3 px-4 py-4 border-b border-[#E5E7EB] shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1A1A1A] leading-tight">TRINETRA</div>
            <div className="text-[11px] text-[#6B7280]">Cyber Safety Console</div>
          </div>
        </Link>
      </div>

      {/* Navigation List (Icon + Clear Text Label on Desktop, Compact Strip on Mobile) */}
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
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border border-[#BFDBFE]'
                  : 'text-[#4B5563] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] border border-transparent'
              }`}
              aria-label={item.enLabel}
            >
              <item.Icon size={16} className={`shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#6B7280]'}`} />
              <span>{t(item.enLabel, item.hiLabel)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop Emergency Help Box */}
      <div className="hidden lg:block p-3 border-t border-[#E5E7EB] shrink-0">
        <a
          href="tel:1930"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            <PhoneCall size={14} />
            <span>{t('Scam Helpline', 'हेल्पलाइन')}</span>
          </span>
          <span className="font-mono font-bold">1930</span>
        </a>
      </div>
    </aside>
  )
}
