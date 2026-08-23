# Solo Suite

A business management platform for solo professionals — leads, clients, projects, invoicing, agreements, and automation in one app.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

Login requires a Google OAuth app. Copy `.env.example` → `.env.local` and fill in credentials:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...        # openssl rand -base64 32
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm test` | Vitest unit tests (60 tests) |
| `npx playwright test` | E2E tests |
| `npm run lint` | ESLint |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design, data flow, and patterns.

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · NextAuth v5 · Zod · Vitest

## Deployment

**Vercel** — push to GitHub, auto-deploys.  
**Docker** — `docker compose up`.  
**Fly.io** — `fly deploy`.
