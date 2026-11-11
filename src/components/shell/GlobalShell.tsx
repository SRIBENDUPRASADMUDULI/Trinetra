'use client'
import React, { ReactNode } from 'react'
import { LanguageProvider } from '@/lib/i18n-context'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'
import { OfficialFooter } from '@/components/shell/OfficialFooter'
import { CinematicCanvas } from '@/components/three/CinematicCanvas'

interface GlobalShellProps {
  children: ReactNode
}

export function GlobalShell({ children }: GlobalShellProps) {
  return (
    <LanguageProvider>
      <div className="relative flex min-h-dvh bg-[#03030A] text-[#F5F5F5] overflow-x-clip">
        {/* Layer 1: 3D Starfield + Wireframe Depth */}
        <CinematicCanvas />

        {/* Newsprint Halftone + Cinematic Scanline Texture */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none newsprint-overlay opacity-75"
          aria-hidden="true"
        />

        {/* Layer 2: Interactive Shell */}
        <div className="relative z-10 flex flex-1 min-w-0">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 pb-14 md:pb-0 md:ml-16">
            <TopBar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
            <OfficialFooter />
          </div>
        </div>
      </div>
    </LanguageProvider>
  )
}

export default GlobalShell
