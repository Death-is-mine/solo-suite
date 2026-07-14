'use client'

import { useState, useCallback, useEffect } from 'react'
import { Star, Plus } from 'lucide-react'
import type { ReviewRecord } from '@/lib/database/types'

const statusColor: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)

  const load = useCallback(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => { setReviews(data); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  async function createReview() {
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, projectId, content, rating }),
    })
    setClientId(''); setProjectId(''); setContent(''); setRating(5); setShowNew(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading...</div>

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Reviews</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus className="size-4" /> Add Review
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 grid gap-3 md:grid-cols-3">
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project ID" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="text-zinc-300 hover:text-amber-400 dark:text-zinc-600">
                  <Star className={`size-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Review content" className="mb-3 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" rows={3} />
          <div className="flex gap-2">
            <button onClick={createReview} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Submit</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`size-4 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
                  ))}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status] ?? ''}`}>{r.status}</span>
              </div>
              {r.status === 'Pending' && (
                <div className="flex gap-1">
                  <button onClick={() => updateStatus(r.id, 'Approved')} className="rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">Approve</button>
                  <button onClick={() => updateStatus(r.id, 'Rejected')} className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Reject</button>
                </div>
              )}
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{r.content}</p>
            <p className="mt-1 text-xs text-zinc-400">{r.clientId ? `Client ${r.clientId}` : ''}{r.projectId ? ` · Project ${r.projectId}` : ''}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="pt-8 text-center text-sm text-zinc-400">No reviews yet.</p>}
      </div>
    </div>
  )
}
