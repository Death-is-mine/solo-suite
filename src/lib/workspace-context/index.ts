import { AsyncLocalStorage } from 'node:async_hooks'

export interface WorkspaceContext {
  userId: string
  workspaceId: string
  role: 'owner' | 'admin' | 'member' | 'client'
  locale: string
  timezone: string
  currency: string
  currentProjectId?: string
  currentClientId?: string
}

const storage = new AsyncLocalStorage<WorkspaceContext>()

export function getContext(): WorkspaceContext {
  const ctx = storage.getStore()
  if (!ctx) throw new Error('No workspace context — must be called within withContext()')
  return ctx
}

export function setContext(partial: Partial<WorkspaceContext>) {
  const current = storage.getStore()
  if (!current) throw new Error('Cannot setContext outside withContext()')
  storage.enterWith({ ...current, ...partial })
}

export function withContext<T>(partial: Partial<WorkspaceContext>, fn: () => Promise<T>): Promise<T> {
  const current = storage.getStore()
  const base: WorkspaceContext = current ?? {
    userId: '',
    workspaceId: '',
    role: 'owner',
    locale: 'en-US',
    timezone: 'UTC',
    currency: 'USD',
  }
  return storage.run({ ...base, ...partial }, fn)
}

export function hasContext(): boolean {
  return storage.getStore() !== undefined
}
