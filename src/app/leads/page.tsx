'use client'

import Link from 'next/link'
import { useState, useCallback, useEffect, useTransition } from 'react'
import { ArrowRight, CheckCircle2, CircleDashed, Mail, Plus, Search, X } from 'lucide-react'
import type { LeadRecord } from '@/lib/database/types'

const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as const

const stageStyle: Record<(typeof stages)[number], { dot: string; badge: string }> = {
  New: { dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900' },
  Contacted: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-900' },
  Qualified: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900' },
  'Proposal Sent': { dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-950/60 dark:text-orange-300 dark:ring-orange-900' },
  Won: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900' },
  Lost: { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900' },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const load = useCallback(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => startTransition(() => { setLeads(data); setLoading(false) }))
      .catch(() => startTransition(() => setLoading(false)))
  }, [])

  useEffect(() => { load() }, [load])

  async function createLead() {
    if (!name.trim()) return
    await fetch('/api/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    })
    setName(''); setEmail(''); setShowNew(false); load()
  }

  async function moveStage(id: string, stage: string) {
    await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, stage }) })
    load()
  }

  const visibleLeads = leads.filter((lead) => `${lead.name} ${lead.email} ${lead.source ?? ''}`.toLowerCase().includes(query.toLowerCase()))
  const activeCount = leads.filter((lead) => !['Won', 'Lost'].includes(lead.stage)).length
  const wonCount = leads.filter((lead) => lead.stage === 'Won').length

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-600">Loading your pipeline…</div>

  return (
    <div className="min-h-full w-full bg-zinc-50/70 p-4 sm:p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">CRM · Pipeline</p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">Keep momentum visible.</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">Move conversations forward without losing the context behind them.</p>
          </div>
          <button onClick={() => setShowNew(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950">
            <Plus className="size-4" /> Add lead
          </button>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Pipeline overview">
          <Metric label="Open conversations" value={activeCount} icon={<CircleDashed className="size-4" />} accent="text-sky-600 dark:text-sky-400" />
          <Metric label="Qualified" value={leads.filter((lead) => lead.stage === 'Qualified').length} icon={<ArrowRight className="size-4" />} accent="text-amber-600 dark:text-amber-400" />
          <Metric label="Converted" value={wonCount} icon={<CheckCircle2 className="size-4" />} accent="text-emerald-700 dark:text-emerald-400" />
        </section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people or sources" className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white" />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600"><span className="font-medium text-zinc-900 dark:text-white">{visibleLeads.length}</span> of {leads.length} leads</p>
        </div>

        {showNew && (
          <form onSubmit={(event) => { event.preventDefault(); createLead() }} className="animate-in mb-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-emerald-900/70 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-zinc-900 dark:text-white">Add a lead</h2><p className="text-sm text-zinc-600 dark:text-zinc-400">Start with the essentials. You can enrich it later.</p></div><button type="button" onClick={() => setShowNew(false)} className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white" aria-label="Close form"><X className="size-4" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2"><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name or company" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" /><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address (optional)" type="email" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" /></div>
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowNew(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button><button disabled={isPending} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">Create lead</button></div>
          </form>
        )}

        <section className="flex gap-4 overflow-x-auto pb-5" tabIndex={0} tabIndex={0} aria-label="Lead pipeline">
          {stages.map((stage) => {
            const stageLeads = visibleLeads.filter((lead) => lead.stage === stage)
            return <div key={stage} className="flex w-[280px] shrink-0 flex-col rounded-2xl border border-zinc-200/80 bg-zinc-100/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${stageStyle[stage].dot}`} /><h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{stage}</h2></div><span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 shadow-sm dark:bg-zinc-800">{stageLeads.length}</span></div>
              <div className="min-h-28 space-y-2">{stageLeads.map((lead) => <LeadCard key={lead.id} lead={lead} stage={stage} onAdvance={moveStage} />)}{stageLeads.length === 0 && <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-7 text-center text-xs text-zinc-600 dark:border-zinc-700">No leads here yet</p>}</div>
            </div>
          })}
        </section>
      </div>
    </div>
  )
}

function Metric({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) { return <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className={`mb-4 ${accent}`}>{icon}</div><p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{value}</p><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">{label}</p></div> }

function LeadCard({ lead, stage, onAdvance }: { lead: LeadRecord; stage: (typeof stages)[number]; onAdvance: (id: string, stage: string) => void }) {
  const closed = stage === 'Won' || stage === 'Lost'
  const nextStage = stages[stages.indexOf(stage) + 1]
  return <article className="group rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900"><Link href={`/leads/${lead.id}`} className="block focus:outline-none"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">{lead.name}</h3>{lead.email && <p className="mt-1 flex items-center gap-1 truncate text-xs text-zinc-600 dark:text-zinc-400"><Mail className="size-3 shrink-0" />{lead.email}</p>}</div><span className={`mt-0.5 size-2 shrink-0 rounded-full ${stageStyle[stage].dot}`} /></div>{lead.source && <span className={`mt-3 inline-flex rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${stageStyle[stage].badge}`}>{lead.source}</span>}</Link>{!closed && <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-zinc-800"><button onClick={() => onAdvance(lead.id, nextStage)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300">Advance <ArrowRight className="size-3" /></button><button onClick={() => onAdvance(lead.id, 'Lost')} className="text-xs font-medium text-zinc-600 transition hover:text-rose-600">Mark lost</button></div>}</article>
}

