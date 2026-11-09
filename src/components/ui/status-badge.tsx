import React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'ok' | 'critical' | 'warning' | 'info' | 'neutral'

interface StatusBadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
  blink?: boolean
}

const variantStyles: Record<BadgeVariant, { pill: string; dot: string }> = {
  ok:       { pill: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  critical: { pill: 'text-rose-300 bg-rose-500/10 border-rose-500/20', dot: 'bg-rose-400' },
  warning:  { pill: 'text-amber-300 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  info:     { pill: 'text-sky-300 bg-sky-500/10 border-sky-500/20', dot: 'bg-sky-400' },
  neutral:  { pill: 'text-slate-300 bg-white/[0.05] border-white/10', dot: 'bg-slate-400' },
}

export function StatusBadge({ label, variant = 'neutral', className, blink }: StatusBadgeProps) {
  const style = variantStyles[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wide border px-2.5 py-0.5 rounded-full select-none',
        style.pill,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', style.dot, blink && 'animate-pulse')} />
      <span>{label}</span>
    </span>
  )
}

export default StatusBadge
