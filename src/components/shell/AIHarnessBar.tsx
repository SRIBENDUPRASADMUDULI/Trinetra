'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Cpu, ShieldCheck, Activity, Zap, CheckCircle2, Lock, X, RefreshCw, AlertTriangle
} from 'lucide-react'
import { useLang } from '@/lib/i18n-context'

interface HarnessTelemetry {
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

interface PingResult {
  connected: boolean
  model: string
  latencyMs: number
  requestId: string | null
  status: string
  note?: string
}

const INITIAL_TELEMETRY: HarnessTelemetry = {
  provider: 'BharatCode Sovereign AI Gateway',
  baseUrl: 'https://bharatcode.ai/api/model/v1',
  activeModel: 'qwen-3.8-27b',
  fallbackModel: 'deepseek-v4.1-flash',
  models: ['qwen-3.8-27b', 'deepseek-v4.1-flash'],
  status: 'connected',
  latencyMs: 0,
  totalCalls: 0,
  lastRequestId: null,
  lastTimestamp: '',
  guardrails: {
    piiMaskedCount: 0,
    injectionBlockedCount: 0,
    statutoryEnforced: true,
  },
  tokenBudget: {
    estimatedUsed: 0,
    capacity: 8192,
  },
}

export function AIHarnessBar() {
  const { t } = useLang()
  const [telemetry, setTelemetry] = useState<HarnessTelemetry>(INITIAL_TELEMETRY)
  const [mounted, setMounted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [pingResult, setPingResult] = useState<PingResult | null>(null)
  const [pinging, setPinging] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry')
      if (!res.ok) return
      const data = await res.json()
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry)
      }
    } catch {
      // silent telemetry background poll
    }
  }

  useEffect(() => {
    fetchTelemetry()
    const timer = setInterval(fetchTelemetry, 8000)
    return () => clearInterval(timer)
  }, [])

  const handlePing = async () => {
    setPinging(true)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.ping) setPingResult(data.ping)
      if (data.telemetry) setTelemetry(data.telemetry)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ping request failed'
      setPingResult({
        connected: false,
        model: telemetry.activeModel,
        latencyMs: 0,
        requestId: null,
        status: 'ERROR',
        note: message,
      })
    } finally {
      setPinging(false)
    }
  }

  const isFallback = telemetry.status === 'fallback'
  const isOffline = telemetry.status === 'offline'

  const statusTone = isOffline
    ? { dot: 'bg-[#D64045]', text: 'text-[#D64045]', badge: 'bg-[#D64045]/10 border-[#D64045]/30 text-[#D64045]', label: 'OFFLINE' }
    : isFallback
      ? { dot: 'bg-[#FF9F1C]', text: 'text-[#FF9F1C]', badge: 'bg-[#FF9F1C]/10 border-[#FF9F1C]/30 text-[#FF9F1C]', label: 'FALLBACK' }
      : { dot: 'bg-[#00A896]', text: 'text-[#00A896]', badge: 'bg-[#00A896]/10 border-[#00A896]/30 text-[#00A896]', label: 'CONNECTED' }

  const modalContent =
    modalOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#172A45] border border-[#233554] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#0A192F] border-b border-[#233554] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#00A896]/10 border border-[#00A896]/30 flex items-center justify-center text-[#00A896]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#F8F9FA] font-serif">
                        {t('BharatCode AI Multi-Model Harness', 'भारतकोड एआई मल्टी-मॉडल हार्नेस')}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00A896]/15 text-[#00A896] border border-[#00A896]/30">
                        STATELESS · STORE: FALSE
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#8D99AE] mt-0.5">
                      Endpoint: {telemetry.baseUrl}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Close AI Diagnostics"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8D99AE] hover:text-[#F8F9FA] hover:bg-[#1E3554] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Active Routing Topology */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#00A896]/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#8D99AE]">Primary Route</span>
                      <span className={`w-2 h-2 rounded-full ${statusTone.dot}`} />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#F8F9FA]">{telemetry.activeModel}</div>
                    <div className="text-[10px] text-[#8D99AE] mt-1">Deep SecOps & Statutory FIR</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#233554]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#8D99AE]">Sub-Sec Fast</span>
                      <Zap className="w-3 h-3 text-[#FF9F1C]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#F8F9FA]">{telemetry.fallbackModel}</div>
                    <div className="text-[10px] text-[#8D99AE] mt-1">Low-latency triage fallback</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0A192F] border border-[#233554]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#8D99AE]">Deterministic Core</span>
                      <Lock className="w-3 h-3 text-[#00A896]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#F8F9FA]">Security Kernel</div>
                    <div className="text-[10px] text-[#8D99AE] mt-1">BNS 2023 / SHA-256 / PICERL</div>
                  </div>
                </div>

                {/* Live Telemetry Metrics (No Fake Defaults) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#0A192F] border border-[#233554]">
                    <div className="text-[10px] font-mono text-[#8D99AE] uppercase">Latency</div>
                    <div className="text-base font-mono font-bold text-[#00A896] mt-1">
                      {telemetry.latencyMs > 0 ? `${telemetry.latencyMs} ms` : 'Awaiting call'}
                    </div>
                    <div className="text-[10px] text-[#8D99AE]">Live probe RTT</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A192F] border border-[#233554]">
                    <div className="text-[10px] font-mono text-[#8D99AE] uppercase">Session Calls</div>
                    <div className="text-base font-mono font-bold text-[#F8F9FA] mt-1">
                      {telemetry.totalCalls}
                      <span className="text-xs font-normal text-[#8D99AE]"> reqs</span>
                    </div>
                    <div className="text-[10px] text-[#8D99AE]">
                      {telemetry.totalCalls === 0 ? 'Awaiting live calls' : 'Observed in runtime'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A192F] border border-[#233554]">
                    <div className="text-[10px] font-mono text-[#8D99AE] uppercase">PII Masked</div>
                    <div className="text-base font-mono font-bold text-[#00A896] mt-1">
                      {telemetry.guardrails.piiMaskedCount}
                    </div>
                    <div className="text-[10px] text-[#8D99AE]">[REDACTED-GOVT-ID]</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A192F] border border-[#233554]">
                    <div className="text-[10px] font-mono text-[#8D99AE] uppercase">Blocked Probes</div>
                    <div className="text-base font-mono font-bold text-[#FF9F1C] mt-1">
                      {telemetry.guardrails.injectionBlockedCount}
                    </div>
                    <div className="text-[10px] text-[#8D99AE]">Sec. 66 IT Act Guard</div>
                  </div>
                </div>

                {/* Guardrail Compliance Matrix */}
                <div className="p-4 rounded-lg bg-[#0A192F] border border-[#00A896]/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#00A896]">
                      <ShieldCheck className="w-4 h-4" />
                      Active Sovereign Defense Guardrails (DPDP Act 2023)
                    </div>
                    {telemetry.lastRequestId && (
                      <span className="text-[10px] font-mono text-[#8D99AE]">
                        Last ID: {telemetry.lastRequestId.slice(0, 14)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#F8F9FA]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                      <span>Stateless Execution (<code className="text-[#00A896] font-mono">store: false</code>)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                      <span>12-Digit Govt ID &amp; PAN Redaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                      <span>Offensive Exploit Refusal Filter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                      <span>BSA 2023 §63 Hash Provenance Ready</span>
                    </div>
                  </div>
                </div>

                {/* Live Ping Diagnostic */}
                <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs font-semibold text-[#F8F9FA]">
                        {t('Live Gateway Health Probe', 'लाइव गेटवे स्वास्थ्य जांच')}
                      </div>
                      <div className="text-[11px] text-[#8D99AE]">
                        Dispatches a stateless probe to verify BharatCode RTT and x-request-id headers.
                      </div>
                    </div>
                    <button
                      onClick={handlePing}
                      disabled={pinging}
                      className="px-4 py-2 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-[#0A192F] text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                      {pinging ? 'Probing...' : 'Ping BharatCode'}
                    </button>
                  </div>

                  {pingResult && (
                    <div
                      className={`p-3 rounded-lg border font-mono text-xs ${
                        pingResult.connected
                          ? 'bg-[#00A896]/10 border-[#00A896]/30 text-[#00A896]'
                          : 'bg-[#FF9F1C]/10 border-[#FF9F1C]/30 text-[#FF9F1C]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          {pingResult.connected ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          STATUS: {pingResult.status}
                        </span>
                        <span>RTT: {pingResult.latencyMs} ms</span>
                      </div>
                      {pingResult.requestId && (
                        <div className="mt-1 text-[11px] text-[#8D99AE]">
                          x-request-id: {pingResult.requestId}
                        </div>
                      )}
                      {pingResult.note && (
                        <div className="mt-1.5 text-[11px] text-[#F8F9FA]/85 font-sans">
                          {pingResult.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-[#0A192F] border-t border-[#233554] flex items-center justify-between text-[11px] text-[#8D99AE]">
                <span className="font-mono">Active Node: TRINETRA-SOC-DELHI-01</span>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#172A45] border border-[#233554] hover:border-[#00A896]/50 text-[#F8F9FA] font-medium transition-colors cursor-pointer"
                >
                  Close Diagnostics
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#172A45] hover:bg-[#1E3554] border border-[#233554] hover:border-[#00A896]/40 transition-colors group cursor-pointer"
        title="Inspect BharatCode AI Gateway Diagnostics"
      >
        <span className="relative flex h-2 w-2">
          {!isOffline && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${statusTone.dot}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusTone.dot}`} />
        </span>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="font-semibold text-[#F8F9FA] hidden sm:inline">AI Gateway</span>
          <span className="text-[#8D99AE] hidden sm:inline">/</span>
          <span className={`${statusTone.text} font-medium truncate max-w-[115px]`}>
            {telemetry.activeModel}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[#233554] text-[10px] font-mono text-[#8D99AE]">
          <Activity className="w-3 h-3 text-[#00A896]" />
          <span>{telemetry.latencyMs > 0 ? `${telemetry.latencyMs}ms` : 'IDLE'}</span>
          <span className={`ml-0.5 px-1.5 py-0.5 rounded border text-[9px] font-semibold ${statusTone.badge}`}>
            {statusTone.label}
          </span>
        </div>
      </button>

      {modalContent}
    </>
  )
}
