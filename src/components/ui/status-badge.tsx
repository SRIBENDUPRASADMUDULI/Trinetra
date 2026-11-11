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
  ok:       { pill: 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]', dot: 'bg-[#15803D]' },
  critical: { pill: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]', dot: 'bg-[#DC2626]' },
  warning:  { pill: 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]', dot: 'bg-[#D97706]' },
  info:     { pill: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]', dot: 'bg-[#059669]' },
  neutral:  { pill: 'text-[#4B5563] bg-[#F3F4F6] border-[#E5E7EB]', dot: 'bg-[#6B7280]' },
}

export function StatusBadge({ label, variant = 'neutral', className, blink }: StatusBadgeProps) {
  const style = variantStyles[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide border px-2.5 py-0.5 rounded-full select-none',
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
