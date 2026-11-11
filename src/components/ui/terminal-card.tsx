import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type LabelColor = 'green' | 'red' | 'amber' | 'cyan' | 'white' | 'purple'

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
  green:  { text: 'text-[#15803D]', dot: 'bg-[#15803D]', badgeBg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]' },
  red:    { text: 'text-[#B91C1C]', dot: 'bg-[#DC2626]', badgeBg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]' },
  amber:  { text: 'text-[#B45309]', dot: 'bg-[#D97706]', badgeBg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' },
  cyan:   { text: 'text-[#047857]', dot: 'bg-[#059669]', badgeBg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]' },
  white:  { text: 'text-[#334155]', dot: 'bg-[#6B726D]', badgeBg: 'bg-[#E5E2DA]', border: 'border-[#CBD5E1]' },
  purple: { text: 'text-[#1E2420]', dot: 'bg-[#1E2420]', badgeBg: 'bg-[#E5E2DA]', border: 'border-[#CBD5E1]' },
}

export function TerminalCard({
  title, label, labelColor = 'green', children, className, headerRight, noPadding,
}: TerminalCardProps) {
  const colors = labelColorMap[labelColor]
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#E0DDD5] shadow-xs transition-shadow duration-150 hover:shadow-sm',
        className
      )}
    >
      {/* Distinct Sovereign Tint Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E0DDD5] bg-[#F2F1EC]">
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
          <span className="text-sm font-semibold text-[#1E2420] font-sans">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {headerRight}
          {label && (
            <span className={cn('text-[11px] font-semibold px-2.5 py-0.5 rounded-full border', colors.text, colors.badgeBg, colors.border)}>
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
