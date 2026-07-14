'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import type { LeadRecord } from '@/lib/database/types'

const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as const

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [, startTransition] = useTransition()

  const load = useCallback(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => startTransition(() => { setLeads(data); setLoading(false) }))
      .catch(() => startTransition(() => setLoading(false)))
  }, [])

  useEffect(() => { load() }, [load])

  async function createLead() {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    setName('')
    setEmail('')
    setShowNew(false)
    load()
  }

  async function moveStage(id: string, stage: string) {
    await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage }),
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
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Leads</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} in pipeline
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="size-4" />
          Add Lead
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={createLead} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-x-auto">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage)
          return (
            <div key={stage} className="flex w-72 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{stage}</h3>
                  <span className="text-xs text-zinc-400">{stageLeads.length}</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 p-3">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{lead.name}</p>
                    {lead.email && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{lead.email}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      {stage !== 'Won' && stage !== 'Lost' && (
                        <button
                          onClick={() => {
                            const idx = stages.indexOf(stage)
                            if (idx < stages.length - 1) moveStage(lead.id, stages[idx + 1])
                          }}
                          className="flex items-center gap-0.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                          <ChevronRight className="size-3" />
                          Advance
                        </button>
                      )}
                      {stage !== 'Won' && stage !== 'Lost' && (
                        <button
                          onClick={() => moveStage(lead.id, 'Lost')}
                          className="ml-2 text-xs text-red-500 hover:text-red-700"
                        >
                          Lost
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <p className="pt-4 text-center text-xs text-zinc-400">No leads</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
