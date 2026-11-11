'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  lastGatewayStatus?: string
  bharatcodeReachable?: boolean
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
  lastGatewayStatus: 'PROBING',
  bharatcodeReachable: false,
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
  const [autoHeartbeat, setAutoHeartbeat] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry')
      if (!res.ok) return
      const data = await res.json()
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry)
      }
    } catch {
      // silent background poll
    }
  }, [])

  const handlePing = useCallback(async () => {
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
  }, [telemetry.activeModel])

  // Initial automatic live probe to BharatCode API key + 30s visible-tab keepalive
  useEffect(() => {
    handlePing()
    const telemetryTimer = setInterval(fetchTelemetry, 8000)
    const heartbeatTimer = setInterval(() => {
      if (autoHeartbeat && document.visibilityState === 'visible') {
        handlePing()
      }
    }, 30000)

    return () => {
      clearInterval(telemetryTimer)
      clearInterval(heartbeatTimer)
    }
  }, [autoHeartbeat, fetchTelemetry, handlePing])

  const isOffline = telemetry.status === 'offline'
  const isLiveOk = telemetry.lastGatewayStatus === 'OK_200'
  const isKeyReached = telemetry.bharatcodeReachable || telemetry.lastGatewayStatus === 'PLAN_UPGRADE_402'

  const statusTone = isOffline
    ? { dot: 'bg-[#FF1B1B]', text: 'text-[#FF1B1B]', badge: 'bg-[#FF1B1B]/10 border-[#FF1B1B]/45 text-[#FF1B1B]', label: 'OFFLINE' }
    : isLiveOk
      ? { dot: 'bg-[#00FF9D]', text: 'text-[#00FF9D]', badge: 'bg-[#00FF9D]/15 border-[#00FF9D]/40 text-[#00FF9D]', label: 'API LIVE' }
      : isKeyReached
        ? { dot: 'bg-[#00D4FF]', text: 'text-[#00D4FF]', badge: 'bg-[#FF9F1C]/15 border-[#FF9F1C]/45 text-[#FF9F1C]', label: 'KEY REACHED · 402' }
        : { dot: 'bg-[#FF9F1C]', text: 'text-[#FF9F1C]', badge: 'bg-[#FF9F1C]/10 border-[#FF9F1C]/40 text-[#FF9F1C]', label: 'FALLBACK' }

  const modalContent =
    modalOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0A0A12] border border-[#1A1A2E] rounded-xl w-full max-w-2xl shadow-[0_0_36px_rgba(0,212,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#03030A] border-b border-[#1A1A2E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#00D4FF]/15 border border-[#00D4FF]/40 flex items-center justify-center text-[#00D4FF]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#F5F5F5] font-serif">
                        {t('BharatCode AI Multi-Model Harness', 'भारतकोड एआई मल्टी-मॉडल हार्नेस')}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/30">
                        STATELESS · STORE: FALSE
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#888888] mt-0.5">
                      Endpoint: {telemetry.baseUrl}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Close AI Diagnostics"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888888] hover:text-[#F5F5F5] hover:bg-[#1A1A2E] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#03030A] border border-[#00D4FF]/35">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#888888]">Primary Route</span>
                      <span className={`w-2 h-2 rounded-full ${statusTone.dot}`} />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#F5F5F5]">{telemetry.activeModel}</div>
                    <div className="text-[10px] text-[#888888] mt-1">Deep SecOps & Statutory FIR</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#03030A] border border-[#1A1A2E]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#888888]">Sub-Sec Fast</span>
                      <Zap className="w-3 h-3 text-[#FF9F1C]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#F5F5F5]">{telemetry.fallbackModel}</div>
                    <div className="text-[10px] text-[#888888] mt-1">Low-latency triage fallback</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#03030A] border border-[#1A1A2E]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#888888]">Gateway HTTP</span>
                      <Lock className="w-3 h-3 text-[#00FF9D]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#FF9F1C]">
                      {telemetry.lastGatewayStatus || 'PROBING'}
                    </div>
                    <div className="text-[10px] text-[#888888] mt-1">
                      {telemetry.bharatcodeReachable ? 'Key reaches bharatcode.ai' : 'Checking connectivity'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#03030A] border border-[#1A1A2E]">
                    <div className="text-[10px] font-mono text-[#888888] uppercase">Gateway RTT</div>
                    <div className="text-base font-mono font-bold text-[#00FF9D] mt-1">
                      {telemetry.latencyMs > 0 ? `${telemetry.latencyMs} ms` : 'Probing...'}
                    </div>
                    <div className="text-[10px] text-[#888888]">bharatcode.ai RTT</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#03030A] border border-[#1A1A2E]">
                    <div className="text-[10px] font-mono text-[#888888] uppercase">Session Calls</div>
                    <div className="text-base font-mono font-bold text-[#F5F5F5] mt-1">
                      {telemetry.totalCalls}
                      <span className="text-xs font-normal text-[#888888]"> reqs</span>
                    </div>
                    <div className="text-[10px] text-[#888888]">Live API dispatches</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#03030A] border border-[#1A1A2E]">
                    <div className="text-[10px] font-mono text-[#888888] uppercase">PII Masked</div>
                    <div className="text-base font-mono font-bold text-[#00D4FF] mt-1">
                      {telemetry.guardrails.piiMaskedCount}
                    </div>
                    <div className="text-[10px] text-[#888888]">[REDACTED-GOVT-ID]</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#03030A] border border-[#1A1A2E]">
                    <div className="text-[10px] font-mono text-[#888888] uppercase">Blocked Probes</div>
                    <div className="text-base font-mono font-bold text-[#FF1B1B] mt-1">
                      {telemetry.guardrails.injectionBlockedCount}
                    </div>
                    <div className="text-[10px] text-[#888888]">Sec. 66 IT Act Guard</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#03030A] border border-[#00D4FF]/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#00D4FF]">
                      <ShieldCheck className="w-4 h-4" />
                      Active Sovereign Defense Guardrails (DPDP Act 2023)
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoHeartbeat(v => !v)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] border cursor-pointer ${
                        autoHeartbeat
                          ? 'bg-[#00FF9D]/10 border-[#00FF9D]/35 text-[#00FF9D]'
                          : 'bg-[#0A0A12] border-[#1A1A2E] text-[#888888]'
                      }`}
                    >
                      Auto-Ping 30s: {autoHeartbeat ? 'ON' : 'PAUSED'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#F5F5F5]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9D] shrink-0" />
                      <span>Stateless Execution (<code className="text-[#00FF9D] font-mono">store: false</code>)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9D] shrink-0" />
                      <span>12-Digit Govt ID &amp; PAN Redaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9D] shrink-0" />
                      <span>Automatic Failover to Security Kernel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9D] shrink-0" />
                      <span>BSA 2023 §63 Hash Provenance Ready</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#03030A] border border-[#1A1A2E] space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs font-semibold text-[#F5F5F5]">
                        {t('Live BharatCode API Key Probe', 'लाइव भारतकोड एपीआई कुंजी जांच')}
                      </div>
                      <div className="text-[11px] text-[#888888]">
                        Dispatches live requests with configured BHARATCODE_API_KEY to verify RTT &amp; tier status.
                      </div>
                    </div>
                    <button
                      onClick={handlePing}
                      disabled={pinging}
                      className="px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00b8de] text-[#03030A] text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_16px_rgba(0,212,255,0.3)]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                      {pinging ? 'Probing...' : 'Send Live Request'}
                    </button>
                  </div>

                  {pingResult && (
                    <div
                      className={`p-3 rounded-lg border font-mono text-xs ${
                        pingResult.connected
                          ? 'bg-[#00FF9D]/10 border-[#00FF9D]/35 text-[#00FF9D]'
                          : 'bg-[#FF9F1C]/10 border-[#FF9F1C]/35 text-[#FF9F1C]'
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
                        <div className="mt-1 text-[11px] text-[#888888]">
                          x-request-id: {pingResult.requestId}
                        </div>
                      )}
                      {pingResult.note && (
                        <div className="mt-1.5 text-[11px] text-[#F5F5F5]/85 font-sans">
                          {pingResult.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-3 bg-[#03030A] border-t border-[#1A1A2E] flex items-center justify-between text-[11px] text-[#888888]">
                <span className="font-mono">Active Node: TRINETRA-SOC-DELHI-01</span>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#0A0A12] border border-[#1A1A2E] hover:border-[#00D4FF]/50 text-[#F5F5F5] font-medium transition-colors cursor-pointer"
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
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#03030A] border border-[#00D4FF]/45 hover:border-[#00D4FF] shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all group cursor-pointer"
        title="Inspect BharatCode AI Harness & Live API Telemetry"
      >
        <span className="relative flex h-2 w-2">
          {!isOffline && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusTone.dot}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusTone.dot}`} />
        </span>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="font-bold text-[#00D4FF] hidden sm:inline">BharatCode AI</span>
          <span className="text-[#888888] hidden sm:inline">/</span>
          <span className={`${statusTone.text} font-medium truncate max-w-[110px]`}>
            {telemetry.activeModel}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[#1A1A2E] text-[10px] font-mono text-[#888888]">
          <Activity className="w-3 h-3 text-[#00D4FF]" />
          <span className="text-[#00FF9D]">
            {telemetry.latencyMs > 0 ? `${telemetry.latencyMs}ms` : 'PROBING'}
          </span>
          <span className={`ml-0.5 px-1.5 py-0.5 rounded border text-[9px] font-bold ${statusTone.badge}`}>
            {statusTone.label}
          </span>
        </div>
      </button>

      {modalContent}
    </>
  )
}
