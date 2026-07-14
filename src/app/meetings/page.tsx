'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Video, Clock } from 'lucide-react'
import type { MeetingRecord } from '@/lib/database/types'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('30')
  const [projectId, setProjectId] = useState('')

  const load = useCallback(() => {
    fetch('/api/meetings')
      .then((res) => res.json())
      .then((data) => { setMeetings(data); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  async function createMeeting() {
    await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, duration: parseInt(duration), projectId }),
    })
    setTitle(''); setDate(''); setDuration('30'); setProjectId(''); setShowNew(false)
    load()
  }

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  const sorted = [...meetings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcoming = sorted.filter((m) => new Date(m.date) > new Date())
  const past = sorted.filter((m) => new Date(m.date) <= new Date())

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Meetings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> Schedule
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 grid gap-3 md:grid-cols-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" placeholder="Duration (min)" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project ID" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          </div>
          <div className="flex gap-2">
            <button onClick={createMeeting} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">Cancel</button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <Video className="size-4 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{m.title}</p>
                    <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="size-3" /> {new Date(m.date).toLocaleString()} · {m.duration}min
                    </p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">{m.projectId ? `Project ${m.projectId}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Past</h2>
          <div className="space-y-2">
            {past.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <Video className="size-4 text-zinc-300" />
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{m.title}</p>
                    <p className="text-xs text-zinc-400">{new Date(m.date).toLocaleString()} · {m.duration}min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meetings.length === 0 && <p className="pt-8 text-center text-sm text-zinc-400">No meetings scheduled.</p>}
    </div>
  )
}
