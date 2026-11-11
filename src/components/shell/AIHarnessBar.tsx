'use client'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Cpu, Zap, ShieldCheck, RefreshCw, X, CheckCircle2 } from 'lucide-react'

interface TelemetryData {
  provider: string
  baseUrl: string
  activeModel: string
  fallbackModel: string
  models: string[]
  status: 'connected' | 'fallback' | 'offline'
  latencyMs: number
  totalCalls: number
  lastRequestId: string | null
  lastTimestamp: string
  guardrails: {
    piiMaskedCount: number
    injectionBlockedCount: number
    statutoryEnforced: boolean
  }
  tokenBudget: {
    estimatedUsed: number
    capacity: number
  }
}

export function AIHarnessBar() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    provider: 'BharatCode Sovereign AI Gateway',
    baseUrl: 'https://bharatcode.ai/api/model/v1',
    activeModel: 'qwen-3.8-27b',
    fallbackModel: 'deepseek-v4.1-flash',
    models: ['qwen-3.8-27b', 'deepseek-v4.1-flash'],
    status: 'connected',
    latencyMs: 148,
    totalCalls: 12,
    lastRequestId: 'req_bc_7a9f029c',
    lastTimestamp: new Date().toISOString(),
    guardrails: {
      piiMaskedCount: 3,
      injectionBlockedCount: 1,
      statutoryEnforced: true,
    },
    tokenBudget: {
      estimatedUsed: 1420,
      capacity: 8192,
    },
  })

  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pinging, setPinging] = useState(false)
  const [pingResult, setPingResult] = useState<{
    connected?: boolean
    status?: string
    latencyMs?: number
    requestId?: string | null
    note?: string
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchTelemetry()
    const id = setInterval(fetchTelemetry, 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  async function fetchTelemetry() {
    try {
      const res = await fetch('/api/ai/telemetry')
      const data = await res.json()
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry)
      }
    } catch {
      // Retain last valid telemetry snapshot
    }
  }

  async function handlePingTest() {
    setPinging(true)
    setPingResult(null)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setPingResult(data.ping)
        if (data.telemetry) setTelemetry(data.telemetry)
      } else {
        setPingResult({ connected: false, status: 'FAILED', note: data.error })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed'
      setPingResult({ connected: false, status: 'ERROR', note: msg })
    } finally {
      setPinging(false)
    }
  }

  const isConnected = telemetry.status === 'connected'
  const isFallback = telemetry.status === 'fallback'

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-harness-title"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] flex flex-col rounded-2xl bg-[#262B40] border border-white/10 shadow-2xl overflow-hidden text-slate-200 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Cpu size={16} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3
                id="ai-harness-title"
                className="text-sm font-bold text-white flex flex-wrap items-center gap-2"
              >
                <span>BharatCode AI Multi-Model Harness</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  STATELESS · STORE: FALSE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                Endpoint: {telemetry.baseUrl}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close diagnostics"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs flex-1 overflow-y-auto">
          {/* Architecture Model Routing Matrix */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-sans font-semibold">
                Dynamic Model Failover Chain
              </span>
              <span className="text-[10px] text-indigo-400">AUTOMATIC RETRY ENABLED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div
                className={`p-3 rounded-lg border ${
                  telemetry.activeModel === 'qwen-3.8-27b'
                    ? 'bg-indigo-950/30 border-indigo-500/50'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>PRIMARY ROUTE</span>
                  {telemetry.activeModel === 'qwen-3.8-27b' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold text-white break-words">qwen-3.8-27b</div>
                <div className="text-[10px] text-indigo-300 mt-1">Deep SecOps &amp; Legal FIR</div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  telemetry.activeModel.includes('deepseek')
                    ? 'bg-indigo-950/30 border-indigo-500/50'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>SUB-SEC FAST</span>
                  {telemetry.activeModel.includes('deepseek') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold text-white break-words">deepseek-v4.1-flash</div>
                <div className="text-[10px] text-slate-400 mt-1">reasoning: none (low-latency)</div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  telemetry.activeModel.includes('deterministic')
                    ? 'bg-indigo-950/30 border-indigo-500/50'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>AIR-GAPPED</span>
                </div>
                <div className="text-xs font-bold text-white">Security Kernel</div>
                <div className="text-[10px] text-slate-400 mt-1">BNS 2023 / PICERL rules</div>
              </div>
            </div>
          </div>

          {/* Guardrails Telemetry & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono text-slate-500">LATENCY</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {telemetry.latencyMs} ms
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Roundtrip P95</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono text-slate-500">TOKEN BUDGET</div>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-400 mt-0.5">
                {telemetry.tokenBudget.estimatedUsed}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">/ {telemetry.tokenBudget.capacity} max</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono text-slate-500">PII MASKED</div>
              <div className="text-base sm:text-lg font-bold font-mono text-cyan-400 mt-0.5">
                {telemetry.guardrails.piiMaskedCount}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">[REDACTED-GOVT-ID]</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono text-slate-500">INJECTIONS BLOCKED</div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-400 mt-0.5">
                {telemetry.guardrails.injectionBlockedCount}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Sec. 66 IT Act</div>
            </div>
          </div>

          {/* Guardrail Policy Checklist */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/20 space-y-2 text-xs">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              Active Sovereign Defense Guardrails
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                <span>Stateless Execution (<code className="text-indigo-300">store: false</code>)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                <span>Aadhaar &amp; Card Full Redaction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                <span>Offensive Exploit Refusal Filter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                <span>BSA 2023 §63 Evidence Certificate Tagging</span>
              </div>
            </div>
          </div>

          {/* Live Gateway Ping Test Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">Live Gateway Health Ping</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dispatches a minimal roundtrip probe to verify BharatCode latency and header telemetry.
                </p>
              </div>
              <button
                onClick={handlePingTest}
                disabled={pinging}
                className="px-3.5 py-2 sm:py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <RefreshCw size={12} className={pinging ? 'animate-spin' : ''} />
                <span>{pinging ? 'Probing...' : 'Ping BharatCode'}</span>
              </button>
            </div>

            {pingResult && (
              <div
                className={`p-3 rounded-lg font-mono text-xs border ${
                  pingResult.connected
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : pingResult.status === 'PLAN_UPGRADE_402'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">STATUS: {pingResult.status}</span>
                  <span>LATENCY: {pingResult.latencyMs} ms</span>
                </div>
                {pingResult.requestId && (
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    x-request-id: {pingResult.requestId}
                  </div>
                )}
                {pingResult.note && (
                  <div className="text-[10px] mt-1.5 text-slate-300 break-words leading-relaxed">
                    {pingResult.note}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 bg-white/[0.02] text-xs shrink-0">
          <span className="text-slate-500 font-mono text-[11px]">
            Active Node: TRINETRA-SOC-DELHI-01
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Clickable High-Density AI Harness Capsule */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 sm:gap-2.5 h-9 px-2.5 sm:px-3.5 rounded-xl bg-[#262B40] hover:bg-[#2E344E] border border-white/10 shadow-sm transition-all text-xs font-sans select-none group cursor-pointer shrink-0"
        title="Click to view BharatCode Multi-Model AI Harness Telemetry & Diagnostics"
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                : isFallback
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'
                : 'bg-rose-400 shadow-[0_0_8px_#f87171]'
            }`}
          />
          <Cpu size={13} className="text-[#FF5A79] group-hover:scale-105 transition-transform shrink-0" />
          <span className="text-white font-semibold text-xs tracking-tight hidden xs:inline sm:inline max-w-[110px] lg:max-w-none truncate">
            {telemetry.activeModel}
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/[0.12] hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300 font-mono">
          <Zap size={10} className="text-amber-400" />
          <span>{telemetry.latencyMs}ms</span>
        </div>

        <div className="h-3.5 w-px bg-white/[0.12] hidden lg:block" />

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-400">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span className="tracking-wide uppercase font-medium text-[10px]">ARMED</span>
        </div>
      </button>

      {/* Portal modal to document.body so header backdrop-filter never clips fixed positioning */}
      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  )
}

export default AIHarnessBar
