import { describe, it, expect } from 'vitest'
import { emit, on, isBusinessEvent, isSystemEvent } from '@/lib/event-bus'

describe('Event Bus', () => {
  it('should emit and receive business events', async () => {
    const events: string[] = []
    const unsub = on('lead.created', (e) => { events.push(e.type) })
    await emit('lead.created', { leadId: 'LD-001' }, 'test')
    expect(events).toContain('lead.created')
    unsub()
  })

  it('should allow unsubscribing', async () => {
    let count = 0
    const handler = () => { count++ }
    const unsub = on('invoice.paid', handler)
    await emit('invoice.paid', {}, 'test')
    expect(count).toBe(1)
    unsub()
    await emit('invoice.paid', {}, 'test')
    expect(count).toBe(1)
  })

  it('should classify business events correctly', () => {
    expect(isBusinessEvent('lead.created')).toBe(true)
    expect(isBusinessEvent('agreement.signed')).toBe(true)
    expect(isBusinessEvent('invoice.paid')).toBe(true)
    expect(isBusinessEvent('backup.completed')).toBe(false)
  })

  it('should classify system events correctly', () => {
    expect(isSystemEvent('backup.completed')).toBe(true)
    expect(isSystemEvent('sync.failed')).toBe(true)
    expect(isSystemEvent('lead.converted')).toBe(false)
  })
})
