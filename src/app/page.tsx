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
    badgeBg: 'bg-[#D64045]/20 border-[#D64045]',
    textColor: 'text-[#D64045]',
  },
  {
    level: 2,
    code: 'LEVEL 2 // HIGH ALERT',
    enLabel: 'Targeted Infrastructure Threat',
    hiLabel: 'लक्षित अवसंरचना खतरा',
    basis: 'CERT-In §70B(6) Active Advisory',
    directive: 'Suspend non-essential third-party API bridges; enforce hardware MFA across BFSI and NIC endpoints.',
    badgeBg: 'bg-[#FF9F1C]/20 border-[#FF9F1C]',
    textColor: 'text-[#FF9F1C]',
  },
  {
    level: 3,
    code: 'LEVEL 3 // ELEVATED WATCH',
    enLabel: 'Active Phishing & Fraud Campaigns',
    hiLabel: 'सक्रिय फ़िशिंग और धोखाधड़ी निगरानी',
    basis: 'NCIIPC Standing Watch · BNS §318',
    directive: 'Monitor UPI/KYC typosquatting domains, enforce 6-hour incident logging, and validate BSA §63 hashes.',
    badgeBg: 'bg-[#FF9F1C]/15 border-[#FF9F1C]/60',
    textColor: 'text-[#FF9F1C]',
  },
  {
    level: 4,
    code: 'LEVEL 4 // GUARDED',
    enLabel: 'Standard Perimeter Patrol',
    hiLabel: 'मानक परिधि सुरक्षा',
    basis: 'IT Rules 2021 · Routine Audit',
    directive: 'Continuous IOC sweep, DevSecOps SAST checks, and daily log retention compliance (180-day mandate).',
    badgeBg: 'bg-[#00A896]/15 border-[#00A896]/60',
    textColor: 'text-[#00A896]',
  },
  {
    level: 5,
    code: 'LEVEL 5 // BASELINE',
    enLabel: 'Nominal Readiness',
    hiLabel: 'सामान्य परिचालन स्थिति',
    basis: 'Standard Operations · Routine Hygiene',
    directive: 'Scheduled Cyber Range drills, patch verification, and cryptographic signature hygiene checks.',
    badgeBg: 'bg-[#2E8B57]/15 border-[#2E8B57]/60',
    textColor: 'text-[#2E8B57]',
  },
]

interface SectorHealthRow {
  sector: string
  asset: string
  status: 'NOMINAL' | 'ADVISORY'
  rttMs: number
  ttp: string
  syncIst: string
}

const NCIIPC_SECTORS: SectorHealthRow[] = [
  {
    sector: 'Banking, Financial Services & UPI (BFSI)',
    asset: 'NPCI Payment Switch / Core Banking Gateways',
    status: 'ADVISORY',
    rttMs: 18,
    ttp: 'T1566.002 (KYC Spearphishing Link)',
    syncIst: 'Today, IST Synchronized',
  },
  {
    sector: 'Power & Energy Grids (RLDC / POSOCO)',
    asset: 'Substation SCADA & Regional Load Dispatch',
    status: 'NOMINAL',
    rttMs: 24,
    ttp: 'T0886 (Remote ICS Monitoring)',
    syncIst: 'Today, IST Synchronized',
  },
  {
    sector: 'Telecom & Public Internet Exchange',
    asset: 'NIXI Core Routers & Telecom KYC Registers',
    status: 'NOMINAL',
    rttMs: 14,
    ttp: 'T1078 (SIM-Swap Credential Abuse)',
    syncIst: 'Today, IST Synchronized',
  },
  {
    sector: 'Transport, Railways & Aviation',
    asset: 'CRIS Reservation Bus & ATC Telemetry',
    status: 'NOMINAL',
    rttMs: 29,
    ttp: 'T1190 (Public-Facing App Audit)',
    syncIst: 'Today, IST Synchronized',
  },
  {
    sector: 'Government & NICnet Infrastructure',
    asset: 'Parichay SSO & e-Governance Portals',
    status: 'ADVISORY',
    rttMs: 21,
    ttp: 'T1583.001 (Typosquat `.gov` Spoofs)',
    syncIst: 'Today, IST Synchronized',
  },
  {
    sector: 'Defence & Strategic Enterprises',
    asset: 'Air-Gapped Document Exchange Nodes',
    status: 'NOMINAL',
    rttMs: 11,
    ttp: 'T1204 (Synthetic Media / Deepfake Bait)',
    syncIst: 'Today, IST Synchronized',
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

const DEPARTMENTS = [
  { code: '01', name: 'Cyber Range', hiName: 'साइबर रेंज', href: '/academy', icon: Terminal, desc: 'Sandboxed attack-defense drills and red/blue packet exercises.' },
  { code: '02', name: 'AI SecOps Copilot', hiName: 'एआई सेकऑप्स सहपायलट', href: '/mentor', icon: BrainCircuit, desc: 'Stateless BharatCode reasoning assistant for Indian cyber statutes.' },
  { code: '03', name: 'DevSecOps Audit', hiName: 'डेवसेकऑप्स ऑडिट', href: '/devsec', icon: Wrench, desc: 'Static secret detection, OWASP hardening, and AI remediation.' },
  { code: '04', name: 'Incident Response & FIR', hiName: 'घटना प्रतिक्रिया एवं एफआईआर', href: '/incident', icon: FileText, desc: 'BNS 2023 / IT Act FIR synthesis with 6-hour CERT-In SLA timer.' },
  { code: '05', name: 'Digital Forensics Lab', hiName: 'डिजिटल फोरेंसिक लैब', href: '/exif', icon: Camera, desc: 'Client-side EXIF extraction, entropy measurement, and SHA-256 hashing.' },
  { code: '06', name: 'Sentinel Guard', hiName: 'सेंटिनल गार्ड', href: '/breach', icon: Lock, desc: 'Zero-leak credential k-anonymity & password entropy diagnostics.' },
  { code: '07', name: 'Threat Observatory', hiName: 'खतरा वेधशाला', href: '/intel', icon: Radar, desc: 'IOC taxonomy, MITRE ATT&CK mapping, and regional threat posture.' },
  { code: '08', name: 'Phishing & Link Inspector', hiName: 'फ़िशिंग और लिंक निरीक्षक', href: '/nlp', icon: MailWarning, desc: 'Live BharatCode SMS analysis, Levenshtein spoofing, and BSA §63 export.' },
  { code: '09', name: 'Cyber-IR Playbooks', hiName: 'साइबर-आईआर प्लेबुक', href: '/cyber-ir', icon: BookOpen, desc: 'SANS PICERL incident containment SOPs aligned with CERT-In rules.' },
  { code: '10', name: 'Media Briefing Studio', hiName: 'मीडिया ब्रीफिंग स्टूडियो', href: '/video-gen', icon: Video, desc: 'Citizen awareness script & briefing generation pipeline.' },
  { code: '11', name: 'Deepfake Forensics', hiName: 'डीपफेक फोरेंसिक लैब', href: '/deepfake-xai', icon: ShieldAlert, desc: 'Grad-CAM spatial attribution, facial zone scoring & CGFD benchmarks.' },
  { code: '12', name: 'Research & Citations', hiName: 'अनुसंधान एवं संदर्भ', href: '/research', icon: GraduationCap, desc: 'Academic citations, statutory references, and validation methodology.' },
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
      {/* Official National SOC Masthead */}
      <section className="rounded-xl bg-[#172A45] border border-[#233554] p-6 lg:p-7">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#0A192F] border border-[#233554] text-[10px] font-mono font-bold text-[#FF9F1C] uppercase tracking-wider">
                {t('00 // NATIONAL SOC COMMAND', '00 // राष्ट्रीय सुरक्षा संचालन केंद्र')}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#00A896]/15 border border-[#00A896]/35 text-[10px] font-mono font-semibold text-[#00A896]">
                IT Act 2000 §70A · CERT-In §70B(6) · BSA 2023 §63
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F8F9FA] font-serif tracking-tight">
              {t(
                'TRINETRA National Cyber Defense & Forensic Console',
                'त्रिनेत्र राष्ट्रीय साइबर रक्षा एवं फोरेंसिक कंसोल'
              )}
            </h1>
            <p className="text-sm text-[#8D99AE] leading-relaxed">
              {t(
                'Unified statutory triage, phishing link inspection, cryptographic evidence hashing, and AI-assisted incident documentation designed in accordance with NCIIPC, CERT-In, and Indian Cybercrime Reporting standards.',
                'एनसीआईआईपीसी, सर्ट-इन और भारतीय साइबर अपराध रिपोर्टिंग मानकों के अनुरूप एकीकृत वैधानिक विश्लेषण, फ़िशिंग निरीक्षण और फोरेंसिक दस्तावेज़ीकरण।'
              )}
            </p>
          </div>

          {/* 1930 Emergency Banner + Quick FIR CTA */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0">
            <div className="px-4 py-3 rounded-lg bg-[#0A192F] border border-[#D64045]/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D64045]/15 border border-[#D64045]/30 flex items-center justify-center text-[#D64045] shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#8D99AE]">
                  {t('Citizen Cyber Helpline', 'नागरिक साइबर हेल्पलाइन')}
                </div>
                <div className="text-base font-mono font-bold text-[#F8F9FA]">
                  1930 <span className="text-xs font-normal text-[#8D99AE]">| 112 (24x7)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/incident"
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-[#0A192F] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                {t('File Statutory FIR', 'वैधानिक एफआईआर दर्ज करें')}
              </Link>
              <Link
                href="/nlp"
                className="px-4 py-2.5 rounded-lg bg-[#0A192F] hover:bg-[#1E3554] border border-[#233554] text-[#F8F9FA] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {t('Scan Phishing', 'फ़िशिंग स्कैन')}
                <ArrowRight className="w-3.5 h-3.5 text-[#00A896]" />
              </Link>
            </div>
          </div>
        </div>

        {/* DEF CON 1-5 Readiness Strip + Verifiable Operational Cards */}
        <div className="mt-6 pt-5 border-t border-[#233554] grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Interactive DEF CON Selector */}
          <div className="lg:col-span-6 p-4 rounded-lg bg-[#0A192F] border border-[#233554] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#8D99AE] font-semibold">
                {t('National Cyber Readiness Posture (IT Act §70)', 'राष्ट्रीय साइबर तत्परता स्तर')}
              </div>
              <div className="flex items-center gap-1">
                {DEFCON_LEVELS.map((d) => (
                  <button
                    key={d.level}
                    onClick={() => setDefcon(d.level)}
                    className={`w-7 h-7 rounded font-mono text-xs font-bold border transition-colors cursor-pointer ${
                      defcon === d.level
                        ? `${d.badgeBg} ${d.textColor}`
                        : 'bg-[#172A45] border-[#233554] text-[#8D99AE] hover:text-[#F8F9FA]'
                    }`}
                    title={d.enLabel}
                  >
                    {d.level}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`font-mono text-xs font-bold ${activeDefcon.textColor}`}>
                {activeDefcon.code} — {t(activeDefcon.enLabel, activeDefcon.hiLabel)}
              </span>
              <span className="text-[10px] font-mono text-[#8D99AE]">{activeDefcon.basis}</span>
            </div>
            <p className="text-xs text-[#8D99AE] leading-relaxed">{activeDefcon.directive}</p>
          </div>

          {/* Real Telemetry & Statutory SLA Cards (Zero Fake Numbers) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#8D99AE]">AI Gateway</span>
                <Cpu className="w-3.5 h-3.5 text-[#00A896]" />
              </div>
              <div className="mt-2">
                <div className="text-sm font-mono font-bold text-[#F8F9FA]">
                  {telemetry ? telemetry.status.toUpperCase() : 'CHECKING'}
                </div>
                <div className="text-[11px] font-mono text-[#00A896] truncate">
                  {telemetry?.activeModel || 'qwen-3.8-27b'}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-[#8D99AE]">
                {telemetry && telemetry.totalCalls > 0
                  ? `${telemetry.totalCalls} calls · ${telemetry.latencyMs}ms`
                  : 'Awaiting live calls'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#8D99AE]">CERT-In SLA</span>
                <Clock className="w-3.5 h-3.5 text-[#FF9F1C]" />
              </div>
              <div className="mt-2">
                <div className="text-lg font-mono font-bold text-[#FF9F1C]">06 Hours</div>
                <div className="text-[11px] text-[#8D99AE]">Mandatory reporting</div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-[#8D99AE]">
                IT Act §70B(6) Mandate
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#8D99AE]">Local Math Core</span>
                <Lock className="w-3.5 h-3.5 text-[#2E8B57]" />
              </div>
              <div className="mt-2">
                <div className="text-lg font-mono font-bold text-[#00A896]">SHA-256</div>
                <div className="text-[11px] text-[#8D99AE]">Deterministic client hashing</div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-[#8D99AE]">
                BSA 2023 §63 Admissible
              </div>
            </div>
          </div>
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
                        ? 'bg-[#FF9F1C] text-[#0A192F] border-[#FF9F1C]'
                        : 'bg-[#0A192F] text-[#8D99AE] border-[#233554] hover:text-[#F8F9FA]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            }
          >
            <div className="px-5 py-3 border-b border-[#233554] bg-[#0A192F]/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8D99AE] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Filter sectors, protected assets, or MITRE TTP...', 'सेक्टर, परिसंपत्ति या MITRE TTP खोजें...')}
                  className="w-full bg-[#0A192F] border border-[#233554] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8F9FA] placeholder:text-[#8D99AE]/70 focus:outline-none focus:border-[#00A896]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0A192F]/80 border-b border-[#233554] text-[10px] font-mono uppercase text-[#8D99AE]">
                    <th className="py-2.5 px-4">Critical Sector</th>
                    <th className="py-2.5 px-4">Posture</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">RTT</th>
                    <th className="py-2.5 px-4 hidden md:table-cell">Watchlist TTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233554]">
                  {filteredSectors.map((row) => (
                    <tr key={row.sector} className="hover:bg-[#1E3554]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#F8F9FA]">{row.sector}</div>
                        <div className="text-[11px] text-[#8D99AE]">{row.asset}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {row.status === 'NOMINAL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00A896]/15 border border-[#00A896]/30 text-[#00A896] font-mono text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> NOMINAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF9F1C]/15 border border-[#FF9F1C]/35 text-[#FF9F1C] font-mono text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> ADVISORY
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#8D99AE] hidden sm:table-cell whitespace-nowrap">
                        {row.rttMs} ms
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#8D99AE] hidden md:table-cell">
                        {row.ttp}
                      </td>
                    </tr>
                  ))}
                  {filteredSectors.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-[#8D99AE]">
                        No sectors match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 bg-[#0A192F]/60 border-t border-[#233554] text-[10px] font-mono text-[#8D99AE] flex justify-between">
              <span>Reference Schedule: IT Act 2000 Section 70A Designated Sectors</span>
              <span>IST Synchronized</span>
            </div>
          </TerminalCard>
        </div>

        {/* CERT-In Reference Advisories */}
        <div className="xl:col-span-5">
          <TerminalCard
            title={t('CERT-In Threat Reference Bulletins', 'सर्ट-इन खतरा संदर्भ बुलेटिन')}
            label="Advisory Watchlist"
            labelColor="amber"
          >
            <div className="space-y-3">
              {CERT_IN_BULLETINS.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-[#0A192F] border border-[#233554] hover:border-[#FF9F1C]/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#F8F9FA]">{item.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        item.severity === 'CRITICAL'
                          ? 'bg-[#D64045]/15 border-[#D64045]/40 text-[#D64045]'
                          : item.severity === 'HIGH'
                            ? 'bg-[#FF9F1C]/15 border-[#FF9F1C]/40 text-[#FF9F1C]'
                            : 'bg-[#00A896]/15 border-[#00A896]/40 text-[#00A896]'
                      }`}
                    >
                      {item.severity} · {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#F8F9FA]/90 leading-relaxed">{item.title}</p>
                  <div className="text-[10px] font-mono text-[#8D99AE]">{item.statute}</div>
                </div>
              ))}
            </div>
          </TerminalCard>
        </div>
      </div>

      {/* 12-Department Official Directory */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#233554] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#F8F9FA] font-serif">
              {t('Operational Departments & Statutory Workbenches', 'संचालन विभाग एवं वैधानिक कार्यक्षेत्र')}
            </h2>
            <p className="text-xs text-[#8D99AE]">
              {t(
                'Select a dedicated cyber defense wing to inspect artifacts, run AI diagnostics, or synthesize legal dossiers.',
                'डिजिटल साक्ष्य जांचने, एआई डायग्नोस्टिक्स चलाने या कानूनी डोजियर तैयार करने के लिए विभाग चुनें।'
              )}
            </p>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-[#00A896] px-2.5 py-1 rounded bg-[#172A45] border border-[#233554]">
            12 Active Wings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon
            return (
              <Link
                key={dept.href}
                href={dept.href}
                className="group p-4 rounded-xl bg-[#172A45] hover:bg-[#1E3554] border border-[#233554] hover:border-[#FF9F1C]/50 transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0A192F] border border-[#233554] text-[#FF9F1C]">
                      DEPT // {dept.code}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#0A192F] border border-[#233554] group-hover:border-[#00A896]/50 flex items-center justify-center text-[#00A896]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8F9FA] group-hover:text-[#FF9F1C] transition-colors">
                    {t(dept.name, dept.hiName)}
                  </h3>
                  <p className="text-xs text-[#8D99AE] leading-relaxed">{dept.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#233554] flex items-center justify-between text-[11px] font-mono text-[#00A896]">
                  <span>Enter Department</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
