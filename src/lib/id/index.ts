// ponytail: simple ID generator, year-based with sequential counter per prefix

const counters = new Map<string, number>()

export function generateId(prefix: string): string {
  const year = new Date().getFullYear()
  const count = (counters.get(prefix) ?? 0) + 1
  counters.set(prefix, count)
  return `${prefix}-${year}-${String(count).padStart(4, '0')}`
}

export function resetCounters() {
  counters.clear()
}
