import { on, emit, type EventType, type EventPayload } from '@/lib/event-bus'
import { db } from '@/lib/database'
import { validateWebhookUrl } from '@/lib/webhook-validation'

// ponytail: lightweight workflow engine — trigger/condition/action over business events.

export interface WorkflowTrigger {
  event: EventType
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists'
  value: unknown
}

export interface WorkflowAction {
  type: 'notify' | 'updateField' | 'createTask' | 'emitEvent' | 'webhook'
  config: Record<string, unknown>
}

export interface WorkflowRule {
  id: string
  name: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  enabled: boolean
}

function evaluateCondition(data: Record<string, unknown>, condition: WorkflowCondition): boolean {
  const fieldValue = data[condition.field]
  switch (condition.operator) {
    case 'equals': return fieldValue === condition.value
    case 'not_equals': return fieldValue !== condition.value
    case 'contains': return String(fieldValue).includes(String(condition.value))
    case 'gt': return Number(fieldValue) > Number(condition.value)
    case 'lt': return Number(fieldValue) < Number(condition.value)
    case 'gte': return Number(fieldValue) >= Number(condition.value)
    case 'lte': return Number(fieldValue) <= Number(condition.value)
    case 'exists': return fieldValue !== undefined && fieldValue !== null
    default: return true
  }
}

async function executeAction(action: WorkflowAction, event: EventPayload) {
  switch (action.type) {
    case 'notify':
      console.log(`[workflow:notify] ${action.config.message ?? event.type}`, event.data)
      break
    case 'updateField': {
      const { entityType, idField, idValue, field, value } = action.config as {
        entityType: string; idField: string; idValue: string; field: string; value: unknown
      }
      const id = idValue ?? (event.data[idField] as string)
      if (!id) return
      const updateData = { [field]: value }
      switch (entityType) {
        case 'lead': await db.updateLead(id, updateData); break
        case 'client': await db.updateClient(id, updateData); break
        case 'project': await db.updateProject(id, updateData); break
        case 'invoice': await db.updateInvoice(id, updateData); break
        case 'task': await db.updateTask(id, updateData); break
      }
      break
    }
    case 'createTask': {
      const { projectId, title, description, priority, assignee } = action.config as {
        projectId?: string; title: string; description?: string; priority?: string; assignee?: string
      }
      await db.createTask({
        projectId: projectId ?? (event.data.projectId as string) ?? '',
        title,
        description,
        status: 'Todo',
        priority: (priority as 'Low' | 'Medium' | 'High' | 'Urgent') ?? 'Medium',
        assignee,
      })
      break
    }
    case 'emitEvent': {
      const { eventType } = action.config as { eventType: EventType }
      await emit(eventType, event.data, 'workflow-engine')
      break
    }
    case 'webhook': {
      const { url, method, headers } = action.config as {
        url: string; method?: string; headers?: Record<string, string>
      }
      const check = validateWebhookUrl(url)
      if (!check.valid) {
        console.error(`[workflow] webhook blocked: ${check.reason} — url: ${url}`)
        break
      }
      await fetch(url, {
        method: method ?? 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ event: event.type, data: event.data }),
      })
      break
    }
  }
}

let cachedRules: WorkflowRule[] = []

export async function loadRules() {
  const dbRules = await db.getAutomationRules()
  cachedRules = dbRules
    .filter((r) => r.status === 'Active')
    .map((r) => ({
      id: r.id,
      name: r.name,
      trigger: { event: r.trigger as EventType },
      conditions: JSON.parse(r.config || '{}').conditions ?? [],
      actions: JSON.parse(r.config || '{}').actions ?? [{ type: r.action, config: {} }],
      enabled: true,
    }))
}

export async function evaluateWorkflow(event: EventPayload) {
  if (!cachedRules.length) await loadRules()

  for (const rule of cachedRules) {
    if (!rule.enabled) continue
    if (rule.trigger.event !== event.type) continue

    const conditionsMet = rule.conditions.every((c) => evaluateCondition(event.data, c))
    if (!conditionsMet) continue

    for (const action of rule.actions) {
      try {
        await executeAction(action, event)
      } catch (err) {
        console.error(`[workflow] rule ${rule.id} action ${action.type} failed:`, err)
      }
    }
  }
}

const businessEvents: EventType[] = [
  'lead.created', 'lead.converted', 'client.created',
  'agreement.sent', 'agreement.signed',
  'invoice.sent', 'invoice.paid',
  'expense.recorded', 'project.completed',
]
for (const evt of businessEvents) {
  on(evt, evaluateWorkflow)
}
