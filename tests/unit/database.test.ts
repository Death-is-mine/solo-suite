import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/database'

beforeEach(async () => {
  await db.reset()
})

describe('InMemoryDatabase', () => {
  describe('Leads', () => {
    it('should create and retrieve a lead', async () => {
      const lead = await db.createLead({ name: 'Test', email: 'test@example.com', stage: 'New' })
      expect(lead.id).toMatch(/^LD-/)
      expect(lead.stage).toBe('New')

      const got = await db.getLead(lead.id)
      expect(got?.name).toBe('Test')
    })

    it('should update a lead', async () => {
      const lead = await db.createLead({ name: 'A', email: 'a@b.com', stage: 'New' })
      await db.updateLead(lead.id, { stage: 'Contacted' })
      const updated = await db.getLead(lead.id)
      expect(updated?.stage).toBe('Contacted')
    })

    it('should list all leads', async () => {
      await db.createLead({ name: 'A', email: 'a@b.com', stage: 'New' })
      await db.createLead({ name: 'B', email: 'b@b.com', stage: 'Qualified' })
      const leads = await db.getLeads()
      expect(leads.length).toBe(2)
    })
  })

  describe('Clients', () => {
    it('should create and retrieve a client', async () => {
      const client = await db.createClient({ company: 'Acme', contacts: '[]', portalAccess: false })
      expect(client.id).toMatch(/^CL-/)
      expect(client.company).toBe('Acme')
    })
  })

  describe('Projects', () => {
    it('should create a project linked to a client', async () => {
      const client = await db.createClient({ company: 'Acme', contacts: '[]', portalAccess: false })
      const project = await db.createProject({ clientId: client.id, name: 'Website', status: 'Planning' })
      expect(project.id).toMatch(/^PR-/)
      expect(project.clientId).toBe(client.id)
    })

    it('should update project status', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const p = await db.createProject({ clientId: c.id, name: 'P', status: 'Planning' })
      await db.updateProject(p.id, { status: 'Active' })
      expect((await db.getProject(p.id))?.status).toBe('Active')
    })
  })

  describe('Agreements', () => {
    it('should create and update agreements', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const a = await db.createAgreement({ clientId: c.id, type: 'Proposal', status: 'Draft', version: 1, content: '' })
      expect(a.id).toMatch(/^AG-/)
      await db.updateAgreement(a.id, { status: 'Signed' })
      expect((await db.getAgreement(a.id))?.status).toBe('Signed')
    })
  })

  describe('Invoices & Transactions', () => {
    it('should create invoice and transaction', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const inv = await db.createInvoice({ clientId: c.id, lineItems: '[]', subtotal: 100, tax: 0, taxType: 'None', total: 100, currency: 'USD', status: 'Draft' })
      expect(inv.id).toMatch(/^INV-/)

      const tx = await db.createTransaction({ invoiceId: inv.id, clientId: c.id, amount: 100, method: 'Bank Transfer', status: 'Pending' })
      expect(tx.id).toMatch(/^TR-/)
    })
  })

  describe('Expenses', () => {
    it('should create an expense', async () => {
      const ex = await db.createExpense({ category: 'Software', amount: 50, currency: 'USD', date: '2026-07-14' })
      expect(ex.id).toMatch(/^EX-/)
    })
  })

  describe('Tasks', () => {
    it('should create and advance tasks', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const p = await db.createProject({ clientId: c.id, name: 'P', status: 'Planning' })
      const t = await db.createTask({ projectId: p.id, title: 'Design', status: 'Backlog', priority: 'High' })
      expect(t.id).toMatch(/^TK-/)
      await db.updateTask(t.id, { status: 'In Progress' })
      expect((await db.getTask(t.id))?.status).toBe('In Progress')
    })
  })

  describe('Meetings', () => {
    it('should create a meeting', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const p = await db.createProject({ clientId: c.id, name: 'P', status: 'Planning' })
      const m = await db.createMeeting({ projectId: p.id, title: 'Kickoff', date: '2026-07-20T10:00', duration: 60 })
      expect(m.id).toMatch(/^MT-/)
    })
  })

  describe('Files', () => {
    it('should create and delete files', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const p = await db.createProject({ clientId: c.id, name: 'P', status: 'Planning' })
      const f = await db.createFile({ projectId: p.id, name: 'report.pdf', type: 'pdf', size: 1024, url: 'https://example.com/report.pdf', uploadedBy: 'user' })
      expect(f.id).toMatch(/^DC-/)
      await db.deleteFile(f.id)
      expect(await db.getFile(f.id)).toBeNull()
    })
  })

  describe('Documents', () => {
    it('should create and update documents', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const p = await db.createProject({ clientId: c.id, name: 'P', status: 'Planning' })
      const d = await db.createDocument({ projectId: p.id, title: 'Notes', content: '', type: 'Note' })
      expect(d.id).toMatch(/^DC-/)
      await db.updateDocument(d.id, { title: 'Updated Notes' })
      expect((await db.getDocument(d.id))?.title).toBe('Updated Notes')
    })
  })

  describe('Retainers', () => {
    it('should create retainer with lifecycle', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const r = await db.createRetainer({ clientId: c.id, name: 'Support', amount: 1000, currency: 'USD', frequency: 'Monthly', status: 'Active', startDate: '2026-07-01' })
      expect(r.id).toMatch(/^RT-/)
      await db.updateRetainer(r.id, { status: 'Paused' })
      expect((await db.getRetainer(r.id))?.status).toBe('Paused')
    })
  })

  describe('Automation Rules', () => {
    it('should create and toggle rules', async () => {
      const rule = await db.createAutomationRule({ name: 'Welcome Email', trigger: 'lead.created', action: 'send.email', config: '{}', status: 'Active' })
      expect(rule.id).toMatch(/^AU-/)
      await db.updateAutomationRule(rule.id, { status: 'Disabled' })
      expect((await db.getAutomationRule(rule.id))?.status).toBe('Disabled')
    })
  })

  describe('Reviews', () => {
    it('should create and moderate reviews', async () => {
      const c = await db.createClient({ company: 'C', contacts: '[]', portalAccess: false })
      const p = await db.createProject({ clientId: c.id, name: 'P', status: 'Completed' })
      const r = await db.createReview({ clientId: c.id, projectId: p.id, rating: 5, content: 'Great work!', status: 'Pending' })
      expect(r.id).toMatch(/^RV-/)
      await db.updateReview(r.id, { status: 'Approved' })
      expect((await db.getReviews()).find((rev) => rev.id === r.id)?.status).toBe('Approved')
    })
  })

  describe('Settings', () => {
    it('should store and retrieve settings', async () => {
      await db.setSetting('currency', 'EUR')
      expect(await db.getSetting('currency')).toBe('EUR')
    })
  })

  describe('Jobs', () => {
    it('should create and update jobs', async () => {
      const id = await db.createJob('test', { foo: 'bar' })
      expect(id).toBeTruthy()
      await db.updateJob(id, { status: 'Processing' })
    })
  })
})
