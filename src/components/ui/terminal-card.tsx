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
  green:  { text: 'text-[#15803D]', dot: 'bg-[#15803D]', badgeBg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
  red:    { text: 'text-[#DC2626]', dot: 'bg-[#DC2626]', badgeBg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]' },
  amber:  { text: 'text-[#D97706]', dot: 'bg-[#D97706]', badgeBg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' },
  cyan:   { text: 'text-[#2563EB]', dot: 'bg-[#2563EB]', badgeBg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]' },
  white:  { text: 'text-[#4B5563]', dot: 'bg-[#6B7280]', badgeBg: 'bg-[#F3F4F6]', border: 'border-[#E5E7EB]' },
  purple: { text: 'text-[#2563EB]', dot: 'bg-[#2563EB]', badgeBg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]' },
}

export function TerminalCard({
  title, label, labelColor = 'green', children, className, headerRight, noPadding,
}: TerminalCardProps) {
  const colors = labelColorMap[labelColor]
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs transition-shadow duration-150 hover:shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
          <span className="text-sm font-semibold text-[#1A1A1A] font-sans">
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
