'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, FileText, Send, Check } from 'lucide-react'
import type { AgreementRecord } from '@/lib/database/types'

const types = ['Proposal', 'Agreement', 'NDA', 'SOW', 'Change', 'Maintenance', 'Retainer'] as const

const typeBadge: Record<string, string> = {
  Proposal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Agreement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  NDA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  SOW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Change: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Maintenance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  Retainer: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<AgreementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AgreementRecord | null>(null)
  const [editContent, setEditContent] = useState('')

  const load = useCallback(() => {
    fetch('/api/agreements')
      .then((res) => res.json())
      .then((data) => { setAgreements(data); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  async function createAgreement(type: string) {
    const res = await fetch('/api/agreements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, clientId: '', content: '' }),
    })
    const a = await res.json()
    setSelected(a)
    setEditContent(a.content)
    load()
  }

  async function saveContent() {
    if (!selected) return
    await fetch('/api/agreements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, content: editContent }),
    })
    load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/agreements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Agreements</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{agreements.length} document{agreements.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Plus className="size-4" /> New
          </button>
          <div className="absolute right-0 top-full z-10 mt-1 hidden w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg group-hover:block dark:border-zinc-700 dark:bg-zinc-900">
            {types.map((t) => (
              <button key={t} onClick={() => createAgreement(t)} className="w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6">
        <div className="w-80 shrink-0 space-y-2">
          {agreements.map((a) => (
            <button key={a.id} onClick={() => { setSelected(a); setEditContent(a.content) }} className={`w-full rounded-lg border p-3 text-left transition-colors ${selected?.id === a.id ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-800' : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800'}`}>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-zinc-400" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge[a.type] ?? ''}`}>{a.type}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">v{a.version} · {a.status}</p>
            </button>
          ))}
          {agreements.length === 0 && <p className="pt-4 text-center text-sm text-zinc-400">No documents yet.</p>}
        </div>

        {selected && (
          <div className="flex flex-1 flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{selected.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge[selected.type] ?? ''}`}>{selected.type}</span>
                <span className="text-xs text-zinc-400">v{selected.version}</span>
              </div>
              <div className="flex items-center gap-2">
                {selected.status === 'Draft' && (
                  <>
                    <button onClick={() => updateStatus(selected.id, 'Sent')} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                      <Send className="size-3.5" /> Send
                    </button>
                    <button onClick={() => updateStatus(selected.id, 'Signed')} className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
                      <Check className="size-3.5" /> Sign
                    </button>
                  </>
                )}
                <button onClick={saveContent} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Save</button>
              </div>
            </div>
            {/* ponytail: textarea editor scaffold, replace with TipTap */}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
              placeholder="Start writing your agreement content here..."
            />
          </div>
        )}
      </div>
    </div>
  )
}
