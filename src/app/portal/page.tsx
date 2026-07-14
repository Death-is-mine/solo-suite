'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, FileText, Briefcase, Wallet } from 'lucide-react'
import type { ClientRecord, ProjectRecord, AgreementRecord, InvoiceRecord } from '@/lib/database/types'

export default function PortalPage() {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [agreements, setAgreements] = useState<AgreementRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/agreements').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
    ]).then(([c, p, a, i]) => {
      if (mounted) { setClients(c); setProjects(p); setAgreements(a); setInvoices(i); setLoading(false) }
    }).catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Client Portal</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Shared workspace for you and your clients</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Projects</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{projects.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Agreements</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{agreements.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Invoices</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{invoices.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Clients</h2>
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.company}</p>
                <p className="text-xs text-zinc-500">{c.id}</p>
              </div>
              <ExternalLink className="size-4 text-zinc-400" />
            </div>
          ))}
          {clients.length === 0 && <p className="text-sm text-zinc-400">No clients yet.</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Recent Projects</h2>
          <div className="space-y-2">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.status}</p>
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-zinc-400">No projects.</p>}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Open Invoices</h2>
          <div className="space-y-2">
            {invoices.filter((i) => i.status === 'Sent' || i.status === 'Partial' || i.status === 'Overdue').slice(0, 5).map((inv) => (
              <div key={inv.id} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{inv.id}</p>
                <p className="text-xs text-zinc-500">{inv.currency} {inv.total.toFixed(2)} · {inv.status}</p>
              </div>
            ))}
            {invoices.filter((i) => i.status === 'Sent' || i.status === 'Partial').length === 0 && <p className="text-sm text-zinc-400">No open invoices.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
