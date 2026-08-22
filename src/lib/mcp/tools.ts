import { registerTool } from './index'
import { db } from '@/lib/database'

// ponytail: register core workspace tools for AI access

registerTool({
  name: 'list_leads',
  description: 'List all leads in the workspace',
  inputSchema: {},
  handler: async () => db.getLeads(),
})

registerTool({
  name: 'get_lead',
  description: 'Get a single lead by ID',
  inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  handler: async (input) => db.getLead(input.id as string),
})

registerTool({
  name: 'list_clients',
  description: 'List all clients',
  inputSchema: {},
  handler: async () => db.getClients(),
})

registerTool({
  name: 'list_projects',
  description: 'List all projects',
  inputSchema: {},
  handler: async () => db.getProjects(),
})

registerTool({
  name: 'list_invoices',
  description: 'List all invoices',
  inputSchema: {},
  handler: async () => db.getInvoices(),
})

registerTool({
  name: 'get_setting',
  description: 'Get a workspace setting',
  inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] },
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
