'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { THREAT_FEED, type ThreatEvent } from '@/data/mock/threat-feed'
import {
  Shield,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Zap,
  Radio,
  Eye,
  Server,
  Terminal,
  Cpu,
  ChevronRight,
  Lock,
  Plus,
  Scale,
  CheckCircle2,
  ScanFace,
  Code2,
  GraduationCap,
  Microscope,
  MessageSquare,
  Video,
  KeyRound,
  AlertOctagon,
} from 'lucide-react'

// NCIIPC 6 Designated Critical Information Infrastructure (CII) Sectors
interface NCIIPCSector {
  id: string
  name: string
  sub: string
  status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL'
  latency: number
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
    activeVector: 'Air-Gapped Telemetry Verification Pass',
    health: 98,
    ttp: 'T1190',
  },
]

function SeverityChip({ s }: { s: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: 'bg-[#FF5A79]/15', text: 'text-[#FF5A79]' },
    HIGH:     { bg: 'bg-amber-500/15', text: 'text-amber-300' },
    MEDIUM:   { bg: 'bg-sky-500/15', text: 'text-sky-300' },
    LOW:      { bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
  }
  const m = map[s] ?? map.LOW
  return (
    <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-md ${m.bg} ${m.text}`}>
      {s}
    </span>
  )
}

export default function CommandCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSector, setFilterSector] = useState('ALL')

  const filteredFeed = THREAT_FEED.filter(evt => {
    const matchesSearch =
      evt.targetAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.sector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterSector === 'ALL' || evt.sector.toUpperCase().includes(filterSector)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 overflow-hidden">
      {/* ============================================================ */}
      {/* 1. TOP HERO ROW: 3 SIGNATURE PASTEL HIGHLIGHT CARDS          */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Sage Mint */}
        <div className="rounded-2xl p-6 bg-[#CBE8BA] text-[#1E2235] shadow-lg shadow-black/15 flex flex-col justify-between min-h-[190px] transition-transform hover:-translate-y-0.5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E2235]/70 font-sans">
                National Cyber Defense Posture
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1E2235]/10 text-[#1E2235]">
                DEFCON 3
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E2235] font-sans mb-1">
              94.8% Operational
            </h2>
            <p className="text-xs text-[#1E2235]/80 font-medium">
              NCIIPC 6 Critical Infrastructure Sectors · Real-time sync active
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-[11px] font-bold text-[#1E2235]/80">
              <span>National Grid Health</span>
              <span>94.8%</span>
            </div>
            {/* Emerald Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#1E2235]/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2E7D32] transition-all duration-500"
                style={{ width: '94.8%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Warm Peach / Coral */}
        <div className="rounded-2xl p-6 bg-[#F3C19D] text-[#1E2235] shadow-lg shadow-black/15 flex flex-col justify-between min-h-[190px] transition-transform hover:-translate-y-0.5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E2235]/70 font-sans">
                Statutory FIR Synthesis
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1E2235]/10 text-[#1E2235]">
                BNS 2023 · BSA §63
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E2235] font-sans mb-1">
              1,248 Legal Dossiers
            </h2>
            <p className="text-xs text-[#1E2235]/80 font-medium">
              Average synthesis latency: 3.8s · Automated 1930 Portal formatting
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-[11px] font-bold text-[#1E2235]/80">
              <span>Triage Resolution Velocity</span>
              <span>86.4%</span>
            </div>
            {/* Coral/Orange Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#1E2235]/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#D84315] transition-all duration-500"
                style={{ width: '86.4%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Soft Sky Blue */}
        <div className="rounded-2xl p-6 bg-[#9ED5F0] text-[#1E2235] shadow-lg shadow-black/15 flex flex-col justify-between min-h-[190px] transition-transform hover:-translate-y-0.5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E2235]/70 font-sans">
                BharatCode Sovereign AI
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1E2235]/10 text-[#1E2235]">
                QWEN 3.8 27B
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E2235] font-sans mb-1">
              148ms Latency
            </h2>
            <p className="text-xs text-[#1E2235]/80 font-medium">
              Stateless (`store: false`) · Complete PII mask · Zero retention
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-[11px] font-bold text-[#1E2235]/80">
              <span>Failover Gateway Uptime</span>
              <span>99.8%</span>
            </div>
            {/* Royal Blue Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#1E2235]/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1565C0] transition-all duration-500"
                style={{ width: '99.8%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. MAIN EXECUTIVE DASHBOARD: 2-COLUMN STRUCTURE              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Critical Infrastructure & Threat Stream (2 Cols) */}
        <div className="xl:col-span-2 space-y-6 min-w-0">
          {/* NCIIPC 6 Critical Sectors Grid */}
          <div className="rounded-2xl bg-[#262B40] p-6 shadow-lg shadow-black/20 border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <Shield size={18} className="text-[#FF5A79]" />
                  <span>NCIIPC National Critical Infrastructure Grid</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Section 70 IT Act 2000 designated critical sectors telemetry
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 self-start sm:self-auto border border-white/[0.06]">
                CERT-In Connected
              </span>
            </div>

            {/* 6 Sectors Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NCIIPC_SECTORS.map(sec => {
                const isNominal = sec.status === 'NOMINAL'
                return (
                  <div
                    key={sec.id}
                    className="rounded-xl p-4 bg-[#1E2235] border border-white/[0.06] hover:border-white/15 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white font-sans truncate">
                          {sec.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isNominal
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {sec.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">
                        {sec.sub}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Health</span>
                        <span className="font-semibold text-white">{sec.health}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isNominal ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${sec.health}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Latency: {sec.latency}ms</span>
                        <span className="font-mono text-slate-400">{sec.ttp}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Real-Time CERT-In Threat Stream */}
          <div className="rounded-2xl bg-[#262B40] p-6 shadow-lg shadow-black/20 border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <Activity size={18} className="text-[#9ED5F0]" />
                  <span>Real-Time Incident Stream & Telemetry</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  12,042 Ingested Hashes · CERT-In Advisory Pipeline
                </p>
              </div>

              {/* Sector Quick Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'FINANCE', 'POWER', 'GOVT'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterSector(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      filterSector === s
                        ? 'bg-[#FF5A79] text-white shadow-sm'
                        : 'bg-[#1E2235] text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by target asset (e.g. SBI, UPI, AIIMS), attack vector, or IOC..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E2235] border border-white/[0.08] pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 rounded-xl outline-none focus:border-[#FF5A79] transition-colors"
              />
            </div>

            {/* Events List */}
            <div className="divide-y divide-white/[0.06] max-h-[340px] overflow-y-auto pr-1">
              {filteredFeed.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No threat events matching filter criteria.
                </div>
              ) : (
                filteredFeed.map((evt, idx) => (
                  <div
                    key={`${evt.id}-${idx}`}
                    className="py-3 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg px-2"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400">
                          {evt.timestamp.slice(11, 19)}Z
                        </span>
                        <SeverityChip s={evt.severity} />
                        <span className="text-[11px] font-semibold text-white truncate">
                          {evt.targetAsset}
                        </span>
                        <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/[0.04]">
                          {evt.sector}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {evt.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-300 bg-white/[0.04] px-2 py-1 rounded">
                        {evt.ttps[0]}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          evt.status === 'ACTIVE'
                            ? 'bg-[#FF5A79]/15 text-[#FF5A79]'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sovereign Radar & Quick Actions (1 Col) */}
        <div className="space-y-6 min-w-0">
          {/* Sovereign Threat Radar */}
          <div className="rounded-2xl bg-[#262B40] p-6 shadow-lg shadow-black/20 border border-white/[0.06] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Radio size={18} className="text-[#FF5A79]" />
                <span>Geospatial Threat Radar</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Radar Visual */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto my-2 flex items-center justify-center">
              {/* Radar Rings */}
              <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-8 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-16 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-24 rounded-full border border-white/[0.08]" />

              {/* Crosshairs */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.08]" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/[0.08]" />

              {/* Rotating Sweep Line */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(255, 90, 121, 0.4) 0deg, transparent 60deg)',
                    animation: 'spin 4s linear infinite',
                  }}
                />
              </div>

              {/* Radar Target Blips */}
              <div className="absolute top-1/4 left-1/3 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A79] animate-ping" />
                <span className="text-[9px] font-mono text-[#FF5A79] font-bold">APT-36</span>
              </div>
              <div className="absolute bottom-1/3 right-1/4 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[9px] font-mono text-amber-300">UPI-BOT</span>
              </div>
              <div className="absolute top-1/2 right-1/3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-mono text-emerald-300">SCADA</span>
              </div>

              {/* Center Bullseye */}
              <div className="w-3 h-3 rounded-full bg-white shadow-md z-10" />
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <span>Threat Vectors Detected</span>
              <span className="font-bold text-white">3 Active Locks</span>
            </div>
          </div>

          {/* Quick Legal & Defense Actions */}
          <div className="rounded-2xl bg-[#262B40] p-6 shadow-lg shadow-black/20 border border-white/[0.06] space-y-3">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2 mb-2">
              <Zap size={18} className="text-[#CBE8BA]" />
              <span>Emergency Defense Actions</span>
            </h3>

            <Link
              href="/incident"
              className="p-3.5 rounded-xl bg-[#1E2235] hover:bg-[#23283e] border border-white/[0.06] hover:border-[#FF5A79]/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF5A79]/15 flex items-center justify-center text-[#FF5A79]">
                  <Plus size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#FF5A79] transition-colors">
                    Draft Statutory FIR
                  </div>
                  <div className="text-[11px] text-slate-400">
                    BNS 2023 §316–§319 & IT Act 2000
                  </div>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/deepfake-xai"
              className="p-3.5 rounded-xl bg-[#1E2235] hover:bg-[#23283e] border border-white/[0.06] hover:border-[#9ED5F0]/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#9ED5F0]/15 flex items-center justify-center text-[#9ED5F0]">
                  <ScanFace size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#9ED5F0] transition-colors">
                    Verify Media Authenticity
                  </div>
                  <div className="text-[11px] text-slate-400">
                    CGFD, FADI & Grad-CAM Evidence
                  </div>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/mentor"
              className="p-3.5 rounded-xl bg-[#1E2235] hover:bg-[#23283e] border border-white/[0.06] hover:border-[#CBE8BA]/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#CBE8BA]/15 flex items-center justify-center text-[#CBE8BA]">
                  <Terminal size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#CBE8BA] transition-colors">
                    AI SecOps Copilot
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Engage BharatCode Qwen 3.8
                  </div>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ALL 12 SOVEREIGN DEFENSE MODULES (ZERO HORIZONTAL CLIPPING)*/}
      {/* ============================================================ */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              Operational Defense Engines (00 – 11)
            </h3>
            <p className="text-xs text-slate-400">
              Comprehensive cyber intelligence, digital forensics, and compliance array
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#262B40] text-slate-300 border border-white/[0.06]">
            12 Modules Armed
          </span>
        </div>

        {/* 12-Card Grid (Guaranteed No Horizontal Clipping) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[
            {
              href: '/incident',
              title: '04 // Incident Crisis',
              desc: 'Emergency FIR runbooks and court-ready BNS 2023 police dossiers with digital hash.',
              badge: 'CRISIS SOS',
              badgeColor: 'bg-[#FF5A79]/15 text-[#FF5A79]',
              Icon: AlertOctagon,
            },
            {
              href: '/deepfake-xai',
              title: '11 // Deepfake XAI',
              desc: 'CGFD, FADI, and Grad-CAM metrics with BharatCode statutory admissibility briefs.',
              badge: 'FORENSICS',
              badgeColor: 'bg-[#9ED5F0]/15 text-[#9ED5F0]',
              Icon: ScanFace,
            },
            {
              href: '/cyber-ir',
              title: '09 // Cyber-IR Engine',
              desc: 'Statutory FIR legal synthesis and SANS PICERL incident containment playbooks.',
              badge: 'LEGAL AI',
              badgeColor: 'bg-[#CBE8BA]/15 text-[#CBE8BA]',
              Icon: Scale,
            },
            {
              href: '/nlp',
              title: '08 // NLP Phishing Scan',
              desc: 'Detect phishing SMS lures, UPI scams, and calculate Shannon URL entropy.',
              badge: 'NLP INSPECT',
              badgeColor: 'bg-[#F3C19D]/15 text-[#F3C19D]',
              Icon: MessageSquare,
            },
            {
              href: '/mentor',
              title: '02 // AI SecOps Copilot',
              desc: 'Defensive cyber intelligence copilot powered by BharatCode stateless gateway.',
              badge: 'AI COPILOT',
              badgeColor: 'bg-indigo-400/15 text-indigo-300',
              Icon: Terminal,
            },
            {
              href: '/academy',
              title: '01 // Cyber Range',
              desc: 'Split-pane mission briefing, CTF challenges, and real-time packet hex inspection.',
              badge: 'TRAINING',
              badgeColor: 'bg-emerald-400/15 text-emerald-300',
              Icon: GraduationCap,
            },
            {
              href: '/exif',
              title: '05 // Forensics Lab',
              desc: 'Canvas EXIF metadata scrubbing, GPS extraction, and image tamper forensics.',
              badge: 'EXIF TOOLS',
              badgeColor: 'bg-sky-400/15 text-sky-300',
              Icon: Microscope,
            },
            {
              href: '/devsec',
              title: '03 // DevSecOps',
              desc: 'Automated code security vulnerability scanner and privacy leakage auditor.',
              badge: 'AUDIT',
              badgeColor: 'bg-violet-400/15 text-violet-300',
              Icon: Code2,
            },
            {
              href: '/video-gen',
              title: '10 // Video Studio',
              desc: 'Multi-scene incident video briefing generator with synchronized audio narration.',
              badge: 'STUDIO',
              badgeColor: 'bg-rose-400/15 text-rose-300',
              Icon: Video,
            },
            {
              href: '/intel',
              title: '07 // Threat Radar',
              desc: 'Critical infrastructure intelligence feeds, CVE trackers, and IOC lookup.',
              badge: 'INTEL',
              badgeColor: 'bg-amber-400/15 text-amber-300',
              Icon: Radio,
            },
            {
              href: '/breach',
              title: '06 // Sentinel Guard',
              desc: 'k-Anonymity identity leak audits and credential exposure intelligence.',
              badge: 'BREACH',
              badgeColor: 'bg-cyan-400/15 text-cyan-300',
              Icon: KeyRound,
            },
            {
              href: '/',
              title: '00 // Command Center',
              desc: 'High-density executive overview and real-time national security telemetry.',
              badge: 'CORE SOC',
              badgeColor: 'bg-white/10 text-white',
              Icon: Shield,
            },
          ].map(mod => (
            <Link
              key={mod.title}
              href={mod.href}
              className="rounded-2xl bg-[#262B40] p-5 border border-white/[0.06] hover:border-white/15 shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 flex flex-col justify-between min-w-0 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1E2235] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
                    <mod.Icon size={16} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#FF5A79] transition-colors mb-1 truncate">
                  {mod.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                <span>Launch Engine</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-[#FF5A79]" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
