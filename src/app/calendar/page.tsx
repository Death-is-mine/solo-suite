'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import type { MeetingRecord, TaskRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SkeletonCard } from '@/components/ui/skeleton'

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
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  function getEvents(day: number): { type: 'Meeting' | 'Task'; title: string }[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const events: { type: 'Meeting' | 'Task'; title: string }[] = []
    meetings.forEach((m) => {
      if (m.date.startsWith(dateStr)) events.push({ type: 'Meeting', title: m.title })
    })
    tasks.forEach((t) => {
      if (t.dueDate === dateStr && t.status !== 'Done') events.push({ type: 'Task', title: t.title })
    })
    return events
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Calendar" description="Schedule and upcoming tasks" />
        <SkeletonCard className="h-[600px]" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Calendar" 
        description="Manage your meetings and project deadlines"
      >
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Previous month"
            onClick={() => { if (month === 0) { setYear(year - 1); setMonth(11) } else setMonth(month - 1) }}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex min-w-[140px] items-center justify-center gap-2 px-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <CalendarIcon className="size-4 text-zinc-600" />
            {months[month]} {year}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Next month"
            onClick={() => { if (month === 11) { setYear(year + 1); setMonth(0) } else setMonth(month + 1) }}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </PageHeader>

      <Card className="animate-fade-in p-0 overflow-hidden flex-1 min-h-[600px]">
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          {days.map((d) => (
            <div key={d} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr h-[calc(100%-45px)] bg-zinc-100/50 dark:bg-zinc-950/50 gap-[1px]">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white p-2 dark:bg-zinc-900 opacity-50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const events = getEvents(day)
            const isToday = dateStr === today
            return (
              <div 
                key={day} 
                className={`group relative bg-white p-2 transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span 
                    className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500' : 'text-zinc-700 dark:text-zinc-300'}`}
                  >
                    {day}
                  </span>
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-35px)] custom-scrollbar pr-1">
                  {events.map((e, j) => (
                    <div 
                      key={j} 
                      title={e.title}
                      className={`truncate rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        e.type === 'Meeting' 
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20' 
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                      }`}
                    >
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

