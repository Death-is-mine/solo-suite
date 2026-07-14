# 02 — Product Requirements (PRD)

> Functional requirements for Solo Suite v1. Organized by workflow.

---

## Purpose

Define every feature, user story, and acceptance criterion for Solo Suite. This document is the functional specification that engineering implements against.

---

## Scope

Covers all modules in Workflow 1 (Revenue), Workflow 2 (Delivery), and Workflow 3 (Growth). Excludes payment gateway integration, native mobile apps, real-time collaboration, and plugin marketplace (documented in `docs/future/`).

---

## Foundation — Application Shell

### Authentication

| ID | Requirement | Acceptance |
|----|-------------|------------|
| AUTH-1 | User signs in with Google OAuth | Redirect to Google, return with session |
| AUTH-2 | Session persists across page reloads | JWT/cookie-based session, no re-auth each page |
| AUTH-3 | User can sign out | Clears session, redirects to login |
| AUTH-4 | Unauthenticated users see login page | Protected routes redirect to /login |

### Layout & Navigation

| ID | Requirement | Acceptance |
|----|-------------|------------|
| SHELL-1 | Sidebar shows all modules with icons | Each module visible, current module highlighted |
| SHELL-2 | Top navigation shows profile menu | User avatar, settings, sign out |
| SHELL-3 | Theme toggle (light/dark) | Toggles between themes, persists preference |
| SHELL-4 | Workspace switcher | Switch between solo/agency workspace |
| SHELL-5 | Global search | Search across leads, clients, projects, invoices, agreements |
| SHELL-6 | Notification center | Bell icon, unread count, notification list |
| SHELL-7 | Command palette | Ctrl+K / Cmd+K opens command palette |
| SHELL-8 | All routes exist | Unimplemented routes show "Coming Soon" state, never 404 |

### Workspace Context Engine

| ID | Requirement | Acceptance |
|----|-------------|------------|
| CTX-1 | Context holds current workspace, user, permissions | Available to all modules via context API |
| CTX-2 | Context holds current project/client if scoped | Modules read context instead of managing own state |
| CTX-3 | Context holds locale, timezone, currency | Used by all formatting and display |

### Workspace Settings Registry

| ID | Requirement | Acceptance |
|----|-------------|------------|
| SET-1 | Settings stored in Google Sheets | Single source of truth |
| SET-2 | Settings include: currency, timezone, taxes, theme, language, numbering format | All configurable via UI |
| SET-3 | Settings include integration status | Shows connected/disconnected for each Google service |

### Feature Flags

| ID | Requirement | Acceptance |
|----|-------------|------------|
| FF-1 | Feature flags stored in workspace settings | Toggle on/off per workspace |
| FF-2 | Flags control visibility of: AI, Reviews, Agency Mode, Client Portal, Documents | Disabled features hidden from sidebar |

### Event Bus

| ID | Requirement | Acceptance |
|----|-------------|------------|
| EVT-1 | Business events published on key actions | lead.created, lead.converted, client.created, agreement.signed, invoice.sent, invoice.paid, expense.recorded, project.completed |
| EVT-2 | System events published on infrastructure actions | backup.completed, sync.failed, calendar.connected, health.failed, adapter.error |
| EVT-3 | Modules subscribe to relevant events | Loose coupling via event bus, not direct calls |

### Job Queue

| ID | Requirement | Acceptance |
|----|-------------|------------|
| JOB-1 | Async jobs queued for: backup, PDF generation, receipt generation, email, report generation, AI summaries, calendar sync, sheet sync | Jobs processed in background, UI remains responsive |
| JOB-2 | Job metadata persisted in Google Sheets | Status, timestamps, retries, result, error visible |
| JOB-3 | Job queue uses InProcessQueueAdapter (v1) | Interface-based, replaceable |

---

## Workflow 1: Revenue (Lead → Client → Proposal → Agreement → Invoice → Transaction → Project)

### Dashboard

| ID | Requirement | Acceptance |
|----|-------------|------------|
| DASH-1 | Revenue widget shows current month income | Aggregated from paid invoices |
| DASH-2 | Active projects count shown | Count of in-progress projects |
| DASH-3 | Pending payments shown | List of overdue and sent invoices |
| DASH-4 | Tasks due today shown | From current projects |
| DASH-5 | Calendar shows upcoming meetings and deadlines | Integrated with Calendar module |
| DASH-6 | AI suggestions shown | From MCP-based AI agent |
| DASH-7 | Lead conversion rate shown | From Leads pipeline |
| DASH-8 | Business health score shown | Composite of multiple metrics |
| DASH-9 | Expenses shown | From Finance & Accounting expenses |
| DASH-10 | Profit shown | Revenue − Expenses |
| DASH-11 | Monthly income chart | Bar/line chart of monthly revenue |
| DASH-12 | Cash flow chart | Income vs expenses over time |
| DASH-13 | Tax estimate shown | Estimated tax based on income and tax config |

### Leads

| ID | Requirement | Acceptance |
|----|-------------|------------|
| LEAD-1 | Pipeline view with stages: New, Contacted, Qualified, Proposal Sent, Won, Lost | Drag-and-drop between stages |
| LEAD-2 | Create lead with: name, email, phone, source, notes | All fields stored in Sheets |
| LEAD-3 | Edit lead | Inline or modal editing |
| LEAD-4 | Add notes and activity log | Time-stamped, visible on lead profile |
| LEAD-5 | Set follow-up reminders | Calendar event or notification created |
| LEAD-6 | AI enrichment: suggest company info, social profiles | From MCP Agent |
| LEAD-7 | Convert Won lead to Client | Creates client record with history preserved |
| LEAD-8 | Archive Lost lead | Moved to archived, searchable |
| LEAD-9 | Duplicate detection | Warn when email/phone matches existing lead or client |

### Clients

| ID | Requirement | Acceptance |
|----|-------------|------------|
| CLI-1 | Client profile with: company, contacts, notes, tags | All fields stored in Sheets |
| CLI-2 | Client view shows related: projects, agreements, invoices, files, meetings, reviews | Linked records shown on profile |
| CLI-3 | Activity timeline shows all interactions | Chronological log of events |
| CLI-4 | Client portal access toggle | Enable/disable per client |
| CLI-5 | Client cannot be deleted if active projects exist | Soft-delete or block |
| CLI-6 | Document ID: CL-{YEAR}-{SEQ} | Auto-generated on creation |

### Agreements

| ID | Requirement | Acceptance |
|----|-------------|------------|
| AGR-1 | Agreement types: Proposal, Agreement, NDA, Statement of Work, Change Request, Maintenance Agreement, Retainer Agreement | Selected on creation |
| AGR-2 | TipTap editor for agreement content | Tables, variables, images, comments, slash commands |
| AGR-3 | Variables auto-populate from workspace context | {{client.name}}, {{project.name}}, {{user.name}}, etc. |
| AGR-4 | Draft → Sent → Signed lifecycle | State transitions tracked |
| AGR-5 | After signing: document is immutable | No edit — must create Version 2 |
| AGR-6 | Version history | Every save creates version, signed versions are frozen |
| AGR-7 | E-signature | Client signs via Client Portal or email link |
| AGR-8 | PDF export | Generates PDF with signature block |
| AGR-9 | AI-assisted generation | AI creates first draft based on prompt |
| AGR-10 | Document ID: AG-{YEAR}-{SEQ} | Auto-generated |

### Finance & Accounting

| ID | Requirement | Acceptance |
|----|-------------|------------|
| FIN-1 | Invoice states: Draft, Sent, Partially Paid, Paid, Overdue, Cancelled | State machine enforced |
| FIN-2 | Create invoice with line items, tax, currency | All fields in Sheets |
| FIN-3 | Editable while in Draft | Full edit |
| FIN-4 | After Sent: no edit, only Revision or Credit Note | State enforced |
| FIN-5 | After Paid: locked, cannot edit | Revision or Credit Note only |
| FIN-6 | Payment methods (metadata labels): Cash, Bank Transfer, UPI, Credit Card, Debit Card, PayPal, Wise, Stripe, Razorpay, Other | Labels only, no API |
| FIN-7 | Transaction record: Invoice ID, Client, Amount, Currency, Date, Method, Reference, Notes, Attachment, Status | Stored in Sheets, receipt in Drive |
| FIN-8 | Payment verification: Client marks "Payment Sent" → Uploads receipt → Freelancer approves → Invoice = Paid | Audit trail: who, when, what |
| FIN-9 | Receipt auto-generated on approval | PDF stored in Drive, linked to invoice |
| FIN-10 | Expense management with categories | Hosting, Domain, Software, Ads, Freelancer Costs, Equipment, Travel, Miscellaneous |
| FIN-11 | Multi-currency: original currency, original amount, base currency, exchange rate, converted amount | All stored per transaction |
| FIN-12 | Tax support: GST, VAT, Sales Tax, Custom | Configured per workspace |
| FIN-13 | Financial reports: Revenue, Outstanding, Overdue, Expenses, Profit, Tax Summary | Generated from Sheets data |
| FIN-14 | Revenue − Expenses = Profit | Formula auto-calculated |
| FIN-15 | Document IDs: INV-{YEAR}-{SEQ}, RC-{YEAR}-{SEQ}, EX-{YEAR}-{SEQ}, TR-{YEAR}-{SEQ} | Auto-generated |

### Projects

| ID | Requirement | Acceptance |
|----|-------------|------------|
| PROJ-1 | Project with: name, description, status, start/end date, client | Created from Agreement or standalone |
| PROJ-2 | Milestones with dates and completion % | Tracked in project view |
| PROJ-3 | Tasks with assignee, due date, status | CRUD within project |
| PROJ-4 | Files linked from Google Drive | Upload, preview |
| PROJ-5 | Meetings linked to calendar | Create meeting from project |
| PROJ-6 | Project timeline view | Gantt-like visualization |
| PROJ-7 | AI assistant for project | MCP Agent answers project questions |
| PROJ-8 | Document ID: PR-{YEAR}-{SEQ} | Auto-generated |

---

## Workflow 2: Delivery (Tasks → Meetings → Files → Calendar → Documents → Client Portal)

### Tasks

| ID | Requirement | Acceptance |
|----|-------------|------------|
| TASK-1 | Task CRUD within projects | Create, edit, complete, delete |
| TASK-2 | Task has: title, description, assignee, due date, priority, status | All fields |
| TASK-3 | Task status: To Do, In Progress, Done | State transitions |
| TASK-4 | Cannot create task in closed/completed project | Business rule enforced |
| TASK-5 | Task completion updates milestone progress | Auto-calculation |
| TASK-6 | Document ID: TK-{YEAR}-{SEQ} | Auto-generated |

### Meetings

| ID | Requirement | Acceptance |
|----|-------------|------------|
| MT-1 | Create meeting with: title, date, time, duration, attendees, agenda | All fields |
| MT-2 | Google Meet link generated | Via Calendar API |
| MT-3 | Meeting notes | TipTap editor |
| MT-4 | AI summary after meeting | MCP Agent summarizes |
| MT-5 | Action items extracted | From meeting notes via AI |
| MT-6 | Recording links stored | Manual entry |
| MT-7 | Document ID: MT-{YEAR}-{SEQ} | Auto-generated |

### Files

| ID | Requirement | Acceptance |
|----|-------------|------------|
| FILE-1 | Upload files to Google Drive | File stored in workspace Drive folder |
| FILE-2 | Files linked to project/client | Metadata in Sheets, file in Drive |
| FILE-3 | File preview for PDF, images, documents | In-browser preview |
| FILE-4 | Deletion retains version history | Drive version history |
| FILE-5 | File categories: Document, Image, Spreadsheet, Other | Select on upload |

### Calendar

| ID | Requirement | Acceptance |
|----|-------------|------------|
| CAL-1 | Google Calendar two-way sync | Events created in Solo Suite appear in Google Calendar and vice versa |
| CAL-2 | Task deadlines shown on calendar | From task due dates |
| CAL-3 | Meetings shown on calendar | From meetings module |
| CAL-4 | Create calendar event from meeting | Auto-sync |
| CAL-5 | Reminders for upcoming events | 15-minute default |

### Documents

| ID | Requirement | Acceptance |
|----|-------------|------------|
| DOC-1 | TipTap editor with full toolbar | Bold, italic, underline, strikethrough, headings, bullet lists, ordered lists |
| DOC-2 | Tables in documents | Add/edit/delete rows and columns |
| DOC-3 | Images in documents | Upload or paste |
| DOC-4 | Variables auto-populate | {{client.name}}, {{project.name}}, {{date}}, etc. |
| DOC-5 | Task lists in documents | Checkbox lists |
| DOC-6 | Comments on text selections | Threaded comments |
| DOC-7 | Slash commands | /table, /image, /heading, etc. |
| DOC-8 | Mentions | @mention users, clients, projects |
| DOC-9 | Underline, highlight, text alignment | Formatting options |
| DOC-10 | Code blocks | With syntax highlighting |
| DOC-11 | Version history | Every save creates version; browse and restore |
| DOC-12 | PDF export | Preserves formatting |
| DOC-13 | AI writing assistant | Prompt-based text generation |
| DOC-14 | Document ID: DC-{YEAR}-{SEQ} | Auto-generated |

### Client Portal

| ID | Requirement | Acceptance |
|----|-------------|------------|
| CP-1 | Client logs in with email + magic link or OAuth | No password required |
| CP-2 | Client sees their projects | Only their own |
| CP-3 | Client uploads files | Stored in Drive, linked to project |
| CP-4 | Client approves deliverables | Status updated, event published |
| CP-5 | Client signs agreements | E-signature embedded |
| CP-6 | Client views invoices | Download PDF |
| CP-7 | Client marks "Payment Sent" | Attaches receipt, provides reference |
| CP-8 | Client views payment history | Transactions visible |
| CP-9 | Client sends messages | Simple chat per project |
| CP-10 | Client CANNOT view internal notes | RBAC enforced |
| CP-11 | Client CANNOT view other clients | Workspace isolation |
| CP-12 | Client CANNOT access admin functions | RBAC enforced |

---

## Workflow 3: Growth (Retainer → Automation → Reports → Reviews → Agency Workspace)

### Retainers

| ID | Requirement | Acceptance |
|----|-------------|------------|
| RET-1 | Create retainer with: client, amount, frequency (weekly/biweekly/monthly), description | All fields |
| RET-2 | Auto-generate recurring invoices | Based on frequency schedule |
| RET-3 | Auto-reminders for upcoming invoices | Notification + email |
| RET-4 | Pause retainer | Stops future invoice generation |
| RET-5 | Cancel retainer | Stops permanently, archives |
| RET-6 | Recurring reports | Monthly summary auto-generated |

### Automation

| ID | Requirement | Acceptance |
|----|-------------|------------|
| AUTO-1 | Visual rule builder | Trigger → Condition → Action |
| AUTO-2 | Triggers from Business Events | invoice.paid, agreement.signed, lead.converted, etc. |
| AUTO-3 | Conditions: field equals, greater than, contains, etc. | Evaluated against event payload |
| AUTO-4 | Actions: update record, send notification, create task, generate document, call webhook | Executed via MCP tools |
| AUTO-5 | Example: Invoice Paid → Move Project Stage → Notify Client → Generate Receipt | Complete working flow |
| AUTO-6 | Automation rules stored in Sheets | Persisted, versioned |

### Reports

| ID | Requirement | Acceptance |
|----|-------------|------------|
| REP-1 | Revenue report | By month, quarter, year; with filters |
| REP-2 | Outstanding invoices report | Aging report |
| REP-3 | Overdue payments report | By client, amount, days overdue |
| REP-4 | Expenses report | By category, month, year |
| REP-5 | Profit report | Revenue − Expenses |
| REP-6 | Tax summary | By tax type, period |
| REP-7 | Pipeline report | Lead conversion funnel |
| REP-8 | Project health report | By status, completion % |
| REP-9 | All reports exportable to CSV and PDF | Export button |

### Reviews

| ID | Requirement | Acceptance |
|----|-------------|------------|
| REV-1 | Public review page | Unique URL per workspace |
| REV-2 | Collect reviews from clients | Email request, link |
| REV-3 | Display testimonials | On review page |
| REV-4 | Portfolio showcase | Featured projects |
| REV-5 | Review moderation | Approve/reject before public |
| REV-6 | Document ID: RV-{YEAR}-{SEQ} | Auto-generated |

### Workspace (Agency Mode)

| ID | Requirement | Acceptance |
|----|-------------|------------|
| WS-1 | Solo mode: single user | Default |
| WS-2 | Agency mode: multiple members | Toggle in settings |
| WS-3 | Members CRUD | Invite, manage roles, remove |
| WS-4 | Roles: Owner, Admin, Member, Client | Permissions per role |
| WS-5 | Capacity tracking | Member count, projects per member |
| WS-6 | Activity feed | All workspace events |
| WS-7 | Switch between solo and agency | Preserves data |

---

## Standards

- All user-facing text uses business terminology (Lead, Client, Agreement, Transaction)
- Every page has empty, loading, error, and success states
- Every form validates before submit
- Every destructive action confirms before executing
- All dates respect workspace timezone
- All currencies respect workspace base currency

---

## Templates

User stories follow the format:

> **As a** [user type]  
> **I want** [feature]  
> **So that** [benefit]  

---

## Cross-References

- Architecture: `05_System_Architecture_ARD.md`
- Design: `04_UX_Design_System_UXD.md`
- Domain Model: `06_Domain_Model_DDD.md`
- Technical Requirements: `07_Technical_Requirements_TRD.md`
- Security: `14_Security.md`
- Testing: `15_Testing_Quality.md`

---

## Future Enhancements

- Payment gateway plugin (Stripe, Razorpay, PayPal)
- Real-time document collaboration
- Excel/Notion/Trello/ClickUp import
- Native mobile apps
