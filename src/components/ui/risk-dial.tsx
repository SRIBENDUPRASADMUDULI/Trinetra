import React from 'react'

interface RiskDialProps {
  value: number
  size?: number
}

function getArcColor(value: number): string {
  if (value < 50) return '#10b981'
  if (value < 75) return '#f59e0b'
  return '#f43f5e'
}

export function RiskDial({ value, size = 80 }: RiskDialProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const strokeWidth = Math.max(size * 0.1, 4)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = 0.75 * circumference
  const arcColor = getArcColor(clamped)
  const dashOffset = arcLength - (clamped / 100) * arcLength
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-0.5" title={`System Posture: ${clamped}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Risk dial: ${clamped}`}
      >
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={0}
          strokeLinecap="butt"
          transform={`rotate(135 ${cx} ${cy})`}
        />
        {/* Value arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{
            transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
          }}
        />
        {/* Value text */}
        <text
          x={cx} y={cy - 3}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={size * 0.22}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="700"
          fill={arcColor}
        >
          {clamped}
        </text>
        <text
          x={cx} y={cy + size * 0.18}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={size * 0.11}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="400"
          fill="#475569"
        >
          /100
        </text>
      </svg>
      <span className="font-mono text-slate-600 tracking-widest" style={{ fontSize: '7px' }}>
        SYS_POSTURE
      </span>
    </div>
  )
}

export default RiskDial
