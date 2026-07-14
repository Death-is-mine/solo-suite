'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Mail, ExternalLink } from 'lucide-react'
import type { ClientRecord } from '@/lib/database/types'

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [company, setCompany] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const load = useCallback(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => { setClients(data); setLoading(false) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function createClient() {
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          contacts: JSON.stringify([{ name: contactName, email: contactEmail }]),
        }),
      })
    } catch {}
    setCompany(''); setContactName(''); setContactEmail('')
    setShowNew(false)
    load()
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Clients</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> Add Client
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex gap-3">
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Contact email" type="email" className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          </div>
          <div className="flex gap-2">
            <button onClick={createClient} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <div key={client.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{client.company}</h3>
              {client.portalAccess && <ExternalLink className="size-3.5 text-zinc-400" />}
            </div>
            {client.contacts && (() => {
              try {
                const parsed = JSON.parse(client.contacts)
                return Array.isArray(parsed) ? parsed.map((c: { name?: string; email?: string }, i: number) => (
                  <div key={i} className="text-sm text-zinc-500 dark:text-zinc-400">
                    <p>{c.name}</p>
                    {c.email && <p className="flex items-center gap-1 text-xs"><Mail className="size-3" />{c.email}</p>}
                  </div>
                )) : null
              } catch { return null }
            })()}
            {client.tags && (
              <div className="mt-2 flex flex-wrap gap-1">
                {client.tags.split(',').map((t) => (
                  <span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{t.trim()}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {clients.length === 0 && (
          <p className="col-span-full pt-8 text-center text-sm text-zinc-400">No clients yet. Convert a lead or add one.</p>
        )}
      </div>
    </div>
  )
}
