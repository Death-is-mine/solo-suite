'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Users, Briefcase, TrendingUp, Target, Clock } from 'lucide-react'
import Link from 'next/link'
import type { LeadRecord, ClientRecord, ProjectRecord, InvoiceRecord, ExpenseRecord, TaskRecord, MeetingRecord } from '@/lib/database/types'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { SkeletonCard } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<{
    leads: LeadRecord[]
    clients: ClientRecord[]
    projects: ProjectRecord[]
    invoices: InvoiceRecord[]
    expenses: ExpenseRecord[]
    tasks: TaskRecord[]
    meetings: MeetingRecord[]
  } | null>(null)

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
    ]).then(([leads, clients, projects, invoices, expenses, tasks, meetings]) => {
      if (mounted) { 
        setData({ leads, clients, projects, invoices, expenses, tasks, meetings })
      }
    }).catch(console.error)
    return () => { mounted = false }
  }, [])

  if (!data) {
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader 
          title="Loading workspace..." 
          description="Fetching your latest business metrics."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const { leads, clients, projects, invoices, expenses, tasks, meetings } = data

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

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      {/* Welcome Banner */}
      <div className="animate-fade-in relative mb-8 overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white shadow-xl dark:bg-zinc-900/50 dark:border dark:border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {greeting()}, {session?.user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-2 text-zinc-300">
              Here&apos;s what&apos;s happening with your business today. You have <span className="font-semibold text-white">{dueTasks} tasks</span> due and <span className="font-semibold text-white">{upcomingMeetings} meetings</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Net Income</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(netIncome)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Pending</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label="Active Projects"
          value={activeProjects}
          icon={<Briefcase className="size-5" />}
          accentColor="indigo"
          delay={1}
          trend={{ value: 12, label: 'vs last month', positive: true }}
        />
        <MetricCard 
          label="Total Clients"
          value={clients.length}
          icon={<Users className="size-5" />}
          accentColor="emerald"
          delay={2}
        />
        <MetricCard 
          label="Lead Conversion"
          value={`${conversionRate}%`}
          icon={<TrendingUp className="size-5" />}
          accentColor="sky"
          delay={3}
          trend={{ value: 5, label: 'vs last month', positive: true }}
        />
        <MetricCard 
          label="Total Leads"
          value={leads.length}
          icon={<Target className="size-5" />}
          accentColor="amber"
          delay={4}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline Overview */}
        <Card glass className="animate-slide-up delay-5 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Pipeline Overview</h2>
            <Link href="/leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              View all leads &rarr;
            </Link>
          </div>
          <div className="space-y-6">
            {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as const).map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
              if (count === 0 && leads.length > 0) return null
              
              const colorMap = {
                'New': 'indigo',
                'Contacted': 'sky',
                'Qualified': 'amber',
                'Proposal Sent': 'emerald',
                'Won': 'emerald',
                'Lost': 'rose'
              } as const

              return (
                <div key={stage} className="flex items-center gap-4">
                  <span className="w-32 text-sm font-medium text-zinc-600 dark:text-zinc-400">{stage}</span>
                  <div className="flex-1">
                    <ProgressBar 
                      value={pct} 
                      color={colorMap[stage]}
                      size="lg"
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-zinc-900 dark:text-white">
                    {count}
                  </span>
                </div>
              )
            })}
            {leads.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                <Target className="mx-auto size-8 text-zinc-400" />
                <p className="mt-2 text-sm text-zinc-500">No leads in pipeline yet.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions & Tasks */}
        <div className="space-y-6">
          <Card glass className="animate-slide-up delay-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/leads" className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200/50 bg-white p-4 transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:border-indigo-900/50">
                <div className="rounded-full bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Users className="size-4" /></div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Add Lead</span>
              </Link>
              <Link href="/invoices" className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200/50 bg-white p-4 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:border-emerald-900/50">
                <div className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><DollarSign className="size-4" /></div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Invoice</span>
              </Link>
              <Link href="/projects" className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200/50 bg-white p-4 transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:border-amber-900/50">
                <div className="rounded-full bg-amber-50 p-2 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><Briefcase className="size-4" /></div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Project</span>
              </Link>
              <Link href="/tasks" className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200/50 bg-white p-4 transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:border-sky-900/50">
                <div className="rounded-full bg-sky-50 p-2 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"><Target className="size-4" /></div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Task</span>
              </Link>
            </div>
          </Card>

          <Card glass className="animate-slide-up delay-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Due Tasks</h2>
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                {dueTasks} pending
              </span>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status !== 'Done').slice(0, 3).map(task => (
                <div key={task.id} className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800/50">
                  <div className={`mt-0.5 size-2 shrink-0 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{task.title}</p>
                    {task.dueDate && <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1"><Clock className="size-3"/>{task.dueDate}</p>}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status !== 'Done').length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">You&apos;re all caught up!</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
