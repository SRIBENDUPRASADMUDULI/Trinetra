'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Cpu, ShieldCheck, Zap, ArrowRight, RefreshCw,
  CheckCircle2, Lock, Terminal, Sparkles, AlertTriangle
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
  guardrails?: {
    piiMaskedCount: number
    injectionBlockedCount: number
  }
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
    confidence: number
    provider: string
    model: string
    latencyMs: number
    requestId?: string | null
    redactedPreview?: string
  } | null>(null)

  const refreshTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry')
      const data = await res.json()
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry)
      }
    } catch {
      // ignore initial offline error
    }
  }

  useEffect(() => {
    refreshTelemetry()
  }, [])

  const runLivePing = async () => {
    setPinging(true)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.ping) {
        setProbe(data.ping)
      }
      if (data.telemetry) {
        setTelemetry(data.telemetry)
      }
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
  }

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

  const isPlanUpgrade = probe?.status === 'PLAN_UPGRADE_402'

  return (
    <section className="rounded-xl bg-[#172A45] border border-[#233554] p-6 lg:p-7">
      <div className="space-y-5">
        {/* Top Row: Official Header + Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#233554] pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00A896]/15 border border-[#00A896]/35 text-[11px] font-mono font-bold text-[#00A896] uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                {t('AI ORCHESTRATION HARNESS', 'एआई ऑर्केस्ट्रेशन हार्नेस')}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#0A192F] border border-[#233554] text-[10px] font-mono text-[#00A896]">
                DPDP ACT §2023 · store: false
              </span>
              {telemetry && (
                <span className="px-2.5 py-1 rounded bg-[#0A192F] border border-[#233554] text-[10px] font-mono text-[#8D99AE]">
                  Session Calls: <strong className="text-[#F8F9FA]">{telemetry.totalCalls}</strong>
                  {' · '}
                  Latency:{' '}
                  <strong className="text-[#00A896]">
                    {telemetry.latencyMs > 0 ? `${telemetry.latencyMs}ms` : 'Awaiting call'}
                  </strong>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F8F9FA] font-serif">
              {t(
                'BharatCode AI Multi-Model Gateway & Deterministic Fail-Safe Pipeline',
                'भारतकोड एआई मल्टी-मॉडल गेटवे एवं डिटरमिनिस्टिक फेल-सेफ पाइपलाइन'
              )}
            </h2>
            <p className="text-xs text-[#8D99AE] max-w-3xl leading-relaxed">
              {t(
                'Three-stage sovereign defense inference architecture: PII redaction & prompt-injection filtering, BharatCode multi-model routing (Qwen 3.8 27B -> DeepSeek v4.1 Flash -> Deterministic Security Kernel), and BSA 2023 §63 SHA-256 verification.',
                'त्रि-स्तरीय साइबर सुरक्षा इन्फरेंस आर्किटेक्चर: पीआईआई रिडैक्शन, भारतकोड मल्टी-मॉडल रूटिंग, एवं बीएसए 2023 §63 सत्यापन।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={runLivePing}
              disabled={pinging}
              className="px-4 py-2 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-[#0A192F] text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              {pinging ? 'Probing Gateway...' : 'Ping BharatCode API'}
            </button>
            <Link
              href="/mentor"
              className="px-4 py-2 rounded-lg bg-[#0A192F] hover:bg-[#1E3554] border border-[#233554] text-[#F8F9FA] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Open SecOps Copilot <ArrowRight className="w-3.5 h-3.5 text-[#00A896]" />
            </Link>
          </div>
        </div>

        {/* 3-Stage Architecture Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00A896] font-bold">
                Stage 01 · Guardrails
              </span>
              <ShieldCheck className="w-4 h-4 text-[#00A896]" />
            </div>
            <div className="text-sm font-semibold text-[#F8F9FA]">PII &amp; Injection Shield</div>
            <p className="text-[11px] text-[#8D99AE] leading-relaxed">
              Automatically masks 12-digit Govt IDs as{' '}
              <code className="text-[#00A896] font-mono">[REDACTED-GOVT-ID]</code> and blocks jailbreaks under IT Act §66.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF9F1C] font-bold">
                Stage 02 · Model Cascade
              </span>
              <Zap className="w-4 h-4 text-[#FF9F1C]" />
            </div>
            <div className="text-sm font-semibold text-[#F8F9FA]">Multi-Model Failover</div>
            <p className="text-[11px] text-[#8D99AE] leading-relaxed">
              Routes <code className="text-[#F8F9FA] font-mono">qwen-3.8-27b</code> &rarr;{' '}
              <code className="text-[#F8F9FA] font-mono">deepseek-v4.1-flash</code> &rarr; Zero-Hallucination Kernel.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#2E8B57] font-bold">
                Stage 03 · Legal Provenance
              </span>
              <Lock className="w-4 h-4 text-[#2E8B57]" />
            </div>
            <div className="text-sm font-semibold text-[#F8F9FA]">BSA 2023 §63 Binding</div>
            <p className="text-[11px] text-[#8D99AE] leading-relaxed">
              Every inference records gateway <code className="text-[#2E8B57] font-mono">x-request-id</code>, IST timestamp, and SHA-256 hash.
            </p>
          </div>
        </div>

        {/* Live Interactive Test Strip */}
        <div className="p-4 rounded-lg bg-[#0A192F] border border-[#233554] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#00A896] shrink-0 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>HARNESS TEST:</span>
            </div>
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              aria-label="Test AI harness with SMS and Govt ID"
              className="flex-1 bg-[#172A45] border border-[#233554] rounded-lg px-3 py-2 text-xs font-mono text-[#F8F9FA] focus:outline-none focus:border-[#00A896]"
            />
            <button
              onClick={runLiveHarnessDemo}
              disabled={demoRunning}
              className="px-4 py-2 rounded-lg bg-[#00A896] hover:bg-[#028a7b] text-[#0A192F] text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {demoRunning ? 'Running...' : 'Run Pipeline'}
            </button>
          </div>

          {demoOutput && (
            <div className="p-3 rounded-lg bg-[#172A45] border border-[#00A896]/30 flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#00A896] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{demoOutput.verdict} ({demoOutput.confidence}%)</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#8D99AE]">
                  <span>Provider: <strong className="text-[#F8F9FA]">{demoOutput.provider}</strong></span>
                  <span>Model: <strong className="text-[#FF9F1C]">{demoOutput.model}</strong></span>
                  <span>RTT: <strong className="text-[#00A896]">{demoOutput.latencyMs}ms</strong></span>
                </div>
              </div>
              <div className="text-[11px] text-[#8D99AE] break-all">
                Sanitized Input: <span className="text-[#F8F9FA]">{demoOutput.redactedPreview}</span>
              </div>
            </div>
          )}

          {probe && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                probe.connected
                  ? 'bg-[#00A896]/10 border-[#00A896]/30 text-[#00A896]'
                  : 'bg-[#FF9F1C]/10 border-[#FF9F1C]/30 text-[#FF9F1C]'
              }`}
            >
              <div className="flex items-center gap-2">
                {probe.connected ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  Gateway Probe: <strong>{probe.status}</strong> ({probe.model}) · {probe.latencyMs}ms
                  {isPlanUpgrade ? ' · Active Fail-Safe Kernel Engaged' : ''}
                </span>
              </div>
              {probe.requestId && (
                <span className="text-[10px] text-[#8D99AE]">x-request-id: {probe.requestId}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
