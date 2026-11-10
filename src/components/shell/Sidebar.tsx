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
  HelpCircle,
  Shield,
  Activity,
  Layers,
} from 'lucide-react'

interface RailItem {
  id: string
  label: string
  sub: string
  path: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const RAIL_NAV: RailItem[] = [
  {
    id: 'home',
    label: 'Command Center',
    sub: 'National SOC & Threat Posture',
    path: '/',
    Icon: Home,
  },
  {
    id: 'mentor',
    label: 'AI SecOps Copilot',
    sub: 'BharatCode Defense Assistant',
    path: '/mentor',
    Icon: Bot,
  },
  {
    id: 'deepfake-xai',
    label: 'Deepfake XAI',
    sub: 'CGFD & FADI Forensic Evidence',
    path: '/deepfake-xai',
    Icon: ScanFace,
  },
  {
    id: 'incident',
    label: 'Incident Crisis & FIR',
    sub: 'BNS 2023 & IT Act Dossiers',
    path: '/incident',
    Icon: AlertOctagon,
  },
  {
    id: 'academy',
    label: 'Cyber Range & CTF',
    sub: 'Mission Briefings & Hex Stream',
    path: '/academy',
    Icon: GraduationCap,
  },
  {
    id: 'intel',
    label: 'Threat Intelligence',
    sub: 'NCIIPC & CERT-In Feed',
    path: '/intel',
    Icon: Radar,
  },
  {
    id: 'exif',
    label: 'Forensics Lab',
    sub: 'EXIF Scrub & GPS Forensics',
    path: '/exif',
    Icon: Microscope,
  },
  {
    id: 'devsec',
    label: 'DevSecOps & Settings',
    sub: 'Code Audit & Privacy Check',
    path: '/devsec',
    Icon: Code2,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-16 bg-[#181B2A] border-r border-white/[0.06] flex flex-col items-center py-4 z-50 select-none justify-between"
      aria-label="Primary Navigation Rail"
    >
      {/* TOP: Brand Monogram Badge */}
      <div className="flex flex-col items-center gap-6 w-full">
        <Link
          href="/"
          className="group relative flex items-center justify-center"
          title="TRINETRA Sovereign Cyber Intelligence"
        >
          {/* Rounded Coral-Pink Square Badge with 'TR' Monogram */}
          <div className="w-10 h-10 rounded-xl bg-[#FF5A79] flex items-center justify-center font-bold text-white text-base shadow-md shadow-[#FF5A79]/30 transition-transform group-hover:scale-105 active:scale-95">
            TR
          </div>
          {/* Brand Hover Tooltip */}
          <div className="absolute left-16 ml-2 px-3 py-1.5 rounded-lg bg-[#262B40] border border-white/10 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 flex items-center gap-2">
            <span>TRINETRA</span>
            <span className="text-[10px] font-mono text-[#FF5A79] bg-[#FF5A79]/15 px-1.5 py-0.5 rounded">
              v2.4
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Icons Stack */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {RAIL_NAV.map(item => {
            const isActive =
              item.path === '/'
                ? pathname === '/'
                : pathname === item.path || pathname?.startsWith(item.path + '/')

            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <Link
                  href={item.path}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#FF5A79] text-white shadow-md shadow-[#FF5A79]/35 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  aria-label={item.label}
                >
                  <item.Icon size={19} className="shrink-0" />
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
      </div>

      {/* BOTTOM: System Status & User Node */}
      <div className="flex flex-col items-center gap-3 w-full px-2 pt-2 border-t border-white/[0.06]">
        {/* Live Operational Status Dot */}
        <div className="relative group flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#262B40] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="absolute left-16 ml-2 px-3 py-1.5 rounded-lg bg-[#262B40] border border-white/10 text-xs text-slate-200 whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
            <div className="font-semibold text-emerald-400">SOC Operational</div>
            <div className="text-[10px] text-slate-400">All Nodes Connected</div>
          </div>
        </div>

        {/* Node Identifier */}
        <div
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[11px] font-mono font-bold text-slate-400"
          title="Sovereign Node IN-DEL-01"
        >
          IN
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
