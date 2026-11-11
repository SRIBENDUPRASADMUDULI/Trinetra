'use client'
import React, { useState, useEffect } from 'react'
import { THREAT_FEED, type ThreatEvent } from '@/data/mock/threat-feed'
import { FAMILY_ENDPOINTS } from '@/data/mock/family-endpoints'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Pause, Play, RefreshCw, Radar, ChevronDown, ChevronUp } from 'lucide-react'
import { ThreatGlobe } from '@/components/three/ThreatGlobe'

const CASE_STUDIES = [
  {
    id: 'CS-001', codename: 'OP_SIDEWINDER', year: 2023, entity: 'Indian Defence & Aerospace',
    vector: 'Spear Phishing → LNK Dropper → Sidewinder RAT',
    ttps: ['T1566.001', 'T1547.001', 'T1071.001', 'T1041'],
    damage: 'Classified documents exfiltrated from 100+ targets',
    attribution: 'APT-C-17 (Pakistan-linked)',
    killChain: ['Recon (LinkedIn OSINT)', 'Spearphish (.docx attachment)', 'LNK dropper execution', 'Sidewinder RAT deployment', 'C2 beacon (HTTP/80)', 'Credential theft + exfil'],
  },
  {
    id: 'CS-002', codename: 'AIIMS_RANSOMWARE', year: 2022, entity: 'AIIMS Delhi — Patient DB',
    vector: 'Ransomware (LockBit variant) → 1.3TB data encrypted',
    ttps: ['T1486', 'T1490', 'T1078', 'T1112'],
    damage: '₹200 crore ransom demand. Critical patient services offline 15 days.',
    attribution: 'Unattributed (suspected PRC nexus)',
    killChain: ['VPN credential abuse', 'Domain controller compromise', 'Active Directory takeover', 'Shadow copy deletion', 'LockBit deployment', '1.3TB data encrypted'],
  },
  {
    id: 'CS-003', codename: 'COSMOS_BANK_HEIST', year: 2018, entity: 'Cosmos Co-operative Bank',
    vector: 'SWIFT MT103 tampering + ATM cashout',
    ttps: ['T1565.001', 'T1036', 'T1098', 'T1531'],
    damage: '₹94.42 crore stolen via fraudulent SWIFT messages + ATM cashouts',
    attribution: 'Lazarus Group (DPRK)',
    killChain: ['Bank network infiltration', 'Core banking malware install', 'SWIFT message manipulation', 'Coordinated global ATM cashout', 'Money mule network', 'Cryptocurrency laundering'],
  },
  {
    id: 'CS-004', codename: 'DRDO_PHISH', year: 2023, entity: 'DRDO (Defence Research)',
    vector: 'Transparent Tribe APT36 spearphishing',
    ttps: ['T1566.002', 'T1204.002', 'T1059.003'],
    damage: 'Crimson RAT deployed on 12 researcher endpoints. Classified data at risk.',
    attribution: 'APT36 / Transparent Tribe (Pakistan)',
    killChain: ['Target profiling (LinkedIn)', 'Weaponized .docx (Crimson RAT dropper)', 'Phishing email delivery', 'User execution', 'RAT C2 established', 'Data exfiltration'],
  },
  {
    id: 'CS-005', codename: 'MOBIKWIK_BREACH', year: 2021, entity: 'MobiKwik — Fintech',
    vector: 'Unsecured S3 bucket → 3.5M user data dump',
    ttps: ['T1530', 'T1567.002'],
    damage: '8.2TB data including KYC docs, Aadhaar, PAN, credit cards on dark web',
    attribution: 'Unknown (data broker?)',
    killChain: ['Misconfigured AWS S3 discovery', 'Unauthenticated data access', 'Mass scraping of 3.5M records', 'Dark web marketplace listing', 'Identity fraud downstream'],
  },
]

type SectorFilter = 'ALL' | 'CRITICAL' | 'FINANCE' | 'POWER' | 'TELECOM' | 'GOVT' | 'HEALTHCARE'

export default function IntelPage() {
  const [feedItems, setFeedItems] = useState<ThreatEvent[]>(THREAT_FEED.slice(0, 10))
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState<SectorFilter>('ALL')
  // Pre-expand CS-001 by default so kill-chain, attribution, and TTPs are visible on load
  const [expandedCase, setExpandedCase] = useState<string | null>('CS-001')
  const [scanningAll, setScanningAll] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const next = THREAT_FEED[Math.floor(Math.random() * THREAT_FEED.length)]
      setFeedItems(prev => [next, ...prev.slice(0, 14)])
    }, 4000)
    return () => clearInterval(id)
  }, [paused])

  const filteredFeed = filter === 'ALL' ? feedItems
    : filter === 'CRITICAL' ? feedItems.filter(e => e.severity === 'CRITICAL')
    : feedItems.filter(e => e.sector === filter)

  async function scanAll() {
    setScanningAll(true)
    setScanProgress(0)
    for (let i = 0; i <= 100; i += 14) {
      await new Promise(r => setTimeout(r, 180))
      setScanProgress(Math.min(i, 100))
    }
    setScanningAll(false)
  }

  const sevColor = (s: string) => ({ CRITICAL: '#f43f5e', HIGH: '#f59e0b', MEDIUM: '#94a3b8', LOW: '#10b981' })[s] ?? '#94a3b8'
  const riskColor = (r: string) => ({ CRITICAL: '#f43f5e', HIGH: '#f59e0b', MEDIUM: '#f59e0b', LOW: '#10b981' })[r] ?? '#94a3b8'
  const patchColor = (p: string) => ({ UP_TO_DATE: '#10b981', OUTDATED: '#f59e0b', CRITICAL: '#f43f5e' })[p] ?? '#94a3b8'

  return (
    <div className="space-y-6">
      {/* Symmetrical Behance-style Header Banner */}
      <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[11px] font-bold flex items-center gap-1.5">
              <Radar size={12} style={{ animation: 'spin 3s linear infinite' }} />
              07 // THREAT INTEL RADAR
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-300">ATT&amp;CK · SECTOR DEFENSE · IOC MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Threat Intelligence Radar &amp; Sector Hardening
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Real-time attack telemetry across Indian sovereign sectors, declassified APT intrusion archives with full kill-chain reconstruction, and endpoint hygiene matrix.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RADAR ACTIVE</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>DEFCON 3</span>
          </div>
        </div>
      </div>

      {/* 3D Geospatial Threat Globe + Live Feed Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-5">
          <ThreatGlobe />
        </div>
        <div className="xl:col-span-7">
      <TerminalCard title="Live Sector Attack Telemetry Feed"
        label="[LIVE_FEED]" labelColor="red" noPadding
        headerRight={
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-slate-400">
              BUFFER: <strong className="text-white">{THREAT_FEED.length}</strong> EVENTS
            </span>
            <button
              onClick={() => setPaused(p => !p)}
              className="flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              {paused ? <><Play size={11} className="text-emerald-400 mr-1" /> RESUME</> : <><Pause size={11} className="text-amber-400 mr-1" /> PAUSE</>}
            </button>
          </div>
        }>
        {/* Filter bar */}
        <div className="flex gap-2 flex-wrap px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/60">
          {(['ALL', 'CRITICAL', 'FINANCE', 'POWER', 'TELECOM', 'GOVT', 'HEALTHCARE'] as SectorFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-mono text-xs px-3 py-1 rounded-lg transition-all"
              style={{
                border: `1px solid ${filter === f ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === f ? '#ffffff' : '#94a3b8',
                backgroundColor: filter === f ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="divide-y divide-slate-800/40" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {filteredFeed.map((evt, i) => (
            <div key={`${evt.id}-${i}`} className="flex flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-slate-900/40 transition-colors text-xs font-mono">
              <span className="text-slate-400 w-20 flex-shrink-0">{evt.timestamp.slice(11, 19)}Z</span>
              <span className="font-bold flex-shrink-0" style={{ color: sevColor(evt.severity) }}>[{evt.severity.slice(0, 4)}]</span>
              <span className="flex-shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold"
                style={{ color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
                {evt.sector}
              </span>
              <span className="text-slate-200 flex-1 truncate font-sans text-xs">{evt.attackType}</span>
              <StatusBadge label={evt.status} variant={evt.status === 'ACTIVE' ? 'critical' : evt.status === 'INVESTIGATING' ? 'warning' : 'ok'} />
            </div>
          ))}
        </div>
      </TerminalCard>

        </div>
      </div>

      {/* Case Studies */}
      <TerminalCard title="Declassified Intrusion Case Archives (MITRE ATT&CK Mapped)" label="[DECLASS_ARCHIVE]" labelColor="amber" noPadding>
        <div className="divide-y divide-slate-800/60">
          {CASE_STUDIES.map(cs => {
            const isExpanded = expandedCase === cs.id
            return (
              <div key={cs.id}>
                <div
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-900/50 transition-colors"
                  onClick={() => setExpandedCase(isExpanded ? null : cs.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-slate-400">{cs.id}</span>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {cs.codename}
                    </span>
                    <span className="text-xs text-slate-400">{cs.year} · <strong className="text-white">{cs.entity}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {cs.ttps.slice(0, 2).map(t => (
                      <span key={t} className="font-mono text-xs px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/30 bg-cyan-950/30 hidden sm:inline">{t}</span>
                    ))}
                    <div className="p-1 rounded bg-slate-800/60 text-slate-400">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 py-4 space-y-4 bg-slate-950/80 border-t border-slate-800/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                        <span className="text-slate-400 font-mono block text-[11px] mb-1">INFECTION VECTOR:</span>
                        <span className="text-slate-200 font-medium">{cs.vector}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                        <span className="text-slate-400 font-mono block text-[11px] mb-1">ATTRIBUTION:</span>
                        <span className="text-amber-300 font-bold">{cs.attribution}</span>
                      </div>
                      <div className="col-span-1 md:col-span-2 p-3 rounded-xl bg-rose-950/20 border border-rose-900/40">
                        <span className="text-rose-400 font-mono block text-[11px] mb-1">DAMAGE &amp; IMPACT:</span>
                        <span className="text-rose-200 font-medium">{cs.damage}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-slate-400 mb-2.5 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        RECONSTRUCTED KILL CHAIN:
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {cs.killChain.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="font-mono text-xs px-3 py-1.5 rounded-lg text-emerald-300 border border-emerald-500/30 bg-emerald-950/20 shadow-sm">
                              {idx + 1}. {step}
                            </span>
                            {idx < cs.killChain.length - 1 && <span className="text-slate-600 font-mono text-xs">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </TerminalCard>

      {/* Family Endpoint Guard Matrix */}
      <TerminalCard
        title="Family & Enterprise Endpoint Guard Matrix"
        label="[POSTURE_SCAN]"
        labelColor="cyan"
        noPadding
        headerRight={
          <button
            onClick={scanAll}
            disabled={scanningAll}
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} className={scanningAll ? 'animate-spin' : ''} />
            <span>{scanningAll ? `AUDITING ${scanProgress}%` : 'AUDIT ALL ENDPOINTS'}</span>
          </button>
        }
      >
        {scanningAll && (
          <div className="mx-4 my-2 h-1.5 rounded-full overflow-hidden bg-slate-800">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200" style={{ width: `${scanProgress}%` }} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40">
                {['DEVICE IDENTIFIER', 'OPERATING SYSTEM', 'PATCH STATUS', '2FA', 'ANTIVIRUS', 'RISK INDEX', 'POSTURE'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 tracking-wider text-[11px] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {FAMILY_ENDPOINTS.map(ep => (
                <tr key={ep.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 text-white font-semibold">{ep.name}</td>
                  <td className="px-4 py-3 text-slate-300 font-sans text-xs">{ep.os} {ep.osVersion}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-xs px-2 py-0.5 rounded" style={{ color: patchColor(ep.patchStatus) }}>
                      [{ep.patchStatus.replace('_', ' ')}]
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-xs" style={{ color: ep.twoFactorEnabled ? '#10b981' : '#f43f5e' }}>
                      {ep.twoFactorEnabled ? '✓ ON' : '✗ OFF'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-xs" style={{ color: ep.antivirusActive ? '#10b981' : '#f43f5e' }}>
                      {ep.antivirusActive ? '✓ ACTIVE' : '✗ OFF'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-800">
                        <div className="h-full rounded-full" style={{ width: `${ep.riskScore}%`, backgroundColor: riskColor(ep.riskLevel) }} />
                      </div>
                      <span className="font-bold" style={{ color: riskColor(ep.riskLevel) }}>{ep.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={ep.riskLevel}
                      variant={ep.riskLevel === 'CRITICAL' ? 'critical' : ep.riskLevel === 'HIGH' ? 'warning' : ep.riskLevel === 'MEDIUM' ? 'warning' : 'ok'}
                      blink={ep.riskLevel === 'CRITICAL'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TerminalCard>
    </div>
  )
}
