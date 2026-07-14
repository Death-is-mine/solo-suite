# 21 — Risk Register

> Identified risks for Solo Suite v1, with mitigation and contingency plans.

---

## Product Risks

| Risk | Likelihood | Impact | Mitigation | Contingency | Owner |
|------|------------|--------|------------|-------------|-------|
| Wrong market fit | Low | High | Loop -1 research validated against 11 competitors | Pivot feature set based on user feedback | Product |
| Feature bloat | Medium | Medium | Product Principles mandate "Can it be removed?" test | Revert to v0.1 scope | Product |
| UX too complex for solo users | Medium | High | Desktop-first, business workflow navigation, UX review gates | User testing rounds pre-v1 | UX |

## Technical Risks

| Risk | Likelihood | Impact | Mitigation | Contingency | Owner |
|------|------------|--------|------------|-------------|-------|
| Google Sheets rate limits | Medium | Medium | Workspace Database adapter; caching; batch operations | Migrate to PostgreSQL adapter | Engineering |
| Offline sync conflicts | Medium | Medium | IndexedDB with last-write-wins strategy | Conflict resolution UI | Engineering |
| MCP compatibility issues | Medium | High | MCP Core is provider-agnostic; test with multiple providers | Fallback to direct provider SDK | Engineering |
| Event Bus becomes bottleneck | Low | Medium | Async, non-blocking; Job Queue for heavy processing | Partition event channels | Engineering |

## Financial Data Risks

| Risk | Likelihood | Impact | Mitigation | Contingency | Owner |
|------|------------|--------|------------|-------------|-------|
| Duplicate payment entry | Medium | Medium | Transaction reference uniqueness check; approval workflow | Manual reversal via Credit Note | Finance |
| Incorrect currency conversion | Medium | Medium | Exchange rate recorded at transaction time; user reviews | Manual correction | Finance |
| Google Sheets corruption | Low | High | Daily backups to Drive; version history | Restore from backup | Engineering |
| Manual reconciliation errors | Medium | Medium | Receipt upload required; approval workflow mandatory | Audit log for reversals | Finance |
| Missing payment proof | Medium | Medium | Receipt upload enforced before approval; email reminders | Client re-upload via portal | Client |

## Third-Party Dependency Risks

| Risk | Likelihood | Impact | Mitigation | Contingency | Owner |
|------|------------|--------|------------|-------------|-------|
| Auth.js breaking change | Low | High | Pinned dependency version; tested in CI | Switch to next-auth or custom OAuth | Engineering |
| TipTap/ProseMirror unmaintained | Low | Medium | Active community; pinned version | Evaluate Slate or Quill | Engineering |
| Tailwind CSS major version change | Low | Low | Pinned version; gradual upgrade | CSS custom properties fallback | Engineering |

## Google API Risks

| Risk | Likelihood | Impact | Mitigation | Contingency | Owner |
|------|------------|--------|------------|-------------|-------|
| API quota exhaustion | Medium | Medium | Rate limiting; caching; quota monitoring | Alert and throttle | Engineering |
| API deprecation | Low | High | Adapter pattern insulates modules | Update adapter implementation | Engineering |
| OAuth scope changes | Low | High | Monitor Google Identity docs; scopes at minimum required | Update consent screen | Engineering |

## Operational Risks

| Risk | Likelihood | Impact | Mitigation | Contingency | Owner |
|------|------------|--------|------------|-------------|-------|
| Vercel downtime | Low | High | Static exports where possible; DNS failover docs | Document recovery procedure | Ops |
| Data loss | Low | Critical | Daily automated backups; version history | Restore from Google Drive backup | Engineering |
| Workspace Health degrades silently | Medium | High | Health dashboard monitors all services; alerts on failure | On-call response procedure | Engineering |

## Cross-References

- Product Principles: `19_Product_Principles.md`
- Security: `14_Security.md`
- Testing: `15_Testing_Quality.md`
- Deployment: `16_Deployment.md`
- Architecture: `05_System_Architecture_ARD.md`
