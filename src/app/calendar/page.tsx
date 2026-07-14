'use client'

import { useState, useEffect } from 'react'
import type { MeetingRecord, TaskRecord } from '@/lib/database/types'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([])
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/meetings').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
    ]).then(([meets, t]) => {
      if (mounted) { setMeetings(meets); setTasks(t); setLoading(false) }
    })
    return () => { mounted = false }
  }, [])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  function getEvents(day: number): { type: string; title: string }[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const events: { type: string; title: string }[] = []
    meetings.forEach((m) => {
      if (m.date.startsWith(dateStr)) events.push({ type: 'Meeting', title: m.title })
    })
    tasks.forEach((t) => {
      if (t.dueDate === dateStr && t.status !== 'Done') events.push({ type: 'Task', title: t.title })
    })
    return events
  }

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (month === 0) { setYear(year - 1); setMonth(11) } else setMonth(month - 1) }} className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">←</button>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{months[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setYear(year + 1); setMonth(0) } else setMonth(month + 1) }} className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">→</button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
          {days.map((d) => (
            <div key={d} className="px-3 py-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 border-b border-r border-zinc-100 p-2 dark:border-zinc-800" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const events = getEvents(day)
            const isToday = dateStr === today
            return (
              <div key={day} className={`min-h-24 border-b border-r border-zinc-100 p-2 dark:border-zinc-800 ${isToday ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}`}>
                <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${isToday ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'}`}>{day}</span>
                <div className="mt-1 space-y-0.5">
                  {events.slice(0, 3).map((e, j) => (
                    <div key={j} className={`truncate rounded px-1 py-0.5 text-[10px] ${e.type === 'Meeting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                      {e.title}
                    </div>
                  ))}
                  {events.length > 3 && <p className="text-[10px] text-zinc-400">+{events.length - 3} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
