'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Cpu, ShieldCheck, Zap, ArrowRight, RefreshCw,
  CheckCircle2, Lock, Sparkles, AlertTriangle, Activity
} from 'lucide-react'
import { useLang } from '@/lib/i18n-context'

interface LiveProbeState {
  status: string
  latencyMs: number
  model: string
  requestId: string | null
  note?: string
  connected?: boolean
}

interface TelemetrySnapshot {
  totalCalls: number
  latencyMs: number
  status: string
  activeModel: string
  fallbackModel: string
  lastGatewayStatus?: string
}

export function BharatCodeShowcase() {
  const { t } = useLang()
  const [pinging, setPinging] = useState(false)
  const [probe, setProbe] = useState<LiveProbeState | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null)
  const [demoInput, setDemoInput] = useState(
    'SBI Alert: Account suspended today. Click http://sbi-kyc-update.top Aadhaar 451298765432'
  )
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoOutput, setDemoOutput] = useState<{
    verdict: string
    confidence: string
    provider: string
    model: string
    latencyMs: number
    redactedPreview?: string
  } | null>(null)

  const refreshTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry')
      const data = await res.json()
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry)
      }
    } catch {
      // ignore
    }
  }, [])

  const runLivePing = useCallback(async () => {
    setPinging(true)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.ping) setProbe(data.ping)
      if (data.telemetry) setTelemetry(data.telemetry)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error'
      setProbe({
        status: 'ERROR',
        latencyMs: 0,
        model: 'qwen-3.8-27b',
        requestId: null,
        note: message,
      })
    } finally {
      setPinging(false)
    }
  }, [])

  useEffect(() => {
    runLivePing()
    const id = setInterval(refreshTelemetry, 10000)
    return () => clearInterval(id)
  }, [runLivePing, refreshTelemetry])

  const runLiveHarnessDemo = async () => {
    if (!demoInput.trim()) return
    setDemoRunning(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: demoInput }),
      })
      const data = await res.json()
      if (data.success && data.analysis) {
        setDemoOutput({
          verdict: data.analysis.verdict,
          confidence: data.analysis.confidence,
          provider: data.analysis.provider,
          model: data.analysis.model,
          latencyMs: data.analysis.latencyMs,
          redactedPreview: demoInput.replace(/\b\d{12}\b/g, '[REDACTED-GOVT-ID]'),
        })
        refreshTelemetry()
      }
    } catch {
      // swallow gracefully
    } finally {
      setDemoRunning(false)
    }
  }

  const isPlanUpgrade = probe?.status === 'PLAN_UPGRADE_402' || telemetry?.lastGatewayStatus === 'PLAN_UPGRADE_402'

  return (
    <section className="rounded-xl bg-[#FFFFFF] border-2 border-[#BFDBFE] p-5 sm:p-6 shadow-xs">
      <div className="space-y-5">
        {/* Highlighted Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] font-semibold text-[#2563EB]">
                <Cpu className="w-3.5 h-3.5" />
                {t('Powered by BharatCode AI Harness', 'भारतकोड एआई हार्नेस द्वारा संचालित')}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] font-medium text-[#15803D]">
                Private · No Chat Stored
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[11px] text-[#4B5563]">
                <Activity className="w-3 h-3 text-[#2563EB]" />
                Requests: <strong className="text-[#1A1A1A]">{telemetry?.totalCalls ?? 0}</strong>
                {' · '}
                Response Time:{' '}
                <strong className="font-mono text-[#15803D]">
                  {(probe?.latencyMs || telemetry?.latencyMs || 0) > 0
                    ? `${probe?.latencyMs || telemetry?.latencyMs}ms`
                    : 'Checking...'}
                </strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {t(
                'Smart Safety Engine with Automatic Privacy Protection',
                'स्वचालित गोपनीयता सुरक्षा के साथ स्मार्ट सुरक्षा इंजन'
              )}
            </h2>
            <p className="text-xs text-[#6B7280] max-w-3xl">
              {t(
                'Live checks go through your BharatCode API key (qwen-3.8-27b & deepseek-v4.1-flash). Personal Aadhaar and bank card numbers are hidden automatically before AI analysis.',
                'लाइव जांच आपकी भारतकोड एपीआई कुंजी के माध्यम से होती है, और एआई विश्लेषण से पहले आधार व कार्ड नंबर अपने-आप छिप जाते हैं।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={runLivePing}
              disabled={pinging}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              {pinging ? 'Checking Connection...' : 'Test BharatCode API'}
            </button>
            <Link
              href="/mentor"
              className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              Ask AI Assistant <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
            </Link>
          </div>
        </div>

        {/* 3 Plain Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#2563EB]">Step 1 · Privacy Shield</span>
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-sm font-semibold text-[#1A1A1A]">Hides Sensitive IDs</div>
            <p className="text-xs text-[#6B7280]">
              Replaces 12-digit ID numbers with{' '}
              <code className="font-mono text-[#15803D] bg-[#F0FDF4] px-1 rounded">[REDACTED-GOVT-ID]</code> automatically.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#D97706]">Step 2 · Smart Fallback</span>
              <Zap className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-sm font-semibold text-[#1A1A1A]">Always Gives an Answer</div>
            <p className="text-xs text-[#6B7280]">
              Tries BharatCode AI models first and falls back smoothly to rule-based checks if offline.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#15803D]">Step 3 · Proof Ready</span>
              <Lock className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-sm font-semibold text-[#1A1A1A]">Verified Evidence PDF</div>
            <p className="text-xs text-[#6B7280]">
              Attaches an IST timestamp and digital fingerprint (SHA-256) to every saved report.
            </p>
          </div>
        </div>

        {/* Live Try Bar */}
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-semibold text-[#1A1A1A] shrink-0">
              Try Privacy &amp; Scam Test:
            </span>
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              aria-label="Test privacy redaction and scam check"
              className="flex-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#2563EB]"
            />
            <button
              onClick={runLiveHarnessDemo}
              disabled={demoRunning}
              className="px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {demoRunning ? 'Checking...' : 'Run Live Check'}
            </button>
          </div>

          {demoOutput && (
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#BBF7D0] flex flex-col gap-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#15803D] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{demoOutput.verdict} ({demoOutput.confidence})</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                  <span>Engine: <strong className="text-[#1A1A1A]">{demoOutput.model}</strong></span>
                  <span className="font-mono">{demoOutput.latencyMs}ms</span>
                </div>
              </div>
              <div className="text-[11px] text-[#6B7280] break-all">
                Hidden ID Preview: <span className="font-mono text-[#1A1A1A]">{demoOutput.redactedPreview}</span>
              </div>
            </div>
          )}

          {probe && (
            <div
              className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                probe.connected
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                  : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
              }`}
            >
              <div className="flex items-center gap-2">
                {probe.connected ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
                )}
                <span>
                  API Status: <strong>{probe.status}</strong> ({probe.model}) · {probe.latencyMs}ms
                  {isPlanUpgrade ? ' · Connected to bharatcode.ai (verify student email or upgrade Lite for OK_200 AI responses)' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
