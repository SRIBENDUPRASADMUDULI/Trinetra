'use client'
import React, { ReactNode } from 'react'
import { LanguageProvider } from '@/lib/i18n-context'
import { ThemeProvider } from '@/lib/theme-context'
import { Sidebar } from '@/components/shell/Sidebar'
import { OfficialFooter } from '@/components/shell/OfficialFooter'

interface GlobalShellProps {
  children: ReactNode
}

export function GlobalShell({ children }: GlobalShellProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex min-h-dvh bg-[#F7F6F2] text-[#1C201D] dark:bg-[#0D120F] dark:text-[#F1F5F3] transition-colors duration-200 overflow-x-clip">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 pb-16 lg:pb-0 lg:ml-64">
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
              {children}
            </main>
            <OfficialFooter />
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default GlobalShell
