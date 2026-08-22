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
│   ├── storage/            # File storage adapters (local, Google Drive)
│   ├── event-bus/          # Pub/sub event system
│   ├── job-queue/          # In-process background jobs
│   ├── workspace-context/  # AsyncLocalStorage for request scoping
│   ├── feature-flags/      # Feature flag definitions
│   ├── id/                 # ID generator (PREFIX-YYYY-NNNN)
│   ├── settings/           # Settings cache
│   ├── calendar/           # Calendar adapter interface
│   ├── mail/               # Mail adapter interface
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
Page Component → useFetch/useCrud hook → /api/* route → Zod validation → Database → Response
```

- **Pages** are `'use client'` components that use hooks for data fetching
- **API routes** validate input with Zod before touching the database
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

## Authentication

- **Provider**: Google OAuth via NextAuth.js v5
- **Config**: `src/lib/auth/config.ts`
- **Guard**: `src/proxy.ts` — protects all routes except `/login` and `/api/auth`
- **Session**: Available via `useSession()` (client) or `auth()` (server)

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

Pub/sub bus for decoupled side effects:

```ts
import { on, emit } from '@/lib'

on('lead.created', (event) => {
  console.log('New lead:', event.data.name)
})

await emit('lead.created', { name: 'Acme Corp' }, 'leads-page')
```

Events: `lead.created`, `lead.converted`, `client.created`, `agreement.sent`, `agreement.signed`, `invoice.sent`, `invoice.paid`, `expense.recorded`, `project.completed`, `job.failed`.

## Job Queue

In-process background job processing:

```ts
import { enqueue, registerJobHandler } from '@/lib'

registerJobHandler('send-email', async (payload) => {
  // send email...
})

await enqueue('send-email', { to: 'client@example.com', subject: 'Invoice' })
```

Jobs persist in the database but are lost on server restart. Replace with Redis/BullMQ for production reliability.

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
npm test             # Vitest unit tests
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