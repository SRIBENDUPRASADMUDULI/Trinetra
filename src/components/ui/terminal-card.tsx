import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type LabelColor = 'green' | 'red' | 'amber' | 'cyan' | 'white'

interface TerminalCardProps {
  title: string
  label?: string
  labelColor?: LabelColor
  children: ReactNode
  className?: string
  headerRight?: ReactNode
  noPadding?: boolean
}

const labelColorMap: Record<LabelColor, { text: string; dot: string; badgeBg: string; border: string }> = {
  green: { text: 'text-emerald-300', dot: 'bg-emerald-400', badgeBg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  red:   { text: 'text-rose-300',    dot: 'bg-rose-400',    badgeBg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  amber: { text: 'text-amber-300',   dot: 'bg-amber-400',   badgeBg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  cyan:  { text: 'text-sky-300',     dot: 'bg-sky-400',     badgeBg: 'bg-sky-500/10',     border: 'border-sky-500/20' },
  white: { text: 'text-slate-300',   dot: 'bg-slate-400',   badgeBg: 'bg-white/[0.06]',   border: 'border-white/15' },
}

export function TerminalCard({
  title, label, labelColor = 'green', children, className, headerRight, noPadding,
}: TerminalCardProps) {
  const colors = labelColorMap[labelColor]
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl overflow-hidden glass-card transition-all duration-300',
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.015]"
      >
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full opacity-80', colors.dot)} />
          <span className="text-xs font-semibold text-slate-100 tracking-wide font-sans">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {headerRight}
          {label && (
            <span className={cn('font-mono text-[11px] font-medium tracking-wide px-2.5 py-0.5 rounded-full border', colors.text, colors.badgeBg, colors.border)}>
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn('flex-1', noPadding ? '' : 'p-5')}>
        {children}
      </div>
    </div>
  )
}

export default TerminalCard
