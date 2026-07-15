'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Video, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import type { MeetingRecord } from '@/lib/database/types'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'

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
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function createMeeting() {
    try {
      await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, duration: parseInt(duration), projectId }),
      })
    } catch {}
    setTitle(''); setDate(''); setDuration('30'); setProjectId(''); setShowNew(false)
    load()
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <PageHeader title="Meetings" description="Schedule and manage client meetings" />
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const sorted = [...meetings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcoming = sorted.filter((m) => new Date(m.date) > new Date())
  const past = sorted.filter((m) => new Date(m.date) <= new Date()).reverse()

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8">
      <PageHeader 
        title="Meetings" 
        description={`${meetings.length} meeting${meetings.length !== 1 ? 's' : ''} total`}
      >
        <Button onClick={() => setShowNew(true)} leftIcon={<Plus className="size-4" />}>
          Schedule Meeting
        </Button>
      </PageHeader>

      <div className="grid gap-12 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Upcoming</h2>
              <Badge variant="info">{upcoming.length}</Badge>
            </div>
            
            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((m, idx) => {
                  const meetingDate = new Date(m.date)
                  return (
                    <div 
                      key={m.id} 
                      className={`group flex items-start gap-4 rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:border-indigo-900 animate-slide-up delay-${idx + 1}`}
                    >
                      <div className="flex flex-col items-center justify-center rounded-xl bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 min-w-[70px]">
                        <span className="text-xs font-semibold uppercase">{meetingDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-xl font-bold">{meetingDate.getDate()}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-white">{m.title}</h3>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Clock className="size-3.5" />
                                <span>{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({m.duration}m)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Video className="size-3.5" />
                                <span>Google Meet</span>
                              </div>
                            </div>
                          </div>
                          
                          {m.projectId && (
                            <Badge variant="neutral" className="hidden sm:inline-flex">
                              Project: {m.projectId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-transparent py-12 dark:border-zinc-800">
                <Calendar className="mb-3 size-10 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming meetings scheduled.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Past Meetings</h2>
            <Badge variant="neutral">{past.length}</Badge>
          </div>
          
          {past.length > 0 ? (
            <div className="space-y-3">
              {past.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-transparent bg-zinc-50 p-3 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 transition-colors">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200/50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">{m.title}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">
                      {new Date(m.date).toLocaleDateString()} &middot; {m.duration}m
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No past meetings.</p>
          )}
        </div>
      </div>

      <Modal 
        isOpen={showNew} 
        onClose={() => setShowNew(false)} 
        title="Schedule Meeting" 
        description="Set up a new meeting with a client or team."
      >
        <div className="space-y-4">
          <Input 
            label="Meeting Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Project Kickoff" 
            autoFocus
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date & Time" 
              type="datetime-local" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration (min)</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-400"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
          <Input 
            label="Project ID (Optional)" 
            value={projectId} 
            onChange={(e) => setProjectId(e.target.value)} 
            placeholder="e.g. prj_123" 
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createMeeting}>Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
