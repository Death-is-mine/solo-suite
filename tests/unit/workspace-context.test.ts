import { describe, it, expect } from 'vitest'
import { getContext, setContext, withContext } from '@/lib/workspace-context'

describe('Workspace Context', () => {
  it('should return default context', () => {
    const ctx = getContext()
    expect(ctx.workspaceId).toBe('default')
    expect(ctx.role).toBe('owner')
    expect(ctx.currency).toBe('USD')
  })

  it('should update context partially', () => {
    setContext({ currency: 'EUR', locale: 'de-DE' })
    const ctx = getContext()
    expect(ctx.currency).toBe('EUR')
    expect(ctx.locale).toBe('de-DE')
    expect(ctx.workspaceId).toBe('default')
  })

  it('should restore previous context after withContext', async () => {
    setContext({ userId: 'user-1' })
    await withContext({ userId: 'user-2' }, async () => {
      expect(getContext().userId).toBe('user-2')
    })
    expect(getContext().userId).toBe('user-1')
  })
})
