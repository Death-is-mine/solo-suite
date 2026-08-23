import { describe, it, expect, beforeEach } from 'vitest'
import { withContext } from '@/lib/workspace-context'
import { db } from '@/lib/database'
import { authorize, requirePermission } from '@/lib/authorization'
import { validateWebhookUrl } from '@/lib/webhook-validation'

beforeEach(async () => {
  await db.reset()
})

describe('P0.2: Cross-workspace data isolation', () => {
  it('should not allow workspace A to read workspace B lead', async () => {
    let leadId = ''
    await withContext({ userId: 'a', workspaceId: 'ws-a', role: 'owner' }, async () => {
      const lead = await db.createLead({ name: 'A-Lead', email: 'a@test.com', stage: 'New' })
      leadId = lead.id
    })
    await withContext({ userId: 'b', workspaceId: 'ws-b', role: 'owner' }, async () => {
      await expect(db.getLead(leadId)).rejects.toThrow('not found')
    })
  })

  it('should not allow workspace A to update workspace B lead', async () => {
    let leadId = ''
    await withContext({ userId: 'a', workspaceId: 'ws-a', role: 'owner' }, async () => {
      const lead = await db.createLead({ name: 'A-Lead', email: 'a@test.com', stage: 'New' })
      leadId = lead.id
    })
    await withContext({ userId: 'b', workspaceId: 'ws-b', role: 'owner' }, async () => {
      await expect(db.updateLead(leadId, { name: 'Hacked' })).rejects.toThrow('not found')
    })
  })

  it('should allow same workspace to read own lead', async () => {
    await withContext({ userId: 'a', workspaceId: 'ws-a', role: 'owner' }, async () => {
      const lead = await db.createLead({ name: 'A-Lead', email: 'a@test.com', stage: 'New' })
      const got = await db.getLead(lead.id)
      expect(got?.name).toBe('A-Lead')
    })
  })

  it('should isolate settings between workspaces', async () => {
    await withContext({ userId: 'a', workspaceId: 'ws-a', role: 'owner' }, async () => {
      await db.setSetting('currency', 'EUR')
      expect(await db.getSetting('currency')).toBe('EUR')
    })
    await withContext({ userId: 'b', workspaceId: 'ws-b', role: 'owner' }, async () => {
      expect(await db.getSetting('currency')).toBeNull()
      await db.setSetting('currency', 'GBP')
      expect(await db.getSetting('currency')).toBe('GBP')
    })
    await withContext({ userId: 'a', workspaceId: 'ws-a', role: 'owner' }, async () => {
      expect(await db.getSetting('currency')).toBe('EUR')
    })
  })

  it('should isolate list queries by workspace', async () => {
    await withContext({ userId: 'a', workspaceId: 'ws-a', role: 'owner' }, async () => {
      await db.createLead({ name: 'A1', email: 'a1@test.com', stage: 'New' })
      await db.createLead({ name: 'A2', email: 'a2@test.com', stage: 'New' })
    })
    await withContext({ userId: 'b', workspaceId: 'ws-b', role: 'owner' }, async () => {
      await db.createLead({ name: 'B1', email: 'b1@test.com', stage: 'New' })
      const leads = await db.getLeads()
      expect(leads.length).toBe(1)
      expect(leads[0].name).toBe('B1')
    })
  })
})

describe('P0.3: Authorization', () => {
  it('owner should have all permissions', () => {
    const ctx = { userId: 'u', workspaceId: 'w', role: 'owner' as const, locale: 'en', timezone: 'UTC', currency: 'USD' }
    expect(authorize('leads.delete', ctx)).toBe(true)
    expect(authorize('workflow.delete', ctx)).toBe(true)
    expect(authorize('backup.restore', ctx)).toBe(true)
    expect(authorize('settings.write', ctx)).toBe(true)
  })

  it('client should have only read permissions', () => {
    const ctx = { userId: 'u', workspaceId: 'w', role: 'client' as const, locale: 'en', timezone: 'UTC', currency: 'USD' }
    expect(authorize('projects.read', ctx)).toBe(true)
    expect(authorize('leads.read', ctx)).toBe(false)
    expect(authorize('leads.create', ctx)).toBe(false)
    expect(authorize('settings.write', ctx)).toBe(false)
    expect(authorize('backup.create', ctx)).toBe(false)
  })

  it('member should not have delete permissions', () => {
    const ctx = { userId: 'u', workspaceId: 'w', role: 'member' as const, locale: 'en', timezone: 'UTC', currency: 'USD' }
    expect(authorize('tasks.create', ctx)).toBe(true)
    expect(authorize('tasks.delete', ctx)).toBe(false)
    expect(authorize('clients.delete', ctx)).toBe(false)
    expect(authorize('projects.delete', ctx)).toBe(false)
  })

  it('requirePermission should throw on denied', () => {
    const ctx = { userId: 'u', workspaceId: 'w', role: 'client' as const, locale: 'en', timezone: 'UTC', currency: 'USD' }
    expect(() => requirePermission('leads.create', ctx)).toThrow('Permission denied')
  })
})

describe('P0.6: Webhook SSRF protection', () => {
  it('should block localhost', () => {
    expect(validateWebhookUrl('http://localhost:3000/hook').valid).toBe(false)
    expect(validateWebhookUrl('http://127.0.0.1:8080/hook').valid).toBe(false)
  })

  it('should block private networks', () => {
    expect(validateWebhookUrl('http://192.168.1.1/hook').valid).toBe(false)
    expect(validateWebhookUrl('http://10.0.0.1/hook').valid).toBe(false)
    expect(validateWebhookUrl('http://172.16.0.1/hook').valid).toBe(false)
  })

  it('should block non-https', () => {
    expect(validateWebhookUrl('http://example.com/hook').valid).toBe(false)
  })

  it('should block cloud metadata', () => {
    expect(validateWebhookUrl('http://169.254.169.254/metadata').valid).toBe(false)
    expect(validateWebhookUrl('http://metadata.google.internal/hook').valid).toBe(false)
  })

  it('should allow valid https public URLs', () => {
    expect(validateWebhookUrl('https://example.com/hook').valid).toBe(true)
    expect(validateWebhookUrl('https://api.stripe.com/webhook').valid).toBe(true)
  })
})