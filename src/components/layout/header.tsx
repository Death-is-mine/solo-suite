'use client'

import { Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from './theme-context'
import { useLayout } from './layout-context'
import { GlobalSearch } from '@/components/global-search'
import { NotificationCenter } from '@/components/notification-center'
import { CommandPalette } from '@/components/command-palette'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { toggleMobileSidebar } = useLayout()

  return (
    <>
      <CommandPalette />
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/50 bg-white/80 px-4 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <button onClick={toggleMobileSidebar} aria-label="Open mobile menu"
            className="rounded-md p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 md:hidden dark:hover:bg-zinc-800">
            <Menu className="size-4" />
          </button>
          <div className="hidden sm:block"><GlobalSearch /></div>
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white sm:hidden dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-900">
            <span>Search...</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <NotificationCenter />
          <button onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </div>
      </header>
    </>
  )
}
