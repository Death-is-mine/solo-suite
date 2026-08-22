'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ponytail: minimal command palette — Ctrl+K to open, fuzzy search, keyboard nav

interface CommandItem {
  id: string
  label: string
  section: string
  action: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items: CommandItem[] = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', section: 'Navigation', action: () => { window.location.href = '/' } },
    { id: 'nav-leads', label: 'Go to Leads', section: 'Navigation', action: () => { window.location.href = '/leads' } },
    { id: 'nav-clients', label: 'Go to Clients', section: 'Navigation', action: () => { window.location.href = '/clients' } },
    { id: 'nav-projects', label: 'Go to Projects', section: 'Navigation', action: () => { window.location.href = '/projects' } },
    { id: 'nav-tasks', label: 'Go to Tasks', section: 'Navigation', action: () => { window.location.href = '/tasks' } },
    { id: 'nav-invoices', label: 'Go to Invoices', section: 'Navigation', action: () => { window.location.href = '/finance' } },
    { id: 'nav-calendar', label: 'Go to Calendar', section: 'Navigation', action: () => { window.location.href = '/calendar' } },
    { id: 'nav-documents', label: 'Go to Documents', section: 'Navigation', action: () => { window.location.href = '/documents' } },
    { id: 'nav-reports', label: 'Go to Reports', section: 'Navigation', action: () => { window.location.href = '/reports' } },
    { id: 'nav-automation', label: 'Go to Automation', section: 'Navigation', action: () => { window.location.href = '/automation' } },
    { id: 'nav-settings', label: 'Go to Workspace Settings', section: 'Navigation', action: () => { window.location.href = '/workspace' } },
  ]

  const filtered = query
    ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : items

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action(); setOpen(false) }
  }, [filtered, selected])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          className="w-full rounded-t-xl border-b border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none dark:border-zinc-700"
        />
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <p className="px-4 py-2 text-sm text-zinc-500">No results</p>}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { item.action(); setOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${i === selected ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
            >
              <span className="text-zinc-400 text-xs">{item.section}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-zinc-200 px-4 py-2 text-xs text-zinc-400 dark:border-zinc-700">
          ↑↓ navigate · ↵ select · esc close
        </div>
      </div>
    </div>
  )
}
