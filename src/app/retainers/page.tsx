'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, RotateCcw, Pause, XCircle } from 'lucide-react'
import type { RetainerRecord } from '@/lib/database/types'

const freqColor: Record<string, string> = {
  Weekly: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Monthly: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Quarterly: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Yearly: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

export default function RetainersPage() {
  const [retainers, setRetainers] = useState<RetainerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('Monthly')

  const load = useCallback(() => {
    fetch('/api/retainers')
      .then((res) => res.json())
      .then((data) => { setRetainers(data); setLoading(false) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function createRetainer() {
    try {
      await fetch('/api/retainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clientId, amount: parseFloat(amount) || 0, frequency }),
      })
    } catch {}
    setName(''); setClientId(''); setAmount(''); setShowNew(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/retainers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    } catch {}
    load()
  }

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-600">Loading...</div>

  const totalMonthly = retainers
    .filter((r) => r.status === 'Active')
    .reduce((s, r) => {
      const m = r.frequency === 'Weekly' ? 4.33 : r.frequency === 'Monthly' ? 1 : r.frequency === 'Quarterly' ? 1 / 3 : 1 / 12
      return s + r.amount * m
    }, 0)

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Retainers</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">{retainers.filter((r) => r.status === 'Active').length} active · ~${totalMonthly.toFixed(0)}/mo</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> New Retainer
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 grid gap-3 md:grid-cols-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Retainer name" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <select aria-label="Select option" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={createRetainer} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {retainers.map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{r.name}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{r.clientId ? `Client ${r.clientId}` : 'No client'}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${freqColor[r.frequency] ?? ''}`}>{r.frequency}</span>
            </div>
            <p className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{r.currency} {r.amount.toFixed(2)}</p>
            <div className="flex items-center gap-2">
              {r.status === 'Active' && (
                <>
                  <button onClick={() => updateStatus(r.id, 'Paused')} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    <Pause className="size-3" /> Pause
                  </button>
                  <button onClick={() => updateStatus(r.id, 'Cancelled')} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <XCircle className="size-3" /> Cancel
                  </button>
                </>
              )}
              {r.status === 'Paused' && (
                <button onClick={() => updateStatus(r.id, 'Active')} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <RotateCcw className="size-3" /> Resume
                </button>
              )}
              <span className="ml-auto text-xs text-zinc-600">{r.status}</span>
            </div>
          </div>
        ))}
        {retainers.length === 0 && <p className="col-span-full pt-8 text-center text-sm text-zinc-600">No retainers yet.</p>}
      </div>
    </div>
  )
}

