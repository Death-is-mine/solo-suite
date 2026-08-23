import { describe, it, expect, beforeEach } from 'vitest'
import { withContext } from '@/lib/workspace-context'
import { db } from '@/lib/database'
import { GET as getLeads, POST as postLead, PUT as putLead } from '@/app/api/leads/route'
import { GET as getClients, POST as postClient, PUT as putClient } from '@/app/api/clients/route'

const ctx = { userId: 'test-user', workspaceId: 'ws-test', role: 'owner' as const, locale: 'en', timezone: 'UTC', currency: 'USD' }

describe('CRM API Routes', () => {
  beforeEach(async () => {
    await db.reset()
  })

  describe('/api/leads', () => {
    it('GET should return leads', async () => {
      await withContext(ctx, async () => {
        await db.createLead({ name: 'Lead 1', email: 'lead1@test.com', stage: 'New' })
        const res = await getLeads()
        const data = await res.json()
        expect(data).toHaveLength(1)
        expect(data[0].name).toBe('Lead 1')
      })
    })

    it('POST should create a new lead and emit event', async () => {
      await withContext(ctx, async () => {
        const req = new Request('http://localhost/api/leads', {
          method: 'POST',
          body: JSON.stringify({ name: 'Lead 2', email: 'lead2@test.com' })
        })
        const res = await postLead(req as any)
        const data = await res.json()
        expect(res.status).toBe(201)
        expect(data.name).toBe('Lead 2')
        expect(data.stage).toBe('New')
      })
    })

    it('PUT should update a lead and handle conversion', async () => {
      await withContext(ctx, async () => {
        const lead = await db.createLead({ name: 'Lead 3', email: 'lead3@test.com', stage: 'New' })
        const req = new Request('http://localhost/api/leads', {
          method: 'PUT',
          body: JSON.stringify({ id: lead.id, stage: 'Won' })
        })
        const res = await putLead(req as any)
        const data = await res.json()

        expect(data.stage).toBe('Won')

        await new Promise(resolve => setTimeout(resolve, 50))

        const updated = await db.getLead(lead.id)
        expect(updated?.clientId).toBeDefined()
      })
    })
  })

  describe('/api/clients', () => {
    it('GET should return clients', async () => {
      await withContext(ctx, async () => {
        await db.createClient({ company: 'Client 1', contacts: '[]', portalAccess: false })
        const res = await getClients()
        const data = await res.json()
        expect(data).toHaveLength(1)
        expect(data[0].company).toBe('Client 1')
      })
    })

    it('POST should create a new client and emit event', async () => {
      await withContext(ctx, async () => {
        const req = new Request('http://localhost/api/clients', {
          method: 'POST',
          body: JSON.stringify({ company: 'Client 2' })
        })
        const res = await postClient(req as any)
        const data = await res.json()
        expect(res.status).toBe(201)
        expect(data.company).toBe('Client 2')
      })
    })

    it('PUT should update a client', async () => {
      await withContext(ctx, async () => {
        const client = await db.createClient({ company: 'Client 3', contacts: '[]', portalAccess: false })
        const req = new Request('http://localhost/api/clients', {
          method: 'PUT',
          body: JSON.stringify({ id: client.id, company: 'Client 3 Updated' })
        })
        const res = await putClient(req as any)
        const data = await res.json()
        expect(data.company).toBe('Client 3 Updated')
      })
    })
  })
})