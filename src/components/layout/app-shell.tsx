'use client'

import { ThemeProvider } from './theme-context'
import { LayoutProvider, useLayout } from './layout-context'
import { Sidebar } from './sidebar'
import { Header } from './header'

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { } = useLayout()
  
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <div 
        className="flex flex-1 flex-col transition-all duration-300 ease-in-out"
      >
        <Header />
        <main className="animate-fade-in flex flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <AppShellContent>{children}</AppShellContent>
      </LayoutProvider>
    </ThemeProvider>
  )
}
