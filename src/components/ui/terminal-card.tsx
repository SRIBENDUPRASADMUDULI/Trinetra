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
  green:  { text: 'text-[#00FF9D]', dot: 'bg-[#00FF9D]', badgeBg: 'bg-[#00FF9D]/10', border: 'border-[#00FF9D]/30' },
  red:    { text: 'text-[#FF1B1B]', dot: 'bg-[#FF1B1B]', badgeBg: 'bg-[#FF1B1B]/10', border: 'border-[#FF1B1B]/35' },
  amber:  { text: 'text-[#FF9F1C]', dot: 'bg-[#FF9F1C]', badgeBg: 'bg-[#FF9F1C]/10', border: 'border-[#FF9F1C]/35' },
  cyan:   { text: 'text-[#00D4FF]', dot: 'bg-[#00D4FF]', badgeBg: 'bg-[#00D4FF]/10', border: 'border-[#00D4FF]/35' },
  white:  { text: 'text-[#F5F5F5]', dot: 'bg-[#888888]', badgeBg: 'bg-[#03030A]',    border: 'border-[#1A1A2E]' },
  purple: { text: 'text-[#00D4FF]', dot: 'bg-[#00D4FF]', badgeBg: 'bg-[#00D4FF]/10', border: 'border-[#00D4FF]/35' },
}

export function TerminalCard({
  title, label, labelColor = 'green', children, className, headerRight, noPadding,
}: TerminalCardProps) {
  const colors = labelColorMap[labelColor]
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl overflow-hidden bg-[#0A0A12]/92 border border-[#1A1A2E] backdrop-blur-md shadow-[0_12px_32px_-12px_rgba(0,0,0,0.85)] transition-all duration-200 hover:border-[#00D4FF]/35',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1A1A2E] bg-[#03030A]/85">
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
          <span className="text-xs font-semibold text-[#F5F5F5] tracking-wide font-sans">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {headerRight}
          {label && (
            <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border', colors.text, colors.badgeBg, colors.border)}>
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
