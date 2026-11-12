'use client'
import React, { useState, useEffect } from 'react'
// Live threat feed populated from /api/intel/connectors (CISA KEV + Abuse.ch Feodo / MISP)
import { FAMILY_ENDPOINTS } from '@/data/mock/family-endpoints'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { InfoExplain } from '@/components/ui/InfoExplain'
import { Pause, Play, RefreshCw, Radar, ChevronDown, ChevronUp, Search, Server, Shield } from 'lucide-react'
import type { ConnectorIoc, DomainOsintResult, LiveThreatFeedItem, OpsHealthSnapshot } from '@/app/api/intel/connectors/route'
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
  const [feedItems, setFeedItems] = useState<LiveThreatFeedItem[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [filter, setFilter] = useState<SectorFilter>('ALL')
  // Pre-expand CS-001 by default so kill-chain, attribution, and TTPs are visible on load
  const [expandedCase, setExpandedCase] = useState<string | null>('CS-001')
  const [scanningAll, setScanningAll] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [connectorData, setConnectorData] = useState<{
    connectors: { misp: string; netdata: string; spiderfoot: string }
    intelSource: string
    iocs: ConnectorIoc[]
    ops: OpsHealthSnapshot | null
  } | null>(null)
  const [osintDomain, setOsintDomain] = useState('sbi.co.in')
  const [osintLoading, setOsintLoading] = useState(false)
  const [osintResult, setOsintResult] = useState<DomainOsintResult | null>(null)
  const [osintError, setOsintError] = useState<string | null>(null)

  const loadConnectors = async () => {
    setFeedLoading(true)
    try {
      const r = await fetch('/api/intel/connectors', { cache: 'no-store' })
      if (!r.ok) return
      const d = await r.json()
      if (d?.success) {
        setConnectorData({
          connectors: d.connectors,
          intelSource: d.intelSource,
          iocs: d.iocs ?? [],
          ops: d.ops ?? null,
        })
        if (Array.isArray(d.liveFeed)) {
          setFeedItems(d.liveFeed)
        }
      }
    } catch {
      // Ignore transient network errors
    } finally {
      setFeedLoading(false)
    }
  }

  useEffect(() => {
    loadConnectors()
  }, [])

  async function runDomainOsint() {
    if (!osintDomain.trim()) return
    setOsintLoading(true)
    setOsintError(null)
    try {
      const res = await fetch('/api/intel/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: osintDomain.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'OSINT lookup failed')
      }
      setOsintResult(data.osint)
    } catch (err: unknown) {
      setOsintError(err instanceof Error ? err.message : 'OSINT lookup failed')
    } finally {
      setOsintLoading(false)
    }
  }


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
      <div className="p-6 rounded-xl bg-white border border-[#E0DDD5] shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F2F1EC] border border-[#E0DDD5] text-[#1E2420] text-xs font-semibold flex items-center gap-1.5">
              <Radar size={12} style={{ animation: 'spin 3s linear infinite' }} />
              Latest Threat Alerts
            </span>
            <span className="text-[#5C645E] text-xs">•</span>
            <span className="text-[11px] font-mono text-[#444B46]">Live Indian cyber alerts & sector watch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C201D] tracking-tight">
            Threat Intelligence Radar &amp; Latest Indian Scam Alerts
          </h1>
          <p className="text-xs sm:text-sm text-[#444B46] leading-relaxed font-normal">
            Real-time attack telemetry across Indian sovereign sectors, declassified APT intrusion archives with full kill-chain reconstruction, and endpoint hygiene matrix.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
          <div className="px-4 py-2 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Feed Active</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-[#F2F1EC] border border-[#E0DDD5] text-[#1E2420] text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Alert Status: Elevated</span>
          </div>
          <InfoExplain
            title="Latest Threats"
            whatIsIt="Shows current scam trends, banking fraud warnings, and security advisories affecting users in India."
            whoShouldUse="Anyone who wants to know what new online frauds to watch out for."
            whatResultMeans="High Risk / Advisory items indicate active scams where you should be extra careful with links or OTPs."
          />
          <div className="hidden">
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
        label="Live Feed" labelColor="red" noPadding
        headerRight={
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-[#5C645E]">
              LIVE: <strong className="text-[#1C201D]">{feedItems.length}</strong> EVENTS
            </span>
            <button
              onClick={loadConnectors} disabled={feedLoading}
              className="flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-100 text-[#444B46] transition-colors"
            >
              <RefreshCw size={11} className={feedLoading ? 'animate-spin' : ''} /> <span>{feedLoading ? 'SYNCING' : 'REFRESH'}</span>
            </button>
          </div>
        }>
        {/* Filter bar */}
        <div className="flex gap-2 flex-wrap px-4 py-2.5 bg-slate-50 border-b border-[#E0DDD5]">
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
            <div key={`${evt.id}-${i}`} className="flex flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-slate-100 transition-colors text-xs font-mono">
              <span className="text-[#5C645E] w-20 flex-shrink-0">{evt.timestamp.slice(11, 19)}Z</span>
              <span className="font-bold flex-shrink-0" style={{ color: sevColor(evt.severity) }}>[{evt.severity.slice(0, 4)}]</span>
              <span className="flex-shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold"
                style={{ color: '#34D399', border: '1px solid rgba(56,189,248,0.3)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
                {evt.sector}
              </span>
              <span className="text-[#1C201D] flex-1 truncate font-sans text-xs">{evt.attackType}</span>
              <StatusBadge label={evt.status} variant={evt.status === 'ACTIVE' ? 'critical' : evt.status === 'INVESTIGATING' ? 'warning' : 'ok'} />
            </div>
          ))}
        </div>
      </TerminalCard>

        </div>
      </div>

      {/* God's Eye Connectors: MISP/Abuse.ch IOCs, Netdata/Ops Health & Domain OSINT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <TerminalCard
            title="Live IOC Feed & Infrastructure Connectors (MISP · Abuse.ch · Netdata)"
            label={connectorData?.connectors.misp === 'CONFIGURED' ? 'MISP Live' : 'Public IOCs'}
            labelColor="green"
            noPadding
          >
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-[#444B46]">
                  Source: <strong className="text-[#1C201D]">{connectorData?.intelSource ?? 'Syncing...'}</strong>
                </span>
                {connectorData?.ops && (
                  <span className="px-2.5 py-1 rounded bg-[#F2F1EC] border border-[#E0DDD5] text-[#1E2420] flex items-center gap-1.5">
                    <Server size={12} className="text-[#059669]" />
                    {connectorData.ops.source}: {connectorData.ops.ramUsedMb} MB RSS
                    {typeof connectorData.ops.cpuPercent === 'number' ? ` · CPU ${connectorData.ops.cpuPercent}%` : ''}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded border border-[#E0DDD5] bg-[#F2F1EC] text-[#1E2420]">
                  MISP: {connectorData?.connectors.misp ?? 'CHECKING'}
                </span>
                <span className="px-2 py-0.5 rounded border border-[#E0DDD5] bg-[#F2F1EC] text-[#1E2420]">
                  Netdata: {connectorData?.connectors.netdata ?? 'CHECKING'}
                </span>
                <span className="px-2 py-0.5 rounded border border-[#E0DDD5] bg-[#F2F1EC] text-[#1E2420]">
                  SpiderFoot / DoH+RDAP: {connectorData?.connectors.spiderfoot ?? 'CHECKING'}
                </span>
              </div>

              <div className="divide-y divide-[#E5E7EB] border border-[#E0DDD5] rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                {connectorData && connectorData.iocs.length > 0 ? (
                  connectorData.iocs.map((ioc) => (
                    <div key={ioc.id} className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="font-semibold text-[#DC2626]">{ioc.value}</span>
                      <span className="text-[#444B46]">{ioc.category}</span>
                      <span className="text-[11px] text-[#5C645E]">{ioc.firstSeen ?? ioc.type}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-xs text-[#5C645E]">Loading live threat indicators...</div>
                )}
              </div>
            </div>
          </TerminalCard>
        </div>

        <div className="lg:col-span-5">
          <TerminalCard
            title="Live Domain OSINT Enricher (DNS + RDAP)"
            label="SpiderFoot / DoH"
            labelColor="cyan"
            noPadding
          >
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={osintDomain}
                  onChange={(e) => setOsintDomain(e.target.value)}
                  placeholder="Enter suspicious domain (e.g. sbi-kyc-update.top)"
                  className="flex-1 px-3 py-2 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] text-xs font-mono text-[#1E2420] focus:outline-none focus:border-[#059669]"
                />
                <button
                  type="button"
                  onClick={runDomainOsint}
                  disabled={osintLoading}
                  className="px-3.5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Search size={13} />
                  {osintLoading ? 'Checking...' : 'Enrich'}
                </button>
              </div>

              {osintError && (
                <div className="text-xs text-[#DC2626] font-mono">{osintError}</div>
              )}

              {osintResult ? (
                <div className="space-y-2 text-xs font-mono bg-[#F2F1EC] border border-[#E0DDD5] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1E2420] flex items-center gap-1.5">
                      <Shield size={13} className="text-[#059669]" />
                      {osintResult.domain}
                    </span>
                    <span className="text-[11px] text-[#5C645E]">
                      {osintResult.createdAt ? `Reg: ${osintResult.createdAt}` : 'RDAP Checked'}
                    </span>
                  </div>
                  <div className="text-[#444B46]">
                    Registrar: <strong className="text-[#1E2420]">{osintResult.registrar ?? 'Not disclosed / Privacy'}</strong>
                  </div>
                  <div className="text-[#444B46]">
                    A Records: <strong className="text-[#1E2420]">{osintResult.aRecords.length ? osintResult.aRecords.join(', ') : 'None'}</strong>
                  </div>
                  <div className="text-[#444B46] truncate">
                    MX: <strong className="text-[#1E2420]">{osintResult.mxRecords.length ? osintResult.mxRecords.join(', ') : 'None'}</strong>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#5C645E]">
                  Query live DNS (A, MX, TXT) and RDAP registrar/creation-date metadata for any suspicious domain.
                </div>
              )}
            </div>
          </TerminalCard>
        </div>
      </div>

      {/* Case Studies */}
      <TerminalCard title="Declassified Intrusion Case Archives (MITRE ATT&CK Mapped)" label="Case History" labelColor="amber" noPadding>
        <div className="divide-y divide-slate-800/60">
          {CASE_STUDIES.map(cs => {
            const isExpanded = expandedCase === cs.id
            return (
              <div key={cs.id}>
                <div
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setExpandedCase(isExpanded ? null : cs.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-[#5C645E]">{cs.id}</span>
                    <span className="font-mono text-xs font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                      {cs.codename}
                    </span>
                    <span className="text-xs text-[#5C645E]">{cs.year} · <strong className="text-[#1C201D]">{cs.entity}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {cs.ttps.slice(0, 2).map(t => (
                      <span key={t} className="font-mono text-xs px-2 py-0.5 rounded text-[#059669] border border-[#A7F3D0] bg-[#F2F1EC] hidden sm:inline">{t}</span>
                    ))}
                    <div className="p-1 rounded bg-slate-100 text-[#5C645E]">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 py-4 space-y-4 bg-slate-50 border-t border-[#E0DDD5]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-100 border border-[#E0DDD5]">
                        <span className="text-[#5C645E] font-mono block text-[11px] mb-1">INFECTION VECTOR:</span>
                        <span className="text-[#1C201D] font-medium">{cs.vector}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 border border-[#E0DDD5]">
                        <span className="text-[#5C645E] font-mono block text-[11px] mb-1">ATTRIBUTION:</span>
                        <span className="text-amber-700 font-bold">{cs.attribution}</span>
                      </div>
                      <div className="col-span-1 md:col-span-2 p-3 rounded-xl bg-rose-50 border border-[#E0DDD5]">
                        <span className="text-[#DC2626] font-mono block text-[11px] mb-1">DAMAGE &amp; IMPACT:</span>
                        <span className="text-[#991B1B] font-medium">{cs.damage}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-[#5C645E] mb-2.5 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        RECONSTRUCTED KILL CHAIN:
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {cs.killChain.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="font-mono text-xs px-3 py-1.5 rounded-lg text-emerald-700 border border-[#A7F3D0] bg-emerald-50 shadow-sm">
                              {idx + 1}. {step}
                            </span>
                            {idx < cs.killChain.length - 1 && <span className="text-[#5C645E] font-mono text-xs">→</span>}
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
        label="Device Health"
        labelColor="cyan"
        noPadding
        headerRight={
          <button
            onClick={scanAll}
            disabled={scanningAll}
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-lg border border-[#A7F3D0] bg-[#F2F1EC] text-[#047857] hover:bg-[#F2F1EC] transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} className={scanningAll ? 'animate-spin' : ''} />
            <span>{scanningAll ? `AUDITING ${scanProgress}%` : 'AUDIT ALL ENDPOINTS'}</span>
          </button>
        }
      >
        {scanningAll && (
          <div className="mx-4 my-2 h-1.5 rounded-full overflow-hidden bg-slate-100">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200" style={{ width: `${scanProgress}%` }} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[#E0DDD5] bg-slate-50">
                {['DEVICE IDENTIFIER', 'OPERATING SYSTEM', 'PATCH STATUS', '2FA', 'ANTIVIRUS', 'RISK INDEX', 'POSTURE'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#5C645E] tracking-wider text-[11px] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {FAMILY_ENDPOINTS.map(ep => (
                <tr key={ep.id} className="hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3 text-[#1C201D] font-semibold">{ep.name}</td>
                  <td className="px-4 py-3 text-[#444B46] font-sans text-xs">{ep.os} {ep.osVersion}</td>
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
                      <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-100">
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