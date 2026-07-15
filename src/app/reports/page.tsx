'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, FileText, BarChart3, PieChart } from 'lucide-react'
import type { LeadRecord, ClientRecord, ProjectRecord, InvoiceRecord, ExpenseRecord, TransactionRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Card } from '@/components/ui/card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { ProgressBar } from '@/components/ui/progress-bar'

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
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Reports" description="Business performance at a glance" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.total, 0)
  const totalExpensed = expenses.reduce((s, e) => s + e.amount, 0)
  const totalPending = invoices.filter((i) => i.status === 'Sent' || i.status === 'Partial' || i.status === 'Overdue').reduce((s, i) => s + i.total, 0)
  
  const wonLeads = leads.filter((l) => l.stage === 'Won').length
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0
  const activeProjects = projects.filter((p) => p.status === 'Active').length

  const leadStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as const
  const projectStatuses = ['Planning', 'Active', 'Paused', 'Completed', 'Archived'] as const

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Reports & Analytics" 
        description="Comprehensive overview of your business performance"
      />

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={`$${totalPaid.toFixed(0)}`}
          icon={<DollarSign className="size-5" />}
          trend={`${totalPending.toFixed(0)} pending`}

          accentColor="emerald"
          delay={1}
        />
        <MetricCard
          label="Invoiced"
          value={`$${totalInvoiced.toFixed(0)}`}
          icon={<FileText className="size-5" />}
          trend={`${invoices.length} invoices`}

          accentColor="indigo"
          delay={2}
        />
        <MetricCard
          label="Expenses"
          value={`$${totalExpensed.toFixed(0)}`}
          icon={<TrendingDown className="size-5" />}
          trend={`${expenses.length} expenses`}

          accentColor="rose"
          delay={3}
        />
        <MetricCard
          label="Conversion"
          value={`${conversionRate}%`}
          icon={<TrendingUp className="size-5" />}
          trend={`${wonLeads} won / ${leads.length} leads`}

          accentColor="amber"
          delay={4}
        />
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <MetricCard
          label="Clients"
          value={clients.length.toString()}
          icon={<Users className="size-5" />}
          trend="Total clients"

          accentColor="blue"
          delay={5}
        />
        <MetricCard
          label="Projects"
          value={activeProjects.toString()}
          icon={<Briefcase className="size-5" />}
          trend={`${projects.length} total · ${activeProjects} active`}

          accentColor="purple"
          delay={6}
        />
        <MetricCard
          label="Transactions"
          value={transactions.length.toString()}
          icon={<DollarSign className="size-5" />}
          trend={`${transactions.filter((t) => t.status === 'Approved').length} approved · ${transactions.filter((t) => t.status === 'Pending').length} pending`}

          accentColor="cyan"
          delay={7}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glass className="animate-slide-up delay-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Lead Pipeline</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Distribution of leads across stages</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
              <BarChart3 className="size-5 text-zinc-500 dark:text-zinc-400" />
            </div>
          </div>
          
          <div className="space-y-5">
            {leadStages.map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
              
              const color = 
                stage === 'Won' ? 'bg-emerald-500 dark:bg-emerald-500' : 
                stage === 'Lost' ? 'bg-rose-500 dark:bg-rose-500' : 
                'bg-indigo-500 dark:bg-indigo-500'

              return (
                <div key={stage}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{stage}</span>
                    <span className="text-zinc-500">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <ProgressBar progress={pct} colorClass={color} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card glass className="animate-slide-up delay-9">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Projects Overview</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Current status of all projects</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
              <PieChart className="size-5 text-zinc-500 dark:text-zinc-400" />
            </div>
          </div>
          
          <div className="space-y-5">
            {projectStatuses.map((status) => {
              const count = projects.filter((p) => p.status === status).length
              const pct = projects.length > 0 ? (count / projects.length) * 100 : 0
              
              const color = 
                status === 'Active' ? 'bg-emerald-500 dark:bg-emerald-500' : 
                status === 'Planning' ? 'bg-blue-500 dark:bg-blue-500' : 
                status === 'Paused' ? 'bg-amber-500 dark:bg-amber-500' : 
                status === 'Archived' ? 'bg-rose-500 dark:bg-rose-500' : 
                'bg-zinc-500 dark:bg-zinc-500'

              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{status}</span>
                    <span className="text-zinc-500">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <ProgressBar progress={pct} colorClass={color} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
