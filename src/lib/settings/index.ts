import { db } from '@/lib/database'

// ponytail: reads settings from the database with in-memory cache

const cache = new Map<string, string>()

export async function getSetting(key: string): Promise<string | null> {
  if (cache.has(key)) return cache.get(key)!
  const value = await db.getSetting(key)
  if (value) cache.set(key, value)
  return value
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.setSetting(key, value)
  cache.set(key, value)
}

export function clearCache() {
  cache.clear()
}
