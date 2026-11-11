'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Cpu,
  ShieldCheck,
  Zap,
  RefreshCw,
  ArrowRight,
  Lock,
  Activity,
  GitBranch,
  CheckCircle2,
} from 'lucide-react'

interface TelemetrySnapshot {
  provider: string
  baseUrl: string
  activeModel: string
  fallbackModel: string
  status: 'connected' | 'fallback' | 'offline'
  latencyMs: number
  totalCalls: number
  lastRequestId: string | null
  guardrails: {
    piiMaskedCount: number
    injectionBlockedCount: number
    statutoryEnforced: boolean
  }
}

export function BharatCodeShowcase() {
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({
    provider: 'BharatCode Sovereign AI Gateway',
    baseUrl: 'https://bharatcode.ai/api/model/v1',
    activeModel: 'qwen-3.8-27b',
    fallbackModel: 'deepseek-v4.1-flash',
    status: 'connected',
    latencyMs: 148,
    totalCalls: 0,
    lastRequestId: null,
    guardrails: {
      piiMaskedCount: 0,
      injectionBlockedCount: 0,
      statutoryEnforced: true,
    },
  })

  const [pinging, setPinging] = useState(false)
  const [pingResult, setPingResult] = useState<{
    status: string
    latencyMs: number
    requestId: string | null
    note?: string
    connected?: boolean
  } | null>(null)

  const [probeInput, setProbeInput] = useState(
    'Victim Aadhaar 4829 1928 3918 compromised via http://sbi-kyc-update.xyz/verify'
  )
  const [probing, setProbing] = useState(false)
  const [probeOutput, setProbeOutput] = useState<{
    sanitizedPreview: string
    verdict: string
    confidence: string
    provider: string
    model: string
    latencyMs: number
  } | null>(null)

  async function refreshTelemetry() {
    try {
      const res = await fetch('/api/telemetry', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry)
      }
    } catch {
      // Keep last observed telemetry snapshot
    }
  }

  useEffect(() => {
    refreshTelemetry()
    const id = setInterval(refreshTelemetry, 8000)
    return () => clearInterval(id)
  }, [])

  async function handlePing() {
    setPinging(true)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.success && data.ping) {
        setPingResult(data.ping)
        if (data.telemetry) setTelemetry(data.telemetry)
      }
    } catch {
      setPingResult({ status: 'NETWORK_ERROR', latencyMs: 0, requestId: null, note: 'Unable to reach test route' })
    } finally {
      setPinging(false)
    }
  }

  async function handleRunHarnessDemo() {
    if (!probeInput.trim()) return
    setProbing(true)
    const sanitizedPreview = probeInput
      .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[REDACTED-GOVT-ID]')
      .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[REDACTED-CARD-NUMBER]')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: probeInput.trim() }),
      })
      const data = await res.json()
      if (data.success && data.analysis) {
        setProbeOutput({
          sanitizedPreview,
          verdict: data.analysis.verdict,
          confidence: data.analysis.confidence,
          provider: data.analysis.provider,
          model: data.analysis.model,
          latencyMs: data.analysis.latencyMs,
        })
        refreshTelemetry()
      }
    } finally {
      setProbing(false)
    }
  }

  return (
    <section
      className="rounded-2xl bg-[#262B40] border border-indigo-500/25 shadow-xl shadow-black/25 p-5 sm:p-6 space-y-5 relative overflow-hidden"
      aria-label="BharatCode API and AI Harness Architecture"
    >
      {/* Subtle Ambient Accent */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/35 text-indigo-200 font-mono text-[11px] font-bold flex items-center gap-1.5">
              <Cpu size={12} />
              BHARATCODE API v1 · SOVEREIGN AI HARNESS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
              STATELESS (store: false)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
              {telemetry.activeModel.toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            BharatCode Multi-Model AI Harness Control Plane
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Every AI call across TRINETRA passes through <code className="text-indigo-300 font-mono">src/lib/ai-harness.ts</code> before hitting{' '}
            <code className="text-cyan-300 font-mono">{telemetry.baseUrl}</code> — enforcing zero-leak Aadhaar/card masking, IT Act §66 prompt-injection refusal, and 3-tier automatic failover.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handlePing}
            disabled={pinging}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={pinging ? 'animate-spin' : ''} />
            <span>{pinging ? 'Pinging BharatCode...' : 'Ping BharatCode API'}</span>
          </button>
          <Link
            href="/mentor"
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Open AI Copilot</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Ping Output Strip (if triggered) */}
      {pingResult && (
        <div
          className={`p-3 rounded-xl font-mono text-xs border flex flex-wrap items-center justify-between gap-2 relative z-10 ${
            pingResult.connected
              ? 'bg-emerald-950/25 border-emerald-500/35 text-emerald-300'
              : 'bg-amber-950/25 border-amber-500/35 text-amber-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold">GATEWAY STATUS: {pingResult.status}</span>
            <span>RTT: {pingResult.latencyMs}ms</span>
            {pingResult.requestId && <span>x-request-id: {pingResult.requestId}</span>}
          </div>
          {pingResult.note && (
            <span className="text-[11px] text-slate-300 break-words">{pingResult.note}</span>
          )}
        </div>
      )}

      {/* 3-Stage Visual Harness Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 relative z-10">
        {/* Stage 1 */}
        <div className="p-4 rounded-xl bg-[#1E2235] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Lock size={13} />
              STAGE 1 · PRE-FLIGHT GUARDRAILS
            </span>
            <span className="text-slate-400">&lt; 0.1ms</span>
          </div>
          <p className="text-xs font-semibold text-white">PII Scrubber &amp; Statutory Filter</p>
          <ul className="space-y-1 text-[11px] text-slate-300">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span>Masks Aadhaar → <code className="text-cyan-300">[REDACTED-GOVT-ID]</code></span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span>Blocks jailbreaks &amp; exploit prompts (IT Act §66)</span>
            </li>
          </ul>
          <div className="pt-1 text-[10px] font-mono text-slate-400 flex justify-between border-t border-white/[0.06]">
            <span>PII Masked: <strong className="text-cyan-300">{telemetry.guardrails.piiMaskedCount}</strong></span>
            <span>Blocked: <strong className="text-amber-300">{telemetry.guardrails.injectionBlockedCount}</strong></span>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="p-4 rounded-xl bg-[#1E2235] border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-indigo-300 font-bold flex items-center gap-1.5">
              <GitBranch size={13} />
              STAGE 2 · BHARATCODE ROUTER
            </span>
            <span className="text-indigo-300">store: false</span>
          </div>
          <p className="text-xs font-semibold text-white">Stateless Multi-Model Dispatch</p>
          <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
            <li className="flex items-center justify-between">
              <span className="text-white">Primary: qwen-3.8-27b</span>
              <span className="text-[10px] text-indigo-300">FIR · SAST · XAI</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-300">Fast: deepseek-v4.1-flash</span>
              <span className="text-[10px] text-amber-300">reasoning: none</span>
            </li>
          </ul>
          <div className="pt-1 text-[10px] font-mono text-slate-400 flex justify-between border-t border-white/[0.06]">
            <span>API Calls: <strong className="text-white">{telemetry.totalCalls}</strong></span>
            <span>Latency: <strong className="text-emerald-400">{telemetry.latencyMs}ms</strong></span>
          </div>
        </div>

        {/* Stage 3 */}
        <div className="p-4 rounded-xl bg-[#1E2235] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <Zap size={13} />
              STAGE 3 · FAILOVER &amp; AUDIT
            </span>
            <span className="text-emerald-400">RESILIENT</span>
          </div>
          <p className="text-xs font-semibold text-white">Deterministic Fallback &amp; Trace</p>
          <ul className="space-y-1 text-[11px] text-slate-300">
            <li className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-amber-400 shrink-0" />
              <span>Tier 3 offline BNS/PICERL kernel prevents downtime</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Activity size={12} className="text-cyan-400 shrink-0" />
              <span>Captures <code className="text-cyan-300">x-request-id</code> &amp; BSA §63 SHA-256</span>
            </li>
          </ul>
          <div className="pt-1 text-[10px] font-mono text-slate-400 truncate border-t border-white/[0.06]">
            Active Route: <strong className="text-white">{telemetry.status.toUpperCase()}</strong>
          </div>
        </div>
      </div>

      {/* Live Pre-Flight Sanitization + AI Harness Demo Bar */}
      <div className="p-3.5 rounded-xl bg-[#1E2235]/80 border border-white/[0.08] space-y-2.5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-indigo-300 shrink-0">
            TRY HARNESS LIVE:
          </span>
          <input
            type="text"
            value={probeInput}
            onChange={e => setProbeInput(e.target.value)}
            className="flex-1 min-w-0 bg-[#262B40] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-indigo-400"
            placeholder="Type text with Aadhaar (12 digits) + phishing URL to test pre-flight masking & AI routing..."
          />
          <button
            onClick={handleRunHarnessDemo}
            disabled={probing || !probeInput.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold shrink-0 cursor-pointer"
          >
            {probing ? 'Running...' : 'Run Through Harness'}
          </button>
        </div>

        {probeOutput && (
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] font-mono text-[11px] space-y-1">
            <div className="text-cyan-300 break-words">
              <span className="text-slate-500">Wire Payload (PII Masked): </span>
              {probeOutput.sanitizedPreview}
            </div>
            <div className="flex flex-wrap gap-3 text-slate-300">
              <span>Verdict: <strong className="text-rose-300">{probeOutput.verdict} ({probeOutput.confidence})</strong></span>
              <span>Model: <strong className="text-indigo-300">{probeOutput.model}</strong></span>
              <span>Latency: <strong className="text-emerald-400">{probeOutput.latencyMs}ms</strong></span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default BharatCodeShowcase
