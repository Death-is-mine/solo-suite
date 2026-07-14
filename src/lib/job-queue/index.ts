import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

// ponytail: in-process queue, replace with Redis/BullMQ if throughput grows

type JobHandler = (payload: unknown) => Promise<unknown>

const handlers = new Map<string, JobHandler>()

export function registerJobHandler(type: string, handler: JobHandler) {
  handlers.set(type, handler)
}

export async function enqueue(type: string, payload: unknown) {
  const jobId = await db.createJob(type, payload)
  processJob(jobId, type, payload)
  return jobId
}

async function processJob(jobId: string, type: string, payload: unknown) {
  const handler = handlers.get(type)
  if (!handler) {
    await db.updateJob(jobId, { status: 'Failed', error: `No handler for job type: ${type}` })
    await emit('job.failed', { jobId, type, error: 'No handler' }, 'job-queue')
    return
  }

  await db.updateJob(jobId, { status: 'Processing' })

  try {
    const result = await handler(payload)
    await db.updateJob(jobId, { status: 'Done', result: JSON.stringify(result), completedAt: new Date().toISOString() })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    await db.updateJob(jobId, { status: 'Failed', error: errMsg })
    await emit('job.failed', { jobId, type, error: errMsg }, 'job-queue')
  }
}
