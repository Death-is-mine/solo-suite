import { describe, it, expect } from 'vitest'
import { getContext, withContext, hasContext } from '@/lib/workspace-context'

describe('Workspace Context', () => {
  it('should throw when no context exists', () => {
    expect(() => getContext()).toThrow('No workspace context')
  })

  it('should return false for hasContext outside withContext', () => {
    expect(hasContext()).toBe(false)
  })

  it('should provide context inside withContext', async () => {
    await withContext({ userId: 'user-1', workspaceId: 'ws-1', role: 'owner' }, async () => {
      const ctx = getContext()
      expect(ctx.userId).toBe('user-1')
      expect(ctx.workspaceId).toBe('ws-1')
      expect(ctx.role).toBe('owner')
      expect(hasContext()).toBe(true)
    })
  })

  it('should restore context after nested withContext', async () => {
    await withContext({ userId: 'outer', workspaceId: 'ws-1', role: 'owner' }, async () => {
      expect(getContext().userId).toBe('outer')
      await withContext({ userId: 'inner' }, async () => {
        expect(getContext().userId).toBe('inner')
      })
      expect(getContext().userId).toBe('outer')
    })
  })

  it('should isolate concurrent contexts', async () => {
    const results: string[] = []
    const p1 = withContext({ userId: 'a', workspaceId: 'ws-a', role: 'owner' }, async () => {
      await new Promise((r) => setTimeout(r, 10))
      results.push(`a:${getContext().workspaceId}`)
    })
    const p2 = withContext({ userId: 'b', workspaceId: 'ws-b', role: 'admin' }, async () => {
      await new Promise((r) => setTimeout(r, 5))
      results.push(`b:${getContext().workspaceId}`)
    })
    await Promise.all([p1, p2])
    expect(results).toContain('a:ws-a')
    expect(results).toContain('b:ws-b')
  })
})
