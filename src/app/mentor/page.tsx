'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
  Send, RotateCcw, Copy, Check, Terminal, Eye,
  Sparkles, Cpu, ShieldCheck, HelpCircle, Activity
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  ts: string
}

const INITIAL_CONVERSATION: Message[] = [
  {
    id: 'msg-0',
    role: 'agent',
    ts: '02:10:14',
    content: `TRINETRA_AI // SEC-OPS DEFENSE KERNEL
Connected to 120B Tactical Reasoning Engine (Groq Hardware Accelerated LPU).

I am your sovereign cyber defense copilot specialized in:
• Live Incident Triage: Ransomware containment, unauthorized UPI / bank transfer freezes, account takeover.
• Indian Cyber Law: Bharatiya Nyaya Sanhita (BNS) 2023, Information Technology Act 2000, CERT-In 6-Hour reporting directions.
• Threat Intelligence: MITRE ATT&CK TTP mapping, CVE research, malware disassembly triage.

Click any question prompt below or describe your emergency situation.`,
  },
]

const PROMPT_SUGGESTIONS = [
  {
    category: 'EMERGENCY FRAUD',
    label: '🚨 Immediate steps for unauthorized UPI debit',
    query: 'What are the exact immediate steps to take if money was debited from my bank via unauthorized UPI fraud in India?',
  },
  {
    category: 'COMPLIANCE',
    label: '⚖️ CERT-In 6-hour reporting rule explained',
    query: 'Explain the mandatory CERT-In 6-hour cyber incident reporting direction in simple terms for an Indian organization.',
  },
  {
    category: 'HARDENING',
    label: '🛡️ How to secure a home Wi-Fi & router',
    query: 'What are the top 5 essential hardening steps to protect a home Wi-Fi network and router against remote takeover and DNS hijacking?',
  },
  {
    category: 'RANSOMWARE',
    label: '🦠 How to contain an active LockBit outbreak',
    query: 'A server has been infected with ransomware and files are encrypted. What should the SOC team do in the first 30 minutes?',
  },
  {
    category: 'FORENSICS',
    label: '🔍 How EXIF metadata can leak location',
    query: 'How do digital forensics investigators extract GPS coordinates from photos, and what tools can strip this metadata?',
  },
]

function timestamp() {
  return new Date().toTimeString().slice(0, 8)
}

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_CONVERSATION)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  async function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim(), ts: timestamp() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: text.trim() }] }),
      })
      const data = await res.json()
      const agentMsg: Message = { id: `a-${Date.now()}`, role: 'agent', content: data.content, ts: timestamp() }
      setMessages(prev => [...prev, agentMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, role: 'agent', ts: timestamp(),
        content: '[ERROR] Connection to AI kernel failed. Check network and LLM_API_KEY configuration.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleReset() {
    setMessages(INITIAL_CONVERSATION)
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0A0E17]">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.08]">
        {/* Terminal Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-[#0F1523]/90 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Eye size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">
                02 // TRINETRA SecOps AI Defense Copilot
              </h1>
              <p className="text-[11px] text-slate-400">
                Powered by Groq 120B reasoning kernel & Indian Cyber Law Knowledge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
              title="Reset conversation"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              120B KERNEL READY
            </span>
          </div>
        </div>

        {/* Message Log Transcript */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.role === 'agent'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-white/[0.08] text-white border border-white/[0.12]'
              }`}>
                {msg.role === 'agent' ? <Eye size={16} /> : 'OP'}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className={`flex items-center gap-2 text-[11px] text-slate-500 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <span>{msg.role === 'agent' ? 'TRINETRA_AI' : 'OPERATOR'}</span>
                  <span>•</span>
                  <span>{msg.ts}</span>
                  {msg.role === 'agent' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-slate-400 hover:text-white ml-1.5"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>

                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'agent'
                    ? 'glass-card text-slate-200 border-white/[0.08] whitespace-pre-wrap'
                    : 'bg-gradient-to-r from-rose-600 to-red-600 text-white font-medium shadow-md shadow-rose-950/40 ml-auto'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Eye size={16} />
              </div>
              <div className="p-4 rounded-2xl glass-card text-xs text-slate-400 flex items-center gap-2">
                <span>Synthesizing tactical defense response</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Inquiries (Pills) */}
        <div className="p-4 bg-[#0F1523]/90 border-t border-white/[0.08] space-y-2 flex-shrink-0">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
            Suggested Quick Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((item, i) => (
              <button
                key={i}
                onClick={() => { setInput(item.query); inputRef.current?.focus() }}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white border border-white/[0.08] hover:border-rose-500/30 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0F1523]/90 border-t border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] focus-within:border-rose-500/60 rounded-full px-4 py-2 transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !loading) sendMessage(input) }}
              placeholder="Ask about active attacks, BNS 2023 legal sections, ransomware containment..."
              className="flex-1 text-xs bg-transparent outline-none text-slate-200 placeholder:text-slate-500"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-2 rounded-full text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 shadow-md transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Intelligence Sidebar */}
      <div className="w-80 bg-[#0B0D13]/60 p-5 space-y-5 overflow-y-auto hidden xl:block text-xs">
        <div className="p-4 rounded-2xl glass-card space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Cpu size={16} />
            <span>AI Engine Specifications</span>
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-500">Model:</span>
              <strong className="text-white font-mono">GPT-OSS 120B</strong>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-500">Hardware:</span>
              <strong className="text-white">Groq LPU Array</strong>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-500">Tested Speed:</span>
              <strong className="text-emerald-400 font-mono">~1,200 ms</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Domain:</span>
              <strong className="text-slate-200">SecOps & Indian Law</strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-3">
          <span className="font-bold text-slate-200 block border-b border-white/[0.06] pb-1.5">
            Knowledge Capabilities
          </span>
          <ul className="space-y-2 text-slate-400 text-xs">
            <li>• <strong>Bharatiya Nyaya Sanhita (BNS 2023)</strong> criminal sections.</li>
            <li>• <strong>Information Technology Act 2000</strong> (§43, §66C, §66D).</li>
            <li>• <strong>CERT-In 2022 Directions</strong> & 6-hour disclosure rule.</li>
            <li>• <strong>MITRE ATT&CK v14</strong> enterprise techniques.</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300 space-y-1">
          <span className="font-bold text-emerald-300 block">Confidentiality Guarantee</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Incident queries are processed in an isolated memory buffer and never retained for public model training.
          </p>
        </div>
      </div>
    </div>
  )
}
