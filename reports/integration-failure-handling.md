# Phase G — Integration Failure Testing

**Date:** 2026-07-14
**Tester:** Code analysis + forced error simulation
**Status:** ⚠️ PARTIAL — error handling exists but varies by adapter

---

## 1. Error Handling Coverage by Component

### Google Sheets Adapter (`src/lib/database/sheets.ts`)

| Failure Scenario | Current Behavior | Assessment |
|-----------------|-----------------|------------|
| Missing sheet tab | `ensureSheet()` creates it automatically | ✅ Good |
| Sheet ID invalid | `googleapis` throws 404 → unhandled in adapter → API route returns 500 | ⚠️ Needs `try/catch` in adapter |
| Permission denied (403) | `googleapis` throws 403 → unhandled → API route 500 | ⚠️ No user-friendly message |
| Rate limit (429) | `googleapis` built-in retry (exponential backoff) | ✅ Good |
| Network timeout | `googleapis` throws `GaxiosError` → 500 | ⚠️ No retry in adapter |

Evidence from server logs:
```
POST /api/leads → 500
Error: PERMISSION_DENIED: The caller does not have permission
  at GoogleSheetsAdapter.ensureSheet (sheets.ts)
```

### Google OAuth (`src/lib/auth/config.ts`)

| Failure Scenario | Current Behavior | Assessment |
|-----------------|-----------------|------------|
| Invalid client ID | Auth.js redirects to error page | ✅ Good |
| Invalid client secret | Auth.js redirects to error page | ✅ Good |
| User denies consent | Auth.js redirects to error page | ✅ Good |
| Token expired | Auth.js auto-refreshes | ✅ Good |
| Revoked permissions | Auth.js redirects to login with error | ✅ Good |
| Network error during auth | Auth.js shows error page | ✅ Good |

Auth.js provides built-in error handling for all OAuth failure modes.

### Missing Adapters (Drive, Calendar, Gmail, Docs)

No error handling exists because no implementations exist.

### Event Bus (`src/lib/event-bus/index.ts`)

| Failure Scenario | Current Behavior | Assessment |
|-----------------|-----------------|------------|
| Adapter error | `emit('adapter.error', { service, error })` | ✅ Good — standardized error channel |
| Job failure | `emit('job.failed', { jobId, error })` | ✅ Good |
| No listeners | `emit()` silently returns | ✅ Good |

### Job Queue (`src/lib/job-queue/index.ts`)

| Failure Scenario | Current Behavior | Assessment |
|-----------------|-----------------|------------|
| Job processing fails | Status → `Failed`, retries incremented | ✅ Good |
| No handler registered | Warning logged, job stays `Queued` | ⚠️ Should emit event |
| Concurrent job processing | Single-threaded, serial processing | ⚠️ Blocks on long jobs |

### Database Layer (`src/lib/database/index.ts`)

| Failure Scenario | Current Behavior | Assessment |
|-----------------|-----------------|------------|
| Sheet adapter init fails | Proxy.get() throws at first call | ⚠️ No graceful fallback to InMemory |
| All env vars set but auth fails | Error propagates to caller | ⚠️ No user-friendly message |

---

## 2. Graceful Degradation Analysis

| Service | Degraded Behavior | User Experience |
|---------|------------------|-----------------|
| Sheets DB | No data persistence — in-memory fallback available | ⚠️ Fallback only when env vars not set |
| Drive | No file upload/download possible | ❌ No fallback |
| Calendar | No meeting creation | ❌ No fallback |
| Gmail | No email sending | ❌ No fallback |
| Docs | No document generation | ❌ No fallback |

### Health Page Status

The `/health` page accurately reports all adapters as "degraded":
- `Google Sheets: degraded — SHEET_ID not configured` ⚠️ should check actual connectivity
- `Google Drive: degraded — Google Drive not configured` ✅ accurate
- `Google Calendar: degraded — Google Calendar not configured` ✅ accurate
- `Storage Adapter: degraded — Google Drive not configured` ✅ accurate
- `Mail Adapter: degraded — Gmail not configured` ✅ accurate

---

## 3. Retry Logic Summary

| Component | Retry Strategy | Max Retries |
|-----------|---------------|-------------|
| Google Sheets (googleapis) | Exponential backoff (built-in) | 3 (default) |
| Google OAuth (Auth.js) | N/A — user-facing redirect | 0 |
| Job Queue | Manual retry via `retries` field | Configurable |
| Sheets adapter | None | 0 |

---

## 4. Gap Analysis

### Critical Gaps

| ID | Severity | Issue |
|----|----------|-------|
| FAIL-001 | HIGH | No fallback from Sheets adapter to InMemory — if Sheets fails, app breaks |
| FAIL-002 | HIGH | No user-friendly error messages from Sheets adapter — 500s propagate to client |
| FAIL-003 | MEDIUM | No retry logic in Sheets adapter for transient failures |
| FAIL-004 | MEDIUM | Missing adapters have no error handling (obviously — they don't exist) |

### Recommendations

1. **`getOrCreateDb()` should catch auth errors** and fall back to InMemory with a warning
2. **API route handlers should catch DB errors** and return structured JSON errors (not 500)
3. **Health page should do actual connectivity checks** — not just report configured/not configured
4. **Job queue should retry failed jobs** with exponential backoff

---

## 5. Forced Failure Test Results

### Test: Start server without Google API credentials

```
Remove SHEET_ID, GOOGLE_SERVICE_EMAIL, GOOGLE_PRIVATE_KEY from .env.local
→ Expected: InMemoryDatabase used
→ Actual: InMemoryDatabase used (works correctly)
→ Result: ✅ PASS — graceful fallback to dev mode
```

### Test: POST to API with invalid data

```
POST /api/leads with body: {}
→ Expected: 400 with validation error
→ Actual: Not tested — blocked by 403 permission error
→ Result: ⚠️ UNTESTED
```

---

## 6. Conclusion

**Error handling for OAuth is solid (Auth.js built-in).** Error handling for Sheets is minimal (depends on `googleapis` built-in retry for rate limits, but no retry for other failures). Missing adapters have no error handling by definition. The Event Bus is well-structured for adapter error propagation, but the Sheets adapter doesn't emit events on failure.

**Gate: ⚠️ PARTIAL — Sheets error handling needs retry + event emission; missing adapter failures TBD**
