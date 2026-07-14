'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Users, Briefcase, TrendingUp, TrendingDown, Target } from 'lucide-react'
import Link from 'next/link'
import type { LeadRecord, ClientRecord, ProjectRecord, InvoiceRecord, ExpenseRecord, TaskRecord, MeetingRecord } from '@/lib/database/types'

export default function DashboardPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [meetings, setMeetings] = useState<MeetingRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/leads').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
      fetch('/api/expenses').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/meetings').then((r) => r.json()),
    ]).then(([l, c, p, i, e, t, m]) => {
      if (mounted) { setLeads(l); setClients(c); setProjects(p); setInvoices(i); setExpenses(e); setTasks(t); setMeetings(m); setLoading(false) }
    })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>
  }

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.total, 0)
  const totalPending = totalInvoiced - totalPaid
  const totalExpensed = expenses.reduce((s, e) => s + e.amount, 0)
  const activeProjects = projects.filter((p) => p.status === 'Active').length
  const wonLeads = leads.filter((l) => l.stage === 'Won').length
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0
  const netIncome = totalPaid - totalExpensed
  const dueTasks = tasks.filter((t) => t.status !== 'Done').length
  const upcomingMeetings = meetings.filter((m) => new Date(m.date) > new Date()).length

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your business at a glance</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <DollarSign className="size-4" />
            <span className="text-xs font-medium">Net Income</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${netIncome.toFixed(0)}</p>
          <p className="text-xs text-zinc-400">${totalPaid.toFixed(0)} collected</p>
        </div>
        <Link href="/finance" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Target className="size-4" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${totalPending.toFixed(0)}</p>
          <p className="text-xs text-zinc-400">{invoices.filter((i) => i.status === 'Sent' || i.status === 'Overdue').length} open invoices</p>
        </Link>
        <Link href="/reports" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium">Conversion</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{conversionRate}%</p>
          <p className="text-xs text-zinc-400">{wonLeads} won / {leads.length} leads</p>
        </Link>
        <Link href="/projects" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500">
            <Briefcase className="size-4" />
            <span className="text-xs font-medium">Projects</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{activeProjects}</p>
          <p className="text-xs text-zinc-400">{dueTasks} open tasks</p>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Link href="/clients" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="size-4" />
            <span className="text-xs font-medium">Clients</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{clients.length}</p>
        </Link>
        <Link href="/tasks" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500">
            <Target className="size-4" />
            <span className="text-xs font-medium">Tasks</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{dueTasks}</p>
          <p className="text-xs text-zinc-400">{upcomingMeetings} upcoming meetings</p>
        </Link>
        <Link href="/leads" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500">
            <TrendingDown className="size-4" />
            <span className="text-xs font-medium">Leads Pipeline</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{leads.length}</p>
          <p className="text-xs text-zinc-400">{leads.filter((l) => l.stage === 'New').length} new</p>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Pipeline Overview</h2>
          <div className="space-y-2">
            {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as const).map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
              if (count === 0) return null
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-zinc-600 dark:text-zinc-400">{stage}</span>
                  <div className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="rounded-full bg-zinc-900 py-1 dark:bg-zinc-50" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-zinc-500">{count}</span>
                </div>
              )
            })}
            {leads.length === 0 && <p className="text-sm text-zinc-400">No leads in pipeline.</p>}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/leads" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <Users className="size-4" /> Add a lead
            </Link>
            <Link href="/clients" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <Users className="size-4" /> Create a client
            </Link>
            <Link href="/projects" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <Briefcase className="size-4" /> Start a project
            </Link>
            <Link href="/finance" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <DollarSign className="size-4" /> Create an invoice
            </Link>
            <Link href="/tasks" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <Target className="size-4" /> Add a task
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
