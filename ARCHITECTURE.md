# Solo Suite — Architecture Guide

A business management platform for solo professionals. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── (auth)/             # Authentication pages (login)
│   ├── (dashboard)/        # Main app pages (leads, clients, tasks, etc.)
│   ├── api/                # REST API endpoints (one file per resource)
│   ├── layout.tsx          # Root layout (providers, fonts, sidebar)
│   └── page.tsx            # Root redirect → /dashboard
│
├── components/             # Reusable UI components
│   ├── ui/                 # Primitives: Button, Card, Modal, Input, etc.
│   ├── layout/             # Shell: Sidebar, Header, ThemeProvider
│   └── index.ts            # Barrel export — import from '@/components'
│
├── hooks/                  # Shared React hooks
│   └── index.ts            # useFetch, useCrud, useSearch, useDebounce, useConfirm
│
├── lib/                    # Core business logic and utilities
│   ├── database/           # In-memory DB + Google Sheets adapter
│   ├── api/                # Zod validation schemas + helpers
│   ├── auth/               # NextAuth.js config (Google OAuth)
│   ├── authorization/      # Role-based permissions
│   ├── storage/            # File storage adapters (local, Google Drive)
│   ├── event-bus/          # Typed pub/sub event system
│   ├── job-queue/          # In-process background jobs with retry
│   ├── workflow-engine/    # Event-driven automation rules
│   ├── mcp/                # Model Context Protocol (external tools)
│   ├── mail/               # Email adapter (Gmail stub)
│   ├── workspace-context/  # AsyncLocalStorage for request scoping
│   ├── feature-flags/      # Feature flag definitions
│   ├── id/                 # ID generator (PREFIX-YYYY-NNNN)
│   ├── settings/           # Settings cache
│   ├── calendar/           # Calendar adapter interface
│   ├── documents/          # Document adapter interface
│   ├── navigation.ts       # Sidebar navigation structure
│   ├── fetch-helper.ts     # Typed fetch wrappers (apiGet, apiPost, apiPut)
│   └── index.ts            # Barrel export — import from '@/lib'
│
├── config/                 # App configuration
│   └── index.ts            # Navigation + feature flags
│
├── types/                  # Shared TypeScript types
│   ├── navigation.ts       # NavItem, NavSection
│   └── index.ts            # Barrel export — import from '@/types'
│
└── proxy.ts                # Next.js middleware (auth guard)
```

## Architecture Principles

### 1. Data Flow

```
Page Component → useFetch/useCrud hook → /api/* route → withAuth → Zod validation → Database → Response
```

- **Pages** are `'use client'` components that use hooks for data fetching
- **API routes** validate input with Zod before touching the database
- **All routes** are protected by `withAuth()` which sets workspace context
- **Database** is an in-memory Map (dev) or Google Sheets (production)

### 2. Component Hierarchy

```
RootLayout
├── SessionProvider (NextAuth)
│   └── AppShell
│       ├── Sidebar (navigation)
│       ├── Header (search, user menu)
│       └── Page Content (children)
```

### 3. Barrel Exports

Every module directory has an `index.ts` that re-exports its public API:

```ts
// Import from barrel — clean, single path
import { db, useFetch, Button } from '@/lib'

// Not from individual files
import { db } from '@/lib/database'
```

### 4. Hooks Pattern

All pages follow the same data-fetching pattern:

```tsx
'use client'
import { useCrud } from '@/hooks'

export default function LeadsPage() {
  const { data: leads, loading, create, update } = useCrud<LeadRecord>('/api/leads')

  if (loading) return <Skeleton />
  return <div>{leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}</div>
}
```

### 5. API Route Pattern

Every POST/PUT route follows the same validation pattern:

```ts
import { parseJsonBody, validateBody, leadCreateSchema } from '@/lib'

export async function POST(request: Request) {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error: validationError } = validateBody(leadCreateSchema, body)
  if (validationError) return validationError

  const lead = await db.createLead(data)
  return Response.json(lead)
}
```

## Database

### In-Memory (Default)

All data lives in JavaScript Maps. Lost on server restart. Fine for development.

### Google Sheets (Production)

Set these env vars to switch to Google Sheets:

```
SHEET_ID=your-sheet-id
GOOGLE_SERVICE_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

Each entity gets its own sheet tab. Row 1 = headers, row 2+ = data.

### Schema

16 entity types: Lead, Client, Project, Agreement, Invoice, Transaction, Expense, Task, Meeting, File, Document, Retainer, AutomationRule, Review, Job, Settings.

All records auto-generate IDs with the pattern `PREFIX-YYYY-NNNN` (e.g., `LD-2026-0001`).

See `src/lib/database/types.ts` for the full schema.

## Authentication & Authorization

- **Provider**: Google OAuth via NextAuth.js v5
- **Config**: `src/lib/auth/config.ts`
- **Guard**: `src/proxy.ts` — protects all routes except `/login` and `/api/auth`
- **Session**: Available via `useSession()` (client) or `auth()` (server)
- **Authorization**: Role-based (owner, admin, member, client) via `src/lib/authorization/index.ts`
- **Workspace context**: Every request is scoped to a workspace via `AsyncLocalStorage` (`src/lib/workspace-context/index.ts`)
- **API auth**: All API routes use `withAuth()` wrapper from `src/lib/api/with-auth.ts`

### Permissions

Roles map to permissions defined in `src/lib/authorization/index.ts`:

| Role | Permissions |
|------|-------------|
| Owner | All permissions |
| Admin | All permissions except workspace.destruct |
| Member | Read + limited write (leads, clients, projects, tasks, meetings, documents) |
| Client | Read-only for portal-accessible resources |

## MCP (Model Context Protocol)

External tool interface at `POST /api/mcp` (JSON-RPC). Tools require permissions and emit audit logs.

```ts
// Registered tools: search_crm, create_task, update_status, create_invoice,
// send_email, list_calendar, manage_contract, get_client_portal,
// analyze_financials, generate_report, create_lead, send_proposal
```

Tools are defined in `src/lib/mcp/tools.ts` and registered via `src/lib/mcp/index.ts`.

## Workflow Engine

Event-driven automation rules (`src/lib/workflow-engine/index.ts`):

```ts
// Rules: trigger (event pattern) → condition (optional) → action
// Executions are persisted as WorkflowExecutionRecord
// Actions: create_task, update_status, send_notification
```

Rules stored in database as `AutomationRuleRecord`. Workflow engine listens to event bus and executes matching rules.

## Client Portal

Two endpoints for external client access:
- `POST /api/portal/login` — validates email + clientId, returns scoped client data
- Portal pages use app's existing auth, scoped by clientId

## Email Integration

- **Outbound**: `src/lib/mail/gmail.ts` — Gmail adapter (requires `GMAIL_API_KEY` env var)
- **Inbound**: `POST /api/webhooks/email` — receives inbound emails, matches to clients or creates leads
- **Event listeners**: `src/lib/event-bus/listeners.ts` — sends emails on `lead.created` and `agreement.sent`

## Feature Flags

Defined in `src/lib/feature-flags/index.ts`:

| Flag | Default | Description |
|------|---------|-------------|
| `ai` | beta | AI-powered features |
| `reviews` | disabled | Client review collection |
| `clientPortal` | beta | Client-facing portal |
| `documents` | enabled | Document management |
| `automation` | enabled | Automation rules |
| `backup` | enabled | Data backup/export |
| `reports` | enabled | Reporting dashboard |

## Event System

Typed pub/sub bus for decoupled side effects. Events flow through `src/lib/event-bus/index.ts`.

```ts
import { on, emit } from '@/lib'

on('lead.created', (event) => {
  console.log('New lead:', event.data.name)
})

await emit('lead.created', { name: 'Acme Corp' }, 'leads-page')
```

**Business events**: `lead.created`, `lead.converted`, `lead.lost`, `client.created`, `agreement.sent`, `agreement.signed`, `invoice.sent`, `invoice.paid`, `expense.recorded`, `project.created`, `project.completed`, `review.submitted`

**System events**: `system.backup`, `system.export`

Event payloads are typed via `EventPayloadMap` in `src/lib/event-bus/types.ts`. Listeners in `src/lib/event-bus/listeners.ts` trigger side effects (e.g., email on `lead.created`).

## Job Queue

In-process background job processing with retry/backoff (`src/lib/job-queue/index.ts`):

```ts
import { enqueue, registerJobHandler } from '@/lib'

registerJobHandler('send-email', async (payload) => {
  // send email...
})

await enqueue('send-email', { to: 'client@example.com', subject: 'Invoice' })
```

Max 3 retries with exponential backoff. Jobs persist in the database but are lost on server restart. Replace with Redis/BullMQ for production reliability.

## Deployment

### Docker

```bash
docker compose up
```

### Fly.io

```bash
fly deploy
```

### Vercel

Push to GitHub — auto-deploys via Vercel integration.

## Development Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm test             # Vitest unit tests (60 tests)
npx playwright test  # Playwright E2E tests
```

## Adding a New Feature

1. **Add the page**: Create `src/app/(dashboard)/your-page/page.tsx`
2. **Add the API route**: Create `src/app/api/your-resource/route.ts`
3. **Add validation**: Add Zod schema to `src/lib/api/schemas.ts`
4. **Add to navigation**: Update `src/lib/navigation.ts`
5. **Use the hooks**: Import `useCrud` from `@/hooks` in your page

## File Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **API routes**: `route.ts` (Next.js convention)
- **Components**: `kebab-case.tsx` (e.g., `metric-card.tsx`)
- **Lib modules**: `kebab-case/index.ts` (e.g., `database/index.ts`)
- **Hooks**: `kebab-case.ts` (e.g., `use-api.ts`)
- **Types**: `kebab-case.ts` (e.g., `navigation.ts`)