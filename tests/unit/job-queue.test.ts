import { describe, it, expect, beforeEach } from 'vitest'
import { registerJobHandler, enqueue } from '@/lib/job-queue'

describe('Job Queue', () => {
  beforeEach(() => {
    // ponytail: handlers persist across tests; register test handlers only
  })

  it('should process a job and mark it done', async () => {
    const results: string[] = []
    registerJobHandler('echo', async (payload) => {
      results.push((payload as { msg: string }).msg)
      return 'ok'
    })

    await enqueue('echo', { msg: 'hello' })
    // Allow microtask to complete
    await new Promise((r) => setTimeout(r, 50))
    expect(results).toContain('hello')
  })

  it('should handle missing handler gracefully', async () => {
    const id = await enqueue('unknown-type', {})
    expect(id).toBeTruthy()
    await new Promise((r) => setTimeout(r, 50))
  })

  it('should handle handler errors gracefully', async () => {
    registerJobHandler('broken', async () => { throw new Error('oops') })
    const id = await enqueue('broken', {})
    expect(id).toBeTruthy()
    await new Promise((r) => setTimeout(r, 50))
  })
})
