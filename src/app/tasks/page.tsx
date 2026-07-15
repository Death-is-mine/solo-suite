'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, ChevronRight, Calendar, GripVertical, CheckCircle2 } from 'lucide-react'
import type { TaskRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'

const stages = ['Backlog', 'Todo', 'In Progress', 'Done'] as const


export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')

  const load = useCallback(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => { setTasks(data); setLoading(false) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function createTask() {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          projectId, 
          status: 'Backlog', 
          priority,
          dueDate: dueDate || undefined 
        }),
      })
    } catch {}
    setTitle(''); setProjectId(''); setPriority('Medium'); setDueDate(''); setShowNew(false)
    load()
  }

  async function advanceTask(id: string, stage: string) {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: stage }),
      })
    } catch {}
    load()
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Tasks" description="Manage your project tasks" />
        <div className="flex gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-8">
      <PageHeader 
        title="Tasks" 
        description={`${tasks.length} task${tasks.length !== 1 ? 's' : ''} in total across all projects`}
      >
        <Button onClick={() => setShowNew(true)} leftIcon={<Plus className="size-4" />}>
          Add Task
        </Button>
      </PageHeader>

      <div className="flex flex-1 gap-6 overflow-x-auto pb-4 custom-scrollbar" tabIndex={0} tabIndex={0}>
        {stages.map((stage, idx) => {
          const stageTasks = tasks.filter((t) => t.status === stage)
          
          return (
            <div key={stage} className={`flex w-80 shrink-0 flex-col rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900/50 border border-transparent dark:border-zinc-800/50 animate-slide-up delay-${idx + 1}`}>
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{stage}</h3>
                  <span className="flex size-5 items-center justify-center rounded-full bg-zinc-200/50 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-600">
                    {stageTasks.length}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-1 custom-scrollbar">
                {stageTasks.map((task) => {
                  const priorityVariant = 
                    task.priority === 'High' || task.priority === 'Urgent' ? 'error' : 
                    task.priority === 'Medium' ? 'warning' : 'info'
                    
                  return (
                    <div 
                      key={task.id} 
                      className="group relative flex cursor-grab flex-col gap-3 rounded-xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800/80"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          {stage === 'Done' ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          ) : (
                            <GripVertical className="mt-0.5 size-4 shrink-0 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
                          )}
                          <p className={`text-sm font-medium ${stage === 'Done' ? 'text-zinc-600 dark:text-zinc-400 line-through dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={priorityVariant} dot>
                            {task.priority}
                          </Badge>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">
                              <Calendar className="size-3" />
                              <span>{task.dueDate}</span>
                            </div>
                          )}
                        </div>
                        {stage !== 'Done' && (
                          <button 
                            onClick={() => advanceTask(task.id, stages[stages.indexOf(stage) + 1])} 
                            className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:text-zinc-400 opacity-0 transition-all hover:bg-indigo-100 hover:text-indigo-600 group-hover:opacity-100 dark:bg-zinc-700 dark:text-zinc-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400"
                            title={`Move to ${stages[stages.indexOf(stage) + 1]}`}
                            aria-label={`Move to ${stages[stages.indexOf(stage) + 1]}`}
                          >
                            <ChevronRight className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {stageTasks.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-transparent dark:border-zinc-800">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">No tasks in {stage}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Modal 
        isOpen={showNew} 
        onClose={() => setShowNew(false)} 
        title="Create Task" 
        description="Add a new task to your backlog."
      >
        <div className="space-y-4">
          <Input 
            label="Task Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="What needs to be done?" 
            autoFocus
          />
          <Input 
            label="Project ID" 
            value={projectId} 
            onChange={(e) => setProjectId(e.target.value)} 
            placeholder="e.g. prj_123" 
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Priority</label>
              <select aria-label="Select option" 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)} 
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <Input 
              label="Due Date" 
              type="date"
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createTask}>Create Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

