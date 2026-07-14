'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, File } from 'lucide-react'
import type { DocumentRecord } from '@/lib/database/types'

const typeColor: Record<string, string> = {
  Note: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Doc: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Template: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DocumentRecord | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const load = useCallback(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => { setDocs(data); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  async function createDoc(type: string) {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, projectId: '', title: `New ${type}`, content: '' }),
    })
    const d = await res.json()
    setSelected(d)
    setEditTitle(d.title)
    setEditContent(d.content)
    load()
  }

  async function saveDoc() {
    if (!selected) return
    await fetch('/api/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, title: editTitle, content: editContent }),
    })
    load()
  }

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Documents</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Plus className="size-4" /> New
          </button>
          <div className="absolute right-0 top-full z-10 mt-1 hidden w-32 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg group-hover:block dark:border-zinc-700 dark:bg-zinc-900">
            <button onClick={() => createDoc('Note')} className="w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Note</button>
            <button onClick={() => createDoc('Doc')} className="w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Document</button>
            <button onClick={() => createDoc('Template')} className="w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Template</button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6">
        <div className="w-72 shrink-0 space-y-2">
          {docs.map((d) => (
            <button key={d.id} onClick={() => { setSelected(d); setEditTitle(d.title); setEditContent(d.content) }} className={`w-full rounded-lg border p-3 text-left transition-colors ${selected?.id === d.id ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-800' : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800'}`}>
              <div className="flex items-center gap-2">
                <File className="size-4 text-zinc-400" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[d.type] ?? ''}`}>{d.type}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">{d.title}</p>
            </button>
          ))}
          {docs.length === 0 && <p className="pt-4 text-center text-sm text-zinc-400">No documents yet.</p>}
        </div>

        {selected && (
          <div className="flex flex-1 flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 bg-transparent text-sm font-medium text-zinc-900 outline-none dark:text-zinc-50" />
              <button onClick={saveDoc} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Save</button>
            </div>
            {/* ponytail: textarea editor scaffold, replace with TipTap */}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
              placeholder="Start writing..."
            />
          </div>
        )}
      </div>
    </div>
  )
}
