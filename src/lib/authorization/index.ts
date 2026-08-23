import { getContext, type WorkspaceContext } from '@/lib/workspace-context'

// ponytail: centralized authorization — one place to check permissions.
// Every sensitive route and MCP tool must call authorize() before proceeding.

export type Permission =
  | 'leads.read' | 'leads.create' | 'leads.update' | 'leads.delete' | 'leads.convert'
  | 'clients.read' | 'clients.create' | 'clients.update' | 'clients.delete'
  | 'projects.read' | 'projects.create' | 'projects.update' | 'projects.delete'
  | 'agreements.read' | 'agreements.create' | 'agreements.update' | 'agreements.delete'
  | 'invoices.read' | 'invoices.create' | 'invoices.update' | 'invoices.send' | 'invoices.markPaid'
  | 'transactions.read' | 'transactions.create'
  | 'expenses.read' | 'expenses.create'
  | 'tasks.read' | 'tasks.create' | 'tasks.update' | 'tasks.delete'
  | 'meetings.read' | 'meetings.create' | 'meetings.update' | 'meetings.delete'
  | 'files.read' | 'files.create' | 'files.delete'
  | 'documents.read' | 'documents.create' | 'documents.update' | 'documents.delete'
  | 'retainers.read' | 'retainers.create' | 'retainers.update' | 'retainers.delete'
  | 'automation.manage'
  | 'reviews.read' | 'reviews.create' | 'reviews.update'
  | 'settings.read' | 'settings.write'
  | 'mcp.connect' | 'mcp.read' | 'mcp.execute'
  | 'workflow.read' | 'workflow.create' | 'workflow.update' | 'workflow.execute' | 'workflow.delete'
  | 'backup.create' | 'backup.restore'

type Role = WorkspaceContext['role']

const rolePermissions: Record<Role, Set<Permission>> = {
  owner: new Set<Permission>([
    'leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.convert',
    'clients.read', 'clients.create', 'clients.update', 'clients.delete',
    'projects.read', 'projects.create', 'projects.update', 'projects.delete',
    'agreements.read', 'agreements.create', 'agreements.update', 'agreements.delete',
    'invoices.read', 'invoices.create', 'invoices.update', 'invoices.send', 'invoices.markPaid',
    'transactions.read', 'transactions.create',
    'expenses.read', 'expenses.create',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'meetings.read', 'meetings.create', 'meetings.update', 'meetings.delete',
    'files.read', 'files.create', 'files.delete',
    'documents.read', 'documents.create', 'documents.update', 'documents.delete',
    'retainers.read', 'retainers.create', 'retainers.update', 'retainers.delete',
    'automation.manage',
    'reviews.read', 'reviews.create', 'reviews.update',
    'settings.read', 'settings.write',
    'mcp.connect', 'mcp.read', 'mcp.execute',
    'workflow.read', 'workflow.create', 'workflow.update', 'workflow.execute', 'workflow.delete',
    'backup.create', 'backup.restore',
  ]),
  admin: new Set<Permission>([
    'leads.read', 'leads.create', 'leads.update', 'leads.delete', 'leads.convert',
    'clients.read', 'clients.create', 'clients.update', 'clients.delete',
    'projects.read', 'projects.create', 'projects.update', 'projects.delete',
    'agreements.read', 'agreements.create', 'agreements.update', 'agreements.delete',
    'invoices.read', 'invoices.create', 'invoices.update', 'invoices.send', 'invoices.markPaid',
    'transactions.read', 'transactions.create',
    'expenses.read', 'expenses.create',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'meetings.read', 'meetings.create', 'meetings.update', 'meetings.delete',
    'files.read', 'files.create', 'files.delete',
    'documents.read', 'documents.create', 'documents.update', 'documents.delete',
    'retainers.read', 'retainers.create', 'retainers.update', 'retainers.delete',
    'automation.manage',
    'reviews.read', 'reviews.create', 'reviews.update',
    'settings.read', 'settings.write',
    'mcp.connect', 'mcp.read', 'mcp.execute',
    'workflow.read', 'workflow.create', 'workflow.update', 'workflow.execute', 'workflow.delete',
    'backup.create',
  ]),
  member: new Set<Permission>([
    'leads.read', 'leads.create', 'leads.update',
    'clients.read', 'clients.create', 'clients.update',
    'projects.read', 'projects.create', 'projects.update',
    'agreements.read', 'agreements.create', 'agreements.update',
    'invoices.read', 'invoices.create', 'invoices.update',
    'transactions.read', 'transactions.create',
    'expenses.read', 'expenses.create',
    'tasks.read', 'tasks.create', 'tasks.update',
    'meetings.read', 'meetings.create', 'meetings.update',
    'files.read', 'files.create',
    'documents.read', 'documents.create', 'documents.update',
    'retainers.read',
    'reviews.read', 'reviews.create',
    'settings.read',
    'mcp.read', 'mcp.execute',
    'workflow.execute',
  ]),
  client: new Set<Permission>([
    'projects.read',
    'agreements.read',
    'invoices.read',
    'tasks.read',
    'files.read',
    'documents.read',
  ]),
}

export function authorize(permission: Permission, ctx?: WorkspaceContext): boolean {
  const context = ctx ?? getContext()
  const perms = rolePermissions[context.role]
  if (!perms) return false
  return perms.has(permission)
}

export function requirePermission(permission: Permission, ctx?: WorkspaceContext): void {
  if (!authorize(permission, ctx)) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

export function hasAnyRole(ctx: WorkspaceContext, ...roles: Role[]): boolean {
  return roles.includes(ctx.role)
}
