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
  { id: '00', label: '00 // Command Center', sub: '3D Threat Globe & DEF CON', path: '/', Icon: Home },
  { id: '01', label: '01 // Cyber Range & Academy', sub: 'CTF Exercises & Packet Analysis', path: '/academy', Icon: GraduationCap },
  { id: '02', label: '02 // AI Operations Copilot', sub: 'BharatCode Streaming SecOps Chat', path: '/mentor', Icon: Bot },
  { id: '03', label: '03 // DevSecOps Auditor', sub: 'SAST CWE Audit & DPDP Compliance', path: '/devsec', Icon: Code2 },
  { id: '04', label: '04 // Incident Response & FIR', sub: 'BNS 2023 Drafting & BSA §63 Cert', path: '/incident', Icon: AlertOctagon },
  { id: '05', label: '05 // Digital Forensics Lab', sub: 'EXIF Scrub & Evidence Hash Chain', path: '/exif', Icon: Microscope },
  { id: '06', label: '06 // Sentinel Guard', sub: 'k-Anonymity SHA-1 Leak Audit', path: '/breach', Icon: KeyRound },
  { id: '07', label: '07 // Threat Intel Radar', sub: '3D Globe, CVE & MITRE ATT&CK', path: '/intel', Icon: Radar },
  { id: '08', label: '08 // Phishing & Link Inspector', sub: 'Live SMS/URL & Levenshtein Desk', path: '/nlp', Icon: MessageSquare },
  { id: '09', label: '09 // IR Playbook Engine', sub: 'SANS PICERL & Statutory FIR', path: '/cyber-ir', Icon: Scale },
  { id: '10', label: '10 // Video Briefing Studio', sub: 'Incident Briefing Synthesis', path: '/video-gen', Icon: Video },
  { id: '11', label: '11 // Deepfake Forensics', sub: 'Grad-CAM, CGFD & FADI Evidence', path: '/deepfake-xai', Icon: ScanFace },
  { id: '12', label: '12 // Research & Citations', sub: 'Academic Sources & OSS Stack', path: '/research', Icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 h-14 w-full md:top-0 md:bottom-auto md:right-auto md:h-screen md:w-16 bg-[#0A0A12]/95 backdrop-blur-md border-t md:border-t-0 md:border-r border-[#1A1A2E] flex flex-row md:flex-col items-center px-2 md:px-0 md:py-3 z-50 select-none md:justify-between overflow-x-auto md:overflow-visible no-scrollbar"
      aria-label="Primary Department Navigation Rail"
    >
      {/* Emblem / Monogram Badge */}
      <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3 shrink-0 mr-1 md:mr-0 md:w-full">
        <Link
          href="/"
          className="group relative flex items-center justify-center cursor-pointer"
          title="TRINETRA — Cinematic Cyber Defense Console"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#03030A] border border-[#FF1B1B]/60 flex items-center justify-center font-bold text-[#FF1B1B] text-sm md:text-base shadow-[0_0_16px_rgba(255,27,27,0.3)] transition-all group-hover:bg-[#FF1B1B] group-hover:text-[#F5F5F5] group-hover:scale-105">
            TR
          </div>
          <div className="hidden md:flex absolute left-16 ml-2 px-3 py-1.5 rounded-lg bg-[#0A0A12] border border-[#1A1A2E] text-[#F5F5F5] text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 items-center gap-2">
            <span>TRINETRA · त्रिनेत्र</span>
            <span className="text-[10px] font-mono text-[#00D4FF] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded border border-[#00D4FF]/30">
              3D SOC
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
                className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-[#FF1B1B] text-[#F5F5F5] border-[#FF1B1B] shadow-[0_0_18px_rgba(255,27,27,0.45)] scale-105'
                    : 'text-[#888888] border-transparent hover:text-[#00D4FF] hover:bg-[#03030A] hover:border-[#00D4FF]/40 hover:scale-105'
                }`}
                aria-label={item.label}
              >
                <item.Icon size={17} className="shrink-0" />
              </Link>

              <div className="hidden md:flex absolute left-16 ml-2 px-3 py-1.5 rounded-lg bg-[#0A0A12] border border-[#1A1A2E] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F5F5F5] font-sans">
                    {item.label}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF1B1B]" />}
                </div>
                <span className="text-[10px] text-[#888888] font-sans">
                  {item.sub}
                </span>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Operational Jurisdiction Identifier (Desktop Rail Only) */}
      <div className="hidden md:flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-[#1A1A2E] shrink-0">
        <div
          className="w-8 h-8 rounded-lg bg-[#03030A] border border-[#1A1A2E] flex items-center justify-center text-[10px] font-mono font-bold text-[#00FF9D]"
          title="Jurisdiction: Republic of India (CERT-In / BNS 2023)"
        >
          IN
        </div>
      </div>
    </aside>
  )
}
