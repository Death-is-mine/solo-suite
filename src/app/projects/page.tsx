'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Play, Pause, CheckCircle2, Archive, Folder, Calendar, ArrowRight, MoreVertical } from 'lucide-react'
import type { ProjectRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

const statusColor: Record<string, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  Planning: 'info',
  Active: 'success',
  Paused: 'warning',
  Completed: 'neutral',
  Archived: 'error',
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
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Projects" description="Manage your client projects" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Projects" 
        description={`${projects.length} project${projects.length !== 1 ? 's' : ''} total`}
      >
        <Button onClick={() => setShowNew(true)} leftIcon={<Plus className="size-4" />}>
          New Project
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p, idx) => (
          <Card 
            key={p.id} 
            className={`group flex flex-col justify-between animate-slide-up delay-${idx % 5 + 1} overflow-hidden hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-900 transition-all`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Folder className="size-6" />
                </div>
                <Badge variant={statusColor[p.status] ?? 'neutral'} dot>
                  {p.status}
                </Badge>
              </div>
              
              <div className="mt-5">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white line-clamp-1">{p.name}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">
                  {p.clientId ? `Client: ${p.clientId}` : 'Internal Project'}
                </p>
              </div>
              
              <div className="mt-6 flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  <span>{p.startDate ?? 'No start date'}</span>
                </div>
                {p.endDate && (
                  <>
                    <ArrowRight className="size-3 text-zinc-300 dark:text-zinc-600" />
                    <span>{p.endDate}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="border-t border-zinc-100 bg-zinc-50/50 p-3 px-5 dark:border-zinc-800/50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {p.status !== 'Completed' && p.status !== 'Archived' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => updateStatus(p.id, nextStatus[p.status] ?? 'Active')}
                      className={p.status === 'Planning' || p.status === 'Paused' ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400'}
                      leftIcon={p.status === 'Planning' || p.status === 'Paused' ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                    >
                      {p.status === 'Planning' || p.status === 'Paused' ? 'Start' : 'Pause'}
                    </Button>
                  )}
                  {p.status !== 'Completed' && p.status !== 'Archived' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => updateStatus(p.id, 'Completed')}
                      className="text-emerald-700 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                      leftIcon={<CheckCircle2 className="size-3.5" />}
                    >
                      Complete
                    </Button>
                  )}
                  {p.status === 'Completed' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => updateStatus(p.id, 'Archived')}
                      className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-600"
                      leftIcon={<Archive className="size-3.5" />}
                    >
                      Archive
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="icon" aria-label="More options" className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Folder className="mb-4 size-12 text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No projects found</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">
            Get started by creating a new project. You can link it to an existing client or keep it internal.
          </p>
          <Button onClick={() => setShowNew(true)} className="mt-6" leftIcon={<Plus className="size-4" />}>
            Create Project
          </Button>
        </div>
      )}

      <Modal 
        isOpen={showNew} 
        onClose={() => setShowNew(false)} 
        title="Create Project" 
        description="Set up a new workspace for your client's project."
      >
        <div className="space-y-4">
          <Input 
            label="Project Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Website Redesign" 
            autoFocus
          />
          <Input 
            label="Client ID (Optional)" 
            value={clientId} 
            onChange={(e) => setClientId(e.target.value)} 
            placeholder="e.g. cli_123" 
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createProject}>Create Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

