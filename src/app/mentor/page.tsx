'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
  Send, RotateCcw, Copy, Check, Terminal, Eye,
  Sparkles, Cpu, ShieldCheck, HelpCircle, Activity
} from 'lucide-react'
import { consumeTokenStream } from '@/lib/sse-stream'
import { InfoExplain } from '@/components/ui/InfoExplain'

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
    content: `TRINETRA — Cyber Defense AI
Operational. Ready to assist.

Areas of expertise:
• Incident Triage — Ransomware containment, UPI fraud freezes, account takeover response
• Indian Cyber Law — BNS 2023, IT Act 2000, CERT-In 6-hour reporting directives
• Threat Intelligence — MITRE ATT&CK TTP mapping, CVE analysis, IOC correlation

Type your question or select a prompt below to begin.`,
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
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const [pinging, setPinging] = useState(false)
  const [pingBadge, setPingBadge] = useState<string | null>(null)
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
    setErrorBanner(null)
    setLoading(true)
    const agentId = `a-${Date.now()}`
    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text.trim() }],
          stream: true,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream')) {
        const agentTs = timestamp()
        setMessages(prev => [...prev, { id: agentId, role: 'agent', content: '', ts: agentTs }])
        setLoading(false)
        await consumeTokenStream(res, accumulated => {
          setMessages(prev =>
            prev.map(m => (m.id === agentId ? { ...m, content: accumulated } : m))
          )
        })
      } else {
        const data = await res.json()
        const agentMsg: Message = { id: agentId, role: 'agent', content: data.content, ts: timestamp() }
        setMessages(prev => [...prev, agentMsg])
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Connection failed'
      setErrorBanner(`SecOps Copilot request failed (${errMsg}). Check API configuration.`)
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, role: 'agent', ts: timestamp(),
        content: '[ERROR] Connection to AI kernel failed. Check network and BHARATCODE_API_KEY configuration.',
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

  async function handlePingBharatCode() {
    setPinging(true)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.success && data.ping) {
        setPingBadge(`${data.ping.status} · ${data.ping.latencyMs}ms${data.ping.requestId ? ' · ' + data.ping.requestId : ''}`)
      } else {
        setPingBadge('PING_FAILED')
      }
    } catch {
      setPingBadge('PING_ERROR')
    } finally {
      setPinging(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[600px] overflow-hidden bg-white rounded-xl border border-[#E5E7EB] shadow-xs">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        {/* Terminal Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Eye size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-wide">
                AI Cyber Safety Assistant
              </h1>
              <p className="text-[11px] text-slate-600">
                Ask any cybersecurity or online scam question in plain language
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handlePingBharatCode}
              disabled={pinging}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-[#2563EB] hover:bg-[#DBEAFE] rounded-full bg-[#EFF6FF] border border-[#BFDBFE] transition-colors cursor-pointer disabled:opacity-50"
              title="Verify BharatCode Gateway Connectivity"
            >
              <Activity size={12} className={pinging ? 'animate-spin' : ''} />
              <span>{pinging ? 'Pinging...' : pingBadge || 'Ping BharatCode'}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-full bg-slate-50 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
            <InfoExplain
              title="AI Cyber Safety Assistant"
              whatIsIt="A safe AI chat assistant where you can ask questions about scams, hacked accounts, privacy laws, or security steps."
              whoShouldUse="Anyone who has a security doubt or wants clear advice without technical jargon."
              whatResultMeans="Gives practical defense steps. Always verify legal sections or banking instructions with official sources."
            />
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STREAMING READY
            </span>
          </div>
        </div>

        {/* Message Log Transcript */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FA]"
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.role === 'agent'
                  ? 'bg-indigo-500/20 text-indigo-700 border border-indigo-500/30'
                  : 'bg-slate-50 text-slate-900 border border-slate-200'
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
                      className="text-slate-600 hover:text-slate-900 ml-1.5"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-[#15803D]" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>

                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'agent'
                    ? 'glass-card text-slate-800 border-slate-200 whitespace-pre-wrap'
                    : 'bg-[#2563EB] text-white font-medium shadow-xs ml-auto'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {errorBanner && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-center justify-between gap-2">
              <span>{errorBanner}</span>
              <button onClick={() => setErrorBanner(null)} className="text-[10px] underline cursor-pointer">Dismiss</button>
            </div>
          )}

          {loading && (
            <div className="flex gap-4 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-700 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Eye size={16} />
              </div>
              <div className="p-4 rounded-2xl glass-card text-xs text-slate-600 space-y-2 flex-1 animate-pulse">
                <div className="flex items-center gap-2">
                  <span>Synthesizing tactical defense response</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                </div>
                <div className="h-2.5 bg-slate-50 rounded w-5/6" />
                <div className="h-2.5 bg-slate-50 rounded w-2/3" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Inquiries (Pills) */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2 flex-shrink-0">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
            Suggested Quick Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((item, i) => (
              <button
                key={i}
                onClick={() => { setInput(item.query); inputRef.current?.focus() }}
                className="text-xs px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-rose-500/30 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
          <p className="text-[10px] text-slate-500 mb-2 px-1">
            AI-assisted indication — verify legal citations and remediation commands manually before action.
          </p>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 focus-within:border-rose-500/60 rounded-full px-4 py-2 transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !loading) sendMessage(input) }}
              placeholder="Ask about active attacks, BNS 2023 legal sections, ransomware containment..."
              className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-500"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-2 rounded-full text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 shadow-xs transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Intelligence Sidebar */}
      <div className="w-80 bg-[#F8F9FA] border-l border-[#E5E7EB] p-5 space-y-4 overflow-y-auto hidden xl:block text-xs">
        <div className="p-4 rounded-2xl glass-card space-y-3">
          <div className="flex items-center gap-2 text-[#2563EB] font-bold">
            <Cpu size={16} />
            <span>AI Engine Specifications</span>
          </div>
          <div className="space-y-2 text-slate-700">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Engine:</span>
              <strong className="text-slate-900 font-mono">TRINETRA SecOps Core</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Architecture:</span>
              <strong className="text-slate-900">Hybrid Transformer-AST</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Latency:</span>
              <strong className="text-[#15803D] font-mono">&lt; 1,200 ms</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Domain:</span>
              <strong className="text-slate-800">SecOps & Indian Law</strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-3">
          <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1.5">
            Knowledge Capabilities
          </span>
          <ul className="space-y-2 text-slate-600 text-xs">
            <li>• <strong>Bharatiya Nyaya Sanhita (BNS 2023)</strong> criminal sections.</li>
            <li>• <strong>Information Technology Act 2000</strong> (§43, §66C, §66D).</li>
            <li>• <strong>CERT-In 2022 Directions</strong> & 6-hour disclosure rule.</li>
            <li>• <strong>MITRE ATT&CK v14</strong> enterprise techniques.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] space-y-1">
          <span className="font-bold text-emerald-700 block">Confidentiality Guarantee</span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Incident queries are processed in an isolated memory buffer and never retained for public model training.
          </p>
        </div>
      </div>
    </div>
  )
}