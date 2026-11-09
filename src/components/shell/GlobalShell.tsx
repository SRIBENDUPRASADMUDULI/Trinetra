import React, { ReactNode } from 'react'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'

interface GlobalShellProps {
  children: ReactNode
}

export function GlobalShell({ children }: GlobalShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0A0E17] text-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1" style={{ marginLeft: '256px' }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-[#0A0E17]/40">
          {children}
        </main>
      </div>
    </div>
  )
}

export default GlobalShell
