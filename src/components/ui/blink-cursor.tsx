'use client'
import React from 'react'

type CursorColor = 'green' | 'red' | 'amber' | 'cyan' | 'white'

interface BlinkCursorProps {
  char?: string
  color?: CursorColor
  className?: string
}

const colorMap: Record<CursorColor, string> = {
  green: '#22c55e',
  red:   '#ef4444',
  amber: '#f59e0b',
  cyan:  '#06b6d4',
  white: '#e2e8f0',
}

export function BlinkCursor({ char = '█', color = 'green', className = '' }: BlinkCursorProps) {
  return (
    <span
      className={`cursor-blink font-mono select-none ${className}`}
      style={{ color: colorMap[color] }}
      aria-hidden="true"
    >
      {char}
    </span>
  )
}

export default BlinkCursor
