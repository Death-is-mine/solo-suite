import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

// ponytail: in-process queue with retry/backoff.
// Replace with Redis/BullMQ if throughput grows beyond single-process limits.

type JobHandler = (payload: unknown) => Promise<unknown>

const handlers = new Map<string, JobHandler>()

const MAX_RETRIES = 3
const BACKOFF_BASE_MS = 1000

export function registerJobHandler(type: string, handler: JobHandler) {
  handlers.set(type, handler)
}

export async function enqueue(type: string, payload: unknown) {
  const jobId = await db.createJob(type, payload)
  void processJob(jobId, type, payload, 0).catch((err) => {
    console.error(`[job-queue] unhandled error processing ${jobId}:`, err)
  })
  return jobId
}

async function processJob(jobId: string, type: string, payload: unknown, attempt: number) {
  const handler = handlers.get(type)
  if (!handler) {
    await db.updateJob(jobId, { status: 'Failed', error: `No handler for job type: ${type}` })
    await emit('job.failed', { jobId, type, error: 'No handler', attempt }, 'job-queue')
    return
  }

  await db.updateJob(jobId, { status: 'Processing', retries: attempt })

  try {
    const result = await handler(payload)
    await db.updateJob(jobId, { status: 'Done', result: JSON.stringify(result), completedAt: new Date().toISOString() })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    if (attempt < MAX_RETRIES) {
      // exponential backoff: 1s, 2s, 4s
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt)
      console.warn(`[job-queue] retry ${attempt + 1}/${MAX_RETRIES} for ${jobId} in ${delay}ms`)
      await new Promise((r) => setTimeout(r, delay))
      return processJob(jobId, type, payload, attempt + 1)
    }
    await db.updateJob(jobId, { status: 'Failed', error: errMsg })
    await emit('job.failed', { jobId, type, error: errMsg, attempt }, 'job-queue')
  }
}