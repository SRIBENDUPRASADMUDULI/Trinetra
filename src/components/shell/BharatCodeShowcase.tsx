'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Cpu, ShieldCheck, Zap, ArrowRight, RefreshCw,
  CheckCircle2, Lock, Terminal, Sparkles, AlertTriangle, Activity
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
  bharatcodeReachable?: boolean
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
    requestId?: string | null
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

  // Auto-dispatch live probe on load + refresh telemetry periodically
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
          requestId: data.analysis.requestId,
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
    <section className="relative rounded-xl bg-[#0A0A12]/95 border border-[#00D4FF]/45 p-6 lg:p-7 backdrop-blur-md shadow-[0_0_32px_rgba(0,212,255,0.16)] overflow-hidden">
      {/* Top Cinematic Highlight Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF1B1B] via-[#FF9F1C] to-[#00D4FF]" />

      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A1A2E] pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00D4FF]/15 border border-[#00D4FF]/50 text-[11px] font-mono font-bold text-[#00D4FF] uppercase tracking-wider shadow-[0_0_12px_rgba(0,212,255,0.2)]">
                <Cpu className="w-3.5 h-3.5" />
                {t('BHARATCODE API · AI HARNESS ENGINE', 'भारतकोड एपीआई · एआई हार्नेस इंजन')}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#03030A] border border-[#00FF9D]/35 text-[10px] font-mono text-[#00FF9D]">
                DPDP ACT §2023 · store: false
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#03030A] border border-[#1A1A2E] text-[10px] font-mono text-[#F5F5F5]">
                <Activity className="w-3 h-3 text-[#00FF9D]" />
                API Calls: <strong>{telemetry?.totalCalls ?? 0}</strong>
                {' · '}
                bharatcode.ai RTT:{' '}
                <strong className="text-[#00FF9D]">
                  {(probe?.latencyMs || telemetry?.latencyMs || 0) > 0
                    ? `${probe?.latencyMs || telemetry?.latencyMs}ms`
                    : 'Probing...'}
                </strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] font-serif">
              {t(
                'BharatCode AI Multi-Model Gateway & Deterministic Fail-Safe Pipeline',
                'भारतकोड एआई मल्टी-मॉडल गेटवे एवं डिटरमिनिस्टिक फेल-सेफ पाइपलाइन'
              )}
            </h2>
            <p className="text-xs text-[#888888] max-w-3xl leading-relaxed">
              {t(
                'Live requests execute against BHARATCODE_API_KEY (qwen-3.8-27b -> deepseek-v4.1-flash) with automatic Aadhaar/PAN PII masking, offensive prompt filtering, and zero-hallucination deterministic failover.',
                'BHARATCODE_API_KEY पर लाइव अनुरोध (qwen-3.8-27b -> deepseek-v4.1-flash), स्वचालित आधार/पैन मास्किंग और डिटरमिनिस्टिक फेलओवर के साथ।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={runLivePing}
              disabled={pinging}
              className="px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00b8de] text-[#03030A] text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer shadow-[0_0_18px_rgba(0,212,255,0.35)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              {pinging ? 'Sending Request...' : 'Ping BharatCode API'}
            </button>
            <Link
              href="/mentor"
              className="px-4 py-2 rounded-lg bg-[#03030A] hover:border-[#00D4FF]/60 border border-[#1A1A2E] text-[#F5F5F5] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Open AI Copilot <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF]" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#03030A] border border-[#00D4FF]/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00D4FF] font-bold">
                Stage 01 · Guardrails
              </span>
              <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="text-sm font-semibold text-[#F5F5F5]">PII &amp; Injection Shield</div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Automatically masks 12-digit Govt IDs as{' '}
              <code className="text-[#00FF9D] font-mono">[REDACTED-GOVT-ID]</code> and blocks jailbreaks under IT Act §66.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#03030A] border border-[#FF9F1C]/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF9F1C] font-bold">
                Stage 02 · Model Cascade
              </span>
              <Zap className="w-4 h-4 text-[#FF9F1C]" />
            </div>
            <div className="text-sm font-semibold text-[#F5F5F5]">Multi-Model Failover</div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Routes <code className="text-[#F5F5F5] font-mono">qwen-3.8-27b</code> &rarr;{' '}
              <code className="text-[#F5F5F5] font-mono">deepseek-v4.1-flash</code> &rarr; Zero-Hallucination Kernel.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#03030A] border border-[#00FF9D]/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00FF9D] font-bold">
                Stage 03 · Legal Provenance
              </span>
              <Lock className="w-4 h-4 text-[#00FF9D]" />
            </div>
            <div className="text-sm font-semibold text-[#F5F5F5]">BSA 2023 §63 Binding</div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              Every inference records gateway <code className="text-[#00FF9D] font-mono">x-request-id</code>, IST timestamp, and SHA-256 hash.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#03030A] border border-[#1A1A2E] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] shrink-0 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>HARNESS TEST:</span>
            </div>
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              aria-label="Test AI harness with SMS and Govt ID"
              className="flex-1 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg px-3 py-2 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#00D4FF]"
            />
            <button
              onClick={runLiveHarnessDemo}
              disabled={demoRunning}
              className="px-4 py-2 rounded-lg bg-[#FF1B1B] hover:bg-[#e01414] text-[#F5F5F5] text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-[0_0_16px_rgba(255,27,27,0.3)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {demoRunning ? 'Running...' : 'Run Pipeline'}
            </button>
          </div>

          {demoOutput && (
            <div className="p-3 rounded-lg bg-[#0A0A12] border border-[#00FF9D]/35 flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#00FF9D] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{demoOutput.verdict} ({demoOutput.confidence})</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#888888]">
                  <span>Provider: <strong className="text-[#F5F5F5]">{demoOutput.provider}</strong></span>
                  <span>Model: <strong className="text-[#FF9F1C]">{demoOutput.model}</strong></span>
                  <span>RTT: <strong className="text-[#00FF9D]">{demoOutput.latencyMs}ms</strong></span>
                </div>
              </div>
              <div className="text-[11px] text-[#888888] break-all">
                Sanitized Input: <span className="text-[#F5F5F5]">{demoOutput.redactedPreview}</span>
              </div>
            </div>
          )}

          {probe && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                probe.connected
                  ? 'bg-[#00FF9D]/10 border-[#00FF9D]/35 text-[#00FF9D]'
                  : 'bg-[#FF9F1C]/10 border-[#FF9F1C]/35 text-[#FF9F1C]'
              }`}
            >
              <div className="flex items-center gap-2">
                {probe.connected ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  Live Key Probe: <strong>{probe.status}</strong> ({probe.model}) · {probe.latencyMs}ms
                  {isPlanUpgrade ? ' · Key reached bharatcode.ai (verify student email or upgrade Lite for OK_200)' : ''}
                </span>
              </div>
              {probe.requestId && (
                <span className="text-[10px] text-[#888888]">x-request-id: {probe.requestId}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
