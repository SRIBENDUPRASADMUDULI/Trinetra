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
  green:  { text: 'text-[#00A896]', dot: 'bg-[#00A896]', badgeBg: 'bg-[#00A896]/10', border: 'border-[#00A896]/30' },
  red:    { text: 'text-[#D64045]', dot: 'bg-[#D64045]', badgeBg: 'bg-[#D64045]/10', border: 'border-[#D64045]/30' },
  amber:  { text: 'text-[#FF9F1C]', dot: 'bg-[#FF9F1C]', badgeBg: 'bg-[#FF9F1C]/10', border: 'border-[#FF9F1C]/30' },
  cyan:   { text: 'text-[#00A896]', dot: 'bg-[#00A896]', badgeBg: 'bg-[#00A896]/10', border: 'border-[#00A896]/30' },
  white:  { text: 'text-[#F8F9FA]', dot: 'bg-[#8D99AE]', badgeBg: 'bg-[#0A192F]',    border: 'border-[#233554]' },
  purple: { text: 'text-[#FF9F1C]', dot: 'bg-[#FF9F1C]', badgeBg: 'bg-[#FF9F1C]/10', border: 'border-[#FF9F1C]/30' },
}

export function TerminalCard({
  title, label, labelColor = 'green', children, className, headerRight, noPadding,
}: TerminalCardProps) {
  const colors = labelColorMap[labelColor]
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl overflow-hidden bg-[#172A45] border border-[#233554] shadow-sm transition-colors duration-200',
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-[#233554] bg-[#0A192F]/80"
      >
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
          <span className="text-xs font-semibold text-[#F8F9FA] tracking-wide font-sans">
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
