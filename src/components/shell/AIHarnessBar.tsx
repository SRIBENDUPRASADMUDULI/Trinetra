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
  provider: 'BharatCode AI Gateway',
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
    ? { dot: 'bg-[#F87171]', pill: 'bg-[#7F1D1D]/50 border-[#EF4444]/50 text-[#FECACA]', label: 'Offline' }
    : isLiveOk
      ? { dot: 'bg-[#34D399]', pill: 'bg-[#064E3B]/60 border-[#10B981]/50 text-[#A7F3D0]', label: 'Live AI' }
      : isKeyReached
        ? { dot: 'bg-[#34D399]', pill: 'bg-[#143326]/60 border-[#34D399]/50 text-[#A7F3D0]', label: 'Key Active · 402' }
        : { dot: 'bg-[#FBBF24]', pill: 'bg-[#78350F]/50 border-[#F59E0B]/50 text-[#FDE68A]', label: 'Safe Mode' }

  const modalContent =
    modalOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4">
            <div className="bg-[#FFFFFF] border border-[#E0DDD5] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1C201D]">
              <div className="px-6 py-4 bg-[#1E2420] border-b border-[#323D36] flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#2A332D] border border-[#3E4B42] flex items-center justify-center text-[#F59E0B]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        {t('BharatCode AI Harness Status', 'भारतकोड एआई हार्नेस स्थिति')}
                      </h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#064E3B] text-[#A7F3D0] border border-[#10B981]/40">
                        No Data Stored (store: false)
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#CBD5E1] mt-0.5">
                      {telemetry.baseUrl}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Close AI Diagnostics"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CBD5E1] hover:text-white hover:bg-[#2A332D] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto bg-[#F2F1EC]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#6B726D] font-medium">Primary AI Model</span>
                      <span className={`w-2 h-2 rounded-full ${statusTone.dot}`} />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#1E2420]">{telemetry.activeModel}</div>
                    <div className="text-[11px] text-[#5C645E] mt-1">Complex threat &amp; complaint analysis</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#6B726D] font-medium">Fast Backup Model</span>
                      <Zap className="w-3.5 h-3.5 text-[#D97706]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#1E2420]">{telemetry.fallbackModel}</div>
                    <div className="text-[11px] text-[#5C645E] mt-1">Automatic quick failover</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#6B726D] font-medium">API Gateway Check</span>
                      <Lock className="w-3.5 h-3.5 text-[#15803D]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#059669]">
                      {telemetry.lastGatewayStatus || 'PROBING'}
                    </div>
                    <div className="text-[11px] text-[#5C645E] mt-1">
                      {telemetry.bharatcodeReachable ? 'Connected to bharatcode.ai' : 'Checking server...'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5]">
                    <div className="text-[11px] text-[#6B726D]">Response Speed</div>
                    <div className="text-base font-bold text-[#15803D] mt-1">
                      {telemetry.latencyMs > 0 ? `${telemetry.latencyMs} ms` : 'Checking...'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5]">
                    <div className="text-[11px] text-[#6B726D]">API Requests</div>
                    <div className="text-base font-bold text-[#1E2420] mt-1">
                      {telemetry.totalCalls}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5]">
                    <div className="text-[11px] text-[#6B726D]">Private IDs Hidden</div>
                    <div className="text-base font-bold text-[#059669] mt-1">
                      {telemetry.guardrails.piiMaskedCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5]">
                    <div className="text-[11px] text-[#6B726D]">Unsafe Prompts Blocked</div>
                    <div className="text-base font-bold text-[#DC2626] mt-1">
                      {telemetry.guardrails.injectionBlockedCount}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#A7F3D0] space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2420]">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      Built-in Privacy &amp; Safety Protections
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoHeartbeat(v => !v)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                        autoHeartbeat
                          ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]'
                          : 'bg-[#F2F1EC] border-[#E0DDD5] text-[#6B726D]'
                      }`}
                    >
                      Auto-Check 30s: {autoHeartbeat ? 'On' : 'Paused'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#334155]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                      <span>Hides 12-digit IDs &amp; bank card numbers automatically</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                      <span>Safe local backup runs even if AI credit finishes</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#E0DDD5] space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs font-semibold text-[#1E2420]">
                        Test Live BharatCode API Connection
                      </div>
                      <div className="text-[11px] text-[#6B726D]">
                        Sends a live test request using your configured BHARATCODE_API_KEY.
                      </div>
                    </div>
                    <button
                      onClick={handlePing}
                      disabled={pinging}
                      className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                      {pinging ? 'Testing...' : 'Send Live Request'}
                    </button>
                  </div>

                  {pingResult && (
                    <div
                      className={`p-3 rounded-lg border text-xs ${
                        pingResult.connected
                          ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#15803D]'
                          : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          {pingResult.connected ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                          )}
                          Status: {pingResult.status}
                        </span>
                        <span className="font-mono">{pingResult.latencyMs} ms</span>
                      </div>
                      {pingResult.note && (
                        <div className="mt-1.5 text-[11px]">{pingResult.note}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-3 bg-[#FFFFFF] border-t border-[#E0DDD5] flex items-center justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#F2F1EC] border border-[#E0DDD5] hover:bg-[#E5E2DA] text-xs font-semibold text-[#1E2420] cursor-pointer"
                >
                  Close
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
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-xs font-medium transition-colors cursor-pointer text-white"
        title="Check BharatCode AI Harness Status"
      >
        <span className="relative flex h-2 w-2">
          {!isOffline && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusTone.dot}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusTone.dot}`} />
        </span>
        <span className="font-semibold text-white hidden sm:inline">BharatCode AI</span>
        <Activity className="w-3.5 h-3.5 text-[#34D399] hidden md:inline" />
        <span className={`hidden lg:inline px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusTone.pill}`}>
          {statusTone.label}
          {telemetry.latencyMs > 0 ? ` · ${telemetry.latencyMs}ms` : ''}
        </span>
      </button>

      {modalContent}
    </>
  )
}
