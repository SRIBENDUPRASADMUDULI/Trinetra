'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, PhoneCall, ArrowRight, MessageSquare, FileText, Bot,
  GraduationCap, Code2, Microscope, KeyRound, Radar, Scale, Video,
  ScanFace, BookOpen, AlertTriangle, CheckCircle2, Cpu
} from 'lucide-react'
import { BharatCodeShowcase } from '@/components/shell/BharatCodeShowcase'
import { InfoExplain } from '@/components/ui/InfoExplain'
import { useLang } from '@/lib/i18n-context'

const TOOLS_DIRECTORY = [
  {
    name: 'Message Checker',
    hiName: 'संदेश जांचें',
    href: '/nlp',
    icon: MessageSquare,
    summary: 'Paste any strange SMS, WhatsApp forward, or link to see if it is a scam.',
    badge: 'Most Popular',
  },
  {
    name: 'File Complaint',
    hiName: 'शिकायत दर्ज करें',
    href: '/incident',
    icon: FileText,
    summary: 'Create a formal police complaint letter for online fraud or hacking (1930 / BNS 2023).',
    badge: 'Legal Help',
  },
  {
    name: 'AI Assistant',
    hiName: 'एआई सहायक',
    href: '/mentor',
    icon: Bot,
    summary: 'Ask any cybersecurity question in plain language and get safe step-by-step guidance.',
    badge: 'AI Chat',
  },
  {
    name: 'Fake Video Checker',
    hiName: 'नकली वीडियो जांच',
    href: '/deepfake-xai',
    icon: ScanFace,
    summary: 'Check suspicious photos for AI manipulation and see which facial zones look edited.',
    badge: 'Deepfake Lab',
  },
  {
    name: 'File Checker',
    hiName: 'फ़ाइल जांचें',
    href: '/exif',
    icon: Microscope,
    summary: 'Remove hidden GPS location or camera data from photos and verify file fingerprints.',
    badge: 'Privacy',
  },
  {
    name: 'Identity Check',
    hiName: 'डेटा लीक जांच',
    href: '/breach',
    icon: KeyRound,
    summary: 'Check if your password or email was exposed in known data breaches safely on your device.',
    badge: 'Safety Check',
  },
  {
    name: 'Latest Threats',
    hiName: 'ताज़ा खतरे',
    href: '/intel',
    icon: Radar,
    summary: 'Read recent scam alerts, fake banking links, and security advisories across India.',
    badge: 'Alerts',
  },
  {
    name: 'Learn & Practice',
    hiName: 'सीखें और अभ्यास करें',
    href: '/academy',
    icon: GraduationCap,
    summary: 'Short interactive lessons and spot-the-scam challenges for students and teams.',
    badge: 'Training',
  },
  {
    name: 'Code Scanner',
    hiName: 'कोड स्कैनर',
    href: '/devsec',
    icon: Code2,
    summary: 'Paste app code to spot exposed passwords, weak checks, or privacy mistakes.',
    badge: 'For Developers',
  },
  {
    name: 'Emergency Guide',
    hiName: 'आपातकालीन गाइड',
    href: '/cyber-ir',
    icon: Scale,
    summary: 'Step-by-step checklists on what to do immediately if your account or office gets hacked.',
    badge: 'Checklist',
  },
  {
    name: 'Make Videos',
    hiName: 'जागरूकता वीडियो',
    href: '/video-gen',
    icon: Video,
    summary: 'Generate simple awareness scripts and briefings to warn family, students, or teams.',
    badge: 'Awareness',
  },
  {
    name: 'Research & Sources',
    hiName: 'शोध और स्रोत',
    href: '/research',
    icon: BookOpen,
    summary: 'See the laws, research papers, and open safety standards powering TRINETRA.',
    badge: 'References',
  },
]

const PLAIN_ALERTS = [
  {
    tag: 'Banking Scam',
    severity: 'High Risk',
    title: 'Fake "SBI / Bank KYC Expired" SMS links asking for PAN or OTP.',
    action: 'Banks never ask for KYC updates on random `.top` or `.xyz` websites. Use only official bank apps.',
  },
  {
    tag: 'Fake Police / Challan',
    severity: 'High Risk',
    title: 'WhatsApp messages sending `.apk` files claiming to be Traffic e-Challan notices.',
    action: 'Never install `.apk` files sent on WhatsApp. Check challans only on `parivahan.gov.in`.',
  },
  {
    tag: 'Fake Video / Voice',
    severity: 'Be Careful',
    title: 'AI-cloned voice calls or video clips asking friends or family for urgent UPI money.',
    action: 'Always call the person back on their saved phone number before transferring any money.',
  },
]

export default function DashboardPage() {
  const { t } = useLang()
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

  return (
    <div className="space-y-6">
      {/* Friendly Hero Overview */}
      <section className="rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-semibold text-[#15803D]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('System Status: Normal · 12 Tools Active', 'सिस्टम स्थिति: सामान्य · 12 टूल सक्रिय')}
              </span>
              <InfoExplain
                title="Dashboard Overview"
                whatIsIt="This home screen summarizes TRINETRA's 12 online safety tools in one simple place."
                whoShouldUse="Anyone who wants to check a suspicious SMS, protect personal photos, or file a cybercrime complaint."
                whatResultMeans="System Status shows whether automated AI checks and local safety scanners are ready to use."
              />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2420] tracking-tight leading-tight">
              {t(
                'Sovereign Cyber Defense for Every Citizen',
                'हर नागरिक के लिए सुरक्षित डिजिटल रक्षा'
              )}
            </h1>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
              {t(
                'Verify suspicious links, spot deepfake videos, audit code, and draft 1930 complaints in seconds.',
                'संदिग्ध लिंक, नकली वीडियो और धोखाधड़ी की तुरंत जांच करें।'
              )}
            </p>

            {/* Primary Clear Buttons with Text + Icons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/nlp"
                className="px-5 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                {t('Check Message', 'संदेश जांचें')}
              </Link>
              <Link
                href="/deepfake-xai"
                className="px-5 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F4F6] border border-[#E0DDD5] text-[#1E2420] text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <ScanFace className="w-4 h-4 text-[#D97706]" />
                {t('Fake Video Lab', 'डीपफेक जांच')}
              </Link>
              <Link
                href="/incident"
                className="px-5 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F4F6] border border-[#E0DDD5] text-[#1E2420] text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-[#DC2626]" />
                {t('File 1930 Report', '1930 शिकायत')}
              </Link>
            </div>
          </div>

          {/* Right Sovereign India Gate Monument + Helpline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:w-80 shrink-0">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#132019] via-[#0E1712] to-[#0A100D] border border-[#2C3F33] p-4 text-white">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#34D399] mb-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                  INDIA GATE SHIELD
                </span>
                <span className="text-[#F59E0B]">
                  {telemetry && telemetry.totalCalls > 0 ? `${telemetry.totalCalls} SCANS` : 'LIVE GRID'}
                </span>
              </div>

              <svg
                viewBox="0 0 260 112"
                className="w-full h-24 mx-auto"
                role="img"
                aria-label="India Gate Cyber Defense Monument"
              >
                <defs>
                  <linearGradient id="igStone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="60%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                  <radialGradient id="igGlow" cx="50%" cy="62%" r="55%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Horizon glow & tricolor cyber grid base */}
                <circle cx="130" cy="68" r="54" fill="url(#igGlow)" />
                <line x1="16" y1="98" x2="244" y2="98" stroke="#10B981" strokeOpacity="0.45" strokeWidth="1.2" />
                <line x1="36" y1="103" x2="224" y2="103" stroke="#F59E0B" strokeOpacity="0.45" strokeWidth="1.2" />

                {/* Top crown & cornice steps */}
                <rect x="76" y="16" width="108" height="7" rx="1.5" fill="url(#igStone)" opacity="0.92" />
                <rect x="66" y="23" width="128" height="8" rx="1" fill="url(#igStone)" opacity="0.96" />
                <rect x="72" y="31" width="116" height="9" fill="#B45309" opacity="0.85" />

                {/* Left & Right Pillars */}
                <rect x="76" y="40" width="32" height="58" fill="url(#igStone)" />
                <rect x="152" y="40" width="32" height="58" fill="url(#igStone)" />

                {/* Central Archway */}
                <path d="M 108 98 L 108 58 A 22 22 0 0 1 152 58 L 152 98 Z" fill="#0B120E" stroke="#FCD34D" strokeOpacity="0.45" strokeWidth="1" />
                <path d="M 113 98 L 113 61 A 17 17 0 0 1 147 61 L 147 98" fill="none" stroke="#34D399" strokeOpacity="0.35" strokeWidth="1" />

                {/* Amar Jawan Eternal Flame */}
                <path d="M130 78 C127 83 128 88 130 88 C132 88 133 83 130 78 Z" fill="#FBBF24" />
                <rect x="124" y="89" width="12" height="9" rx="1" fill="#92400E" />

                {/* Side architectural niches */}
                <rect x="86" y="54" width="10" height="24" rx="5" fill="#0E1712" opacity="0.65" />
                <rect x="164" y="54" width="10" height="24" rx="5" fill="#0E1712" opacity="0.65" />
              </svg>

              <div className="mt-1 flex items-center justify-between text-[11px] text-[#CBD5E1]">
                <span>National Cyber Grid · New Delhi</span>
                <span className="font-mono text-[#34D399]">99.9% UP</span>
              </div>
            </div>

            <a
              href="tel:1930"
              className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#991B1B]">Cyber Helpline: 1930</div>
                <div className="text-xs text-[#7F1D1D]">
                  24x7 Fraud Freeze · cybercrime.gov.in
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Highlighted BharatCode API & AI Harness Section */}
      <BharatCodeShowcase />

      {/* Common Current Scams in Plain Language */}
      <section className="rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#1E2420]">
              {t('Common Scams to Watch Out For', 'सावधान रहें: आम ऑनलाइन धोखाधड़ी')}
            </h2>
            <p className="text-xs text-[#5C645E]">
              Recent fraud tricks reported across banking, traffic challans, and social media.
            </p>
          </div>
          <Link
            href="/intel"
            className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1"
          >
            View All Alerts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAIN_ALERTS.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {item.severity}
                </span>
                <span className="text-[11px] text-[#5C645E] font-medium">{item.tag}</span>
              </div>
              <h3 className="text-xs font-bold text-[#1E2420] leading-snug">{item.title}</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">{item.action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All 12 Tools Directory in Plain English */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1E2420]">
              {t('All 12 Safety Tools', 'सभी 12 सुरक्षा टूल')}
            </h2>
            <p className="text-xs text-[#5C645E]">
              Each page handles one clear task in plain language.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> 12 Tools Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS_DIRECTORY.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group p-5 rounded-xl bg-[#FFFFFF] border border-[#E0DDD5] hover:border-[#059669]/50 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-[#5C645E] bg-[#F3F4F6] px-2.5 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E2420] group-hover:text-[#059669] transition-colors">
                    {t(tool.name, tool.hiName)}
                  </h3>
                  <p className="text-sm text-[#5C645E] leading-relaxed">{tool.summary}</p>
                </div>

                <div className="pt-3 border-t border-[#E0DDD5] flex items-center justify-between text-xs font-semibold text-[#059669]">
                  <span>Open Tool</span>
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
