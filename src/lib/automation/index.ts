import { on, type EventType, type EventPayload } from '@/lib/event-bus'
import { db } from '@/lib/database'

// ponytail: lightweight automation engine — evaluates rules on each business event.
// Rules are simple: trigger = event type, action = one of the supported actions.
// No external services, no cron — just event-driven evaluation.

type ActionHandler = (event: EventPayload, config: Record<string, unknown>) => Promise<void>

const actions: Record<string, ActionHandler> = {
  notify: async (event, config) => {
    // ponytail: console.log for now, swap to email/push when those adapters exist
    console.log(`[automation:notify] ${config.message ?? event.type}`, event.data)
  },
  updateStatus: async (event, config) => {
    const { entityType, statusField, statusValue } = config as {
      entityType: string
      statusField: string
      statusValue: string
    }
    const id = event.data[`${entityType}Id`] as string | undefined
    if (!id) return

    const updateData = { [statusField]: statusValue }
    switch (entityType) {
      case 'lead':
        await db.updateLead(id, updateData)
        break
      case 'client':
        await db.updateClient(id, updateData)
        break
      case 'project':
        await db.updateProject(id, updateData)
        break
      case 'invoice':
        await db.updateInvoice(id, updateData)
        break
    }
  },
}

export async function evaluateAutomationRules(event: EventPayload) {
  if (event.type === 'job.failed') return // don't self-trigger

  const rules = await db.getAutomationRules()
  for (const rule of rules) {
    if (rule.status !== 'Active') continue
    if (rule.trigger !== event.type) continue

    const handler = actions[rule.action]
    if (!handler) {
      console.warn(`[automation] unknown action: ${rule.action}`)
      continue
    }

    try {
      const config = JSON.parse(rule.config || '{}')
      await handler(event, config)
    } catch (err) {
      console.error(`[automation] rule ${rule.id} failed:`, err)
    }
  }
}

// wire up: listen to all business events
const businessEvents: EventType[] = [
  'lead.created', 'lead.converted',
  'client.created',
  'agreement.sent', 'agreement.signed',
  'invoice.sent', 'invoice.paid',
  'expense.recorded',
  'project.completed',
]

for (const evt of businessEvents) {
  on(evt, evaluateAutomationRules)
}
