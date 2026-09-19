'use client'
import React, { useState, useEffect } from 'react'

interface TelemetryState {
  rx: string
  tx: string
  conn: number
  loss: string
}

function rand(min: number, max: number, dec = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec))
}

export function TelemetryTicker() {
  const [t, setT] = useState<TelemetryState>({ rx: '4.2', tx: '1.1', conn: 847, loss: '0.00' })

  useEffect(() => {
    const id = setInterval(() => {
      setT({
        rx: rand(2.1, 9.8).toFixed(1),
        tx: rand(0.4, 3.2).toFixed(1),
        conn: Math.floor(Math.random() * 400) + 600,
        loss: rand(0, 0.14, 2).toFixed(2),
      })
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 select-none whitespace-nowrap">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-500">RX</span>
        <span className="text-emerald-400 font-semibold">{t.rx} MB/s</span>
      </div>

      <span className="text-white/[0.1]">•</span>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-500">TX</span>
        <span className="text-emerald-400 font-semibold">{t.tx} MB/s</span>
      </div>

      <span className="text-white/[0.1]">•</span>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-500">CONN</span>
        <span className="text-cyan-400 font-semibold">{t.conn}</span>
      </div>
    </div>
  )
}

export default TelemetryTicker
