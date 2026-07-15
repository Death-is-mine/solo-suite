'use client'

import { Search, Bell, Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from './theme-context'
import { useLayout } from './layout-context'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { toggleMobileSidebar } = useLayout()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/50 bg-white/80 px-4 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobileSidebar}
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Menu className="size-4" />
        </button>
        <button className="group flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
          <Search className="size-4 text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300" />
          <span>Search...</span>
          <kbd className="hidden rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline-block dark:bg-zinc-800 dark:text-zinc-400">Ctrl+K</kbd>
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
        <button className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500 dark:border-zinc-950" />
        </button>
      </div>
    </header>
  )
}
