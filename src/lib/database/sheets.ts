import { google, sheets_v4 } from 'googleapis'
import type { WorkspaceDatabase, LeadRecord, ClientRecord, ProjectRecord, AgreementRecord, InvoiceRecord, TransactionRecord, ExpenseRecord, TaskRecord, MeetingRecord, FileRecord, DocumentRecord, RetainerRecord, AutomationRuleRecord, ReviewRecord, JobRecord } from './types'
import { generateId } from '@/lib/id'

// ponytail: single-sheet-per-entity strategy.
// Each entity type maps to a sheet tab named after the entity.
// Row 1 = headers, Row 2+ = data. ID column is primary key for lookups.
// Upgrade to a proper SQL or document store if query complexity grows.

type SheetRows = string[][]

export class GoogleSheetsAdapter implements WorkspaceDatabase {
  private sheets: sheets_v4.Resource$Spreadsheets
  private sheetId: string

  constructor(authEmail: string, authKey: string, sheetId: string) {
    const auth = new google.auth.JWT({ email: authEmail, key: authKey, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
    this.sheets = google.sheets({ version: 'v4', auth }).spreadsheets
    this.sheetId = sheetId
  }

  // ── Generic helpers ──────────────────────────────────────────────

  private async ensureSheet(name: string): Promise<void> {
    const res = await this.sheets.get({ spreadsheetId: this.sheetId, includeGridData: false })
    const existing = res.data.sheets?.some((s) => s.properties?.title === name)
    if (existing) return
    await this.sheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: name } } }] },
    })
  }

  private async readAll(sheetName: string): Promise<SheetRows> {
    try {
      const res = await this.sheets.values.get({ spreadsheetId: this.sheetId, range: `${sheetName}!A:ZZ` })
      return res.data.values ?? []
    } catch {
      return []
    }
  }

  private async appendRow(sheetName: string, row: string[]): Promise<void> {
    await this.ensureSheet(sheetName)
    await this.sheets.values.append({
      spreadsheetId: this.sheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })
  }

  private async updateRow(sheetName: string, idCol: string, idVal: string, headers: string[], row: string[]): Promise<void> {
    const rows = await this.readAll(sheetName)
    if (rows.length === 0) return
    const idIdx = headers.indexOf(idCol)
    const dataIdx = rows.findIndex((r) => r[idIdx] === idVal)
    if (dataIdx < 0) return
    const range = `${sheetName}!A${dataIdx + 1}`
    await this.sheets.values.update({
      spreadsheetId: this.sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })
  }

  private async deleteRow(sheetName: string, idCol: string, idVal: string): Promise<void> {
    const rows = await this.readAll(sheetName)
    if (rows.length === 0) return
    const idIdx = rows[0].indexOf(idCol)
    const dataIdx = rows.findIndex((r) => r[idIdx] === idVal)
    if (dataIdx < 0) return
    // sheets API has no delete-row shortcut; clear the row values
    const range = `${sheetName}!A${dataIdx + 1}:${String.fromCharCode(64 + rows[0].length)}${dataIdx + 1}`
    await this.sheets.values.clear({ spreadsheetId: this.sheetId, range })
  }

  private rowsToRecords<T>(rows: SheetRows): T[] {
    if (rows.length < 2) return []
    const headers = rows[0]
    return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((r) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = r[i] ?? '' })
      return obj as unknown as T
    })
  }

  private recordToRow<T>(record: T, headers: string[]): string[] {
    return headers.map((h) => {
      const v = (record as Record<string, unknown>)[h]
      return v === null || v === undefined ? '' : String(v)
    })
  }

  // ── Generic CRUD ──────────────────────────────────────────────────

  private async list<T>(sheetName: string): Promise<T[]> {
    const rows = await this.readAll(sheetName)
    return this.rowsToRecords<T>(rows)
  }

  private async get<T>(sheetName: string, id: string): Promise<T | null> {
    const all = await this.list<Record<string, string>>(sheetName)
    return (all.find((r) => r.id === id) as T) ?? null
  }

  private async create<T>(sheetName: string, record: T): Promise<void> {
    const rows = await this.readAll(sheetName)
    const headers = rows.length > 0 ? rows[0] : Object.keys(record as Record<string, unknown>)
    if (rows.length === 0) {
      await this.ensureSheet(sheetName)
      const row = [headers, this.recordToRow(record, headers)]
      await this.sheets.values.update({
        spreadsheetId: this.sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: row },
      })
    } else {
      await this.appendRow(sheetName, this.recordToRow(record, headers))
    }
  }

  private async update<T>(sheetName: string, id: string, data: Partial<T>): Promise<T | null> {
    const rows = await this.readAll(sheetName)
    if (rows.length < 2) return null
    const headers = rows[0]
    const idIdx = headers.indexOf('id')
    const dataIdx = rows.findIndex((r) => r[idIdx] === id)
    if (dataIdx < 0) return null
    const merged: Record<string, string> = {}
    headers.forEach((h, i) => { merged[h] = dataIdx < rows.length && i < rows[dataIdx].length ? rows[dataIdx][i] : '' })
    Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
      const idx = headers.indexOf(k)
      if (idx >= 0) merged[k] = v === null || v === undefined ? '' : String(v)
    })
    const updatedRow = headers.map((h) => merged[h] ?? '')
    const range = `${sheetName}!A${dataIdx + 1}`
    await this.sheets.values.update({
      spreadsheetId: this.sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    })
    return merged as unknown as T
  }

  // ── Leads ─────────────────────────────────────────────────────────

  async getLeads() { return this.list<LeadRecord>('Leads') }
  async getLead(id: string) { return this.get<LeadRecord>('Leads', id) }
  async createLead(data: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: LeadRecord = { id: generateId('LD'), ...data, createdAt: now, updatedAt: now }
    await this.create('Leads', record)
    return record
  }
  async updateLead(id: string, data: Partial<LeadRecord>) {
    const updated = await this.update<LeadRecord>('Leads', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Lead not found')
    return updated
  }

  // ── Clients ───────────────────────────────────────────────────────

  async getClients() { return this.list<ClientRecord>('Clients') }
  async getClient(id: string) { return this.get<ClientRecord>('Clients', id) }
  async createClient(data: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: ClientRecord = { id: generateId('CL'), ...data, portalAccess: data.portalAccess ?? false, createdAt: now, updatedAt: now }
    await this.create('Clients', record)
    return record
  }
  async updateClient(id: string, data: Partial<ClientRecord>) {
    const updated = await this.update<ClientRecord>('Clients', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Client not found')
    return updated
  }

  // ── Projects ──────────────────────────────────────────────────────

  async getProjects() { return this.list<ProjectRecord>('Projects') }
  async getProject(id: string) { return this.get<ProjectRecord>('Projects', id) }
  async createProject(data: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: ProjectRecord = { id: generateId('PR'), ...data, createdAt: now, updatedAt: now }
    await this.create('Projects', record)
    return record
  }
  async updateProject(id: string, data: Partial<ProjectRecord>) {
    const updated = await this.update<ProjectRecord>('Projects', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Project not found')
    return updated
  }

  // ── Agreements ────────────────────────────────────────────────────

  async getAgreements() { return this.list<AgreementRecord>('Agreements') }
  async getAgreement(id: string) { return this.get<AgreementRecord>('Agreements', id) }
  async createAgreement(data: Omit<AgreementRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: AgreementRecord = { id: generateId('AG'), ...data, version: data.version ?? 1, createdAt: now, updatedAt: now }
    await this.create('Agreements', record)
    return record
  }
  async updateAgreement(id: string, data: Partial<AgreementRecord>) {
    const updated = await this.update<AgreementRecord>('Agreements', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Agreement not found')
    return updated
  }

  // ── Invoices ──────────────────────────────────────────────────────

  async getInvoices() { return this.list<InvoiceRecord>('Invoices') }
  async getInvoice(id: string) { return this.get<InvoiceRecord>('Invoices', id) }
  async createInvoice(data: Omit<InvoiceRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: InvoiceRecord = { id: generateId('INV'), ...data, createdAt: now, updatedAt: now }
    await this.create('Invoices', record)
    return record
  }
  async updateInvoice(id: string, data: Partial<InvoiceRecord>) {
    const updated = await this.update<InvoiceRecord>('Invoices', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Invoice not found')
    return updated
  }

  // ── Transactions ──────────────────────────────────────────────────

  async getTransactions() { return this.list<TransactionRecord>('Transactions') }
  async createTransaction(data: Omit<TransactionRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: TransactionRecord = { id: generateId('TR'), ...data, createdAt: now }
    await this.create('Transactions', record)
    return record
  }

  // ── Expenses ──────────────────────────────────────────────────────

  async getExpenses() { return this.list<ExpenseRecord>('Expenses') }
  async createExpense(data: Omit<ExpenseRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: ExpenseRecord = { id: generateId('EX'), ...data, createdAt: now }
    await this.create('Expenses', record)
    return record
  }

  // ── Tasks ─────────────────────────────────────────────────────────

  async getTasks(projectId?: string) {
    const all = await this.list<TaskRecord>('Tasks')
    return projectId ? all.filter((t) => t.projectId === projectId) : all
  }
  async getTask(id: string) { return this.get<TaskRecord>('Tasks', id) }
  async createTask(data: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: TaskRecord = { id: generateId('TK'), ...data, createdAt: now, updatedAt: now }
    await this.create('Tasks', record)
    return record
  }
  async updateTask(id: string, data: Partial<TaskRecord>) {
    const updated = await this.update<TaskRecord>('Tasks', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Task not found')
    return updated
  }

  // ── Meetings ──────────────────────────────────────────────────────

  async getMeetings(projectId?: string) {
    const all = await this.list<MeetingRecord>('Meetings')
    return projectId ? all.filter((m) => m.projectId === projectId) : all
  }
  async getMeeting(id: string) { return this.get<MeetingRecord>('Meetings', id) }
  async createMeeting(data: Omit<MeetingRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: MeetingRecord = { id: generateId('MT'), ...data, createdAt: now, updatedAt: now }
    await this.create('Meetings', record)
    return record
  }
  async updateMeeting(id: string, data: Partial<MeetingRecord>) {
    const updated = await this.update<MeetingRecord>('Meetings', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Meeting not found')
    return updated
  }

  // ── Files ─────────────────────────────────────────────────────────

  async getFiles(projectId?: string) {
    const all = await this.list<FileRecord>('Files')
    return projectId ? all.filter((f) => f.projectId === projectId) : all
  }
  async getFile(id: string) { return this.get<FileRecord>('Files', id) }
  async createFile(data: Omit<FileRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: FileRecord = { id: generateId('DC'), ...data, createdAt: now }
    await this.create('Files', record)
    return record
  }
  async deleteFile(id: string) { await this.deleteRow('Files', 'id', id) }

  // ── Documents ─────────────────────────────────────────────────────

  async getDocuments(projectId?: string) {
    const all = await this.list<DocumentRecord>('Documents')
    return projectId ? all.filter((d) => d.projectId === projectId) : all
  }
  async getDocument(id: string) { return this.get<DocumentRecord>('Documents', id) }
  async createDocument(data: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: DocumentRecord = { id: generateId('DC'), ...data, createdAt: now, updatedAt: now }
    await this.create('Documents', record)
    return record
  }
  async updateDocument(id: string, data: Partial<DocumentRecord>) {
    const updated = await this.update<DocumentRecord>('Documents', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Document not found')
    return updated
  }

  // ── Retainers ─────────────────────────────────────────────────────

  async getRetainers() { return this.list<RetainerRecord>('Retainers') }
  async getRetainer(id: string) { return this.get<RetainerRecord>('Retainers', id) }
  async createRetainer(data: Omit<RetainerRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: RetainerRecord = { id: generateId('RT'), ...data, createdAt: now, updatedAt: now }
    await this.create('Retainers', record)
    return record
  }
  async updateRetainer(id: string, data: Partial<RetainerRecord>) {
    const updated = await this.update<RetainerRecord>('Retainers', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Retainer not found')
    return updated
  }

  // ── Automation ────────────────────────────────────────────────────

  async getAutomationRules() { return this.list<AutomationRuleRecord>('Automation') }
  async getAutomationRule(id: string) { return this.get<AutomationRuleRecord>('Automation', id) }
  async createAutomationRule(data: Omit<AutomationRuleRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: AutomationRuleRecord = { id: generateId('AU'), ...data, createdAt: now, updatedAt: now }
    await this.create('Automation', record)
    return record
  }
  async updateAutomationRule(id: string, data: Partial<AutomationRuleRecord>) {
    const updated = await this.update<AutomationRuleRecord>('Automation', id, { ...data, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Automation rule not found')
    return updated
  }

  // ── Reviews ───────────────────────────────────────────────────────

  async getReviews() { return this.list<ReviewRecord>('Reviews') }
  async createReview(data: Omit<ReviewRecord, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    const record: ReviewRecord = { id: generateId('RV'), ...data, createdAt: now }
    await this.create('Reviews', record)
    return record
  }
  async updateReview(id: string, data: Partial<ReviewRecord>) {
    const updated = await this.update<ReviewRecord>('Reviews', id, { ...data })
    if (!updated) throw new Error('Review not found')
    return updated
  }

  // ── Settings ──────────────────────────────────────────────────────

  async getSetting(key: string) {
    const rows = await this.readAll('Settings')
    if (rows.length < 2) return null
    const dataIdx = rows.slice(1).findIndex((r) => r[0] === key)
    return dataIdx >= 0 ? rows[dataIdx + 1][1] ?? null : null
  }
  async setSetting(key: string, value: string) {
    const rows = await this.readAll('Settings')
    if (rows.length === 0 || rows[0].length < 2) {
      await this.ensureSheet('Settings')
      await this.sheets.values.update({
        spreadsheetId: this.sheetId,
        range: 'Settings!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['key', 'value'], [key, value]] },
      })
      return
    }
    const dataIdx = rows.slice(1).findIndex((r) => r[0] === key)
    if (dataIdx >= 0) {
      const range = `Settings!B${dataIdx + 2}`
      await this.sheets.values.update({
        spreadsheetId: this.sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[value]] },
      })
    } else {
      await this.appendRow('Settings', [key, value])
    }
  }

  // ── Jobs ──────────────────────────────────────────────────────────

  private async listJobs() { return this.list<JobRecord>('Jobs') }

  async createJob(type: string, payload: unknown) {
    const now = new Date().toISOString()
    const id = `JOB-${Date.now()}`
    const record: JobRecord = { id, type, status: 'Queued', payload: JSON.stringify(payload), retries: 0, createdAt: now }
    await this.create('Jobs', record)
    return id
  }
  async updateJob(id: string, data: Partial<JobRecord>) {
    const updated = await this.update<JobRecord>('Jobs', id, { ...data })
    if (!updated) throw new Error('Job not found')
  }

  // ── Internal ──────────────────────────────────────────────────────

  async reset() {
    const tabs = ['Leads', 'Clients', 'Projects', 'Agreements', 'Invoices', 'Transactions', 'Expenses', 'Tasks', 'Meetings', 'Files', 'Documents', 'Retainers', 'Automation', 'Reviews', 'Settings', 'Jobs']
    for (const tab of tabs) {
      try {
        const rows = await this.readAll(tab)
        if (rows.length > 0) {
          const range = `${tab}!A1:ZZ${rows.length}`
          await this.sheets.values.clear({ spreadsheetId: this.sheetId, range })
        }
      } catch { /* tab may not exist */ }
    }
  }
}
