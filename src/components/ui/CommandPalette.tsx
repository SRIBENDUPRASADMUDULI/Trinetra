'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
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
  category: 'Safety Tools' | 'Forensics & Media' | 'Complaints & Guides' | 'Alerts & Learning'
  tag: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const ALL_MODULES: CommandItem[] = [
  { id: '00', title: 'Dashboard', sub: 'Summary of all 12 tools, system status, and quick scam actions', path: '/', category: 'Safety Tools', tag: 'HOME', Icon: Shield },
  { id: '08', title: 'Message Checker', sub: 'Check suspicious SMS, WhatsApp messages, or fake bank links', path: '/nlp', category: 'Safety Tools', tag: 'SCAM CHECK', Icon: MessageSquare },
  { id: '04', title: 'File Complaint', sub: 'Draft a formal police complaint letter (BNS 2023 / 1930)', path: '/incident', category: 'Complaints & Guides', tag: 'POLICE FIR', Icon: AlertOctagon },
  { id: '02', title: 'AI Assistant', sub: 'Ask cybersecurity questions in plain language', path: '/mentor', category: 'Safety Tools', tag: 'AI CHAT', Icon: Bot },
  { id: '11', title: 'Fake Video Checker', sub: 'Inspect suspicious images and deepfake benchmarks', path: '/deepfake-xai', category: 'Forensics & Media', tag: 'DEEPFAKE', Icon: ScanFace },
  { id: '05', title: 'File Checker', sub: 'Remove hidden GPS location from photos & check file fingerprints', path: '/exif', category: 'Forensics & Media', tag: 'PHOTO PRIVACY', Icon: Microscope },
  { id: '06', title: 'Identity Check', sub: 'Check if your password or identity appeared in data breaches', path: '/breach', category: 'Safety Tools', tag: 'LEAK CHECK', Icon: KeyRound },
  { id: '07', title: 'Latest Threats', sub: 'Recent scam alerts and security advisories across India', path: '/intel', category: 'Alerts & Learning', tag: 'ALERTS', Icon: Radar },
  { id: '01', title: 'Learn & Practice', sub: 'Interactive cybersecurity lessons and spot-the-scam quizzes', path: '/academy', category: 'Alerts & Learning', tag: 'LESSONS', Icon: GraduationCap },
  { id: '03', title: 'Code Scanner', sub: 'Check app code for exposed passwords or privacy mistakes', path: '/devsec', category: 'Safety Tools', tag: 'CODE CHECK', Icon: Code2 },
  { id: '09', title: 'Emergency Guide', sub: 'Step-by-step response plan if you or your team get hacked', path: '/cyber-ir', category: 'Complaints & Guides', tag: 'CHECKLIST', Icon: Scale },
  { id: '10', title: 'Make Videos', sub: 'Create cybersecurity awareness scripts and briefings', path: '/video-gen', category: 'Forensics & Media', tag: 'AWARENESS', Icon: Video },
  { id: '12', title: 'Research & Sources', sub: 'Academic papers, laws, and open-source tools used', path: '/research', category: 'Alerts & Learning', tag: 'SOURCES', Icon: Shield },
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

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown' && filtered.length > 0) {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp' && filtered.length > 0) {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault()
        onClose()
        router.push(filtered[selectedIndex].path)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filtered, onClose, router])

  function navigateTo(path: string) {
    onClose()
    router.push(path)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-10 sm:pt-24 px-3 sm:px-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] text-[#1A1A1A]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5E7EB] bg-[#F8F9FA] gap-3">
          <Search size={18} className="text-[#2563EB] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools (e.g. Message Checker, Complaint, Password, Deepfake)..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#6B7280] outline-none font-sans"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="text-[#6B7280] hover:text-[#1A1A1A] p-1 rounded-lg hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-[#6B7280]">
                No tools match <span className="text-[#1A1A1A] font-semibold">&quot;{query}&quot;</span>
              </p>
              {query.length > 2 && (
                <button
                  onClick={() => navigateTo(`/intel?q=${encodeURIComponent(query)}`)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#2563EB] hover:bg-[#DBEAFE] transition-colors cursor-pointer"
                >
                  <span>Search &quot;{query}&quot; in Latest Threats</span>
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
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                      : 'hover:bg-[#F8F9FA] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#F3F4F6] text-[#4B5563]'
                      }`}
                    >
                      <item.Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1A1A1A] truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] truncate mt-0.5">{item.sub}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280]">
                      {item.tag}
                    </span>
                    {isSelected && <CornerDownLeft size={13} className="text-[#2563EB]" />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
          <span>12 Tools Available</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
