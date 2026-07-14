// ponytail: simple pub/sub event bus
// Split into Business and System event types per architecture

export type BusinessEventType =
  | 'lead.created' | 'lead.converted'
  | 'client.created'
  | 'agreement.signed' | 'agreement.sent'
  | 'invoice.sent' | 'invoice.paid'
  | 'expense.recorded'
  | 'project.completed'

export type SystemEventType =
  | 'backup.completed' | 'sync.failed'
  | 'calendar.connected' | 'gmail.connected'
  | 'workspace.loaded'
  | 'health.failed'
  | 'adapter.error' | 'job.failed'

export type EventType = BusinessEventType | SystemEventType

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
  await Promise.all(Array.from(deps).map((h) => h(event)))
}

export function isBusinessEvent(type: EventType): type is BusinessEventType {
  return type.startsWith('lead') || type.startsWith('client') || type.startsWith('agreement') ||
    type.startsWith('invoice') || type === 'expense.recorded' || type === 'project.completed'
}

export function isSystemEvent(type: EventType): type is SystemEventType {
  return !isBusinessEvent(type)
}
