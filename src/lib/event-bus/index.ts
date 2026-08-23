// ponytail: typed event bus — business and system events.
// PayloadMap documents expected shapes; emit accepts any Record for backward compat.

export type BusinessEventType =
  | 'lead.created' | 'lead.converted' | 'lead.updated'
  | 'client.created' | 'client.updated'
  | 'agreement.signed' | 'agreement.sent'
  | 'invoice.sent' | 'invoice.paid'
  | 'expense.recorded'
  | 'project.completed' | 'project.status_changed'

export type SystemEventType =
  | 'backup.completed' | 'sync.failed'
  | 'calendar.connected' | 'gmail.connected'
  | 'workspace.loaded'
  | 'health.failed'
  | 'adapter.error' | 'job.failed'
  | 'workflow.executed'

export type EventType = BusinessEventType | SystemEventType

// ponytail: documents expected payloads — emit still accepts any Record<string, unknown>
// so existing callers don't break. Add strict checking per-caller when ready.
export interface EventPayloadMap {
  'lead.created': { leadId: string; name?: string; email?: string }
  'lead.converted': { leadId: string; clientId?: string }
  'lead.updated': { leadId: string; changes?: Record<string, unknown> }
  'client.created': { clientId: string; company?: string }
  'client.updated': { clientId: string; changes?: Record<string, unknown> }
  'agreement.sent': { agreementId: string; clientId?: string }
  'agreement.signed': { agreementId: string; clientId?: string }
  'invoice.sent': { invoiceId: string; clientId?: string; total?: number }
  'invoice.paid': { invoiceId: string; clientId?: string; amount?: number }
  'expense.recorded': { expenseId: string; category?: string; amount?: number }
  'project.completed': { projectId: string; clientId?: string }
  'project.status_changed': { projectId: string; from?: string; to?: string }
  'backup.completed': { backupId?: string; size?: number; snapshot?: unknown }
  'sync.failed': { adapter?: string; error?: string }
  'job.failed': { jobId?: string; type?: string; error?: string; attempt?: number }
  'workflow.executed': { ruleId?: string; status?: string; duration_ms?: number }
  'calendar.connected': { userId?: string }
  'gmail.connected': { userId?: string }
  'workspace.loaded': { workspaceId?: string }
  'health.failed': { check?: string; error?: string }
  'adapter.error': { adapter?: string; error?: string }
}

export interface EventPayload {
  type: EventType
  data: Record<string, unknown>
  timestamp: string
  source: string
}

type Handler = (event: EventPayload) => void | Promise<void>

const handlers = new Map<string, Set<Handler>>()

export function on(eventType: EventType, handler: Handler) {
  if (!handlers.has(eventType)) {
    handlers.set(eventType, new Set())
  }
  handlers.get(eventType)!.add(handler)
  return () => handlers.get(eventType)?.delete(handler)
}

export function off(eventType: EventType, handler: Handler) {
  handlers.get(eventType)?.delete(handler)
}

export async function emit(eventType: EventType, data: Record<string, unknown>, source: string) {
  const event: EventPayload = { type: eventType, data, timestamp: new Date().toISOString(), source }
  const deps = handlers.get(eventType)
  if (!deps) return
  await Promise.allSettled(Array.from(deps).map((h) => h(event)))
}

export function isBusinessEvent(type: EventType): type is BusinessEventType {
  return type.startsWith('lead') || type.startsWith('client') || type.startsWith('agreement') ||
    type.startsWith('invoice') || type === 'expense.recorded' || type.startsWith('project')
}

export function isSystemEvent(type: EventType): type is SystemEventType {
  return !isBusinessEvent(type)
}