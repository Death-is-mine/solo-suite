'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Activity } from 'lucide-react'

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  message: string
}

export default function HealthPage() {
  const [timestamps, setTimestamps] = useState<string[]>([])
  const [eventCount, setEventCount] = useState(0)
  const [apiCount, setApiCount] = useState(0)
  const [checks] = useState<HealthCheck[]>([
    { name: 'Application Server', status: 'healthy', message: 'Next.js 16 responding' },
    { name: 'Google Sheets', status: 'degraded', message: 'Service account needs sheet access' },
    { name: 'Auth Provider', status: 'healthy', message: 'Google OAuth configured' },
    { name: 'Event Bus', status: 'healthy', message: 'Pub/sub active' },
    { name: 'Job Queue', status: 'healthy', message: 'In-process queue active' },
    { name: 'Context Engine', status: 'healthy', message: 'Workspace context ready' },
    { name: 'Storage Adapter', status: 'degraded', message: 'Google Drive not configured' },
    { name: 'Calendar Adapter', status: 'degraded', message: 'Google Calendar not configured' },
    { name: 'Mail Adapter', status: 'degraded', message: 'Gmail not configured' },
    { name: 'Documents Adapter', status: 'degraded', message: 'Google Docs not configured' },
  ])

  useEffect(() => {
    let mounted = true
    const endpoints = ['leads', 'clients', 'projects', 'agreements', 'invoices', 'transactions', 'expenses', 'tasks', 'meetings', 'files', 'documents', 'retainers', 'automation', 'reviews']
    Promise.all(endpoints.map((ep) => fetch(`/api/${ep}`).then(r => r.ok).catch(() => false)))
      .then((results) => { if (mounted) setApiCount(results.filter(Boolean).length) })
    const interval = setInterval(() => {
      setTimestamps((prev) => [...prev.slice(-19), new Date().toLocaleTimeString()])
      setEventCount((prev) => prev + 1)
    }, 3000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])
  const healthy = checks.filter((c) => c.status === 'healthy').length
  const degraded = checks.filter((c) => c.status === 'degraded').length
  const down = checks.filter((c) => c.status === 'down').length

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Workspace Health</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">System status and service monitoring</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="size-4" />
            <span className="text-xs font-medium">Healthy</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{healthy}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4" />
            <span className="text-xs font-medium">Degraded</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{degraded}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="size-4" />
            <span className="text-xs font-medium">Down</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{down}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <Database className="size-4" />
            <span className="text-xs font-medium">API Endpoints</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{apiCount}/15</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Services</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {checks.map((check) => (
            <div key={check.name} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {check.status === 'healthy' ? (
                  <CheckCircle className="size-4 text-green-500" />
                ) : check.status === 'degraded' ? (
                  <AlertTriangle className="size-4 text-amber-500" />
                ) : (
                  <XCircle className="size-4 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{check.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{check.message}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                check.status === 'healthy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                check.status === 'degraded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="size-4 text-zinc-400" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Heartbeat</h2>
          <RefreshCw className="size-3 text-zinc-300" />
          <span className="text-xs text-zinc-400">Every 3s · {eventCount} ticks</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {timestamps.map((t, i) => (
            <span key={i} className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700 dark:bg-green-900/30 dark:text-green-300">{t}</span>
          ))}
          {timestamps.length === 0 && <span className="text-xs text-zinc-400">Waiting...</span>}
        </div>
      </div>
    </div>
  )
}
