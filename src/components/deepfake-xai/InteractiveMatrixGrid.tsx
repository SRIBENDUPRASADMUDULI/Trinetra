'use client'
import React from 'react'
import type { PairwiseRow } from '@/lib/deepfake-xai'

interface InteractiveMatrixGridProps {
  title: string
  subtitle: string
  metric: 'CGFD' | 'FADI'
  generators: string[]
  pairwise: PairwiseRow[]
  onSelectPair?: (pair: PairwiseRow) => void
}

function getCellStyle(metric: 'CGFD' | 'FADI', value: number): string {
  if (metric === 'CGFD') {
    if (value > 0.02) return 'bg-rose-500/20 border-rose-500/40 text-rose-200'
    if (value < -0.02) return 'bg-emerald-500/15 border-emerald-500/35 text-emerald-200'
    return 'bg-amber-500/15 border-amber-500/30 text-amber-200'
  }
  // FADI
  if (value >= 0.5) return 'bg-rose-500/20 border-rose-500/40 text-rose-200'
  if (value <= -0.5) return 'bg-sky-500/20 border-sky-500/40 text-sky-200'
  return 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
}

export function InteractiveMatrixGrid({
  title,
  subtitle,
  metric,
  generators,
  pairwise,
  onSelectPair,
}: InteractiveMatrixGridProps) {
  const lookup = new Map<string, PairwiseRow>()
  pairwise.forEach(p => lookup.set(`${p.source}__${p.target}`, p))

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-bold text-white tracking-wide">{title}</h4>
        <p className="text-[11px] text-slate-400">{subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1.5 text-xs font-mono">
          <thead>
            <tr>
              <th className="p-2 text-left text-[10px] text-slate-500 uppercase tracking-wider">
                Train \ Test
              </th>
              {generators.map(tgt => (
                <th
                  key={tgt}
                  className="p-2 text-center text-[11px] text-slate-300 font-semibold bg-white/[0.02] rounded-lg border border-white/[0.06]"
                >
                  {tgt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generators.map(src => (
              <tr key={src}>
                <td className="p-2 text-[11px] text-slate-200 font-semibold bg-white/[0.02] rounded-lg border border-white/[0.06] whitespace-nowrap">
                  {src}
                </td>
                {generators.map(tgt => {
                  if (src === tgt) {
                    return (
                      <td
                        key={tgt}
                        className="p-3 text-center rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-500 text-[10px]"
                      >
                        IN-DIST
                      </td>
                    )
                  }
                  const pair = lookup.get(`${src}__${tgt}`)
                  if (!pair) {
                    return (
                      <td
                        key={tgt}
                        className="p-3 text-center rounded-lg bg-white/[0.015] border border-white/[0.04] text-slate-600 text-[10px]"
                      >
                        N/A
                      </td>
                    )
                  }
                  const val = pair[metric]
                  return (
                    <td key={tgt} className="p-0">
                      <button
                        type="button"
                        onClick={() => onSelectPair?.(pair)}
                        title={`${src} → ${tgt} | Acc: ${(pair.src_accuracy * 100).toFixed(0)}% → ${(pair.target_accuracy * 100).toFixed(0)}% | Faithfulness: ${pair.src_faithfulness.toFixed(3)} → ${pair.target_faithfulness.toFixed(3)}`}
                        className={`w-full p-3 rounded-lg border text-center transition-all hover:scale-[1.03] cursor-pointer ${getCellStyle(
                          metric,
                          val
                        )}`}
                      >
                        <div className="text-sm font-bold">
                          {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </div>
                        <div className="text-[9px] opacity-75 mt-0.5">
                          ΔAcc {(pair.accuracy_drop * 100).toFixed(0)}%
                        </div>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
