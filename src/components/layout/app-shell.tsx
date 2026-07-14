'use client'

import { ThemeProvider } from './theme-context'
import { Sidebar } from './sidebar'
import { Header } from './header'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}
