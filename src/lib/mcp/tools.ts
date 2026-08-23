import { registerTool } from './index'
import { db } from '@/lib/database'
import { gmailAdapter } from '@/lib/mail/gmail'
import { emit } from '@/lib/event-bus'

// ponytail: register core workspace tools — each declares its required permission.

registerTool({
  name: 'list_leads',
  description: 'List all leads in the workspace',
  inputSchema: {},
  permission: 'leads.read',
  handler: async () => db.getLeads(),
})

registerTool({
  name: 'get_lead',
  description: 'Get a single lead by ID',
  inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  permission: 'leads.read',
  handler: async (input) => db.getLead(input.id as string),
})

registerTool({
  name: 'list_clients',
  description: 'List all clients',
  inputSchema: {},
  permission: 'clients.read',
  handler: async () => db.getClients(),
})

registerTool({
  name: 'list_projects',
  description: 'List all projects',
  inputSchema: {},
  permission: 'projects.read',
  handler: async () => db.getProjects(),
})

registerTool({
  name: 'list_invoices',
  description: 'List all invoices',
  inputSchema: {},
  permission: 'invoices.read',
  handler: async () => db.getInvoices(),
})

registerTool({
  name: 'get_setting',
  description: 'Get a workspace setting',
  inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] },
  permission: 'settings.read',
  handler: async (input) => db.getSetting(input.key as string),
})

registerTool({
  name: 'create_task',
  description: 'Create a new task',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
    },
    required: ['title'],
  },
  permission: 'tasks.create',
  handler: async (input) => {
    return db.createTask({
      projectId: (input.projectId as string) ?? '',
      title: input.title as string,
      description: input.description as string | undefined,
      status: 'Todo',
      priority: (input.priority as 'Low' | 'Medium' | 'High' | 'Urgent') ?? 'Medium',
    })
  },
})

registerTool({
  name: 'search_entities',
  description: 'Search across leads, clients, projects, invoices by name/company/title',
  inputSchema: {
    type: 'object',
    properties: { query: { type: 'string' }, type: { type: 'string' } },
    required: ['query'],
  },
  permission: 'leads.read',
  handler: async (input) => {
    const q = (input.query as string).toLowerCase()
    const results: { entity: string; id: string; name: string }[] = []

    if (!input.type || input.type === 'lead') {
      for (const l of await db.getLeads()) {
        if (l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)) {
          results.push({ entity: 'lead', id: l.id, name: l.name })
        }
      }
    }
    if (!input.type || input.type === 'client') {
      for (const c of await db.getClients()) {
        if (c.company.toLowerCase().includes(q)) {
          results.push({ entity: 'client', id: c.id, name: c.company })
        }
      }
    }
    if (!input.type || input.type === 'project') {
      for (const p of await db.getProjects()) {
        if (p.name.toLowerCase().includes(q)) {
          results.push({ entity: 'project', id: p.id, name: p.name })
        }
      }
    }
    if (!input.type || input.type === 'invoice') {
      for (const i of await db.getInvoices()) {
        if (i.id.toLowerCase().includes(q)) {
          results.push({ entity: 'invoice', id: i.id, name: `Invoice ${i.id}` })
        }
      }
    }
    return results
  },
})

// ponytail: create_lead — accepts name + email minimum, defaults stage to New

registerTool({
  name: 'create_lead',
  description: 'Create a new lead in the workspace',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      source: { type: 'string' },
      notes: { type: 'string' },
    },
    required: ['name', 'email'],
  },
  permission: 'leads.create',
  handler: async (input) => {
    const lead = await db.createLead({
      name: input.name as string,
      email: input.email as string,
      phone: input.phone as string | undefined,
      source: input.source as string | undefined,
      notes: input.notes as string | undefined,
      stage: 'New',
    })
    await emit('lead.created', { leadId: lead.id, name: lead.name, email: lead.email }, 'mcp/create_lead')
    return lead
  },
})

// ponytail: send_proposal — looks up agreement, sends email, updates status to Sent

registerTool({
  name: 'send_proposal',
  description: 'Send a proposal/agreement to a client via email',
  inputSchema: {
    type: 'object',
    properties: {
      agreementId: { type: 'string' },
      toEmail: { type: 'string' },
      subject: { type: 'string' },
      message: { type: 'string' },
    },
    required: ['agreementId', 'toEmail'],
  },
  permission: 'agreements.send',
  handler: async (input) => {
    const agreement = await db.getAgreement(input.agreementId as string)
    if (!agreement) throw new Error('Agreement not found')

    const subject = (input.subject as string) || `Proposal: ${agreement.type}`
    const body = (input.message as string) || agreement.content || `Please review the attached ${agreement.type.toLowerCase()}.`

    await gmailAdapter.sendEmail(input.toEmail as string, subject, body)
    const updated = await db.updateAgreement(agreement.id, { status: 'Sent' })
    await emit('agreement.sent', { agreementId: agreement.id, clientId: agreement.clientId }, 'mcp/send_proposal')
    return updated
  },
})

// ponytail: workflow MCP tools — manage automation rules via MCP

registerTool({
  name: 'list_workflows',
  description: 'List all automation rules in the workspace',
  inputSchema: {},
  permission: 'automation.manage',
  handler: async () => db.getAutomationRules(),
})

registerTool({
  name: 'create_workflow',
  description: 'Create a new automation rule',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      trigger: { type: 'string' },
      action: { type: 'string' },
      config: { type: 'string' },
    },
    required: ['name', 'trigger', 'action'],
  },
  permission: 'automation.manage',
  handler: async (input) => {
    return db.createAutomationRule({
      name: input.name as string,
      trigger: input.trigger as string,
      action: input.action as string,
      config: (input.config as string) ?? '{}',
      status: 'Active',
    })
  },
})

registerTool({
  name: 'toggle_workflow',
  description: 'Enable or disable an automation rule',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['Active', 'Disabled'] },
    },
    required: ['id', 'status'],
  },
  permission: 'automation.manage',
  handler: async (input) => {
    await db.updateAutomationRule(input.id as string, { status: input.status as 'Active' | 'Disabled' })
    return { ok: true }
  },
})