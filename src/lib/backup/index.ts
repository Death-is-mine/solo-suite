import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

// ponytail: backup module — exports all workspace data as JSON.

export interface BackupSnapshot {
  version: 1
  createdAt: string
  workspaceId: string
  data: {
    leads: unknown[]
    clients: unknown[]
    projects: unknown[]
    invoices: unknown[]
    tasks: unknown[]
    agreements: unknown[]
    transactions: unknown[]
    expenses: unknown[]
    meetings: unknown[]
    files: unknown[]
    documents: unknown[]
    retainers: unknown[]
  }
}

export async function createBackup(): Promise<BackupSnapshot> {
  const [leads, clients, projects, invoices, tasks, agreements, transactions, expenses, meetings, files, documents, retainers] =
    await Promise.all([
      db.getLeads(), db.getClients(), db.getProjects(), db.getInvoices(),
      db.getTasks(), db.getAgreements(), db.getTransactions(), db.getExpenses(),
      db.getMeetings(), db.getFiles(), db.getDocuments(), db.getRetainers(),
    ])

  const snapshot: BackupSnapshot = {
    version: 1,
    createdAt: new Date().toISOString(),
    workspaceId: '',
    data: { leads, clients, projects, invoices, tasks, agreements, transactions, expenses, meetings, files, documents, retainers },
  }

  await emit('backup.completed', { snapshot }, 'backup')
  return snapshot
}

export async function restoreBackup(snapshot: BackupSnapshot): Promise<{ imported: number }> {
  if (snapshot.version !== 1) throw new Error(`Unsupported backup version: ${snapshot.version}`)
  let imported = 0
  for (const lead of snapshot.data.leads) {
    const l = lead as { name: string; email: string; stage?: string; source?: string }
    await db.createLead({ name: l.name, email: l.email, stage: (l.stage as 'New') ?? 'New', source: l.source })
    imported++
  }
  for (const client of snapshot.data.clients) {
    const c = client as { company: string; contacts: string; portalAccess?: boolean }
    await db.createClient({ company: c.company, contacts: c.contacts, portalAccess: c.portalAccess ?? false })
    imported++
  }
  return { imported }
}

export function backupToJson(snapshot: BackupSnapshot): string {
  return JSON.stringify(snapshot, null, 2)
}
