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
} from 'lucide-react'

interface RailItem {
  id: string
  label: string
  sub: string
  path: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const ALL_12_MODULES: RailItem[] = [
  {
    id: '00',
    label: '00 // Command Center',
    sub: 'National SOC & Threat Posture',
    path: '/',
    Icon: Home,
  },
  {
    id: '01',
    label: '01 // Cyber Range',
    sub: 'Mission Briefings & Hex Stream',
    path: '/academy',
    Icon: GraduationCap,
  },
  {
    id: '02',
    label: '02 // AI SecOps Copilot',
    sub: 'BharatCode Defense Assistant',
    path: '/mentor',
    Icon: Bot,
  },
  {
    id: '03',
    label: '03 // DevSecOps',
    sub: 'Code Audit & Privacy Check',
    path: '/devsec',
    Icon: Code2,
  },
  {
    id: '04',
    label: '04 // Incident Crisis & FIR',
    sub: 'BNS 2023 & IT Act Dossiers',
    path: '/incident',
    Icon: AlertOctagon,
  },
  {
    id: '05',
    label: '05 // Forensics Lab',
    sub: 'EXIF Scrub & GPS Forensics',
    path: '/exif',
    Icon: Microscope,
  },
  {
    id: '06',
    label: '06 // Sentinel Guard',
    sub: 'k-Anonymity Identity Audits',
    path: '/breach',
    Icon: KeyRound,
  },
  {
    id: '07',
    label: '07 // Threat Radar',
    sub: 'NCIIPC & CERT-In Feed',
    path: '/intel',
    Icon: Radar,
  },
  {
    id: '08',
    label: '08 // NLP Phishing Scan',
    sub: 'Lure Detection & URL Entropy',
    path: '/nlp',
    Icon: MessageSquare,
  },
  {
    id: '09',
    label: '09 // Cyber-IR Engine',
    sub: 'BNS 2023 FIR & SANS Playbooks',
    path: '/cyber-ir',
    Icon: Scale,
  },
  {
    id: '10',
    label: '10 // Video Studio',
    sub: 'Incident Briefing Video Vault',
    path: '/video-gen',
    Icon: Video,
  },
  {
    id: '11',
    label: '11 // Deepfake XAI',
    sub: 'CGFD & FADI Forensic Evidence',
    path: '/deepfake-xai',
    Icon: ScanFace,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-16 bg-[#181B2A] border-r border-white/[0.06] flex flex-col items-center py-3 z-50 select-none justify-between overflow-hidden"
      aria-label="Primary Navigation Rail"
    >
      {/* TOP: Brand Monogram Badge */}
      <div className="flex flex-col items-center gap-3 w-full shrink-0">
        <Link
          href="/"
          className="group relative flex items-center justify-center cursor-pointer"
          title="TRINETRA Sovereign Cyber Intelligence"
        >
          {/* Rounded Coral-Pink Square Badge with 'TR' Monogram */}
          <div className="w-10 h-10 rounded-xl bg-[#FF5A79] flex items-center justify-center font-bold text-white text-base shadow-md shadow-[#FF5A79]/30 transition-transform group-hover:scale-105 active:scale-95">
            TR
          </div>
          {/* Brand Hover Tooltip */}
          <div className="absolute left-16 ml-2 px-3 py-1.5 rounded-xl bg-[#262B40] border border-white/10 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 flex items-center gap-2">
            <span>TRINETRA</span>
            <span className="text-[10px] font-mono text-[#FF5A79] bg-[#FF5A79]/15 px-1.5 py-0.5 rounded">
              SOC 2.4
            </span>
          </div>
        </Link>
      </div>

      {/* CENTER: All 12 Operational Module Icons (Scrollable with Hidden Bar) */}
      <nav className="flex-1 overflow-y-auto no-scrollbar w-full px-2 py-2 flex flex-col items-center gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ALL_12_MODULES.map(item => {
          const isActive =
            item.path === '/'
              ? pathname === '/'
              : pathname === item.path || pathname?.startsWith(item.path + '/')

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <Link
                href={item.path}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5A79] text-white shadow-md shadow-[#FF5A79]/35 font-bold scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                aria-label={item.label}
              >
                <item.Icon size={18} className="shrink-0" />
              </Link>

              {/* Hover Flyout Tooltip */}
              <div className="absolute left-16 ml-2 px-3 py-1.5 rounded-xl bg-[#262B40] border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-sans">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A79]" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">
                  {item.sub}
                </span>
              </div>
            </div>
          )
        })}
      </nav>

      {/* BOTTOM: Operational Status & Node Identifier */}
      <div className="flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-white/[0.06] shrink-0">
        {/* Live Operational Status Dot */}
        <div className="relative group flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#262B40] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="absolute left-16 ml-2 px-3 py-1.5 rounded-xl bg-[#262B40] border border-white/10 text-xs text-slate-200 whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
            <div className="font-semibold text-emerald-400">12 Engines Armed</div>
            <div className="text-[10px] text-slate-400">Sovereign Defense Grid Active</div>
          </div>
        </div>

        {/* Node Identifier */}
        <div
          className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] font-mono font-bold text-slate-400"
          title="Sovereign Node IN-DEL-01"
        >
          IN
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
