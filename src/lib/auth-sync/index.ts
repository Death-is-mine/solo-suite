import { type WorkspaceContext } from '@/lib/workspace-context'

// ponytail: auth sync — maps external auth provider roles to internal roles.
// When an external IdP is connected, call syncRole() to resolve the workspace role.

type ExternalRole = string
type InternalRole = WorkspaceContext['role']

// ponytail: configurable mapping — extend when adding IdPs
const roleMapping: Record<string, InternalRole> = {
  'admin': 'admin',
  'member': 'member',
  'viewer': 'client',
  'owner': 'owner',
}

export function syncRole(externalRole: ExternalRole): InternalRole {
  return roleMapping[externalRole.toLowerCase()] ?? 'member'
}

export function syncContextFromToken(token: {
  sub?: string
  email?: string
  role?: string
  workspace_id?: string
  locale?: string
  timezone?: string
  currency?: string
}): Partial<WorkspaceContext> {
  return {
    userId: token.sub ?? '',
    workspaceId: token.workspace_id ?? '',
    role: token.role ? syncRole(token.role) : 'member',
    locale: token.locale ?? 'en-US',
    timezone: token.timezone ?? 'UTC',
    currency: token.currency ?? 'USD',
  }
}