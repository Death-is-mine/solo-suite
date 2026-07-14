// ponytail: simple context object, expand as modules are built

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

let context: WorkspaceContext = {
  userId: '',
  workspaceId: 'default',
  role: 'owner',
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
}

export function getContext(): WorkspaceContext {
  return context
}

export function setContext(partial: Partial<WorkspaceContext>) {
  context = { ...context, ...partial }
}

export function withContext<T>(partial: Partial<WorkspaceContext>, fn: () => Promise<T>): Promise<T> {
  const prev = context
  context = { ...context, ...partial }
  return fn().finally(() => { context = prev })
}
