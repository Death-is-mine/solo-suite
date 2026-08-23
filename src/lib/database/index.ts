import type { WorkspaceDatabase, LeadRecord, ClientRecord, ProjectRecord, AgreementRecord, InvoiceRecord, TransactionRecord, ExpenseRecord, TaskRecord, MeetingRecord, FileRecord, DocumentRecord, RetainerRecord, AutomationRuleRecord, ReviewRecord, JobRecord, WorkflowExecutionRecord } from './types'
import { generateId } from '@/lib/id'
import { getContext } from '@/lib/workspace-context'

// ponytail: in-memory implementation for development.
// All queries are workspace-scoped via getContext().

class InMemoryDatabase implements WorkspaceDatabase {
  private leads = new Map<string, LeadRecord>()
  private clients = new Map<string, ClientRecord>()
  private projects = new Map<string, ProjectRecord>()
  private agreements = new Map<string, AgreementRecord>()
  private invoices = new Map<string, InvoiceRecord>()
  private transactions = new Map<string, TransactionRecord>()
  private expenses = new Map<string, ExpenseRecord>()
  private tasks = new Map<string, TaskRecord>()
  private meetings = new Map<string, MeetingRecord>()
  private files = new Map<string, FileRecord>()
  private documents = new Map<string, DocumentRecord>()
  private retainers = new Map<string, RetainerRecord>()
  private automations = new Map<string, AutomationRuleRecord>()
  private reviews = new Map<string, ReviewRecord>()
  private settings = new Map<string, string>()
  private jobs = new Map<string, JobRecord>()
  private workflowExecutions = new Map<string, WorkflowExecutionRecord>()

  private getWorkspaceId(): string {
    return getContext().workspaceId
  }

  private inWorkspace<T extends { workspaceId: string }>(items: T[]): T[] {
    const wid = this.getWorkspaceId()
    return items.filter((r) => r.workspaceId === wid)
  }

  private assertOwnership<T extends { workspaceId: string }>(record: T | null, label: string): T {
    if (!record) throw new Error(`${label} not found`)
    if (record.workspaceId !== this.getWorkspaceId()) throw new Error(`${label} not found`)
    return record
  }

  // Leads
  async getLeads() { return this.inWorkspace(Array.from(this.leads.values())) }
  async getLead(id: string) { return this.assertOwnership(this.leads.get(id) ?? null, 'Lead') }
  async createLead(data: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: LeadRecord = { id: generateId('LD'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.leads.set(record.id, record)
    return record
  }
  async updateLead(id: string, data: Partial<LeadRecord>) {
    const existing = this.assertOwnership(this.leads.get(id) ?? null, 'Lead')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.leads.set(id, updated)
    return updated
  }

  // Clients
  async getClients() { return this.inWorkspace(Array.from(this.clients.values())) }
  async getClient(id: string) { return this.assertOwnership(this.clients.get(id) ?? null, 'Client') }
  async createClient(data: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: ClientRecord = { id: generateId('CL'), workspaceId: this.getWorkspaceId(), ...data, portalAccess: data.portalAccess ?? false, createdAt: now, updatedAt: now }
    this.clients.set(record.id, record)
    return record
  }
  async updateClient(id: string, data: Partial<ClientRecord>) {
    const existing = this.assertOwnership(this.clients.get(id) ?? null, 'Client')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.clients.set(id, updated)
    return updated
  }

  // Projects
  async getProjects() { return this.inWorkspace(Array.from(this.projects.values())) }
  async getProject(id: string) { return this.assertOwnership(this.projects.get(id) ?? null, 'Project') }
  async createProject(data: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: ProjectRecord = { id: generateId('PR'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.projects.set(record.id, record)
    return record
  }
  async updateProject(id: string, data: Partial<ProjectRecord>) {
    const existing = this.assertOwnership(this.projects.get(id) ?? null, 'Project')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.projects.set(id, updated)
    return updated
  }

  // Agreements
  async getAgreements() { return this.inWorkspace(Array.from(this.agreements.values())) }
  async getAgreement(id: string) { return this.assertOwnership(this.agreements.get(id) ?? null, 'Agreement') }
  async createAgreement(data: Omit<AgreementRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: AgreementRecord = { id: generateId('AG'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.agreements.set(record.id, record)
    return record
  }
  async updateAgreement(id: string, data: Partial<AgreementRecord>) {
    const existing = this.assertOwnership(this.agreements.get(id) ?? null, 'Agreement')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.agreements.set(id, updated)
    return updated
  }

  // Invoices
  async getInvoices() { return this.inWorkspace(Array.from(this.invoices.values())) }
  async getInvoice(id: string) { return this.assertOwnership(this.invoices.get(id) ?? null, 'Invoice') }
  async createInvoice(data: Omit<InvoiceRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: InvoiceRecord = { id: generateId('INV'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.invoices.set(record.id, record)
    return record
  }
  async updateInvoice(id: string, data: Partial<InvoiceRecord>) {
    const existing = this.assertOwnership(this.invoices.get(id) ?? null, 'Invoice')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.invoices.set(id, updated)
    return updated
  }

  // Transactions
  async getTransactions() { return this.inWorkspace(Array.from(this.transactions.values())) }
  async createTransaction(data: Omit<TransactionRecord, 'id' | 'createdAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: TransactionRecord = { id: generateId('TR'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now }
    this.transactions.set(record.id, record)
    return record
  }

  // Expenses
  async getExpenses() { return this.inWorkspace(Array.from(this.expenses.values())) }
  async createExpense(data: Omit<ExpenseRecord, 'id' | 'createdAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: ExpenseRecord = { id: generateId('EX'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now }
    this.expenses.set(record.id, record)
    return record
  }

  // Tasks
  async getTasks(projectId?: string) {
    const all = this.inWorkspace(Array.from(this.tasks.values()))
    return projectId ? all.filter((t) => t.projectId === projectId) : all
  }
  async getTask(id: string) { return this.assertOwnership(this.tasks.get(id) ?? null, 'Task') }
  async createTask(data: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: TaskRecord = { id: generateId('TK'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.tasks.set(record.id, record)
    return record
  }
  async updateTask(id: string, data: Partial<TaskRecord>) {
    const existing = this.assertOwnership(this.tasks.get(id) ?? null, 'Task')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.tasks.set(id, updated)
    return updated
  }

  // Meetings
  async getMeetings(projectId?: string) {
    const all = this.inWorkspace(Array.from(this.meetings.values()))
    return projectId ? all.filter((m) => m.projectId === projectId) : all
  }
  async getMeeting(id: string) { return this.assertOwnership(this.meetings.get(id) ?? null, 'Meeting') }
  async createMeeting(data: Omit<MeetingRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: MeetingRecord = { id: generateId('MT'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.meetings.set(record.id, record)
    return record
  }
  async updateMeeting(id: string, data: Partial<MeetingRecord>) {
    const existing = this.assertOwnership(this.meetings.get(id) ?? null, 'Meeting')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.meetings.set(id, updated)
    return updated
  }

  // Files
  async getFiles(projectId?: string) {
    const all = this.inWorkspace(Array.from(this.files.values()))
    return projectId ? all.filter((f) => f.projectId === projectId) : all
  }
  async getFile(id: string) { return this.assertOwnership(this.files.get(id) ?? null, 'File') }
  async createFile(data: Omit<FileRecord, 'id' | 'createdAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: FileRecord = { id: generateId('FL'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now }
    this.files.set(record.id, record)
    return record
  }
  async deleteFile(id: string) {
    const existing = this.assertOwnership(this.files.get(id) ?? null, 'File')
    this.files.delete(existing.id)
  }

  // Documents
  async getDocuments(projectId?: string) {
    const all = this.inWorkspace(Array.from(this.documents.values()))
    return projectId ? all.filter((d) => d.projectId === projectId) : all
  }
  async getDocument(id: string) { return this.assertOwnership(this.documents.get(id) ?? null, 'Document') }
  async createDocument(data: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: DocumentRecord = { id: generateId('DC'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.documents.set(record.id, record)
    return record
  }
  async updateDocument(id: string, data: Partial<DocumentRecord>) {
    const existing = this.assertOwnership(this.documents.get(id) ?? null, 'Document')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.documents.set(id, updated)
    return updated
  }

  // Retainers
  async getRetainers() { return this.inWorkspace(Array.from(this.retainers.values())) }
  async getRetainer(id: string) { return this.assertOwnership(this.retainers.get(id) ?? null, 'Retainer') }
  async createRetainer(data: Omit<RetainerRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: RetainerRecord = { id: generateId('RT'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.retainers.set(record.id, record)
    return record
  }
  async updateRetainer(id: string, data: Partial<RetainerRecord>) {
    const existing = this.assertOwnership(this.retainers.get(id) ?? null, 'Retainer')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.retainers.set(id, updated)
    return updated
  }

  // Automation Rules
  async getAutomationRules() { return this.inWorkspace(Array.from(this.automations.values())) }
  async getAutomationRule(id: string) { return this.assertOwnership(this.automations.get(id) ?? null, 'AutomationRule') }
  async createAutomationRule(data: Omit<AutomationRuleRecord, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: AutomationRuleRecord = { id: generateId('AU'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now, updatedAt: now }
    this.automations.set(record.id, record)
    return record
  }
  async updateAutomationRule(id: string, data: Partial<AutomationRuleRecord>) {
    const existing = this.assertOwnership(this.automations.get(id) ?? null, 'AutomationRule')
    const updated = { ...existing, ...data, workspaceId: existing.workspaceId, updatedAt: new Date().toISOString() }
    this.automations.set(id, updated)
    return updated
  }

  // Reviews
  async getReviews() { return this.inWorkspace(Array.from(this.reviews.values())) }
  async createReview(data: Omit<ReviewRecord, 'id' | 'createdAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: ReviewRecord = { id: generateId('RV'), workspaceId: this.getWorkspaceId(), ...data, createdAt: now }
    this.reviews.set(record.id, record)
    return record
  }
  async updateReview(id: string, data: Partial<ReviewRecord>) {
    const existing = this.reviews.get(id)
    if (!existing) throw new Error('Review not found')
    if (existing.workspaceId !== this.getWorkspaceId()) throw new Error('Review not found')
    const updated = { ...existing, ...data }
    this.reviews.set(id, updated)
    return updated
  }

  // Settings — workspace-scoped by key prefix
  async getSetting(key: string) { return this.settings.get(`${this.getWorkspaceId()}:${key}`) ?? null }
  async setSetting(key: string, value: string) { this.settings.set(`${this.getWorkspaceId()}:${key}`, value) }

  // Jobs
  async createJob(type: string, payload: unknown) {
    const now = new Date().toISOString()
    const id = `JOB-${Date.now()}`
    this.jobs.set(id, { id, type, status: 'Queued', payload: JSON.stringify(payload), retries: 0, createdAt: now })
    return id
  }
  async updateJob(id: string, data: Partial<JobRecord>) {
    const existing = this.jobs.get(id)
    if (!existing) throw new Error('Job not found')
    this.jobs.set(id, { ...existing, ...data })
  }

  // Workflow Executions
  async createWorkflowExecution(data: Omit<WorkflowExecutionRecord, 'id' | 'createdAt' | 'workspaceId'>) {
    const now = new Date().toISOString()
    const record: WorkflowExecutionRecord = {
      id: generateId('WF'),
      workspaceId: this.getWorkspaceId(),
      ...data,
      createdAt: now,
    }
    this.workflowExecutions.set(record.id, record)
    return record
  }
  async getWorkflowExecutions(ruleId?: string) {
    const all = this.inWorkspace(Array.from(this.workflowExecutions.values()))
    return ruleId ? all.filter((e) => e.ruleId === ruleId) : all
  }

  async reset() {
    this.leads.clear()
    this.clients.clear()
    this.projects.clear()
    this.agreements.clear()
    this.invoices.clear()
    this.transactions.clear()
    this.expenses.clear()
    this.tasks.clear()
    this.meetings.clear()
    this.files.clear()
    this.documents.clear()
    this.retainers.clear()
    this.automations.clear()
    this.reviews.clear()
    this.settings.clear()
    this.jobs.clear()
    this.workflowExecutions.clear()
  }
}

// ponytail: lazy singleton via Proxy — sheets adapter loaded only on first call from server
const _get = (): WorkspaceDatabase => {
  const key = '__solo_db'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any
  if (g[key]) return g[key] as WorkspaceDatabase
  const sheetId = process.env.SHEET_ID
  const serviceEmail = process.env.GOOGLE_SERVICE_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  if (sheetId && serviceEmail && privateKey) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleSheetsAdapter } = require('./sheets')
    g[key] = new GoogleSheetsAdapter(serviceEmail, privateKey, sheetId) as WorkspaceDatabase
  } else {
    g[key] = new InMemoryDatabase()
  }
  return g[key] as WorkspaceDatabase
}

export const db: WorkspaceDatabase = new Proxy({} as WorkspaceDatabase, {
  get(_, prop: string | symbol) {
    return (_get() as unknown as Record<string | symbol, unknown>)[prop]
  },
})