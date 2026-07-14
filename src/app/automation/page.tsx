'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Zap, ToggleLeft, ToggleRight } from 'lucide-react'
import type { AutomationRuleRecord } from '@/lib/database/types'

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
    setName(''); setShowNew(false)
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

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Automation</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{rules.filter((r) => r.status === 'Active').length} active rule{rules.filter((r) => r.status === 'Active').length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> New Rule
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 grid gap-3 md:grid-cols-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rule name" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="lead.created">Lead Created</option>
              <option value="lead.converted">Lead Converted</option>
              <option value="agreement.signed">Agreement Signed</option>
              <option value="invoice.sent">Invoice Sent</option>
              <option value="invoice.paid">Invoice Paid</option>
              <option value="project.completed">Project Completed</option>
            </select>
            <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="send.email">Send Email</option>
              <option value="create.task">Create Task</option>
              <option value="create.invoice">Create Invoice</option>
              <option value="notify.slack">Slack Notification</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={createRule} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <Zap className={`size-4 ${rule.status === 'Active' ? 'text-amber-500' : 'text-zinc-300'}`} />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{rule.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">When <span className="font-mono text-zinc-700 dark:text-zinc-300">{rule.trigger}</span> → <span className="font-mono text-zinc-700 dark:text-zinc-300">{rule.action}</span></p>
              </div>
            </div>
            <button onClick={() => toggleRule(rule.id, rule.status)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              {rule.status === 'Active' ? <ToggleRight className="size-5 text-green-500" /> : <ToggleLeft className="size-5" />}
            </button>
          </div>
        ))}
        {rules.length === 0 && <p className="pt-8 text-center text-sm text-zinc-400">No automation rules yet. Create your first rule to automate workflows.</p>}
      </div>
    </div>
  )
}
