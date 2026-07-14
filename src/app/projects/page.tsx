'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Play, Pause, CheckCircle, Archive } from 'lucide-react'
import type { ProjectRecord } from '@/lib/database/types'

const statusIcon: Record<string, typeof Play> = {
  Planning: Play,
  Active: Play,
  Paused: Pause,
  Completed: CheckCircle,
  Archived: Archive,
}

const statusColor: Record<string, string> = {
  Planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Completed: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  Archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const nextStatus: Record<string, string> = {
  Planning: 'Active',
  Active: 'Paused',
  Paused: 'Active',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')

  const load = useCallback(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => { setProjects(data); setLoading(false) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function createProject() {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clientId, status: 'Planning' }),
      })
    } catch {}
    setName(''); setClientId(''); setShowNew(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    } catch {}
    load()
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> New Project
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID" className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          </div>
          <div className="flex gap-2">
            <button onClick={createProject} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.map((p) => {
          const Icon = statusIcon[p.status] ?? Play
          return (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <Icon className="size-5 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{p.clientId ? `Client ${p.clientId}` : 'No client'} · {p.startDate ?? 'No start date'}{p.endDate ? ` → ${p.endDate}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[p.status] ?? ''}`}>{p.status}</span>
                {p.status !== 'Completed' && p.status !== 'Archived' && (
                  <button onClick={() => updateStatus(p.id, nextStatus[p.status] ?? 'Active')} className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                    {p.status === 'Planning' || p.status === 'Paused' ? 'Start' : 'Pause'}
                  </button>
                )}
                {p.status !== 'Completed' && p.status !== 'Archived' && (
                  <button onClick={() => updateStatus(p.id, 'Completed')} className="rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                    Complete
                  </button>
                )}
                {p.status === 'Completed' && (
                  <button onClick={() => updateStatus(p.id, 'Archived')} className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Archive
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {projects.length === 0 && <p className="pt-4 text-center text-sm text-zinc-400">No projects yet. Create one after setting up a client.</p>}
      </div>
    </div>
  )
}
