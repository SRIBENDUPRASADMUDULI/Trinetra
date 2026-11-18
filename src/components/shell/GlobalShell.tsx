'use client'
import React, { ReactNode } from 'react'
import { LanguageProvider } from '@/lib/i18n-context'
import { ThemeProvider } from '@/lib/theme-context'
import { TopBar } from '@/components/shell/TopBar'
import { OfficialFooter } from '@/components/shell/OfficialFooter'

interface GlobalShellProps {
  children: ReactNode
}

export function GlobalShell({ children }: GlobalShellProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex flex-col min-h-dvh w-full bg-[#F7F6F2] text-[#1C201D] dark:bg-[#0D120F] dark:text-[#F1F5F3] transition-colors duration-200">
          <TopBar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <OfficialFooter />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default GlobalShell
