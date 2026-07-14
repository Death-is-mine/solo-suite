# 20 — Coding Standards

> The coding constitution for Solo Suite. Every contributor follows these rules.

---

## TypeScript Rules

- Strict mode enabled in tsconfig.json
- No `any` — use `unknown` and narrow with type guards
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and utility types
- All function parameters and return values typed
- No `@ts-ignore` or `@ts-expect-error` without documented reason
- Use `const` for imports and immutable values

## React Rules

- Server components by default (Next.js App Router)
- Client components only when interactivity is needed — suffix with `'use client'`
- Use React 19 hooks: `use`, `useActionState`, `useFormStatus`, `useOptimistic`
- Avoid `useEffect` for data fetching — use server components or React Query
- Avoid prop drilling — prefer Server Components composition or Workspace Context
- Components are PascalCase; files are kebab-case

## Next.js Conventions

- App Router for all pages
- Route handlers for API (not pages router API routes)
- Use `generateMetadata` for dynamic page titles
- Use `generateStaticParams` where pages are known at build time
- Loading states via `loading.tsx`
- Error boundaries via `error.tsx`
- Not found via `not-found.tsx`

## Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Files | kebab-case | `lead-pipeline.tsx` |
| Components | PascalCase | `LeadPipeline` |
| Functions | camelCase | `convertLead()` |
| Interfaces | PascalCase prefixed with I | `ILeadRepository` |
| Types | PascalCase | `LeadStage` |
| Constants | UPPER_SNAKE | `MAX_STAGES` |
| Adapters | PascalCase suffixed with Adapter | `GoogleSheetsAdapter` |
| Event names | dot.case | `lead.converted` |

## Imports

- No barrel files (`index.ts` re-exports) — explicit imports prevent circular deps
- External dependencies first, then internal, separated by blank line
- Use `@/` alias for src imports

## Folder Structure

```
src/
├── app/        # Routes only — thin as possible
├── components/ # UI components
├── lib/        # Business logic, services, adapters
├── types/      # Shared type definitions
└── styles/     # Global styles
```

- `app/` contains only route files and page layouts
- Business logic lives in `lib/`, never in `app/`
- Components go in `components/{module}/`
- Shared UI primitives go in `components/ui/`

## Error Handling

- Custom error classes for each domain
- Error boundaries at every route segment
- API routes return structured errors: `{ error: string, code: string }`
- All async operations use try/catch with proper error forwarding
- User-facing errors are human-readable, prefixed with emoji-free plain text

## Logging

- Structured JSON logs for server-side operations
- No `console.log` in production code
- Use an observability service wrapper for all logging
- Log: action, entity, duration, success/failure, error details

## Testing Standards

- Vitest for unit and integration tests
- Playwright for E2E and browser tests
- Business Rule Tests in separate suite at `tests/business-rules/`
- Test files co-located with source or in `tests/` directory
- Naming: `*.test.ts` or `*.business.test.ts`
- Every business rule has at least one test
- No test files without assertions

## Accessibility Standards

- WCAG AA minimum
- All interactive elements keyboard accessible
- All images have `alt` text
- All forms have accessible labels
- Color contrast meets WCAG AA (4.5:1 normal, 3:1 large)
- Focus indicators visible
- Use semantic HTML (nav, main, section, article, button, a)
- Custom components extend ARIA roles appropriately

## Performance Guidelines

- FCP < 1.5s, LCP < 2.5s, CLS < 0.1
- Initial JS bundle < 300KB
- API responses < 200ms
- Lighthouse score ≥ 95
- Lazy load below-fold content
- Optimize images with Next.js Image component
- Minimize client-side JavaScript

## Security Guidelines

- No secrets in code — all via environment variables
- OAuth tokens never stored in localStorage
- CSP headers configured
- All user input validated server-side
- RBAC checked on every protected API route
- Rate limiting on API routes
- Dependencies reviewed for known CVEs before adding

## Git Conventions

- Branch from `develop`, merge back to `develop`
- Feature branches: `feature/{short-description}`
- Fix branches: `fix/{short-description}`
- One commit per logical change
- No "WIP" commits — use `git commit --amend` or squash

## Commit Messages

```
{type}: {short description}

{optional body}
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat: add lead pipeline with drag-and-drop stages
```

## PR Checklist

- [ ] Build passes
- [ ] 0 ESLint errors
- [ ] Tests pass (unit + integration + business rules + E2E)
- [ ] Browser verification complete
- [ ] UX review complete
- [ ] Security review complete
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

## Cross-References

- Product Principles: `19_Product_Principles.md`
- Testing: `15_Testing_Quality.md`
- Security: `14_Security.md`
- Deployment: `16_Deployment.md`
