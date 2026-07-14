import { notFound } from 'next/navigation'
import { db } from '@/lib/database'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await db.getLead(id)
  if (!lead) notFound()

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{lead.name}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{lead.email}</p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-xs font-medium text-zinc-500">Stage</span>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">{lead.stage}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500">Email</span>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">{lead.email}</p>
          </div>
          {lead.source && (
            <div>
              <span className="text-xs font-medium text-zinc-500">Source</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-50">{lead.source}</p>
            </div>
          )}
          {lead.phone && (
            <div>
              <span className="text-xs font-medium text-zinc-500">Phone</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-50">{lead.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
