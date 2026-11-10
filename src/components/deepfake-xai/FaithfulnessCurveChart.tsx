'use client'
import React from 'react'

interface FaithfulnessCurveChartProps {
  deletionCurve: number[]
  insertionCurve: number[]
  deletionAuc: number
  insertionAuc: number
}

export function FaithfulnessCurveChart({
  deletionCurve,
  insertionCurve,
  deletionAuc,
  insertionAuc,
}: FaithfulnessCurveChartProps) {
  const width = 560
  const height = 220
  const padL = 44
  const padR = 20
  const padT = 20
  const padB = 34
  const plotW = width - padL - padR
  const plotH = height - padT - padB

  const buildPath = (pts: number[]) => {
    if (pts.length === 0) return ''
    return pts
      .map((val, idx) => {
        const x = padL + (idx / Math.max(1, pts.length - 1)) * plotW
        const y = padT + (1 - Math.max(0, Math.min(1, val))) * plotH
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }

  const buildArea = (pts: number[]) => {
    if (pts.length === 0) return ''
    const line = buildPath(pts)
    const lastX = padL + plotW
    const baseY = padT + plotH
    return `${line} L ${lastX} ${baseY} L ${padL} ${baseY} Z`
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1.0]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            Deletion AUC: <strong>{deletionAuc.toFixed(4)}</strong>
            <span className="text-slate-500 text-[10px]">(lower = better)</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            Insertion AUC: <strong>{insertionAuc.toFixed(4)}</strong>
            <span className="text-slate-500 text-[10px]">(higher = better)</span>
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl bg-[#070B12] border border-white/[0.06] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[360px]">
          <defs>
            <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="insGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {yTicks.map(t => {
            const y = padT + (1 - t) * plotH
            return (
              <g key={t}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + plotW}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="3 4"
                />
                <text
                  x={padL - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {t.toFixed(2)}
                </text>
              </g>
            )
          })}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.16)" />
          <line
            x1={padL}
            y1={padT + plotH}
            x2={padL + plotW}
            y2={padT + plotH}
            stroke="rgba(255,255,255,0.16)"
          />

          {/* Areas */}
          <path d={buildArea(deletionCurve)} fill="url(#delGrad)" />
          <path d={buildArea(insertionCurve)} fill="url(#insGrad)" />

          {/* Lines */}
          <path d={buildPath(deletionCurve)} fill="none" stroke="#FB7185" strokeWidth="2.5" />
          <path d={buildPath(insertionCurve)} fill="none" stroke="#34D399" strokeWidth="2.5" />

          {/* Points */}
          {deletionCurve.map((val, idx) => {
            const x = padL + (idx / Math.max(1, deletionCurve.length - 1)) * plotW
            const y = padT + (1 - Math.max(0, Math.min(1, val))) * plotH
            return <circle key={`d-${idx}`} cx={x} cy={y} r="3" fill="#FB7185" />
          })}
          {insertionCurve.map((val, idx) => {
            const x = padL + (idx / Math.max(1, insertionCurve.length - 1)) * plotW
            const y = padT + (1 - Math.max(0, Math.min(1, val))) * plotH
            return <circle key={`i-${idx}`} cx={x} cy={y} r="3" fill="#34D399" />
          })}

          {/* X labels */}
          {[0, 25, 50, 75, 100].map(pct => {
            const x = padL + (pct / 100) * plotW
            return (
              <text
                key={pct}
                x={x}
                y={padT + plotH + 16}
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="monospace"
              >
                {pct}%
              </text>
            )
          })}
          <text
            x={padL + plotW / 2}
            y={height - 4}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="10"
            fontFamily="monospace"
          >
            Top Ranked Grad-CAM Pixels Perturbed (%)
          </text>
        </svg>
      </div>
    </div>
  )
}
