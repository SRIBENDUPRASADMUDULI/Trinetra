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
  BookOpen,
} from 'lucide-react'

interface RailItem {
  id: string
  label: string
  sub: string
  path: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const ALL_DEPARTMENTS: RailItem[] = [
  { id: '00', label: '00 // National SOC', sub: 'DEF CON Posture & Sector Health', path: '/', Icon: Home },
  { id: '01', label: '01 // Cyber Range & Training', sub: 'CTF Exercises & Packet Analysis', path: '/academy', Icon: GraduationCap },
  { id: '02', label: '02 // AI Operations Copilot', sub: 'BharatCode Streaming SecOps Chat', path: '/mentor', Icon: Bot },
  { id: '03', label: '03 // Secure Code Auditor', sub: 'SAST CWE Audit & DPDP Compliance', path: '/devsec', Icon: Code2 },
  { id: '04', label: '04 // Incident Response & FIR', sub: 'BNS 2023 Drafting & BSA §63 Cert', path: '/incident', Icon: AlertOctagon },
  { id: '05', label: '05 // Digital Forensics', sub: 'EXIF Scrub & Evidence Hash Chain', path: '/exif', Icon: Microscope },
  { id: '06', label: '06 // Identity & Breach Monitor', sub: 'k-Anonymity SHA-1 Leak Audit', path: '/breach', Icon: KeyRound },
  { id: '07', label: '07 // Threat Intelligence', sub: 'CVE Registry & MITRE ATT&CK', path: '/intel', Icon: Radar },
  { id: '08', label: '08 // Phishing & Link Inspector', sub: 'Live SMS/URL & Reputation Desk', path: '/nlp', Icon: MessageSquare },
  { id: '09', label: '09 // IR Playbook Engine', sub: 'SANS PICERL & Statutory FIR', path: '/cyber-ir', Icon: Scale },
  { id: '10', label: '10 // Incident Video Briefing', sub: 'Briefing Synthesis Studio', path: '/video-gen', Icon: Video },
  { id: '11', label: '11 // Deepfake Forensics', sub: 'Grad-CAM, CGFD & FADI Evidence', path: '/deepfake-xai', Icon: ScanFace },
  { id: '12', label: '12 // Research & Citations', sub: 'Academic Sources & OSS Stack', path: '/research', Icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 h-14 w-full md:top-0 md:bottom-auto md:right-auto md:h-screen md:w-16 bg-[#071222] border-t md:border-t-0 md:border-r border-[#233554] flex flex-row md:flex-col items-center px-2 md:px-0 md:py-3 z-50 select-none md:justify-between overflow-x-auto md:overflow-visible no-scrollbar"
      aria-label="Primary Department Navigation Rail"
    >
      {/* Emblem / Monogram Badge */}
      <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3 shrink-0 mr-1 md:mr-0 md:w-full">
        <Link
          href="/"
          className="group relative flex items-center justify-center cursor-pointer"
          title="TRINETRA — National Cyber Defense Console"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#172A45] border border-[#FF9F1C]/60 flex items-center justify-center font-bold text-[#FF9F1C] text-sm md:text-base shadow-sm transition-colors group-hover:bg-[#FF9F1C] group-hover:text-[#0A192F]">
            TR
          </div>
          <div className="hidden md:flex absolute left-16 ml-2 px-3 py-1.5 rounded-lg bg-[#172A45] border border-[#233554] text-[#F8F9FA] text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 items-center gap-2">
            <span>TRINETRA · त्रिनेत्र</span>
            <span className="text-[10px] font-mono text-[#FF9F1C] bg-[#FF9F1C]/10 px-1.5 py-0.5 rounded border border-[#FF9F1C]/30">
              IT ACT §70A
            </span>
          </div>
        </Link>
      </div>

      {/* Department Navigation Links */}
      <nav className="flex-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto no-scrollbar md:w-full px-1 md:px-2 md:py-2 flex flex-row md:flex-col items-center gap-1.5">
        {ALL_DEPARTMENTS.map(item => {
          const isActive =
            item.path === '/'
              ? pathname === '/'
              : pathname === item.path || pathname?.startsWith(item.path + '/')

          return (
            <div key={item.id} className="relative group shrink-0 md:w-full flex justify-center">
              <Link
                href={item.path}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#FF9F1C] text-[#0A192F] border-[#FF9F1C] font-bold'
                    : 'text-[#8D99AE] border-transparent hover:text-[#F8F9FA] hover:bg-[#172A45] hover:border-[#233554]'
                }`}
                aria-label={item.label}
              >
                <item.Icon size={17} className="shrink-0" />
              </Link>

              <div className="hidden md:flex absolute left-16 ml-2 px-3 py-1.5 rounded-lg bg-[#172A45] border border-[#233554] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F8F9FA] font-sans">
                    {item.label}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F1C]" />}
                </div>
                <span className="text-[10px] text-[#8D99AE] font-sans">
                  {item.sub}
                </span>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Operational Jurisdiction Identifier (Desktop Rail Only) */}
      <div className="hidden md:flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-[#233554] shrink-0">
        <div
          className="w-8 h-8 rounded-lg bg-[#172A45] border border-[#233554] flex items-center justify-center text-[10px] font-mono font-bold text-[#00A896]"
          title="Jurisdiction: Republic of India (CERT-In / BNS 2023)"
        >
          IN
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
