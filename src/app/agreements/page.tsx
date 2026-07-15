'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, FileText, Send, Check, ChevronDown, FilePlus2, ScrollText } from 'lucide-react'
import type { AgreementRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'

const types = ['Proposal', 'Agreement', 'NDA', 'SOW', 'Change', 'Maintenance', 'Retainer'] as const

const typeBadgeVariant: Record<string, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  Proposal: 'info',
  Agreement: 'success',
  NDA: 'neutral',
  SOW: 'warning',
  Change: 'error',
  Maintenance: 'success',
  Retainer: 'info',
}

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<AgreementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AgreementRecord | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showNewMenu, setShowNewMenu] = useState(false)

  const load = useCallback(() => {
    fetch('/api/agreements')
      .then((res) => res.json())
      .then((data) => { setAgreements(data); setLoading(false) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function createAgreement(type: string) {
    let res: Response
    try {
      res = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, clientId: '', content: '' }),
      })
    } catch { return }
    const a = await res.json()
    setSelected(a)
    setEditContent(a.content)
    load()
  }

  async function saveContent() {
    if (!selected) return
    try {
      await fetch('/api/agreements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, content: editContent }),
      })
    } catch {}
    load()
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/agreements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    } catch {}
    load()
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Agreements" description="Manage your proposals and contracts" />
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <SkeletonCard className="h-[400px]" />
          <SkeletonCard className="h-[400px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Agreements" 
        description={`${agreements.length} document${agreements.length !== 1 ? 's' : ''}`}
      >
        <div className="relative">
          <Button 
            onClick={() => setShowNewMenu((v) => !v)} 
            onBlur={() => setTimeout(() => setShowNewMenu(false), 200)}
            leftIcon={<Plus className="size-4" />}
            rightIcon={<ChevronDown className="size-3.5" />}
          >
            New Document
          </Button>
          {showNewMenu && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              {types.map((t) => (
                <button 
                  key={t} 
                  onClick={() => { createAgreement(t); setShowNewMenu(false) }} 
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <FilePlus2 className="size-4 text-zinc-400" />
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </PageHeader>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Document List */}
        <div className="w-72 shrink-0 space-y-2 overflow-y-auto xl:w-80">
          {agreements.map((a, idx) => (
            <button 
              key={a.id} 
              onClick={() => { setSelected(a); setEditContent(a.content) }} 
              className={`animate-slide-up delay-${idx % 5 + 1} group w-full rounded-xl border p-4 text-left transition-all ${
                selected?.id === a.id 
                  ? 'border-indigo-500/40 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500/20 dark:border-indigo-500/30 dark:bg-indigo-950/20 dark:ring-indigo-500/10' 
                  : 'border-zinc-200/60 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex size-8 items-center justify-center rounded-lg ${selected?.id === a.id ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                  <FileText className="size-4" />
                </div>
                <Badge variant={typeBadgeVariant[a.type] ?? 'neutral'}>{a.type}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">v{a.version}</span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span className={`text-xs font-medium ${
                  a.status === 'Signed' ? 'text-emerald-600 dark:text-emerald-400' : 
                  a.status === 'Sent' ? 'text-blue-600 dark:text-blue-400' : 
                  'text-zinc-500 dark:text-zinc-400'
                }`}>
                  {a.status}
                </span>
              </div>
            </button>
          ))}
          {agreements.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
              <ScrollText className="mb-3 size-10 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No documents yet.</p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">Create your first agreement.</p>
            </div>
          )}
        </div>

        {/* Editor Pane */}
        {selected ? (
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{selected.id}</span>
                <Badge variant={typeBadgeVariant[selected.type] ?? 'neutral'}>{selected.type}</Badge>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">v{selected.version}</span>
              </div>
              <div className="flex items-center gap-2">
                {selected.status === 'Draft' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => updateStatus(selected.id, 'Sent')}
                      leftIcon={<Send className="size-3.5" />}
                    >
                      Send
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus(selected.id, 'Signed')}
                      leftIcon={<Check className="size-3.5" />}
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                    >
                      Sign
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={saveContent}>
                  Save
                </Button>
              </div>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 resize-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
              placeholder="Start writing your agreement content here..."
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-transparent dark:border-zinc-800">
            <ScrollText className="mb-4 size-14 text-zinc-200 dark:text-zinc-800" />
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">Select a document</h3>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-600">
              Choose a document from the sidebar or create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
