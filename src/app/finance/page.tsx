'use client'

import { useState, useEffect } from 'react'
import { Plus, Send, Check, Receipt, DollarSign, Wallet, FileText, ArrowRight } from 'lucide-react'
import type { InvoiceRecord, TransactionRecord, ExpenseRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'

type Tab = 'invoices' | 'transactions' | 'expenses'

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
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Finance" description="Track invoices, payments, and expenses" />
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const totals = invoices.reduce((acc, inv) => {
    if (inv.status === 'Paid') acc.paid += inv.total
    else if (inv.status !== 'Cancelled') acc.pending += inv.total
    return acc
  }, { paid: 0, pending: 0 })
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Finance & Accounting" 
        description="Track invoices, payments, and expenses"
      >
        <Button onClick={() => setShowNew(true)} leftIcon={<Plus className="size-4" />}>
          New Invoice
        </Button>
      </PageHeader>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <MetricCard
          label="Invoiced (Pending)"
          value={`$${totals.pending.toFixed(2)}`}
          icon={<Receipt className="size-5" />}
          accentColor="amber"
          delay={1}
        />
        <MetricCard
          label="Collected"
          value={`$${totals.paid.toFixed(2)}`}
          icon={<DollarSign className="size-5" />}
          accentColor="emerald"
          delay={2}
        />
        <MetricCard
          label="Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          icon={<Wallet className="size-5" />}
          accentColor="rose"
          delay={3}
        />
      </div>

      <Card glass className="animate-slide-up delay-4 p-0 overflow-hidden">
        <div className="flex border-b border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
          {(['invoices', 'transactions', 'expenses'] as Tab[]).map((t) => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition-all ${
                tab === t 
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'invoices' && (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-900">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">{inv.id}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {inv.clientId ? `Client ${inv.clientId}` : 'No client attached'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                    <div className="text-right">
                      <p className="font-medium text-zinc-900 dark:text-white">{inv.currency} {inv.total.toFixed(2)}</p>
                      <div className="mt-1">
                        <Badge 
                          variant={inv.status === 'Paid' ? 'success' : inv.status === 'Sent' ? 'info' : inv.status === 'Overdue' ? 'error' : 'neutral'}
                          dot
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {inv.status === 'Draft' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(inv.id, 'Sent')} leftIcon={<Send className="size-3" />}>
                          Send
                        </Button>
                      )}
                      {inv.status === 'Sent' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(inv.id, 'Paid')} leftIcon={<Check className="size-3" />}>
                          Mark Paid
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto size-12 text-zinc-300 dark:text-zinc-700" />
                  <p className="mt-4 text-zinc-500">No invoices generated yet.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'transactions' && (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{tx.id}</p>
                    <p className="mt-1 text-sm text-zinc-500">via {tx.method} &middot; {tx.reference ?? 'No reference'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-zinc-900 dark:text-white">{tx.amount.toFixed(2)}</p>
                    <Badge variant={tx.status === 'Approved' ? 'success' : tx.status === 'Rejected' ? 'error' : 'warning'} dot>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto size-12 text-zinc-300 dark:text-zinc-700" />
                  <p className="mt-4 text-zinc-500">No transactions recorded.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'expenses' && (
            <div className="space-y-3">
              {expenses.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-rose-900">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                      <Wallet className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">{ex.category}</p>
                      <p className="mt-1 text-sm text-zinc-500">{ex.description ?? 'No description'} &middot; {ex.date}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-rose-600 dark:text-rose-400">-{ex.currency} {ex.amount.toFixed(2)}</p>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-12">
                  <Wallet className="mx-auto size-12 text-zinc-300 dark:text-zinc-700" />
                  <p className="mt-4 text-zinc-500">No expenses recorded.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Modal 
        isOpen={showNew} 
        onClose={() => setShowNew(false)} 
        title="Create Invoice" 
        description="Generate a new invoice for a client."
      >
        <div className="space-y-4">
          <Input 
            label="Client ID" 
            value={clientId} 
            onChange={(e) => setClientId(e.target.value)} 
            placeholder="e.g. client_123" 
          />
          <Input 
            label="Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Web design services" 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.00" 
            />
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Currency</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createInvoice}>Create Invoice</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
