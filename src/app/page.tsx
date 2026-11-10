'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { THREAT_FEED, SECTOR_THREAT_LEVELS, type ThreatEvent } from '@/data/mock/threat-feed'
import { CVE_FIXTURES } from '@/data/mock/cve-fixtures'
import { TerminalCard } from '@/components/ui/terminal-card'
import {
  AlertTriangle, Shield, Activity, Server,
  ChevronRight, ArrowUpRight, Search, Siren,
  PhoneCall, Sparkles, Lock, Eye, Cpu, Radio, ShieldCheck,
  CheckCircle2, Zap, Globe, Radar, Terminal, RefreshCw
} from 'lucide-react'

// NCIIPC Designated 6 Critical Information Infrastructure (CII) Sectors
interface NCIIPCSector {
  id: string
  name: string
  sub: string
  status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL'
  latency: number
  jitter: string
  activeVector: string
  health: number
  ttp: string
}

const NCIIPC_SECTORS: NCIIPCSector[] = [
  {
    id: 'power',
    name: 'Power & Energy',
    sub: 'National Load Despatch (NLDC) · SCADA 400kV',
    status: 'NOMINAL',
    latency: 18,
    jitter: '0.02ms',
    activeVector: 'IEC 60870-5-104 Telemetry Sync',
    health: 96,
    ttp: 'T1059.001',
  },
  {
    id: 'bfsi',
    name: 'Banking & Finance (BFSI)',
    sub: 'NPCI UPI Switch · RBI RTGS & NEFT Core',
    status: 'ELEVATED',
    latency: 24,
    jitter: '0.14ms',
    activeVector: 'Automated Credential Stuffing on API VPA',
    health: 82,
    ttp: 'T1110.004',
  },
  {
    id: 'telecom',
    name: 'Telecom & Satellite',
    sub: 'SS7 / Diameter Core · Subsea Cable Landings',
    status: 'NOMINAL',
    latency: 14,
    jitter: '0.01ms',
    activeVector: 'GTP-C Tunneling Filter Active',
    health: 94,
    ttp: 'T1557.001',
  },
  {
    id: 'transport',
    name: 'Transport & Aviation',
    sub: 'Airports Authority ATC · Railways UTS / CRIS',
    status: 'NOMINAL',
    latency: 29,
    jitter: '0.05ms',
    activeVector: 'Signaling Microsegmentation Nominal',
    health: 91,
    ttp: 'T1071.001',
  },
  {
    id: 'government',
    name: 'Govt & Public Services',
    sub: 'UIDAI Aadhaar Auth · DigiLocker · NIC Cloud',
    status: 'ELEVATED',
    latency: 38,
    jitter: '0.22ms',
    activeVector: 'DDoS Scrapes on e-Governance Gateways',
    health: 79,
    ttp: 'T1498.001',
  },
  {
    id: 'strategic',
    name: 'Strategic & Healthcare',
    sub: 'AIIMS Health Network · Atomic Energy Grid',
    status: 'NOMINAL',
    latency: 21,
    jitter: '0.03ms',
    activeVector: 'Air-Gapped Telemetry Verification Pass',
    health: 98,
    ttp: 'T1190',
  },
]

function SeverityPill({ s }: { s: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    CRITICAL: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
    HIGH:     { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
    MEDIUM:   { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/20' },
    LOW:      { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
  }
  const m = map[s] ?? map.LOW
  return (
    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${m.bg} ${m.text} ${m.border}`}>
      {s}
    </span>
  )
}

function InteractiveQuantumRadar() {
  const [lockedTarget, setLockedTarget] = useState<string | null>('APT-36 (RedFox)')

  return (
    <div className="relative w-full aspect-square max-w-[380px] mx-auto flex items-center justify-center select-none font-mono">
      {/* Background Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/15 via-cyan-600/10 to-transparent blur-3xl opacity-75" />
      <div className="absolute w-52 h-52 rounded-full bg-indigo-500/10 blur-xl" />

      {/* SVG Radar Surface */}
      <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 360 360" fill="none">
        <defs>
          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0A0E17" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Range Rings */}
        <circle cx="180" cy="180" r="160" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="180" cy="180" r="120" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
        <circle cx="180" cy="180" r="80" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1" strokeDasharray="6 8" />
        <circle cx="180" cy="180" r="40" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1" />

        {/* Crosshair Grids */}
        <line x1="20" y1="180" x2="340" y2="180" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
        <line x1="180" y1="20" x2="180" y2="340" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

        {/* Rotating Radar Sweep Cone */}
        <g className="orbit-slow-anim">
          <path
            d="M 180 180 L 180 20 A 160 160 0 0 1 330 130 Z"
            fill="url(#radarSweep)"
            opacity="0.45"
          />
          <line x1="180" y1="180" x2="330" y2="130" stroke="#38BDF8" strokeWidth="1.5" />
        </g>

        {/* Target Blips */}
        <g className="cursor-pointer" onClick={() => setLockedTarget('APT-36 (RedFox)')}>
          <circle cx="235" cy="110" r="4" fill="#F43F5E" className="animate-ping" opacity="0.6" />
          <circle cx="235" cy="110" r="3.5" fill="#F43F5E" />
          <text x="245" y="114" fill="#FDA4AF" fontSize="9" fontFamily="monospace">APT-36 [SCADA]</text>
        </g>

        <g className="cursor-pointer" onClick={() => setLockedTarget('Mirai Botnet Wave')}>
          <circle cx="115" cy="240" r="3" fill="#F59E0B" />
          <text x="70" y="255" fill="#FCD34D" fontSize="9" fontFamily="monospace">BOTNET: 12k IP</text>
        </g>

        <g className="cursor-pointer" onClick={() => setLockedTarget('LockBit 3.0 Node')}>
          <circle cx="260" cy="220" r="3" fill="#0EA5E9" />
          <text x="268" y="224" fill="#7DD3FC" fontSize="9" fontFamily="monospace">C2 BEACON</text>
        </g>

        {/* Radar Center Eye Hub */}
        <circle cx="180" cy="180" r="14" fill="#0F1523" stroke="#6366F1" strokeWidth="1.5" />
        <path d="M 172 180 Q 180 172 188 180 Q 180 188 172 180 Z" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
        <circle cx="180" cy="180" r="2.5" fill="#FFFFFF" />
      </svg>

      {/* Real-Time Radar HUD Overlay */}
      <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-[#0A0E17]/90 border border-white/[0.08] text-[9px] text-slate-400">
        SCAN: 360° · AZ: 042°
      </div>

      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-[#0A0E17]/90 border border-indigo-500/30 text-[9px] text-indigo-300">
        TARGET: {lockedTarget}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [feed, setFeed] = useState<ThreatEvent[]>(THREAT_FEED.slice(0, 8))
  const [filterSector, setFilterSector] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [utcTime, setUtcTime] = useState('')
  const [istTime, setIstTime] = useState('')

  useEffect(() => {
    function updateClocks() {
      const d = new Date()
      setUtcTime(d.toISOString().slice(11, 19) + ' UTC')
      setIstTime(d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST')
    }
    updateClocks()
    const clockId = setInterval(updateClocks, 1000)

    const feedId = setInterval(() => {
      setFeed(prev => {
        const next = THREAT_FEED[Math.floor(Math.random() * THREAT_FEED.length)]
        return [next, ...prev.slice(0, 9)]
      })
    }, 5000)

    return () => {
      clearInterval(clockId)
      clearInterval(feedId)
    }
  }, [])

  const criticalCount = THREAT_FEED.filter(e => e.severity === 'CRITICAL').length
  const activeCount   = THREAT_FEED.filter(e => e.status === 'ACTIVE').length

  const filteredFeed = feed.filter(evt => {
    const matchesSector = filterSector === 'ALL' || evt.sector === filterSector
    const matchesSearch = !searchQuery || 
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.targetAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.attackType.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSector && matchesSearch
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* ============================================================ */}
      {/* 1. HIGH-DENSITY SOVEREIGN SOC CONTROL HUD                    */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1523]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Designation & Status */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold">
              00 // SOVEREIGN CYBER SOC CONSOLE
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              NCIIPC SEC. 70 IT ACT · CERT-IN 6-HR MANDATE · BNS 2023
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
              National Cyber Defense Operations Center
            </h1>
          </div>
        </div>

        {/* Real-time Telemetry Indicators */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Synchronized Clocks */}
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-2 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">{istTime || '12:00:00 IST'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{utcTime || '06:30:00 UTC'}</span>
          </div>

          {/* DEFCON Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>DEFCON 3 · ELEVATED</span>
          </div>

          {/* National Posture Score */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1.5 font-semibold">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>POSTURE: 84/100</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SPLIT WORKBENCH: NCIIPC 6-SECTOR GRID + QUANTUM RADAR     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: NCIIPC 6-Sector Critical Infrastructure Grid (7 Cols) */}
        <div className="xl:col-span-7">
          <TerminalCard
            title="NCIIPC Critical Information Infrastructure (CII) Status Grid"
            label="SEC 70 IT ACT"
            labelColor="cyan"
            headerRight={
              <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                6 National Sectors Monitored
              </span>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {NCIIPC_SECTORS.map(sec => {
                const isNominal = sec.status === 'NOMINAL'
                return (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                          {sec.name}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isNominal
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse'
                        }`}>
                          {sec.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                        {sec.sub}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>LATENCY: <strong className="text-white">{sec.latency}ms</strong></span>
                        <span>JITTER: <strong className="text-slate-300">{sec.jitter}</strong></span>
                        <span className="text-indigo-300 font-bold">{sec.health}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${sec.health}%`,
                            backgroundColor: isNominal ? '#10B981' : '#F59E0B',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                        <span className="truncate max-w-[180px]">{sec.activeVector}</span>
                        <span className="text-cyan-400 font-semibold">{sec.ttp}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TerminalCard>
        </div>

        {/* Right: Interactive Sovereign Quantum Radar & SOC Triage (5 Cols) */}
        <div className="xl:col-span-5">
          <TerminalCard
            title="Interactive Sovereign Quantum Radar"
            label="REAL-TIME AIR-SPACE"
            labelColor="purple"
            headerRight={
              <span className="text-[10px] font-mono text-indigo-300 flex items-center gap-1">
                <Radar size={12} className="animate-spin text-indigo-400" />
                <span>360° LIVE SWEEP</span>
              </span>
            }
          >
            <div className="space-y-4">
              <InteractiveQuantumRadar />

              {/* Triage Quick Triggers Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <Link
                  href="/cyber-ir"
                  className="p-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 text-center font-semibold transition-all hover:scale-[1.01]"
                >
                  [DISPATCH PLAYBOOK]
                </Link>
                <Link
                  href="/incident"
                  className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-center font-semibold transition-all hover:scale-[1.01]"
                >
                  [GENERATE BNS FIR]
                </Link>
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. LIVE INFRASTRUCTURE THREAT STREAM & ATTACK TTP MATRIX    */}
      {/* ============================================================ */}
      <TerminalCard
        title="Live Threat Telemetry & Attack TTP Ingestion"
        label="CERT-IN FEED"
        labelColor="cyan"
        noPadding
        headerRight={
          <span className="font-mono text-xs text-slate-400">
            {filteredFeed.length} Events Ingested
          </span>
        }
      >
        {/* Search & Sector Filters */}
        <div className="p-3.5 border-b border-white/[0.06] bg-white/[0.01] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by target asset (e.g. SBI, UPI, AIIMS), attack type, IOC..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.07] pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 rounded-lg font-mono transition-colors"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
            {['ALL', 'FINANCE', 'POWER', 'HEALTHCARE', 'GOVT'].map(s => (
              <button
                key={s}
                onClick={() => setFilterSector(s)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium text-[11px] ${
                  filterSector === s
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Threat Events Table */}
        <div className="divide-y divide-white/[0.05] max-h-[320px] overflow-y-auto text-xs font-mono">
          {filteredFeed.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No threat events match your search query.
            </div>
          ) : (
            filteredFeed.map((evt, i) => (
              <div
                key={`${evt.id}-${i}`}
                className="p-3 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{evt.timestamp.slice(11, 19)}Z</span>
                    <SeverityPill s={evt.severity} />
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {evt.sector}
                    </span>
                    <span className="text-white font-semibold font-sans truncate">{evt.targetAsset}</span>
                  </div>
                  <p className="text-slate-400 text-xs font-sans line-clamp-1">
                    {evt.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sky-300 text-[10px] bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                    {evt.ttps[0]}
                  </span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-medium ${
                    evt.status === 'ACTIVE'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                  }`}>
                    {evt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white/[0.01] border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
          <span className="text-slate-500">
            Ingestion Pipeline: CERT-In Advisory Stream · 12,042 Event Hash Index
          </span>
          <Link
            href="/intel"
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors font-sans font-semibold text-xs"
          >
            <span>Full Threat Radar</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </TerminalCard>

      {/* ============================================================ */}
      {/* 4. TACTICAL OPERATIONAL MODULES ARRAY (ALL 12 MODULES)       */}
      {/* ============================================================ */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-slate-300">
            Sovereign Defense Modules (00 – 11)
          </h2>
          <span className="text-[11px] font-mono text-slate-500">12 Engines Online</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              href: '/cyber-ir',
              title: '09 // CYBER-IR ENGINE',
              desc: 'Dual-model AI engine for BNS 2023 legal FIR dossiers and SANS PICERL playbooks.',
              tag: 'FEATURED AI',
              color: '#818CF8',
            },
            {
              href: '/deepfake-xai',
              title: '11 // DEEPFAKE XAI',
              desc: 'CGFD, FADI, and Grad-CAM faithfulness metrics with BharatCode legal explainers.',
              tag: 'XAI FORENSICS',
              color: '#38BDF8',
            },
            {
              href: '/video-gen',
              title: '10 // VIDEO STUDIO',
              desc: 'Autonomous multi-scene video briefing scripts from incident reports and PDF dossiers.',
              tag: 'STUDIO',
              color: '#A78BFA',
            },
            {
              href: '/incident',
              title: '04 // INCIDENT CRISIS',
              desc: 'Emergency response runbooks and court-ready BNS 2023 FIR PDF generation.',
              tag: 'CRISIS SOS',
              color: '#FB7185',
            },
            {
              href: '/academy',
              title: '01 // CYBER RANGE',
              desc: 'Split-pane briefing terminal, CTF challenge shell, and packet hex dump inspection.',
              tag: 'CTF RANGE',
              color: '#34D399',
            },
            {
              href: '/mentor',
              title: '02 // AI TACTICAL MENTOR',
              desc: 'SecOps defense copilot for active attack mitigation and CERT-In compliance.',
              tag: 'AI COPILOT',
              color: '#818CF8',
            },
            {
              href: '/exif',
              title: '05 // FORENSICS LAB',
              desc: 'Canvas EXIF metadata scrubbing, GPS extraction, and image tamper forensics.',
              tag: 'METADATA',
              color: '#38BDF8',
            },
            {
              href: '/nlp',
              title: '08 // NLP PHISHING SCAN',
              desc: 'Detect phishing SMS lures, UPI scams, and calculate Shannon URL entropy.',
              tag: 'NLP INSPECT',
              color: '#FBBF24',
            },
          ].map(m => (
            <Link
              key={m.href}
              href={m.href}
              className="p-4 rounded-xl bg-[#0F1523]/80 hover:bg-[#141C2E] border border-white/[0.07] hover:border-indigo-500/40 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold" style={{ color: m.color }}>
                    {m.title}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {m.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                  {m.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                <span>Launch Engine</span>
                <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
