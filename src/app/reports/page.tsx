'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, FileText } from 'lucide-react'
import type { LeadRecord, ClientRecord, ProjectRecord, InvoiceRecord, ExpenseRecord, TransactionRecord } from '@/lib/database/types'

export default function ReportsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/leads').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
      fetch('/api/expenses').then((r) => r.json()),
      fetch('/api/transactions').then((r) => r.json()),
    ]).then(([l, c, p, i, e, t]) => {
      if (mounted) { setLeads(l); setClients(c); setProjects(p); setInvoices(i); setExpenses(e); setTransactions(t); setLoading(false) }
    })
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.total, 0)
  const totalExpensed = expenses.reduce((s, e) => s + e.amount, 0)
  const totalPending = invoices.filter((i) => i.status === 'Sent' || i.status === 'Partial' || i.status === 'Overdue').reduce((s, i) => s + i.total, 0)
  const wonLeads = leads.filter((l) => l.stage === 'Won').length
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0
  const activeProjects = projects.filter((p) => p.status === 'Active').length

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Reports</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Business performance at a glance</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <DollarSign className="size-4" />
            <span className="text-xs font-medium">Revenue</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${totalPaid.toFixed(0)}</p>
          <p className="text-xs text-zinc-400">${totalPending.toFixed(0)} pending</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <FileText className="size-4" />
            <span className="text-xs font-medium">Invoiced</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${totalInvoiced.toFixed(0)}</p>
          <p className="text-xs text-zinc-400">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <TrendingDown className="size-4" />
            <span className="text-xs font-medium">Expenses</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${totalExpensed.toFixed(0)}</p>
          <p className="text-xs text-zinc-400">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium">Conversion</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{conversionRate}%</p>
          <p className="text-xs text-zinc-400">{wonLeads} won / {leads.length} leads</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="size-4" />
            <span className="text-xs font-medium">Clients</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{clients.length}</p>
          <p className="text-xs text-zinc-400">Total clients</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <Briefcase className="size-4" />
            <span className="text-xs font-medium">Projects</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{activeProjects}</p>
          <p className="text-xs text-zinc-400">{projects.length} total · {activeProjects} active</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <DollarSign className="size-4" />
            <span className="text-xs font-medium">Transactions</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{transactions.length}</p>
          <p className="text-xs text-zinc-400">
            {transactions.filter((t) => t.status === 'Approved').length} approved · {transactions.filter((t) => t.status === 'Pending').length} pending
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Pipeline</h2>
          <div className="space-y-2">
            {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as const).map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-zinc-600 dark:text-zinc-400">{stage}</span>
                  <div className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="rounded-full bg-zinc-900 py-1 dark:bg-zinc-50" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-zinc-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Projects by Status</h2>
          <div className="space-y-2">
            {(['Planning', 'Active', 'Paused', 'Completed', 'Archived'] as const).map((status) => {
              const count = projects.filter((p) => p.status === status).length
              const pct = projects.length > 0 ? (count / projects.length) * 100 : 0
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-zinc-600 dark:text-zinc-400">{status}</span>
                  <div className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="rounded-full bg-zinc-900 py-1 dark:bg-zinc-50" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-zinc-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
