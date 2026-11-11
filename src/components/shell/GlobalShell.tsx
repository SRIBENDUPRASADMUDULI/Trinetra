'use client'
import React, { ReactNode } from 'react'
import { LanguageProvider } from '@/lib/i18n-context'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'
import { OfficialFooter } from '@/components/shell/OfficialFooter'

interface GlobalShellProps {
  children: ReactNode
}

export function GlobalShell({ children }: GlobalShellProps) {
  return (
    <LanguageProvider>
      <div className="flex min-h-dvh bg-[#0A192F] text-[#F8F9FA]">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 pb-14 md:pb-0 md:ml-16">
          <TopBar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0A192F]">
            {children}
          </main>
          <OfficialFooter />
        </div>
      </div>
    </LanguageProvider>
  )
}

export default GlobalShell
