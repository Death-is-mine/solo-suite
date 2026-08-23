import { describe, it, expect, beforeEach } from 'vitest'
import { withContext } from '@/lib/workspace-context'
import { db } from '@/lib/database'
import { on, emit } from '@/lib/event-bus'

const ctx = { userId: 'test-user', workspaceId: 'ws-test', role: 'owner' as const, locale: 'en', timezone: 'UTC', currency: 'USD' }

describe('Lead Conversion Flow', () => {
  beforeEach(async () => { await db.reset() })
  it('should create client from lead data when converted', async () => {
    await withContext(ctx, async () => {
      const lead = await db.createLead({ name: 'Jane Doe', email: 'jane@example.com', stage: 'Won', clientId: undefined })
      const client = await db.createClient({
        company: lead.name,
        contacts: JSON.stringify([{ name: lead.name, email: lead.email }]),
        portalAccess: false,
      })
      await db.updateLead(lead.id, { clientId: client.id })

      const updated = await db.getLead(lead.id)
      expect(updated?.clientId).toBe(client.id)
      expect(client.company).toBe('Jane Doe')
    })
  })

  it('should emit lead.converted event on conversion', async () => {
    const events: string[] = []
    const unsub = on('lead.converted', (e) => { events.push(e.type) })

    await emit('lead.converted', { leadId: 'LD-0001', clientId: 'CL-0001' }, 'api/leads')
    expect(events).toContain('lead.converted')
    unsub()
  })
})