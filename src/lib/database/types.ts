export interface WorkspaceDatabase {
  // Leads
  getLeads(): Promise<LeadRecord[]>
  getLead(id: string): Promise<LeadRecord | null>
  createLead(data: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord>
  updateLead(id: string, data: Partial<LeadRecord>): Promise<LeadRecord>

  // Clients
  getClients(): Promise<ClientRecord[]>
  getClient(id: string): Promise<ClientRecord | null>
  createClient(data: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientRecord>
  updateClient(id: string, data: Partial<ClientRecord>): Promise<ClientRecord>

  // Projects
  getProjects(): Promise<ProjectRecord[]>
  getProject(id: string): Promise<ProjectRecord | null>
  createProject(data: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectRecord>
  updateProject(id: string, data: Partial<ProjectRecord>): Promise<ProjectRecord>

  // Agreements
  getAgreements(): Promise<AgreementRecord[]>
  getAgreement(id: string): Promise<AgreementRecord | null>
  createAgreement(data: Omit<AgreementRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgreementRecord>
  updateAgreement(id: string, data: Partial<AgreementRecord>): Promise<AgreementRecord>

  // Invoices
  getInvoices(): Promise<InvoiceRecord[]>
  getInvoice(id: string): Promise<InvoiceRecord | null>
  createInvoice(data: Omit<InvoiceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvoiceRecord>
  updateInvoice(id: string, data: Partial<InvoiceRecord>): Promise<InvoiceRecord>

  // Transactions
  getTransactions(): Promise<TransactionRecord[]>
  createTransaction(data: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord>

  // Expenses
  getExpenses(): Promise<ExpenseRecord[]>
  createExpense(data: Omit<ExpenseRecord, 'id' | 'createdAt'>): Promise<ExpenseRecord>

  // Tasks
  getTasks(projectId?: string): Promise<TaskRecord[]>
  getTask(id: string): Promise<TaskRecord | null>
  createTask(data: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskRecord>
  updateTask(id: string, data: Partial<TaskRecord>): Promise<TaskRecord>

  // Meetings
  getMeetings(projectId?: string): Promise<MeetingRecord[]>
  getMeeting(id: string): Promise<MeetingRecord | null>
  createMeeting(data: Omit<MeetingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingRecord>
  updateMeeting(id: string, data: Partial<MeetingRecord>): Promise<MeetingRecord>

  // Files
  getFiles(projectId?: string): Promise<FileRecord[]>
  getFile(id: string): Promise<FileRecord | null>
  createFile(data: Omit<FileRecord, 'id' | 'createdAt'>): Promise<FileRecord>
  deleteFile(id: string): Promise<void>

  // Documents
  getDocuments(projectId?: string): Promise<DocumentRecord[]>
  getDocument(id: string): Promise<DocumentRecord | null>
  createDocument(data: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentRecord>
  updateDocument(id: string, data: Partial<DocumentRecord>): Promise<DocumentRecord>

  // Retainers
  getRetainers(): Promise<RetainerRecord[]>
  getRetainer(id: string): Promise<RetainerRecord | null>
  createRetainer(data: Omit<RetainerRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RetainerRecord>
  updateRetainer(id: string, data: Partial<RetainerRecord>): Promise<RetainerRecord>

  // Automation
  getAutomationRules(): Promise<AutomationRuleRecord[]>
  getAutomationRule(id: string): Promise<AutomationRuleRecord | null>
  createAutomationRule(data: Omit<AutomationRuleRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationRuleRecord>
  updateAutomationRule(id: string, data: Partial<AutomationRuleRecord>): Promise<AutomationRuleRecord>

  // Reviews
  getReviews(): Promise<ReviewRecord[]>
  createReview(data: Omit<ReviewRecord, 'id' | 'createdAt'>): Promise<ReviewRecord>
  updateReview(id: string, data: Partial<ReviewRecord>): Promise<ReviewRecord>

  // Settings
  getSetting(key: string): Promise<string | null>
  setSetting(key: string, value: string): Promise<void>

  // Jobs
  createJob(type: string, payload: unknown): Promise<string>
  updateJob(id: string, data: Partial<JobRecord>): Promise<void>

  // Internal
  reset(): Promise<void>
}

export interface LeadRecord {
  id: string
  name: string
  email: string
  phone?: string
  source?: string
  stage: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost'
  notes?: string
  clientId?: string
  createdAt: string
  updatedAt: string
}

export interface ClientRecord {
  id: string
  company: string
  contacts: string
  notes?: string
  tags?: string
  portalAccess: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectRecord {
  id: string
  clientId: string
  name: string
  status: 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived'
  startDate?: string
  endDate?: string
  agreementId?: string
  createdAt: string
  updatedAt: string
}

export interface AgreementRecord {
  id: string
  clientId: string
  type: 'Proposal' | 'Agreement' | 'NDA' | 'SOW' | 'Change' | 'Maintenance' | 'Retainer'
  status: 'Draft' | 'Sent' | 'Signed'
  version: number
  content: string
  signedAt?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceRecord {
  id: string
  clientId: string
  lineItems: string
  subtotal: number
  tax: number
  taxType: string
  total: number
  currency: string
  status: 'Draft' | 'Sent' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled'
  dueDate?: string
  sentAt?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionRecord {
  id: string
  invoiceId: string
  clientId: string
  amount: number
  method: string
  reference?: string
  receiptLink?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

export interface ExpenseRecord {
  id: string
  category: string
  amount: number
  currency: string
  date: string
  description?: string
  receiptLink?: string
  createdAt: string
}

export interface TaskRecord {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  assignee?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface MeetingRecord {
  id: string
  projectId: string
  title: string
  date: string
  duration: number
  attendees?: string
  notes?: string
  recordingLink?: string
  createdAt: string
  updatedAt: string
}

export interface FileRecord {
  id: string
  projectId: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  createdAt: string
}

export interface DocumentRecord {
  id: string
  projectId: string
  title: string
  content: string
  type: 'Note' | 'Doc' | 'Template'
  createdAt: string
  updatedAt: string
}

export interface RetainerRecord {
  id: string
  clientId: string
  name: string
  amount: number
  currency: string
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  status: 'Active' | 'Paused' | 'Cancelled'
  startDate: string
  endDate?: string
  nextBillingDate?: string
  createdAt: string
  updatedAt: string
}

export interface AutomationRuleRecord {
  id: string
  name: string
  trigger: string
  action: string
  config: string
  status: 'Active' | 'Disabled'
  createdAt: string
  updatedAt: string
}

export interface ReviewRecord {
  id: string
  clientId: string
  projectId: string
  rating: number
  content: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

export interface JobRecord {
  id: string
  type: string
  status: 'Queued' | 'Processing' | 'Done' | 'Failed'
  payload: string
  result?: string
  error?: string
  retries: number
  createdAt: string
  completedAt?: string
}
