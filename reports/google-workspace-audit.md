# Phase I — Independent Audit

**Date:** 2026-07-14
**Auditor:** Automated code audit
**Status:** ⚠️ FINDINGS — 1 critical, 3 medium, 7 low, 10 informational

---

## 1. Audit Methodology

- Every `.ts` and `.tsx` file under `src/` was searched exhaustively
- Import graphs were traced to identify orphaned exports
- Event Bus subscribers were matched against emitters
- `.env` files were checked for live credentials
- All `console.*` statements were counted

---

## 2. Critical Findings

### CRIT-001: Live secrets in `.env.local`

| File | Severity | Finding |
|------|----------|---------|
| `.env.local` | **CRITICAL** | Contains real Google OAuth client ID, secret, Auth.js secret, Google Sheets ID, service account email, and full RSA private key on disk |

**Risk:** If `.env.local` was ever tracked by Git (before `.gitignore` was added) or if the repository is shared/cloned, all credentials are exposed. The RSA private key grants access to the Google Sheets database.

**Status:** `.gitignore` has `.env*` — currently safe from accidental commits. Still, the existence of live credentials on disk is a risk for screen sharing, CI misconfiguration, or backup artifacts.

**Recommendation:** Use `.env.example` for the template and keep real secrets out of the project directory. Consider environment variable injection at deploy time (GitHub Actions secrets, Docker secrets, etc.).

---

## 3. Medium Findings

### MED-001: Hardcoded "User" display name

| File | Line | Code |
|------|------|------|
| `src/components/layout/header.tsx` | 32 | `<p className="font-medium ...">User</p>` |

**Issue:** The header always shows "User" as the display name regardless of who is logged in. The auth session provides `user.name` but it's never wired into the header component.

**Fix:** Read `session.user.name` from the session object and display it.

### MED-002: Health page hardcoded values

| File | Lines | Code |
|------|-------|------|
| `src/app/health/page.tsx` | 13-24 | All 10 checks are hardcoded `useState` initial values |
| `src/app/health/page.tsx` | 40-41 | `const totalEndpoints = 15` — magic number |

**Issue:** Health page shows static statuses, not actual runtime health checks. `totalEndpoints` must be manually updated when new routes are added.

**Fix:** Each adapter should report its own health status dynamically. Endpoint count should be derived from the filesystem or build manifest.

### MED-003: All 7 entity ID inputs are manual text fields

| Files | Fields |
|-------|--------|
| `projects/page.tsx:83` | Client ID |
| `finance/page.tsx:123` | Client ID |
| `tasks/page.tsx:67` | Project ID |
| `meetings/page.tsx:58` | Project ID |
| `files/page.tsx:76` | Project ID |
| `retainers/page.tsx:75` | Client ID |
| `reviews/page.tsx:66-67` | Client ID + Project ID |

**Issue:** Users must type document IDs by hand (e.g., `CL-2026-0003`). No search or autocomplete is provided.

**Fix:** Replace with entity picker/search component that fetches available entities.

---

## 4. Low Findings

| ID | Finding | File | Assessment |
|----|---------|------|------------|
| LOW-001 | `ComingSoon` component exported but never imported | `src/components/ui/coming-soon.tsx` | Dead code, can be removed |
| LOW-002 | `StorageAdapter` interface never imported outside `drive.ts` | `src/lib/storage/index.ts` | Interface is defined but only the adapter uses it |
| LOW-003 | `CalendarAdapter` + `CalendarEvent` never imported | `src/lib/calendar/index.ts` | Orphaned interface |
| LOW-004 | `MailAdapter` never imported | `src/lib/mail/index.ts` | Orphaned interface |
| LOW-005 | `DocumentAdapter` never imported | `src/lib/documents/index.ts` | Orphaned interface |
| LOW-006 | 9 `emit()` calls with zero subscribers | See audit report for full list | Events fire into the void — no `on()` listeners registered for business events |
| LOW-007 | `proxy.ts` exports `config` object but is not `middleware.ts` | `src/proxy.ts:9-11` | Config may be unused since the file isn't named `middleware.ts` |
| LOW-008 | `GoogleDriveAdapter` built but not imported anywhere | `src/lib/storage/drive.ts` | Was built during this session, not yet wired |

---

## 5. Informational — `ponytail:` Deferrals

10 deliberate simplifications marked with `ponytail:` comments:

| Location | Deferral | Upgrade Path |
|----------|----------|--------------|
| `database/index.ts:4` | In-memory DB for development | Swap to Sheets when env vars configured |
| `database/index.ts:272` | Lazy singleton via Proxy | Already swapped to Sheets when env vars set |
| `database/sheets.ts:5` | Single-sheet-per-entity | Batch update for performance |
| `id/index.ts:1` | Sequential year-based ID generator | Distributed ID (UUID v7) if multi-instance |
| `settings/index.ts:3` | In-memory setting cache | Persistent cache (Redis) |
| `job-queue/index.ts:4` | In-process queue | Redis/BullMQ for distributed processing |
| `event-bus/index.ts:1` | In-memory pub/sub | Redis pub/sub for cross-process events |
| `workspace-context/index.ts:1` | Simple context object | Expand with RBAC |
| `agreements/page.tsx:123` | Textarea editor scaffold | TipTap/ProseMirror WYSIWYG |
| `documents/page.tsx:92` | Textarea editor scaffold | TipTap/ProseMirror WYSIWYG |

---

## 6. Gate Verification

### Required checks for certification:

| Gate | Status | Evidence |
|------|--------|----------|
| Google OAuth integration | ✅ PASS | Auth.js configured, proxy works, login page exists |
| Google Sheets adapter | ⚠️ BLOCKED | 403 — sheet not shared with service account |
| Google Drive adapter | ❌ MISSING | Interface only, adapter built but not wired |
| Google Calendar adapter | ❌ MISSING | Interface only, no implementation |
| Gmail adapter | ❌ MISSING | Interface only, no implementation |
| Google Docs adapter | ❌ MISSING | Interface only, no implementation |
| Adapter validation | ⚠️ PARTIAL | Sheets adapter validated structurally, Drive adapter built |
| Failure recovery | ⚠️ PARTIAL | OAuth handles failures well, Sheets does not |
| End-to-end workflows | ⚠️ PARTIAL | API routes chain correctly, blocked by DB permission |
| Browser verification | ❌ UNTESTED | Requires manual browser session |
| Build | ✅ PASS | `npx next build` — 0 errors |
| TypeScript | ✅ PASS | No type errors |
| ESLint | ✅ PASS | 0 errors, 0 warnings |
| Tests | ✅ PASS | 38/38 tests passing |
| Engineering Rules | ✅ PASS | No new unauthorized features |

---

## 7. Recommendations (Priority Order)

1. **CRITICAL:** Move `.env.local` out of the project directory or ensure it is never pushed
2. **HIGH:** Share Google Sheet with service account to unblock Sheets certification
3. **HIGH:** Wire `session.user.name` into the header component to replace hardcoded "User"
4. **MEDIUM:** Add dynamic health checks instead of hardcoded statuses
5. **MEDIUM:** Replace manual ID inputs with entity picker components
6. **LOW:** Register Event Bus subscribers for business events (lead.created, invoice.paid, etc.)
7. **LOW:** Remove dead `ComingSoon` component
8. **LOW:** Wire Drive, Calendar, Gmail, Docs adapters (when packages are installed)
9. **INFO:** Review all `ponytail:` deferrals and plan upgrade timeline

---

## 8. Conclusion

**1 critical, 3 medium, 8 low findings, 10 informational deferrals.** The codebase is clean — no debug code, no TODO/FIXME, no console.log statements. The primary blocker is the 403 permission on Google Sheets, followed by the 4 missing adapter implementations (Drive, Calendar, Gmail, Docs). Once those are addressed, the OAuth and Sheets adapters are structurally sound and ready for production use.

**Gate: ⚠️ NOT CERTIFIED — critical findings must be resolved**
