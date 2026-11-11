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

  // Keep probing BHARATCODE_API_KEY automatically on load + 30s keepalive when visible
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
    ? { dot: 'bg-[#DC2626]', text: 'text-[#DC2626]', pill: 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]', label: 'Offline' }
    : isLiveOk
      ? { dot: 'bg-[#15803D]', text: 'text-[#15803D]', pill: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]', label: 'Live AI' }
      : isKeyReached
        ? { dot: 'bg-[#2563EB]', text: 'text-[#2563EB]', pill: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]', label: 'Key Active · 402' }
        : { dot: 'bg-[#D97706]', text: 'text-[#D97706]', pill: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]', label: 'Safe Mode' }

  const modalContent =
    modalOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1A1A1A]">
              <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#1A1A1A]">
                        {t('BharatCode AI Harness Status', 'भारतकोड एआई हार्नेस स्थिति')}
                      </h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                        No Data Stored (store: false)
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#6B7280] mt-0.5">
                      {telemetry.baseUrl}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Close AI Diagnostics"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#6B7280] font-medium">Primary AI Model</span>
                      <span className={`w-2 h-2 rounded-full ${statusTone.dot}`} />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#1A1A1A]">{telemetry.activeModel}</div>
                    <div className="text-[11px] text-[#6B7280] mt-1">Complex threat &amp; complaint analysis</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#6B7280] font-medium">Fast Backup Model</span>
                      <Zap className="w-3.5 h-3.5 text-[#D97706]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#1A1A1A]">{telemetry.fallbackModel}</div>
                    <div className="text-[11px] text-[#6B7280] mt-1">Automatic quick failover</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#6B7280] font-medium">API Gateway Check</span>
                      <Lock className="w-3.5 h-3.5 text-[#15803D]" />
                    </div>
                    <div className="font-mono text-xs font-bold text-[#2563EB]">
                      {telemetry.lastGatewayStatus || 'PROBING'}
                    </div>
                    <div className="text-[11px] text-[#6B7280] mt-1">
                      {telemetry.bharatcodeReachable ? 'Connected to bharatcode.ai' : 'Checking server...'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                    <div className="text-[11px] text-[#6B7280]">Response Speed</div>
                    <div className="text-base font-bold text-[#15803D] mt-1">
                      {telemetry.latencyMs > 0 ? `${telemetry.latencyMs} ms` : 'Checking...'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                    <div className="text-[11px] text-[#6B7280]">API Requests</div>
                    <div className="text-base font-bold text-[#1A1A1A] mt-1">
                      {telemetry.totalCalls}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                    <div className="text-[11px] text-[#6B7280]">Private IDs Hidden</div>
                    <div className="text-base font-bold text-[#2563EB] mt-1">
                      {telemetry.guardrails.piiMaskedCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                    <div className="text-[11px] text-[#6B7280]">Unsafe Prompts Blocked</div>
                    <div className="text-base font-bold text-[#DC2626] mt-1">
                      {telemetry.guardrails.injectionBlockedCount}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1E40AF]">
                      <ShieldCheck className="w-4 h-4" />
                      Built-in Privacy &amp; Safety Protections
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoHeartbeat(v => !v)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                        autoHeartbeat
                          ? 'bg-[#FFFFFF] border-[#BFDBFE] text-[#2563EB]'
                          : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]'
                      }`}
                    >
                      Auto-Check 30s: {autoHeartbeat ? 'On' : 'Paused'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1E3A8A]">
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

                <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs font-semibold text-[#1A1A1A]">
                        Test Live BharatCode API Connection
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        Sends a live test request using your configured BHARATCODE_API_KEY.
                      </div>
                    </div>
                    <button
                      onClick={handlePing}
                      disabled={pinging}
                      className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                      {pinging ? 'Testing...' : 'Send Live Request'}
                    </button>
                  </div>

                  {pingResult && (
                    <div
                      className={`p-3 rounded-lg border text-xs ${
                        pingResult.connected
                          ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
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

              <div className="px-6 py-3 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs font-medium text-[#1A1A1A] cursor-pointer"
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
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-xs font-medium transition-colors cursor-pointer"
        title="Check BharatCode AI Harness Status"
      >
        <span className="relative flex h-2 w-2">
          {!isOffline && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusTone.dot}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusTone.dot}`} />
        </span>
        <span className="font-semibold text-[#1E40AF] hidden sm:inline">BharatCode AI</span>
        <Activity className="w-3.5 h-3.5 text-[#2563EB] hidden md:inline" />
        <span className={`hidden lg:inline px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusTone.pill}`}>
          {statusTone.label}
          {telemetry.latencyMs > 0 ? ` · ${telemetry.latencyMs}ms` : ''}
        </span>
      </button>

      {modalContent}
    </>
  )
}
