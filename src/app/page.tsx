'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldAlert, PhoneCall, Clock, ArrowRight, Search, Cpu,
  FileText, Terminal, Wrench, Camera, Lock, Radar, MailWarning,
  BookOpen, Video, BrainCircuit, GraduationCap, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { BharatCodeShowcase } from '@/components/shell/BharatCodeShowcase'
import { ThreatGlobe } from '@/components/three/ThreatGlobe'
import { Card3D, type Card3DAccent } from '@/components/three/Card3D'
import { useLang } from '@/lib/i18n-context'

interface DefconLevel {
  level: 1 | 2 | 3 | 4 | 5
  code: string
  enLabel: string
  hiLabel: string
  basis: string
  directive: string
  badgeBg: string
  textColor: string
}

const DEFCON_LEVELS: DefconLevel[] = [
  {
    level: 1,
    code: 'LEVEL 1 // CRITICAL EMERGENCY',
    enLabel: 'National Cyber Emergency',
    hiLabel: 'राष्ट्रीय साइबर आपातकाल',
    basis: 'IT Act §69 / §70A Emergency Response',
    directive: 'Immediate isolation of CII SCADA/ICS nodes; mandatory CERT-In war-room escalation within 60 mins.',
    badgeBg: 'bg-[#FF1B1B]/20 border-[#FF1B1B]',
    textColor: 'text-[#FF1B1B]',
  },
  {
    level: 2,
    code: 'LEVEL 2 // HIGH ALERT',
    enLabel: 'Targeted Infrastructure Threat',
    hiLabel: 'लक्षित अवसंरचना खतरा',
    basis: 'CERT-In §70B(6) Active Advisory',
    directive: 'Suspend non-essential third-party API bridges; enforce hardware MFA across BFSI and NIC endpoints.',
    badgeBg: 'bg-[#FF1B1B]/15 border-[#FF1B1B]/70',
    textColor: 'text-[#FF1B1B]',
  },
  {
    level: 3,
    code: 'LEVEL 3 // ELEVATED WATCH',
    enLabel: 'Active Phishing & Fraud Campaigns',
    hiLabel: 'सक्रिय फ़िशिंग और धोखाधड़ी निगरानी',
    basis: 'NCIIPC Standing Watch · BNS §318',
    directive: 'Monitor UPI/KYC typosquatting domains, enforce 6-hour incident logging, and validate BSA §63 hashes.',
    badgeBg: 'bg-[#FF9F1C]/15 border-[#FF9F1C]/70',
    textColor: 'text-[#FF9F1C]',
  },
  {
    level: 4,
    code: 'LEVEL 4 // GUARDED',
    enLabel: 'Standard Perimeter Patrol',
    hiLabel: 'मानक परिधि सुरक्षा',
    basis: 'IT Rules 2021 · Routine Audit',
    directive: 'Continuous IOC sweep, DevSecOps SAST checks, and daily log retention compliance (180-day mandate).',
    badgeBg: 'bg-[#00D4FF]/15 border-[#00D4FF]/60',
    textColor: 'text-[#00D4FF]',
  },
  {
    level: 5,
    code: 'LEVEL 5 // BASELINE',
    enLabel: 'Nominal Readiness',
    hiLabel: 'सामान्य परिचालन स्थिति',
    basis: 'Standard Operations · Routine Hygiene',
    directive: 'Scheduled Cyber Range drills, patch verification, and cryptographic signature hygiene checks.',
    badgeBg: 'bg-[#00FF9D]/15 border-[#00FF9D]/60',
    textColor: 'text-[#00FF9D]',
  },
]

interface SectorHealthRow {
  sector: string
  asset: string
  status: 'NOMINAL' | 'ADVISORY'
  rttMs: number
  ttp: string
}

const NCIIPC_SECTORS: SectorHealthRow[] = [
  {
    sector: 'Banking, Financial Services & UPI (BFSI)',
    asset: 'NPCI Payment Switch / Core Banking Gateways',
    status: 'ADVISORY',
    rttMs: 18,
    ttp: 'T1566.002 (KYC Spearphishing Link)',
  },
  {
    sector: 'Power & Energy Grids (RLDC / POSOCO)',
    asset: 'Substation SCADA & Regional Load Dispatch',
    status: 'NOMINAL',
    rttMs: 24,
    ttp: 'T0886 (Remote ICS Monitoring)',
  },
  {
    sector: 'Telecom & Public Internet Exchange',
    asset: 'NIXI Core Routers & Telecom KYC Registers',
    status: 'NOMINAL',
    rttMs: 14,
    ttp: 'T1078 (SIM-Swap Credential Abuse)',
  },
  {
    sector: 'Transport, Railways & Aviation',
    asset: 'CRIS Reservation Bus & ATC Telemetry',
    status: 'NOMINAL',
    rttMs: 29,
    ttp: 'T1190 (Public-Facing App Audit)',
  },
  {
    sector: 'Government & NICnet Infrastructure',
    asset: 'Parichay SSO & e-Governance Portals',
    status: 'ADVISORY',
    rttMs: 21,
    ttp: 'T1583.001 (Typosquat `.gov` Spoofs)',
  },
  {
    sector: 'Defence & Strategic Enterprises',
    asset: 'Air-Gapped Document Exchange Nodes',
    status: 'NOMINAL',
    rttMs: 11,
    ttp: 'T1204 (Synthetic Media / Deepfake Bait)',
  },
]

const CERT_IN_BULLETINS = [
  {
    id: 'CIAD-2026-014',
    severity: 'HIGH',
    category: 'BFSI / UPI Fraud',
    title: 'Surge in APK-based RTO e-Challan and SBI KYC suspension SMS phishing lures.',
    statute: 'BNS 2023 §318(4) · IT Act §66D',
  },
  {
    id: 'CIAD-2026-011',
    severity: 'CRITICAL',
    category: 'Synthetic Identity',
    title: 'Face-swap deepfake impersonation targeting video KYC (V-CIP) onboarding portals.',
    statute: 'IT Act §66C · BSA 2023 §63',
  },
  {
    id: 'CIAD-2026-009',
    severity: 'MEDIUM',
    category: 'Log Compliance',
    title: 'Reminder: 180-day India-jurisdiction ICT log retention & 6-hour incident notification.',
    statute: 'CERT-In Direction §70B(6)',
  },
  {
    id: 'CIAD-2026-005',
    severity: 'HIGH',
    category: 'Cloud / DevSecOps',
    title: 'Exposed `.env` and API credentials observed across public citizen-service repositories.',
    statute: 'DPDP Act 2023 §8(5)',
  },
]

const DEPARTMENTS: Array<{
  code: string
  name: string
  hiName: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  accent: Card3DAccent
  desc: string
}> = [
  { code: '01', name: 'Cyber Range', hiName: 'साइबर रेंज', href: '/academy', icon: Terminal, accent: 'blue', desc: 'Sandboxed attack-defense drills and red/blue packet exercises.' },
  { code: '02', name: 'AI SecOps Copilot', hiName: 'एआई सेकऑप्स सहपायलट', href: '/mentor', icon: BrainCircuit, accent: 'cyan', desc: 'Stateless BharatCode reasoning assistant for Indian cyber statutes.' },
  { code: '03', name: 'DevSecOps Audit', hiName: 'डेवसेकऑप्स ऑडिट', href: '/devsec', icon: Wrench, accent: 'saffron', desc: 'Static secret detection, OWASP hardening, and AI remediation.' },
  { code: '04', name: 'Incident Response & FIR', hiName: 'घटना प्रतिक्रिया एवं एफआईआर', href: '/incident', icon: FileText, accent: 'red', desc: 'BNS 2023 / IT Act FIR synthesis with 6-hour CERT-In SLA timer.' },
  { code: '05', name: 'Digital Forensics Lab', hiName: 'डिजिटल फोरेंसिक लैब', href: '/exif', icon: Camera, accent: 'blue', desc: 'Client-side EXIF extraction, entropy measurement, and SHA-256 hashing.' },
  { code: '06', name: 'Sentinel Guard', hiName: 'सेंटिनल गार्ड', href: '/breach', icon: Lock, accent: 'cyan', desc: 'Zero-leak credential k-anonymity & password entropy diagnostics.' },
  { code: '07', name: '3D Threat Radar', hiName: '3D थ्रेट रडार', href: '/intel', icon: Radar, accent: 'red', desc: 'Interactive 3D globe, IOC taxonomy, and MITRE ATT&CK kill-chains.' },
  { code: '08', name: 'Phishing & Link Inspector', hiName: 'फ़िशिंग और लिंक निरीक्षक', href: '/nlp', icon: MailWarning, accent: 'saffron', desc: 'Live BharatCode SMS analysis, Levenshtein spoofing, and BSA §63 export.' },
  { code: '09', name: 'Cyber-IR Playbooks', hiName: 'साइबर-आईआर प्लेबुक', href: '/cyber-ir', icon: BookOpen, accent: 'blue', desc: 'SANS PICERL incident containment SOPs aligned with CERT-In rules.' },
  { code: '10', name: 'Media Briefing Studio', hiName: 'मीडिया ब्रीफिंग स्टूडियो', href: '/video-gen', icon: Video, accent: 'saffron', desc: 'Citizen awareness script & briefing generation pipeline.' },
  { code: '11', name: 'Deepfake Forensics', hiName: 'डीपफेक फोरेंसिक लैब', href: '/deepfake-xai', icon: ShieldAlert, accent: 'red', desc: 'Grad-CAM spatial attribution, facial zone scoring & CGFD benchmarks.' },
  { code: '12', name: 'Research & Citations', hiName: 'अनुसंधान एवं संदर्भ', href: '/research', icon: GraduationCap, accent: 'cyan', desc: 'Academic citations, statutory references, and validation methodology.' },
]

export default function CommandCenterPage() {
  const { t } = useLang()
  const [defcon, setDefcon] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [sectorFilter, setSectorFilter] = useState<'ALL' | 'NOMINAL' | 'ADVISORY'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [telemetry, setTelemetry] = useState<{
    status: string
    activeModel: string
    latencyMs: number
    totalCalls: number
  } | null>(null)

  useEffect(() => {
    fetch('/api/telemetry')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.telemetry) {
          setTelemetry(d.telemetry)
        }
      })
      .catch(() => {})
  }, [])

  const activeDefcon = DEFCON_LEVELS.find((d) => d.level === defcon) || DEFCON_LEVELS[2]

  const filteredSectors = NCIIPC_SECTORS.filter((row) => {
    const matchesStatus = sectorFilter === 'ALL' || row.status === sectorFilter
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q || row.sector.toLowerCase().includes(q) || row.asset.toLowerCase().includes(q) || row.ttp.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Hero Grid: Cinematic SOC Command + 3D Threat Globe */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-7 rounded-xl bg-[#0A0A12]/92 border border-[#1A1A2E] backdrop-blur-md p-6 flex flex-col justify-between gap-6 shadow-[0_0_28px_rgba(255,27,27,0.08)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#FF1B1B]/15 border border-[#FF1B1B]/45 text-[10px] font-mono font-bold text-[#FF1B1B] uppercase tracking-wider">
                {t('00 // NATIONAL SOC COMMAND', '00 // राष्ट्रीय सुरक्षा संचालन केंद्र')}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/35 text-[10px] font-mono font-semibold text-[#00D4FF]">
                IT Act 2000 §70A · BNS 2023 · BSA 2023 §63
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] font-serif tracking-tight">
              {t(
                'TRINETRA National Cyber Defense & 3D Forensics Console',
                'त्रिनेत्र राष्ट्रीय साइबर रक्षा एवं 3D फोरेंसिक कंसोल'
              )}
            </h1>
            <p className="text-sm text-[#888888] leading-relaxed">
              {t(
                'Stateless BharatCode multi-model triage, phishing link inspection, cryptographic evidence hashing, and statutory FIR drafting backed by real-time 3D geospatial threat visualization.',
                'स्टेटलेस भारतकोड मल्टी-मॉडल विश्लेषण, फ़िशिंग जांच, क्रिप्टोग्राफिक हैशिंग और इंटरैक्टिव 3D थ्रेट विज़ुअलाइज़ेशन।'
              )}
            </p>

            {/* Primary Actions + 1930 Emergency Banner */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/incident"
                className="px-4 py-2.5 rounded-lg bg-[#FF1B1B] hover:bg-[#e01414] text-[#F5F5F5] text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,27,27,0.35)]"
              >
                <FileText className="w-3.5 h-3.5" />
                {t('File Statutory FIR', 'वैधानिक एफआईआर दर्ज करें')}
              </Link>
              <Link
                href="/nlp"
                className="px-4 py-2.5 rounded-lg bg-[#00D4FF] hover:bg-[#00b8de] text-[#03030A] text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)]"
              >
                {t('Inspect Phishing Link', 'फ़िशिंग स्कैन')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="tel:1930"
                className="px-3.5 py-2 rounded-lg bg-[#03030A] border border-[#FF9F1C]/45 text-[#FF9F1C] font-mono text-xs font-bold flex items-center gap-2 hover:bg-[#FF9F1C]/10 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                1930 Helpline
              </a>
            </div>
          </div>

          {/* Interactive DEF CON 1-5 Strip + Real Telemetry */}
          <div className="pt-4 border-t border-[#1A1A2E] space-y-4">
            <div className="p-3.5 rounded-lg bg-[#03030A] border border-[#1A1A2E] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] font-semibold">
                  {t('Readiness Posture (IT Act §70)', 'तत्परता स्तर (IT Act §70)')}
                </span>
                <div className="flex items-center gap-1">
                  {DEFCON_LEVELS.map((d) => (
                    <button
                      key={d.level}
                      onClick={() => setDefcon(d.level)}
                      className={`w-7 h-7 rounded font-mono text-xs font-bold border transition-colors cursor-pointer ${
                        defcon === d.level
                          ? `${d.badgeBg} ${d.textColor}`
                          : 'bg-[#0A0A12] border-[#1A1A2E] text-[#888888] hover:text-[#F5F5F5]'
                      }`}
                      title={d.enLabel}
                    >
                      {d.level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`font-mono text-xs font-bold ${activeDefcon.textColor}`}>
                  {activeDefcon.code} — {t(activeDefcon.enLabel, activeDefcon.hiLabel)}
                </span>
                <span className="text-[10px] font-mono text-[#666666]">{activeDefcon.basis}</span>
              </div>
              <p className="text-xs text-[#888888] leading-relaxed">{activeDefcon.directive}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card3D accent="blue" className="p-3.5 bg-[#03030A]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
                  <span>AI GATEWAY</span>
                  <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" />
                </div>
                <div className="text-sm font-mono font-bold text-[#F5F5F5] mt-1.5">
                  {telemetry ? telemetry.status.toUpperCase() : 'CHECKING'}
                </div>
                <div className="text-[11px] font-mono text-[#00FF9D] mt-0.5 truncate">
                  {telemetry && telemetry.totalCalls > 0
                    ? `${telemetry.totalCalls} calls · ${telemetry.latencyMs}ms`
                    : 'Awaiting live calls'}
                </div>
              </Card3D>

              <Card3D accent="saffron" className="p-3.5 bg-[#03030A]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
                  <span>CERT-IN SLA</span>
                  <Clock className="w-3.5 h-3.5 text-[#FF9F1C]" />
                </div>
                <div className="text-sm font-mono font-bold text-[#FF9F1C] mt-1.5">06 HOURS</div>
                <div className="text-[11px] font-mono text-[#888888] mt-0.5">IT Act §70B(6)</div>
              </Card3D>

              <Card3D accent="cyan" className="p-3.5 bg-[#03030A]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
                  <span>CRYPTO CORE</span>
                  <Lock className="w-3.5 h-3.5 text-[#00FF9D]" />
                </div>
                <div className="text-sm font-mono font-bold text-[#00FF9D] mt-1.5">SHA-256</div>
                <div className="text-[11px] font-mono text-[#888888] mt-0.5">BSA 2023 §63 Cert</div>
              </Card3D>
            </div>
          </div>
        </div>

        {/* Hero Right Panel: Interactive 3D Threat Globe */}
        <div className="xl:col-span-5 flex flex-col justify-between">
          <ThreatGlobe />
        </div>
      </section>

      {/* BharatCode AI Harness Architecture Section */}
      <BharatCodeShowcase />

      {/* NCIIPC Critical Infrastructure Health Table & CERT-In Bulletins */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <TerminalCard
            title={t('NCIIPC Critical Information Infrastructure Sectors', 'एनसीआईआईपीसी महत्वपूर्ण सूचना अवसंरचना क्षेत्र')}
            label="IT Act §70A Schedule"
            labelColor="cyan"
            noPadding
            headerRight={
              <div className="flex items-center gap-1.5">
                {(['ALL', 'NOMINAL', 'ADVISORY'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSectorFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-colors cursor-pointer ${
                      sectorFilter === f
                        ? 'bg-[#00D4FF] text-[#03030A] border-[#00D4FF]'
                        : 'bg-[#03030A] text-[#888888] border-[#1A1A2E] hover:text-[#F5F5F5]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            }
          >
            <div className="px-5 py-3 border-b border-[#1A1A2E] bg-[#03030A]/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Filter sectors, protected assets, or MITRE TTP...', 'सेक्टर, परिसंपत्ति या MITRE TTP खोजें...')}
                  className="w-full bg-[#03030A] border border-[#1A1A2E] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#03030A]/85 border-b border-[#1A1A2E] text-[10px] font-mono uppercase text-[#888888]">
                    <th className="py-2.5 px-4">Critical Sector</th>
                    <th className="py-2.5 px-4">Posture</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">RTT</th>
                    <th className="py-2.5 px-4 hidden md:table-cell">Watchlist TTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A2E]">
                  {filteredSectors.map((row) => (
                    <tr key={row.sector} className="hover:bg-[#121222] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#F5F5F5]">{row.sector}</div>
                        <div className="text-[11px] text-[#888888]">{row.asset}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {row.status === 'NOMINAL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/35 text-[#00FF9D] font-mono text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> NOMINAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF9F1C]/10 border border-[#FF9F1C]/40 text-[#FF9F1C] font-mono text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> ADVISORY
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#00FF9D] hidden sm:table-cell whitespace-nowrap">
                        {row.rttMs} ms
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#888888] hidden md:table-cell">
                        {row.ttp}
                      </td>
                    </tr>
                  ))}
                  {filteredSectors.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-[#888888]">
                        No sectors match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 bg-[#03030A]/70 border-t border-[#1A1A2E] text-[10px] font-mono text-[#888888] flex justify-between">
              <span>Reference Schedule: IT Act 2000 Section 70A Designated Sectors</span>
              <span className="text-[#00FF9D]">IST Synchronized</span>
            </div>
          </TerminalCard>
        </div>

        {/* CERT-In Reference Advisories */}
        <div className="xl:col-span-5">
          <TerminalCard
            title={t('CERT-In Threat Reference Bulletins', 'सर्ट-इन खतरा संदर्भ बुलेटिन')}
            label="Advisory Watchlist"
            labelColor="red"
          >
            <div className="space-y-3">
              {CERT_IN_BULLETINS.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-[#03030A] border border-[#1A1A2E] hover:border-[#FF1B1B]/45 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#F5F5F5]">{item.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        item.severity === 'CRITICAL'
                          ? 'bg-[#FF1B1B]/15 border-[#FF1B1B]/45 text-[#FF1B1B]'
                          : item.severity === 'HIGH'
                            ? 'bg-[#FF9F1C]/15 border-[#FF9F1C]/45 text-[#FF9F1C]'
                            : 'bg-[#00D4FF]/15 border-[#00D4FF]/45 text-[#00D4FF]'
                      }`}
                    >
                      {item.severity} · {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#F5F5F5]/90 leading-relaxed">{item.title}</p>
                  <div className="text-[10px] font-mono text-[#888888]">{item.statute}</div>
                </div>
              ))}
            </div>
          </TerminalCard>
        </div>
      </div>

      {/* 12-Department 3D Interactive Module Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1A2E] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#F5F5F5] font-serif">
              {t('3D Tactical Departments & Statutory Workbenches', '3D सामरिक विभाग एवं वैधानिक कार्यक्षेत्र')}
            </h2>
            <p className="text-xs text-[#888888]">
              {t(
                'Hover cards for 3D depth tilt and click any wing to enter its specialized console.',
                '3D गहराई देखने के लिए कार्ड पर होवर करें और संबंधित कंसोल खोलने के लिए क्लिक करें।'
              )}
            </p>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-[#00D4FF] px-2.5 py-1 rounded bg-[#0A0A12] border border-[#1A1A2E]">
            12 Active Wings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon
            return (
              <Link key={dept.href} href={dept.href} className="block h-full">
                <Card3D accent={dept.accent} className="p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#03030A] border border-[#1A1A2E] text-[#FF9F1C]">
                        DEPT // {dept.code}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#03030A] border border-[#1A1A2E] flex items-center justify-center text-[#00D4FF]">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-[#F5F5F5]">
                      {t(dept.name, dept.hiName)}
                    </h3>
                    <p className="text-xs text-[#888888] leading-relaxed">{dept.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-[#1A1A2E] flex items-center justify-between text-[11px] font-mono text-[#00D4FF]">
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Card3D>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
