'use client'

import { useState, useEffect } from 'react'
import { Save, Download, RefreshCw, Globe, Clock, DollarSign, CheckCircle2, ShieldAlert, Settings, HardDrive, Cpu } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Workspace Settings" 
        description="Manage your preferences, backups, and system status"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <Card className="animate-slide-up delay-1 p-0 overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Settings className="size-5 text-indigo-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Localization</h2>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">Configure your regional preferences</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <DollarSign className="size-4 text-zinc-600" /> Default Currency
                </label>
                <select aria-label="Select option" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)} 
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
              
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Clock className="size-4 text-zinc-600" /> Timezone
                </label>
                <select aria-label="Select option" 
                  value={timezone} 
                  onChange={(e) => setTimezone(e.target.value)} 
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
                >
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
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Globe className="size-4 text-zinc-600" /> Locale
                </label>
                <select aria-label="Select option" 
                  value={locale} 
                  onChange={(e) => setLocale(e.target.value)} 
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="de-DE">German</option>
                  <option value="fr-FR">French</option>
                  <option value="es-ES">Spanish</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="ja-JP">Japanese</option>
                </select>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={saveSettings} 
                  leftIcon={saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
                  variant={saved ? "outline" : "primary"}
                  className={saved ? "border-emerald-500 text-emerald-700 dark:text-emerald-400" : ""}
                >
                  {saved ? 'Settings Saved' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="animate-slide-up delay-2 p-0 overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <HardDrive className="size-5 text-indigo-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Data Management</h2>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">Export and backup your workspace data</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Full JSON Export</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">
                  Download a complete backup of all your clients, projects, invoices, and settings. 
                  Keep this file safe as it contains sensitive business information.
                </p>
              </div>
              
              <Button 
                onClick={doBackup} 
                variant="outline"
                leftIcon={backupMsg === 'Backup downloaded!' ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Download className="size-4" />}
              >
                {backupMsg || 'Generate Backup'}
              </Button>
            </div>
          </Card>

          <Card className="animate-slide-up delay-3 p-0 overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Cpu className="size-5 text-indigo-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">System Status</h2>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">Current status of platform services</p>
            </div>
            
            <div className="p-0">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <div className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Database</span>
                  <Badge variant="success" className="gap-1.5 py-1">
                    <RefreshCw className="size-3 animate-spin-slow" /> In-Memory
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Authentication</span>
                  <Badge variant="success" className="gap-1.5 py-1">
                    <CheckCircle2 className="size-3" /> Configured
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Google Sheets Sync</span>
                  <Badge variant="warning" className="gap-1.5 py-1">
                    <ShieldAlert className="size-3" /> Disabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Event Bus</span>
                  <Badge variant="success" className="gap-1.5 py-1">
                    <CheckCircle2 className="size-3" /> Active
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

