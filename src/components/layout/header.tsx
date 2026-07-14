'use client'

import { Search, Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-context'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600">
          <Search className="size-4" />
          <span>Search... (Ctrl+K)</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
        <button className="relative rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-zinc-900 dark:bg-zinc-50" />
        </button>
        <div className="ml-2 flex items-center gap-2 border-l border-zinc-200 pl-3 dark:border-zinc-700">
          <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="text-sm">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">User</p>
          </div>
        </div>
      </div>
    </header>
  )
}
