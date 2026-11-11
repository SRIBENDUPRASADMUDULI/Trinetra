'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type Card3DAccent = 'red' | 'blue' | 'saffron' | 'cyan'

interface Card3DProps {
  children: React.ReactNode
  accent?: Card3DAccent
  className?: string
  onClick?: () => void
}

const ACCENT_MAP: Record<Card3DAccent, { borderHover: string; glowClass: string; corner: string }> = {
  red: {
    borderHover: 'hover:border-[#FF1B1B]/60',
    glowClass: 'hover:shadow-[0_0_24px_rgba(255,27,27,0.35),0_0_48px_rgba(255,27,27,0.14)]',
    corner: 'bg-[#FF1B1B]',
  },
  blue: {
    borderHover: 'hover:border-[#00D4FF]/60',
    glowClass: 'hover:shadow-[0_0_24px_rgba(0,212,255,0.35),0_0_48px_rgba(0,212,255,0.14)]',
    corner: 'bg-[#00D4FF]',
  },
  saffron: {
    borderHover: 'hover:border-[#FF9F1C]/60',
    glowClass: 'hover:shadow-[0_0_24px_rgba(255,159,28,0.35),0_0_48px_rgba(255,159,28,0.14)]',
    corner: 'bg-[#FF9F1C]',
  },
  cyan: {
    borderHover: 'hover:border-[#00FF9D]/60',
    glowClass: 'hover:shadow-[0_0_24px_rgba(0,255,157,0.3),0_0_44px_rgba(0,255,157,0.12)]',
    corner: 'bg-[#00FF9D]',
  },
}

export function Card3D({ children, accent = 'blue', className, onClick }: Card3DProps) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const style = ACCENT_MAP[accent]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth <= 768) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({
      rotateX: Number((-py * 7).toFixed(2)),
      rotateY: Number((px * 7).toFixed(2)),
    })
  }

  const resetTilt = () => setTilt({ rotateX: 0, rotateY: 0 })

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ y: -3, scale: 1.01 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={cn(
          'relative h-full rounded-xl bg-[#0A0A12]/95 border border-[#1A1A2E] transition-colors duration-200 overflow-hidden',
          style.borderHover,
          style.glowClass,
          onClick ? 'cursor-pointer' : '',
          className
        )}
      >
        {/* Subtle 3D specular corner pip */}
        <span className={cn('absolute top-0 right-0 w-8 h-[2px] opacity-80', style.corner)} />
        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    </div>
  )
}
