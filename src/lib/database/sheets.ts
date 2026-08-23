import { google, sheets_v4 } from 'googleapis'
import type { WorkspaceDatabase, LeadRecord, ClientRecord, ProjectRecord, AgreementRecord, InvoiceRecord, TransactionRecord, ExpenseRecord, TaskRecord, MeetingRecord, FileRecord, DocumentRecord, RetainerRecord, AutomationRuleRecord, ReviewRecord, JobRecord, WorkflowExecutionRecord } from './types'
import { generateId } from '@/lib/id'