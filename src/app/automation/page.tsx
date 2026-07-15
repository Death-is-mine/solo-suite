'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Zap, Workflow, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react'
import type { AutomationRuleRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'

import { SkeletonCard } from '@/components/ui/skeleton'

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRuleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState('lead.created')
  const [action, setAction] = useState('send.email')

  const load = useCallback(() => {
    fetch('/api/automation')
      .then((res) => res.json())
      .then((data) => { setRules(data); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  async function createRule() {
    await fetch('/api/automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, trigger, action }),
    })
    setName(''); setTrigger('lead.created'); setAction('send.email'); setShowNew(false)
    load()
  }

  async function toggleRule(id: string, current: string) {
    await fetch('/api/automation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: current === 'Active' ? 'Disabled' : 'Active' }),
    })
    load()
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Automation" description="Manage your automated workflows" />
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const activeCount = rules.filter((r) => r.status === 'Active').length

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Automation" 
        description={`${activeCount} active rule${activeCount !== 1 ? 's' : ''} out of ${rules.length} total`}
      >
        <Button onClick={() => setShowNew(true)} leftIcon={<Plus className="size-4" />}>
          New Rule
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rules.map((rule, idx) => (
          <div 
            key={rule.id} 
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-indigo-900 animate-slide-up delay-${idx % 5 + 1} ${rule.status === 'Disabled' ? 'opacity-70 grayscale-[30%]' : ''}`}
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className={`flex size-10 items-center justify-center rounded-xl ${rule.status === 'Active' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                  <Zap className={`size-5 ${rule.status === 'Active' ? 'fill-current' : ''}`} />
                </div>
                <button 
                  onClick={() => toggleRule(rule.id, rule.status)} 
                  className="transition-transform hover:scale-105 active:scale-95"
                  title={rule.status === 'Active' ? 'Disable rule' : 'Enable rule'}
                >
                  {rule.status === 'Active' ? (
                    <ToggleRight className="size-7 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="size-7 text-zinc-300 dark:text-zinc-600" />
                  )}
                </button>
              </div>

              <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white line-clamp-1">{rule.name}</h3>
            </div>

            <div className="mt-6 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">When</p>
                  <p className="mt-0.5 truncate font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">{rule.trigger}</p>
                </div>
                <ArrowRight className="size-4 text-zinc-300 dark:text-zinc-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Then</p>
                  <p className="mt-0.5 truncate font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">{rule.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-transparent py-24 dark:border-zinc-800">
          <Workflow className="mb-4 size-12 text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No automations found</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-zinc-500 dark:text-zinc-400">
            Automate your repetitive tasks and workflows by creating your first rule.
          </p>
          <Button onClick={() => setShowNew(true)} className="mt-6" leftIcon={<Plus className="size-4" />}>
            Create Rule
          </Button>
        </div>
      )}

      <Modal 
        isOpen={showNew} 
        onClose={() => setShowNew(false)} 
        title="Create Automation Rule" 
        description="Set up a trigger and an action to automate a workflow."
      >
        <div className="space-y-4">
          <Input 
            label="Rule Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Welcome Email to New Leads" 
            autoFocus
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">When this happens...</label>
              <select 
                value={trigger} 
                onChange={(e) => setTrigger(e.target.value)} 
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
              >
                <option value="lead.created">Lead Created</option>
                <option value="lead.converted">Lead Converted</option>
                <option value="agreement.signed">Agreement Signed</option>
                <option value="invoice.sent">Invoice Sent</option>
                <option value="invoice.paid">Invoice Paid</option>
                <option value="project.completed">Project Completed</option>
              </select>
            </div>
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Then do this...</label>
              <select 
                value={action} 
                onChange={(e) => setAction(e.target.value)} 
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
              >
                <option value="send.email">Send Email</option>
                <option value="create.task">Create Task</option>
                <option value="create.invoice">Create Invoice</option>
                <option value="notify.slack">Slack Notification</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createRule}>Create Rule</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
