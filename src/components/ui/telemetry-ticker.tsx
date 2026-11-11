'use client'
import React, { useState, useEffect } from 'react'

interface LiveTelemetry {
  model: string
  latencyMs: number
  calls: number
  status: string
}

export function TelemetryTicker() {
  const [t, setT] = useState<LiveTelemetry>({
    model: 'qwen-3.8-27b',
    latencyMs: 148,
    calls: 0,
    status: 'connected',
  })

  useEffect(() => {
    let active = true
    async function poll() {
      try {
        const res = await fetch('/api/telemetry', { cache: 'no-store' })
        const data = await res.json()
        if (active && data.success && data.telemetry) {
          setT({
            model: data.telemetry.activeModel,
            latencyMs: data.telemetry.latencyMs,
            calls: data.telemetry.totalCalls,
            status: data.telemetry.status,
          })
        }
      } catch {
        // Keep last observed telemetry snapshot
      }
    }
    poll()
    const id = setInterval(poll, 8000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 select-none whitespace-nowrap">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            t.status === 'connected' ? 'bg-emerald-400' : t.status === 'fallback' ? 'bg-amber-400' : 'bg-rose-400'
          }`}
        />
        <span className="text-slate-500">MODEL</span>
        <span className="text-emerald-400 font-semibold">{t.model}</span>
      </div>

      <span className="text-white/[0.1]">•</span>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-500">RTT</span>
        <span className="text-emerald-400 font-semibold">{t.latencyMs}ms</span>
      </div>

      <span className="text-white/[0.1]">•</span>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-500">CALLS</span>
        <span className="text-cyan-400 font-semibold">{t.calls}</span>
      </div>
    </div>
  )
}

export default TelemetryTicker
