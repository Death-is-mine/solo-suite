# 03 — Product Decision Record (PDR)

> Key product decisions for Solo Suite v1, with rationale, alternatives considered, and consequences.

---

## Purpose

Document every significant product decision so future contributors understand why things are the way they are. Prevents repeating debates and preserves institutional knowledge.

---

## PDR-001: Google Sheets as Database

**Decision:** Use Google Sheets as the primary structured database.

**Alternatives:**
- PostgreSQL / Supabase — more powerful, but introduces vendor dependency
- SQLite — good for offline but harder to sync
- Firebase — vendor lock-in

**Rationale:**
- User owns their data — it's literally in their Google Drive
- No vendor lock-in — user can open the sheet in any spreadsheet app
- Transparent — user can see all their data at any time
- Easy backup — copy the spreadsheet
- Portable — export to CSV, Excel, or any format
- Simpler than running a database for solo/small-agency scale

**Consequences:**
- Not suitable for high-write workloads — but solo users don't have those
- Query flexibility limited — mitigated by Workspace Database abstraction layer
- Race conditions possible at high concurrency — mitigated by single-user/small-team nature
- ADR-006 documents this in depth

---

## PDR-002: Agreement (not Contract)

**Decision:** Use "Agreement" instead of "Contract".

**Rationale:**
- "Agreement" is more approachable for freelancers and clients
- "Contract" can feel intimidating or legalistic
- The product includes proposals, NDAs, SOWs — not all are strict "contracts"
- "Agreement" covers the full spectrum: Proposal → Agreement → NDA → SOW → Change Request

**Consequences:**
- All code, docs, and UI use "Agreement" terminology
- Glossary defines the term

---

## PDR-003: MCP for AI (not Hardcoded Providers)

**Decision:** Use Model Context Protocol (MCP) for all AI integration instead of directly integrating OpenAI/Anthropic/Gemini SDKs.

**Alternatives:**
- Direct SDK integration — simpler but locks to providers
- Custom abstraction layer — reinventing what MCP already does
- No AI — misses core product promise

**Rationale:**
- Provider-agnostic — any MCP-compatible model can connect
- No vendor dependence — user can switch models without code changes
- Pluggable — community MCPs provide additional capabilities
- Future-proof — AI landscape changes rapidly, MCP insulates from churn
- Aligns with "Evolution over Replacement" principle

**Consequences:**
- Requires MCP Manager as core infrastructure
- Some provider-specific features may not be available through MCP
- ADR-003 documents the architecture

---

## PDR-004: No Payment Gateways (Manual Verification)

**Decision:** Do not integrate payment gateways. Payment records are manual with receipt upload.

**Alternatives:**
- Stripe integration — most common, but adds complexity
- Multiple gateways (Stripe, Razorpay, PayPal, Wise) — even more complexity
- Third-party payment orchestration — another vendor

**Rationale:**
- Most freelancers already handle payments through their own bank/gateway
- Manual verification matches real workflow: client pays → freelancer confirms
- Payment gateway integration is the #1 source of support tickets in similar products
- Avoids PCI compliance scope
- Avoids payment processing fees
- Plugin SDK allows adding gateways later

**Consequences:**
- Payment is not real-time
- Freelancer must manually reconcile
- ADR-005 documents this in depth
- Future: payment gateway module via Plugin SDK

---

## PDR-005: TipTap (not Markdown Editor)

**Decision:** Use TipTap (ProseMirror) for document editing.

**Alternatives:**
- Markdown editor — simpler but limited
- Slate — flexible but less mature
- Quill — less extensible
- Google Docs API embedding — too constrained

**Rationale:**
- Professional WYSIWYG editing with tables, images, comments
- Extensible via custom extensions (variables, AI hook)
- Version history built-in
- Slash commands and mentions for power users
- Variables system automates document personalization

**Consequences:**
- Larger bundle size than Markdown editor
- Learning curve for extension development
- Real-time collaboration requires additional infra (future)

---

## PDR-006: Next.js Monolith (not Separate Backend)

**Decision:** Use Next.js with API routes for both frontend and backend.

**Alternatives:**
- Next.js frontend + Express/Fastify backend — more separation but more infrastructure
- Next.js + separate BFF — over-engineered for solo/small-agency scale
- Remix — similar but smaller ecosystem

**Rationale:**
- Single deployment (Vercel)
- Shared types between frontend and backend
- Reduced infrastructure complexity
- Route handlers provide API endpoints alongside pages
- Good enough performance for the target user base

**Consequences:**
- Backend logic cannot be reused outside Next.js
- Vercel dependency for optimal deployment
- API route cold starts on serverless

---

## PDR-007: Adapter Architecture for All Google APIs

**Decision:** Wrap every Google API behind an adapter interface.

**Rationale:**
- Google API may change or deprecate
- User may want non-Google alternatives in future
- Module code doesn't depend on Google-specific SDKs
- Testing — adapters can be mocked
- ADR pattern: every adapter is a replaceable implementation

**Consequences:**
- More files and interfaces upfront
- Some Google-specific features may be obscured by the adapter

---

## PDR-008: Workspace Context Engine

**Decision:** Centralize runtime context in a single engine available to all modules.

**Alternatives:**
- Each module manages its own context — leads to duplication and inconsistency
- React Context only — doesn't cover server-side
- No context — modules fetch data repeatedly

**Rationale:**
- Single source of truth for current workspace, user, permissions, scoped entity
- MCP tools need context — engines provides it
- Automation needs context — engine provides it
- Multi-workspace support becomes trivial
- Testing: mock the engine, not a dozen scattered contexts

**Consequences:**
- New architectural component to build and maintain
- All modules must route context queries through the engine

---

## PDR-009: Business Events + System Events (separate channels)

**Decision:** Split Event Bus into Business Events and System Events channels.

**Rationale:**
- Clear separation of concerns
- Automation listens to Business Events only
- Infrastructure listens to System Events only
- Cleaner debugging and observability
- Prevents automation from accidentally triggering on system events

**Consequences:**
- Two event channels to maintain
- Some events may need to be published to both channels

---

## PDR-010: Rename Finance → Finance & Accounting

**Decision:** Call the module "Finance & Accounting" instead of "Finance".

**Rationale:**
- Product does not process payments — it tracks records
- "Finance" implies banking/payments
- "Finance & Accounting" accurately describes the scope: invoices, expenses, taxes, reports
- Manages user expectations

**Consequences:**
- Module name change across all docs, code, UI
- Consistent terminology throughout

---

## Standards

Every PDR entry must include:
- Decision (what was decided)
- Alternatives (what else was considered)
- Rationale (why this choice)
- Consequences (what this means for the product)

---

## Cross-References

- ADRs: `docs/adr/ADR-001` through `ADR-006`
- Vision: `01_Vision.md`
- Architecture: `05_System_Architecture_ARD.md`
- Product Principles: `19_Product_Principles.md`
- Decision Log: `docs/decision-log.md`

---

## Future

- Payment gateway plugin (PDR reconsidered when Plugin SDK supports it)
- Real-time collaboration (PDR when infrastructure requirements are understood)
- Native mobile apps (PDR when mobile companion proves insufficient)
