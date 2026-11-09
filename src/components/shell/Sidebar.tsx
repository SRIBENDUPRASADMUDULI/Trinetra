'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap, Terminal, Code2, AlertOctagon,
  Microscope, KeyRound, Radar, MessageSquare, Shield,
  Home, Eye, Activity, PhoneCall, Video
} from 'lucide-react'

const NAV = [
  { idx: '00', label: 'Command Center', sub: 'Threat posture & metrics', path: '/',         Icon: Home },
  { idx: '01', label: 'Cyber Range',    sub: 'Tactical CTF challenges',   path: '/academy',  Icon: GraduationCap },
  { idx: '02', label: 'AI Mentor',      sub: 'SecOps defense copilot',   path: '/mentor',   Icon: Terminal },
  { idx: '03', label: 'DevSecOps',      sub: 'Code & privacy auditor',   path: '/devsec',   Icon: Code2 },
  { idx: '04', label: 'Incident Crisis',sub: 'Emergency FIR runbooks',   path: '/incident', Icon: AlertOctagon },
  { idx: '05', label: 'Forensics Lab',  sub: 'EXIF metadata & GPS',       path: '/exif',     Icon: Microscope },
  { idx: '06', label: 'Sentinel Guard', sub: 'k-Anonymity leak audits',  path: '/breach',   Icon: KeyRound },
  { idx: '07', label: 'Threat Radar',   sub: 'Critical infra feeds',      path: '/intel',    Icon: Radar },
  { idx: '08', label: 'NLP Inspector',  sub: 'Phishing & entropy scan',   path: '/nlp',      Icon: MessageSquare },
  { idx: '09', label: 'Cyber-IR Engine',sub: 'BNS 2023 FIR & playbooks',  path: '/cyber-ir', Icon: Shield },
  { idx: '10', label: 'Video Studio',   sub: 'PPT/PDF to Briefing Vault', path: '/video-gen', Icon: Video },
]

function formatUptime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
}

export function Sidebar() {
  const pathname = usePathname()
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const start = Math.floor(Math.random() * 172800)
    setUptime(start)
    const id = setInterval(() => setUptime(u => u + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 flex flex-col z-50 select-none bg-[#0A0E17]/95 backdrop-blur-2xl border-r border-white/[0.07]"
    >
      {/* Brand Logo Header */}
      <Link href="/" className="p-3 pt-3 pb-2 block group">
        <div className="flex items-center gap-2.5">
          {/* Sovereign Trinetra Shield Emblem */}
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500/20 via-slate-800/60 to-indigo-950/40 border border-indigo-500/30 shadow-md shadow-indigo-950/30 group-hover:border-indigo-400/60 transition-all">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-indigo-500/20 to-transparent blur-sm" />
            <Eye
              size={16}
              className="text-indigo-300 relative z-10 transition-transform group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-[0.14em] text-white font-sans">
                TRINETRA
              </span>
            </div>
            <div className="text-[9px] uppercase font-mono tracking-[0.18em] text-indigo-300/80 font-medium">
              Sovereign Cyber SOC
            </div>
          </div>
        </div>
      </Link>

      {/* Node Status Pill Bar */}
      <div className="mx-3 mb-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Activity size={11} className="text-indigo-400" />
          NODE_01
        </span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium text-[9px] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Nominal
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto py-1">
        {NAV.map(({ idx, label, sub, path, Icon }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <Link
              key={path}
              href={path}
              className={`group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                active
                  ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent text-white border border-indigo-500/30 shadow-sm shadow-indigo-950/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  active
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-400 group-hover:text-indigo-300 group-hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between leading-tight">
                  <span className={`text-xs tracking-tight ${active ? 'text-white font-bold' : 'text-slate-300 font-medium'}`}>
                    {label}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 px-1 py-0.2 rounded bg-white/[0.04]">
                    {idx}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight">
                  {sub}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Quick Status & Helpline Footer */}
      <div className="p-2 mx-3 mb-2 rounded-lg bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-md">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span className="font-mono text-slate-400 text-[9px]">UPTIME</span>
          <span className="text-emerald-400 font-mono font-medium">{formatUptime(uptime)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
          <span className="font-mono text-slate-400 text-[9px]">THREAT LEVEL</span>
          <span className="text-amber-300 font-mono text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/10 border border-amber-500/20">
            DEFCON 3
          </span>
        </div>
        <a
          href="tel:1930"
          className="pt-1.5 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-[10px] text-slate-300 hover:text-indigo-300 transition-colors"
        >
          <PhoneCall size={11} className="text-indigo-400" />
          <span>Cyber Helpline: <strong className="text-indigo-300 font-mono">1930</strong></span>
        </a>
      </div>
    </aside>
  )
}

export default Sidebar
