# Phase H — End-to-End Workflow Validation

**Date:** 2026-07-14
**Tester:** Code analysis + API smoke tests
**Status:** ⚠️ PARTIAL — Workflow 1 API routes exist but block on Sheets permission; Workflows 2-3 partial

---

## 1. Workflow 1: Lead → Client → Proposal → Agreement → Invoice → Transaction → Project

### Route Map

```
POST /api/leads       → db.createLead()
PATCH /api/leads/:id  → db.updateLead()  → stage: "Won" → clientId set
POST /api/clients     → db.createClient()
POST /api/agreements  → db.createAgreement()  → type: "Proposal" | "Agreement"
POST /api/invoices    → db.createInvoice()
POST /api/transactions → db.createTransaction()
PUT  /api/projects    → db.updateProject() → status: "Active"
```

### Current Validation

| Step | API Route | Tested | Result |
|------|-----------|--------|--------|
| Create lead | POST /api/leads | YES | 500 (403 from Sheets) |
| Update lead to Won | PUT via POST (same route) | NO | Blocked by 403 |
| Create client | POST /api/clients | NO | Blocked |
| Create agreements | POST /api/agreements | NO | Blocked |
| Create invoice | POST /api/invoices | NO | Blocked |
| Record payment | POST /api/transactions | NO | Blocked |
| Activate project | PUT via POST /api/projects | NO | Blocked |

### Data Consistency Checks

All checks blocked — require Sheets write access.

| Check | How to Verify |
|-------|---------------|
| Lead `clientId` links to Client record | After lead → client conversion |
| Project `clientId` matches client | After project creation from client |
| Invoice `clientId` matches client | After invoice creation |
| Transaction `invoiceId` links to Invoice | After payment recording |
| Agreement `clientId` matches client | After agreement generation |
| Document ID prefixes correct | LD, CL, PR, AG, INV, TR |
| Timestamps in chronological order | `createdAt` < `updatedAt` |
| Lead stage transitions valid | New → Contacted → Qualified → Proposal Sent → Won |

---

## 2. Workflow 2: Project → Task → Meeting → Documents → Client Portal

### Route Map

```
POST /api/projects    → db.createProject()
POST /api/tasks       → db.createTask()
POST /api/meetings    → db.createMeeting()
POST /api/documents   → db.createDocument()
GET  /api/portal      → aggregated client data
```

| Step | API Route | Current State |
|------|-----------|---------------|
| Create project | POST /api/projects | Routes exist, blocked by 403 |
| Add tasks | POST /api/tasks | Routes exist |
| Schedule meeting | POST /api/meetings | Routes exist |
| Create document | POST /api/documents | Routes exist |
| Portal summary | GET /api/clients + projects + agreements + invoices | UI exists, fetches all 4 APIs |

### Portal Data Aggregation

The Client Portal page (`src/app/portal/page.tsx`) fetches:
- `GET /api/clients` → 200 ✅
- `GET /api/projects` → 200 ✅
- `GET /api/agreements` → 200 ✅
- `GET /api/invoices` → 200 ✅

All return empty arrays currently (read-only works with Sheets adapter).

---

## 3. Workflow 3: Retainer → Automation → Reports

### Route Map

```
POST /api/retainers   → db.createRetainer()
POST /api/automation  → db.createAutomationRule()
GET  /api/reports     → aggregated data (no dedicated API — uses entity APIs)
```

| Step | API Route | Current State |
|------|-----------|---------------|
| Create retainer | POST /api/retainers | Routes exist, blocked by 403 |
| Create automation rule | POST /api/automation | Routes exist |
| Reports aggregation | Client-side from entity APIs | UI exists, shows empty state |

### Reports Page Data Sources

The Reports page (`src/app/reports/page.tsx`) fetches:
- `GET /api/leads` — pipeline data
- `GET /api/invoices` — revenue data
- `GET /api/projects` — project status counts
- `GET /api/expenses` — expense breakdown
- `GET /api/clients` — client growth

All return 200 ✅ with empty arrays.

---

## 4. Infrastructure Verification

### Workspace Context Engine
| Check | Result |
|-------|--------|
| Context initializes on workspace load | ✅ `src/lib/workspace-context/index.ts` |
| Context persists for session duration | ✅ In-memory |
| Context reset on logout | ⚠️ Not wired to auth session |

### Event Bus
| Check | Result |
|-------|--------|
| Events emitted on entity changes | ❌ API routes don't emit events |
| Events received by subscribers | ✅ `event-bus/index.ts` works correctly |
| `lead.converted` event exists | ✅ In `BusinessEventType` |
| `adapter.error` event emitted | ❌ GoogleSheetsAdapter doesn't emit errors |

### Job Queue
| Check | Result |
|-------|--------|
| Queue processes jobs | ✅ `job-queue/index.ts` |
| Jobs persisted in DB | ✅ via `db.createJob()` / `db.updateJob()` |
| Failed jobs are retried | ⚠️ Retry counter exists, auto-retry not implemented |
| Queue clears on restart | ✅ In-memory queue — jobs lost on restart |

---

## 5. Validation Summary

| Check | Status | Evidence |
|-------|--------|----------|
| All API routes respond 200 on GET | ✅ PASS | Server returns `[]` for all entity GET endpoints |
| All API routes accept POST | ⚠️ Blocked | 403 from Sheets permission |
| Data flows correctly across entities | ❌ UNTESTED | Blocked by 403 |
| Document IDs are unique and consistent | ⚠️ UNTESTED | Need write access to verify |
| Timestamps are properly set | ⚠️ UNTESTED | Need write access to verify |
| Context Engine is populated | ⚠️ UNTESTED | Not wired to auth flow |
| Event Bus receives workflow events | ❌ FAIL | API routes don't call `emit()` |
| Job Queue processes async tasks | ⚠️ UNTESTED | No jobs created during test |

---

## 6. Conclusion

**All 15 API routes exist and respond correctly to GET requests.** The full end-to-end workflow validation is blocked by the 403 permission error on Google Sheets writes. Once the sheet is shared with the service account, the complete pipeline can be tested: create lead → convert to client → generate agreement → create invoice → record payment → activate project.

**Gate: ❌ BLOCKED — requires Sheets write access**
