'use client'

import { useState, useEffect, useCallback } from 'react'

// ponytail: global search — searches across leads, clients, projects via API

interface SearchResult {
  entity: string
  id: string
  name: string
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'tools/call',
          params: { name: 'search_entities', arguments: { query: q } },
        }),
      })
      const data = await res.json()
      if (data.result?.content?.[0]?.text) setResults(JSON.parse(data.result.content[0].text))
    } catch { setResults([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  const entityHref = (entity: string) => {
    switch (entity) {
      case 'lead': return '/leads'
      case 'client': return '/clients'
      case 'project': return '/projects'
      case 'invoice': return '/finance'
      default: return '/'
    }
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Search..."
        className="w-64 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
      />
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 z-40 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {loading && <p className="px-3 py-2 text-xs text-zinc-500">Searching...</p>}
          {!loading && results.length === 0 && <p className="px-3 py-2 text-xs text-zinc-500">No results</p>}
          {!loading && results.map((r) => (
            <a key={`${r.entity}-${r.id}`} href={entityHref(r.entity)} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{r.entity}</span>
              <span>{r.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
