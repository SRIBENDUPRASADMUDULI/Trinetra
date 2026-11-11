'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  ChevronRight,
  Shield,
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
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  sub: string
  path: string
  category: 'Core SOC' | 'Forensics & XAI' | 'Legal & Compliance' | 'Intelligence'
  tag: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const ALL_MODULES: CommandItem[] = [
  {
    id: '00',
    title: '00 // Command Center',
    sub: 'National threat posture, DEFCON status & NCIIPC grid',
    path: '/',
    category: 'Core SOC',
    tag: 'DASHBOARD',
    Icon: Shield,
  },
  {
    id: '01',
    title: '01 // Cyber Range',
    sub: 'Tactical mission briefing terminal, CTF challenges & packet hex dump',
    path: '/academy',
    category: 'Core SOC',
    tag: 'CHALLENGES',
    Icon: GraduationCap,
  },
  {
    id: '02',
    title: '02 // AI SecOps Copilot',
    sub: 'Stateless defense copilot with BharatCode Qwen 3.8 & DeepSeek failover',
    path: '/mentor',
    category: 'Core SOC',
    tag: 'AI COPILOT',
    Icon: Bot,
  },
  {
    id: '03',
    title: '03 // DevSecOps Audit',
    sub: 'Static code vulnerability audit and privacy leakage detection',
    path: '/devsec',
    category: 'Legal & Compliance',
    tag: 'CODE AUDIT',
    Icon: Code2,
  },
  {
    id: '04',
    title: '04 // Incident Crisis & FIR',
    sub: 'Emergency statutory BNS 2023 police dossiers with digital hash verification',
    path: '/incident',
    category: 'Legal & Compliance',
    tag: 'BNS 2023',
    Icon: AlertOctagon,
  },
  {
    id: '05',
    title: '05 // Forensics Lab',
    sub: 'Canvas EXIF metadata scrubbing, GPS extraction & media tamper scan',
    path: '/exif',
    category: 'Forensics & XAI',
    tag: 'METADATA',
    Icon: Microscope,
  },
  {
    id: '06',
    title: '06 // Sentinel Guard',
    sub: 'k-Anonymity identity breach audits and credential exposure search',
    path: '/breach',
    category: 'Intelligence',
    tag: 'BREACH',
    Icon: KeyRound,
  },
  {
    id: '07',
    title: '07 // Threat Radar',
    sub: 'Critical infrastructure intelligence feeds, CVE registry & IOC tracker',
    path: '/intel',
    category: 'Intelligence',
    tag: 'IOC RADAR',
    Icon: Radar,
  },
  {
    id: '08',
    title: '08 // NLP Phishing Scan',
    sub: 'Detect phishing SMS lures, UPI fraud patterns & Shannon URL entropy',
    path: '/nlp',
    category: 'Forensics & XAI',
    tag: 'PHISHING',
    Icon: MessageSquare,
  },
  {
    id: '09',
    title: '09 // Cyber-IR Engine',
    sub: 'Automated legal FIR synthesis and SANS PICERL containment playbooks',
    path: '/cyber-ir',
    category: 'Legal & Compliance',
    tag: 'LEGAL AI',
    Icon: Scale,
  },
  {
    id: '10',
    title: '10 // Video Studio',
    sub: 'Multi-scene incident video briefing generator with synchronized audio',
    path: '/video-gen',
    category: 'Forensics & XAI',
    tag: 'STUDIO',
    Icon: Video,
  },
  {
    id: '12',
    title: '12 // Research & OSS Stack',
    sub: '10 peer-reviewed papers, DOIs & HuggingFace/GitHub models',
    path: '/research',
    category: 'Intelligence',
    tag: 'CITATIONS',
    Icon: Shield,
  },
  {
    id: '11',
    title: '11 // Deepfake XAI',
    sub: 'CGFD, FADI & Grad-CAM explainability with BNS §319(2) briefs',
    path: '/deepfake-xai',
    category: 'Forensics & XAI',
    tag: 'DEEPFAKE XAI',
    Icon: ScanFace,
  },
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Global keydown handler for Escape & Arrow navigation
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          navigateTo(filtered[selectedIndex].path)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, query])

  const filtered = ALL_MODULES.filter(item => {
    const q = query.toLowerCase()
    return (
      item.title.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q) ||
      item.path.toLowerCase().includes(q)
    )
  })

  function navigateTo(path: string) {
    onClose()
    router.push(path)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-10 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#262B40] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#1E2235]/60 gap-3">
          <Search size={18} className="text-[#FF5A79] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, module name (e.g. FIR, XAI, EXIF), or IOC search..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.03]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No modules match <span className="text-white font-mono">&quot;{query}&quot;</span>
              </p>
              {query.length > 2 && (
                <button
                  onClick={() => navigateTo(`/intel?q=${encodeURIComponent(query)}`)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF5A79]/15 border border-[#FF5A79]/30 text-xs font-semibold text-[#FF5A79] hover:bg-[#FF5A79]/25 transition-colors cursor-pointer"
                >
                  <span>Search IOC &quot;{query}&quot; in Threat Radar</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => navigateTo(item.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E2235] border border-[#FF5A79]/40 shadow-sm'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#FF5A79] text-white shadow-md shadow-[#FF5A79]/30'
                          : 'bg-[#1E2235] text-slate-300 border border-white/[0.06]'
                      }`}
                    >
                      <item.Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.06]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
                      {item.tag}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <CornerDownLeft size={12} className="text-[#FF5A79]" />
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#1E2235]/80 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>12 Sovereign Modules Available</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
