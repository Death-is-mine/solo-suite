import type { WorkspaceDatabase, LeadRecord, ClientRecord, ProjectRecord, AgreementRecord, InvoiceRecord, TransactionRecord, ExpenseRecord, TaskRecord, MeetingRecord, FileRecord, DocumentRecord, RetainerRecord, AutomationRuleRecord, ReviewRecord, JobRecord } from './types'
import { generateId } from '@/lib/id'

// ponytail: in-memory implementation for development.
// Swap to GoogleSheetsAdapter when SHEET_ID + service account are configured.

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

  async getLeads() { return Array.from(this.leads.values()) }
  async getLead(id: string) { return this.leads.get(id) ?? null }
  async createLead(data: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: LeadRecord = { id: generateId('LD'), ...data, createdAt: now, updatedAt: now }
    this.leads.set(record.id, record)
    return record
  }
  async updateLead(id: string, data: Partial<LeadRecord>) {
    const existing = this.leads.get(id)
    if (!existing) throw new Error('Lead not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.leads.set(id, updated)
    return updated
  }

  async getClients() { return Array.from(this.clients.values()) }
  async getClient(id: string) { return this.clients.get(id) ?? null }
  async createClient(data: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: ClientRecord = { id: generateId('CL'), ...data, portalAccess: data.portalAccess ?? false, createdAt: now, updatedAt: now }
    this.clients.set(record.id, record)
    return record
  }
  async updateClient(id: string, data: Partial<ClientRecord>) {
    const existing = this.clients.get(id)
    if (!existing) throw new Error('Client not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.clients.set(id, updated)
    return updated
  }

  async getProjects() { return Array.from(this.projects.values()) }
  async getProject(id: string) { return this.projects.get(id) ?? null }
  async createProject(data: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: ProjectRecord = { id: generateId('PR'), ...data, createdAt: now, updatedAt: now }
    this.projects.set(record.id, record)
    return record
  }
  async updateProject(id: string, data: Partial<ProjectRecord>) {
    const existing = this.projects.get(id)
    if (!existing) throw new Error('Project not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.projects.set(id, updated)
    return updated
  }

  async getAgreements() { return Array.from(this.agreements.values()) }
  async getAgreement(id: string) { return this.agreements.get(id) ?? null }
  async createAgreement(data: Omit<AgreementRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: AgreementRecord = { id: generateId('AG'), ...data, createdAt: now, updatedAt: now }
    this.agreements.set(record.id, record)
    return record
  }
  async updateAgreement(id: string, data: Partial<AgreementRecord>) {
    const existing = this.agreements.get(id)
    if (!existing) throw new Error('Agreement not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.agreements.set(id, updated)
    return updated
  }

  async getInvoices() { return Array.from(this.invoices.values()) }
  async getInvoice(id: string) { return this.invoices.get(id) ?? null }
  async createInvoice(data: Omit<InvoiceRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: InvoiceRecord = { id: generateId('INV'), ...data, createdAt: now, updatedAt: now }
    this.invoices.set(record.id, record)
    return record
  }
  async updateInvoice(id: string, data: Partial<InvoiceRecord>) {
    const existing = this.invoices.get(id)
    if (!existing) throw new Error('Invoice not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.invoices.set(id, updated)
    return updated
  }

  async getTransactions() { return Array.from(this.transactions.values()) }
  async createTransaction(data: Omit<TransactionRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: TransactionRecord = { id: generateId('TR'), ...data, createdAt: now }
    this.transactions.set(record.id, record)
    return record
  }
  async getExpenses() { return Array.from(this.expenses.values()) }
  async createExpense(data: Omit<ExpenseRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: ExpenseRecord = { id: generateId('EX'), ...data, createdAt: now }
    this.expenses.set(record.id, record)
    return record
  }

  async getTasks(projectId?: string) {
    const all = Array.from(this.tasks.values())
    return projectId ? all.filter((t) => t.projectId === projectId) : all
  }
  async getTask(id: string) { return this.tasks.get(id) ?? null }
  async createTask(data: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: TaskRecord = { id: generateId('TK'), ...data, createdAt: now, updatedAt: now }
    this.tasks.set(record.id, record)
    return record
  }
  async updateTask(id: string, data: Partial<TaskRecord>) {
    const existing = this.tasks.get(id)
    if (!existing) throw new Error('Task not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.tasks.set(id, updated)
    return updated
  }

  async getMeetings(projectId?: string) {
    const all = Array.from(this.meetings.values())
    return projectId ? all.filter((m) => m.projectId === projectId) : all
  }
  async getMeeting(id: string) { return this.meetings.get(id) ?? null }
  async createMeeting(data: Omit<MeetingRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: MeetingRecord = { id: generateId('MT'), ...data, createdAt: now, updatedAt: now }
    this.meetings.set(record.id, record)
    return record
  }
  async updateMeeting(id: string, data: Partial<MeetingRecord>) {
    const existing = this.meetings.get(id)
    if (!existing) throw new Error('Meeting not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.meetings.set(id, updated)
    return updated
  }

  async getFiles(projectId?: string) {
    const all = Array.from(this.files.values())
    return projectId ? all.filter((f) => f.projectId === projectId) : all
  }
  async getFile(id: string) { return this.files.get(id) ?? null }
  async createFile(data: Omit<FileRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: FileRecord = { id: generateId('DC'), ...data, createdAt: now }
    this.files.set(record.id, record)
    return record
  }
  async deleteFile(id: string) { this.files.delete(id) }

  async getDocuments(projectId?: string) {
    const all = Array.from(this.documents.values())
    return projectId ? all.filter((d) => d.projectId === projectId) : all
  }
  async getDocument(id: string) { return this.documents.get(id) ?? null }
  async createDocument(data: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: DocumentRecord = { id: generateId('DC'), ...data, createdAt: now, updatedAt: now }
    this.documents.set(record.id, record)
    return record
  }
  async updateDocument(id: string, data: Partial<DocumentRecord>) {
    const existing = this.documents.get(id)
    if (!existing) throw new Error('Document not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.documents.set(id, updated)
    return updated
  }

  async getRetainers() { return Array.from(this.retainers.values()) }
  async getRetainer(id: string) { return this.retainers.get(id) ?? null }
  async createRetainer(data: Omit<RetainerRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: RetainerRecord = { id: generateId('RT'), ...data, createdAt: now, updatedAt: now }
    this.retainers.set(record.id, record)
    return record
  }
  async updateRetainer(id: string, data: Partial<RetainerRecord>) {
    const existing = this.retainers.get(id)
    if (!existing) throw new Error('Retainer not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.retainers.set(id, updated)
    return updated
  }

  async getAutomationRules() { return Array.from(this.automations.values()) }
  async getAutomationRule(id: string) { return this.automations.get(id) ?? null }
  async createAutomationRule(data: Omit<AutomationRuleRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: AutomationRuleRecord = { id: generateId('AU'), ...data, createdAt: now, updatedAt: now }
    this.automations.set(record.id, record)
    return record
  }
  async updateAutomationRule(id: string, data: Partial<AutomationRuleRecord>) {
    const existing = this.automations.get(id)
    if (!existing) throw new Error('Automation rule not found')
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
    this.automations.set(id, updated)
    return updated
  }

  async getReviews() { return Array.from(this.reviews.values()) }
  async createReview(data: Omit<ReviewRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: ReviewRecord = { id: generateId('RV'), ...data, createdAt: now }
    this.reviews.set(record.id, record)
    return record
  }
  async updateReview(id: string, data: Partial<ReviewRecord>) {
    const existing = this.reviews.get(id)
    if (!existing) throw new Error('Review not found')
    const updated = { ...existing, ...data }
    this.reviews.set(id, updated)
    return updated
  }

  async getSetting(key: string) { return this.settings.get(key) ?? null }
  async setSetting(key: string, value: string) { this.settings.set(key, value) }

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
  }
}

// ponytail: lazy singleton via Proxy — sheets adapter loaded only on first call from server
let _db: WorkspaceDatabase | null = null

function getOrCreateDb(): WorkspaceDatabase {
  if (_db) return _db
  const sheetId = process.env.SHEET_ID
  const serviceEmail = process.env.GOOGLE_SERVICE_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  if (sheetId && serviceEmail && privateKey) {
    // require is safe here — only called on server, never in client bundle
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleSheetsAdapter } = require('./sheets')
    _db = new GoogleSheetsAdapter(serviceEmail, privateKey, sheetId) as WorkspaceDatabase
  } else {
    _db = new InMemoryDatabase()
  }
  return _db
}

export const db: WorkspaceDatabase = new Proxy({} as WorkspaceDatabase, {
  get(_, prop: string | symbol) {
    return (getOrCreateDb() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
