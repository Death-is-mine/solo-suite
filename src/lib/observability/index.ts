// ponytail: lightweight observability — structured logging + simple counters

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

const counters = new Map<string, number>()

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = { level, message, context, timestamp: new Date().toISOString() }
  if (level === 'error') console.error(JSON.stringify(entry))
  else if (level === 'warn') console.warn(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}

export function counter(name: string, delta = 1) {
  counters.set(name, (counters.get(name) ?? 0) + delta)
}

export function getCounter(name: string): number {
  return counters.get(name) ?? 0
}

export function getAllCounters(): Record<string, number> {
  return Object.fromEntries(counters)
}

export function timer(name: string) {
  const start = performance.now()
  return () => {
    const elapsed = performance.now() - start
    log('info', `${name} completed`, { elapsed_ms: Math.round(elapsed) })
    counter(`${name}.count`)
    counter(`${name}.ms`, Math.round(elapsed))
  }
}
