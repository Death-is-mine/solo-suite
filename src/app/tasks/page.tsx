'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import type { TaskRecord } from '@/lib/database/types'

const stages = ['Backlog', 'Todo', 'In Progress', 'Done'] as const
const priorityColor: Record<string, string> = {
  Low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')

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
        body: JSON.stringify({ title, projectId, status: 'Backlog', priority: 'Medium' }),
      })
    } catch {}
    setTitle(''); setProjectId(''); setShowNew(false)
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

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tasks</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> Add Task
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project ID" className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          </div>
          <div className="flex gap-2">
            <button onClick={createTask} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-x-auto">
        {stages.map((stage) => {
          const stageTasks = tasks.filter((t) => t.status === stage)
          return (
            <div key={stage} className="flex w-72 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{stage}</h3>
                  <span className="text-xs text-zinc-400">{stageTasks.length}</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 p-3">
                {stageTasks.map((task) => (
                  <div key={task.id} className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{task.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[task.priority] ?? ''}`}>{task.priority}</span>
                    </div>
                    {task.description && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{task.description}</p>}
                    {task.dueDate && <p className="mt-1 text-xs text-zinc-400">Due {task.dueDate}</p>}
                    <div className="mt-2 flex items-center gap-1">
                      {stage !== 'Done' && (
                        <button onClick={() => advanceTask(task.id, stages[stages.indexOf(stage) + 1])} className="flex items-center gap-0.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
                          <ChevronRight className="size-3" /> Advance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {stageTasks.length === 0 && <p className="pt-4 text-center text-xs text-zinc-400">No tasks</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
