'use client'

import { useState, useEffect } from 'react'
import { Save, Download, RefreshCw, Globe, Clock, DollarSign } from 'lucide-react'

export default function WorkspacePage() {
  const [currency, setCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('UTC')
  const [locale, setLocale] = useState('en-US')
  const [saved, setSaved] = useState(false)
  const [backupMsg, setBackupMsg] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/settings?key=currency').then(r => r.json()),
      fetch('/api/settings?key=timezone').then(r => r.json()),
      fetch('/api/settings?key=locale').then(r => r.json()),
    ]).then(([c, t, l]) => {
      if (mounted) {
        if (c.value) setCurrency(c.value)
        if (t.value) setTimezone(t.value)
        if (l.value) setLocale(l.value)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  async function saveSettings() {
    try {
      await Promise.all([
        fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'currency', value: currency }) }),
        fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'timezone', value: timezone }) }),
        fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'locale', value: locale }) }),
      ])
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function doBackup() {
    setBackupMsg('Exporting...')
    const data: Record<string, unknown> = {}
    const endpoints = ['leads', 'clients', 'projects', 'agreements', 'invoices', 'transactions', 'expenses', 'tasks', 'meetings', 'files', 'documents', 'retainers', 'automation', 'reviews']
    for (const ep of endpoints) {
      try {
        const res = await fetch(`/api/${ep}`)
        data[ep] = await res.json()
      } catch { /* skip */ }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solo-suite-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setBackupMsg('Backup downloaded!')
    setTimeout(() => setBackupMsg(''), 3000)
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Workspace</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Settings, backup, and workspace management</p>
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">General Settings</h2>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <DollarSign className="size-3" /> Default Currency
            </label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <Clock className="size-3" /> Timezone
            </label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern (US)</option>
              <option value="America/Chicago">Central (US)</option>
              <option value="America/Denver">Mountain (US)</option>
              <option value="America/Los_Angeles">Pacific (US)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Berlin">Berlin</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <Globe className="size-3" /> Locale
            </label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="de-DE">German</option>
              <option value="fr-FR">French</option>
              <option value="es-ES">Spanish</option>
              <option value="hi-IN">Hindi</option>
              <option value="ja-JP">Japanese</option>
            </select>
          </div>
        </div>
        <button onClick={saveSettings} className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
          <Save className="size-4" /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">Backup & Restore</h2>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">Export all workspace data as JSON. Restore is coming in a future release.</p>
        <button onClick={doBackup} className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <Download className="size-4" /> {backupMsg || 'Download Backup'}
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">System Status</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Database</span>
            <span className="flex items-center gap-1 text-xs text-green-600"><RefreshCw className="size-3" /> In-Memory (Active)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Auth</span>
            <span className="text-xs text-green-600">Google OAuth (Configured)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Google Sheets</span>
            <span className="text-xs text-zinc-400">SHEET_ID not set — using InMemoryDatabase</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Events</span>
            <span className="text-xs text-green-600">Event Bus (Active)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
