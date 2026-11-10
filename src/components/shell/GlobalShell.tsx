import React, { ReactNode } from 'react'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'

interface GlobalShellProps {
  children: ReactNode
}

export function GlobalShell({ children }: GlobalShellProps) {
  return (
    <div className="flex min-h-screen bg-[#1E2235] text-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0" style={{ marginLeft: '64px' }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#1E2235]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default GlobalShell
