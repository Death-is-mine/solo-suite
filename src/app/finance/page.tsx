'use client'

import { useState, useEffect } from 'react'
import { Plus, Send, Check } from 'lucide-react'
import type { InvoiceRecord, TransactionRecord, ExpenseRecord } from '@/lib/database/types'

type Tab = 'invoices' | 'transactions' | 'expenses'

const statusColor: Record<string, string> = {
  Draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Cancelled: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('invoices')
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/invoices').then((r) => r.json()),
      fetch('/api/transactions').then((r) => r.json()),
      fetch('/api/expenses').then((r) => r.json()),
    ]).then(([inv, tx, ex]) => {
      if (mounted) { setInvoices(inv); setTransactions(tx); setExpenses(ex); setLoading(false) }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  // New invoice form state
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')

  async function reload() {
    try {
      const [inv, tx, ex] = await Promise.all([
        fetch('/api/invoices').then((r) => r.json()),
        fetch('/api/transactions').then((r) => r.json()),
        fetch('/api/expenses').then((r) => r.json()),
      ])
      setInvoices(inv); setTransactions(tx); setExpenses(ex)
    } catch {}
  }

  async function createInvoice() {
    const subtotal = parseFloat(amount) || 0
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          lineItems: JSON.stringify([{ description, quantity: 1, rate: subtotal }]),
          subtotal,
          tax: 0,
          taxType: 'None',
          total: subtotal,
          currency,
        }),
      })
    } catch {}
    setClientId(''); setDescription(''); setAmount(''); setShowNew(false)
    reload()
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    } catch {}
    reload()
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>
  }

  const totals = invoices.reduce((acc, inv) => {
    if (inv.status === 'Paid') acc.paid += inv.total
    else if (inv.status !== 'Cancelled') acc.pending += inv.total
    return acc
  }, { paid: 0, pending: 0 })
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Finance & Accounting</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Track invoices, payments, and expenses</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Invoiced (Pending)</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{currency} {totals.pending.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Collected</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">{currency} {totals.paid.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Expenses</p>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">{currency} {totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 grid gap-3 md:grid-cols-4">
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={createInvoice} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {(['invoices', 'transactions', 'expenses'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize ${tab === t ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'invoices' && (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{inv.id}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{inv.currency} {inv.total.toFixed(2)} · {inv.clientId ? `Client ${inv.clientId}` : 'No client'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[inv.status] ?? ''}`}>{inv.status}</span>
                {inv.status === 'Draft' && (
                  <button onClick={() => updateStatus(inv.id, 'Sent')} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
                    <Send className="size-3" /> Send
                  </button>
                )}
                {inv.status === 'Sent' && (
                  <button onClick={() => updateStatus(inv.id, 'Paid')} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                    <Check className="size-3" /> Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
          {invoices.length === 0 && <p className="pt-4 text-center text-sm text-zinc-400">No invoices yet.</p>}
        </div>
      )}

      {tab === 'transactions' && (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{tx.id}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.amount.toFixed(2)} via {tx.method} · {tx.reference ?? 'No ref'}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tx.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : tx.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{tx.status}</span>
            </div>
          ))}
          {transactions.length === 0 && <p className="pt-4 text-center text-sm text-zinc-400">No transactions yet.</p>}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="space-y-2">
          {expenses.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{ex.category}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{ex.description ?? 'No description'} · {ex.date}</p>
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{ex.currency} {ex.amount.toFixed(2)}</span>
            </div>
          ))}
          {expenses.length === 0 && <p className="pt-4 text-center text-sm text-zinc-400">No expenses recorded.</p>}
        </div>
      )}
    </div>
  )
}
