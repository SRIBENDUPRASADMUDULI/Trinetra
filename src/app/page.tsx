'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { THREAT_FEED, SECTOR_THREAT_LEVELS, type ThreatEvent } from '@/data/mock/threat-feed'
import { CVE_FIXTURES } from '@/data/mock/cve-fixtures'
import { TerminalCard } from '@/components/ui/terminal-card'
import {
  AlertTriangle, Shield, Activity, Server,
  ChevronRight, ArrowUpRight, Search, Siren,
  PhoneCall, Sparkles, Lock, Eye, Cpu, Radio, ShieldCheck, CheckCircle2
} from 'lucide-react'

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

function SovereignQuantumShield() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none">
      {/* Soft Ethereal Indigo & Cyan Ambient Aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/15 via-sky-600/10 to-transparent blur-3xl opacity-80" />
      <div className="absolute w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl" />

      {/* SVG Concentric Radar Rings & Orbital Geometry */}
      <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 400 400" fill="none">
        <defs>
          <radialGradient id="sphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#1E1B4B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0A0E17" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbitalTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Orbital Ring 1 - Dashed */}
        <circle cx="200" cy="200" r="180" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="6 8" />

        {/* Outer Ring 2 - Hairline Solid */}
        <circle cx="200" cy="200" r="158" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

        {/* Rotating Orbital Segment */}
        <g className="orbit-slow-anim">
          <circle cx="200" cy="200" r="135" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="40 80 20 60" />
          <circle cx="335" cy="200" r="4" fill="#38BDF8" />
          <circle cx="65" cy="200" r="3" fill="#818CF8" />
        </g>

        {/* Reverse Orbital Segment */}
        <g className="orbit-reverse-anim">
          <circle cx="200" cy="200" r="112" stroke="rgba(129, 140, 248, 0.35)" strokeWidth="1.5" strokeDasharray="30 50 15 45" />
          <circle cx="200" cy="88" r="3.5" fill="#38BDF8" />
        </g>

        {/* Inner Solid Indigo Ring */}
        <circle cx="200" cy="200" r="88" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1.5" />

        {/* Central Luminous Sphere Core */}
        <circle cx="200" cy="200" r="68" fill="url(#sphereGrad)" />

        {/* Tactical Shield Geometries */}
        <path
          d="M 200 158 L 228 172 V 205 C 228 226 216 238 200 245 C 184 238 172 226 172 205 V 172 Z"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.5"
          fill="rgba(99, 102, 241, 0.15)"
          strokeLinejoin="round"
        />

        {/* Inner Shield Trinetra Third Eye Accents */}
        <path d="M 186 200 Q 200 188 214 200 Q 200 212 186 200 Z" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
        <circle cx="200" cy="200" r="3.5" fill="#FFFFFF" />

        {/* Clean geometric coordinate crosshairs */}
        <line x1="135" y1="200" x2="160" y2="200" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
        <line x1="240" y1="200" x2="265" y2="200" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
        <line x1="200" y1="135" x2="200" y2="150" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
        <line x1="200" y1="250" x2="200" y2="265" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
      </svg>

      {/* Orbiting Live Telemetry Badges */}
      <div className="absolute -top-2 right-4 px-3.5 py-1.5 rounded-full bg-[#0F1523]/90 border border-indigo-500/30 text-[10px] font-mono text-indigo-200 backdrop-blur-md shadow-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        <span>IR-TRIAGE // 120B ACTIVE</span>
      </div>

      <div className="absolute -bottom-2 left-4 px-3.5 py-1.5 rounded-full bg-[#0F1523]/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 backdrop-blur-md shadow-lg flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-emerald-400" />
        <span>BNS 2023 · VERIFIED</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [feed, setFeed] = useState<ThreatEvent[]>(THREAT_FEED.slice(0, 8))
  const [filterSector, setFilterSector] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [now, setNow] = useState('')

  useEffect(() => {
    setNow(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST')
    const id = setInterval(() => {
      setFeed(prev => {
        const next = THREAT_FEED[Math.floor(Math.random() * THREAT_FEED.length)]
        return [next, ...prev.slice(0, 9)]
      })
    }, 6000)
    return () => clearInterval(id)
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
    <div className="p-6 md:p-8 space-y-12 max-w-7xl mx-auto">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative pt-4 pb-8 overflow-hidden">
        {/* Soft Ambient Mesh Background */}
        <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium tracking-wide shadow-sm">
              <Sparkles size={13} className="text-indigo-400" />
              <span>Sovereign Cyber Intelligence & Threat Operations</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Protect Your Digital{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-teal-200 bg-clip-text text-transparent">
                Security Operations
              </span>
            </h1>

            {/* Descriptive Body */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Equipped with real-time critical infrastructure telemetry, automated Bharatiya Nyaya Sanhita (BNS) 2023 legal FIR dossiers, and ultra-fast incident response triage for Bharat.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/cyber-ir"
                className="px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-950/40 border border-indigo-400/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Launch Cyber-IR Engine</span>
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/incident"
                className="px-6 py-3.5 rounded-full text-sm font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] backdrop-blur-md transition-all hover:text-white flex items-center gap-2"
              >
                <Siren size={16} className="text-indigo-400" />
                <span>Report Incident (FIR)</span>
              </Link>
            </div>

            {/* Trust Badges / Agencies Ticker */}
            <div className="pt-6 border-t border-white/[0.08]">
              <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-3">
                INTEGRATED WITH SOVEREIGN FRAMEWORKS & AGENCIES
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> CERT-In
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" /> NCIIPC
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> NPCI UPI
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> I4C MHA
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-violet-400" /> BNS 2023
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sovereign Quantum Shield */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <SovereignQuantumShield />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. THREE FEATURE CARDS                                       */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold mb-1">
            DEFENSE ARCHITECTURE
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            From our roots in cybersecurity innovation to becoming a trusted guardian of safety
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
          {/* Card 1: Robust Protection */}
          <div className="p-6 rounded-2xl glass-card flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Lock size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                Robust Legal Protection
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Instant statutory mapping under the newly enacted Bharatiya Nyaya Sanhita (BNS) 2023 and IT Act 2000. Generates legally sound, court-ready FIR dossiers with PDF downloads.
              </p>
            </div>
            <Link
              href="/incident"
              className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300"
            >
              <span>Draft FIR Dossier</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Proactive Defense */}
          <div className="p-6 rounded-2xl glass-card flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Cpu size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                Proactive SOC Triage
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Sub-second 120B reasoning model identifies exact MITRE ATT&CK techniques (T1566, T1003) and drafts tactical SANS PICERL playbooks to contain ransomware and intrusion chains.
              </p>
            </div>
            <Link
              href="/cyber-ir"
              className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300"
            >
              <span>Generate Playbook</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: 24/7 Monitoring */}
          <div className="p-6 rounded-2xl glass-card flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Radio size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                24/7 National Monitoring
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Real-time threat feeds analyzing banking switches, state electricity load dispatch SCADA networks, and telecom SS7 routing against active global APT campaigns.
              </p>
            </div>
            <Link
              href="/intel"
              className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300"
            >
              <span>View Threat Stream</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. OPERATIONAL METRICS                                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Threats</p>
            <p className="text-3xl font-extrabold text-white mt-1">{activeCount}</p>
            <p className="text-[11px] text-rose-300 mt-1 font-mono">SEV 1 CRITICAL: {criticalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Sectors Watched</p>
            <p className="text-3xl font-extrabold text-white mt-1">8</p>
            <p className="text-[11px] text-emerald-300 mt-1 font-mono">ALL NOMINAL</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shield size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tracked CVEs</p>
            <p className="text-3xl font-extrabold text-white mt-1">{CVE_FIXTURES.length}</p>
            <p className="text-[11px] text-amber-300 mt-1 font-mono">9 ACTIVE ZERO-DAYS</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Activity size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">National Posture</p>
            <p className="text-3xl font-extrabold text-white mt-1">84 / 100</p>
            <p className="text-[11px] text-sky-300 mt-1 font-mono">DEFCON 3 STATUS</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Server size={20} />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN OPERATIONS GRID: LIVE FEED & SECTOR HEATMAP          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Live Threat Feed with Search & Filter */}
        <div className="xl:col-span-3">
          <TerminalCard
            title="Live Infrastructure Threat Stream"
            label="REAL-TIME"
            labelColor="cyan"
            noPadding
            headerRight={
              <span className="font-mono text-xs text-slate-400">
                {filteredFeed.length} Events
              </span>
            }
          >
            {/* Filter & Search Bar */}
            <div className="p-3.5 border-b border-white/[0.06] bg-white/[0.01] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by asset (e.g. SBI, UPI, AIIMS), attack type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.07] pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 rounded-full font-sans transition-colors"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'FINANCE', 'POWER', 'HEALTHCARE', 'GOVT'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterSector(s)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap font-medium ${
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

            {/* Events List */}
            <div className="divide-y divide-white/[0.05] max-h-[380px] overflow-y-auto text-xs">
              {filteredFeed.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No threat events match your search query.
                </div>
              ) : (
                filteredFeed.map((evt, i) => (
                  <div
                    key={`${evt.id}-${i}`}
                    className="p-3.5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">{evt.timestamp.slice(11, 19)}Z</span>
                        <SeverityPill s={evt.severity} />
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          {evt.sector}
                        </span>
                        <span className="text-slate-200 font-semibold truncate">{evt.targetAsset}</span>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-1">
                        {evt.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sky-300 font-mono text-[10px] bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                        {evt.ttps[0]}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-medium ${
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
            <div className="p-3.5 bg-white/[0.01] border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Telemetry Node: CERT-In Live Ingestion
              </span>
              <Link
                href="/intel"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Full Threat Radar</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </TerminalCard>
        </div>

        {/* Sector Threat Heatmap */}
        <div className="xl:col-span-2">
          <TerminalCard
            title="National Sector Heatmap"
            label="ELEVATED"
            labelColor="amber"
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Intrusion attempt velocity calculated across vital Indian infrastructure switches:
              </p>

              <div className="space-y-3.5">
                {Object.entries(SECTOR_THREAT_LEVELS).map(([sector, data]) => {
                  const color = data.level > 80 ? '#F43F5E' : data.level > 60 ? '#F59E0B' : '#10B981'
                  const statusLabel = data.level > 80 ? 'CRITICAL' : data.level > 60 ? 'ELEVATED' : 'NOMINAL'
                  return (
                    <div key={sector} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-200 font-medium">{sector}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">{statusLabel}</span>
                          <span className="font-mono font-bold text-xs" style={{ color }}>{data.level}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.06]">
                        <div
                          className="h-full transition-all duration-700 rounded-full"
                          style={{
                            width: `${data.level}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                <span>
                  <strong>Threshold Note:</strong> Percentages over 75% indicate automated botnet brute-forcing or weaponized phishing waves targeting public infrastructure.
                </span>
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. QUICK LAUNCH OPERATIONAL MODULES                          */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Explore Trinetra Operational Modules
          </h2>
          <span className="text-xs text-slate-500">11 Integrated Engines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: '/video-gen',
              title: '10 // VIDEO STUDIO',
              desc: 'Autonomous AI video briefings from uploaded PDFs, PPTX decks, and incident advisories.',
              color: '#6366F1',
              tag: 'STUDIO',
            },
            {
              href: '/cyber-ir',
              title: '09 // CYBER-IR ENGINE',
              desc: 'Dual-model AI engine for generating BNS 2023 legal FIR dossiers and SANS PICERL playbooks.',
              color: '#8B5CF6',
              tag: 'FEATURED AI',
            },
            {
              href: '/incident',
              title: '04 // INCIDENT & FIR',
              desc: 'Immediate emergency crisis response and 1-click legal cybercrime FIR PDF generation.',
              color: '#F43F5E',
              tag: 'EMERGENCY',
            },
            {
              href: '/nlp',
              title: '08 // NLP PHISHING SCAN',
              desc: 'Inspect fake SMS, UPI fraud alerts, and calculate URL Shannon entropy in real-time.',
              color: '#0EA5E9',
              tag: 'SCAM SCAN',
            },
            {
              href: '/breach',
              title: '06 // SENTINEL GUARD',
              desc: 'Safely check password exposure with zero-knowledge SHA-1 k-anonymity queries.',
              color: '#10B981',
              tag: 'PRIVACY',
            },
            {
              href: '/academy',
              title: '01 // ACADEMY & CTF',
              desc: 'Interactive tactical CTF terminal, packet dissection, and MITRE ATT&CK flashcards.',
              color: '#10B981',
              tag: 'TRAINING',
            },
            {
              href: '/mentor',
              title: '02 // AI TACTICAL MENTOR',
              desc: 'SecOps copilot for active attack mitigation and CERT-In advisory guidance.',
              color: '#6366F1',
              tag: 'COPILOT',
            },
            {
              href: '/devsec',
              title: '03 // DEVSEC & SAST',
              desc: 'Scan code for OWASP vulnerabilities and audit app terms for DPDP Act compliance.',
              color: '#F59E0B',
              tag: 'APP SEC',
            },
          ].map(m => (
            <Link
              key={m.href}
              href={m.href}
              className="p-5 rounded-2xl glass-card flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-xs font-semibold" style={{ color: m.color }}>
                    {m.title}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400">
                    {m.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                  {m.desc}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-indigo-400 transition-colors">
                <span>Launch Engine</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
