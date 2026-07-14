# 19 — Product Principles

> The constitution of Solo Suite. When unsure about a decision, consult this document first.

---

## 1. Users Own Their Data

All business data lives in the user's Google Workspace. No proprietary databases. No vendor lock-in. The user can leave at any time with a complete, portable copy of their data.

## 2. Google Workspace First

Google Sheets, Drive, Calendar, Meet, Gmail, and Docs are the infrastructure layer. They are not third-party add-ons — they are the platform. Every alternative must be behind an adapter.

## 3. Offline First

Core functionality must work without internet. Data syncs when connectivity is restored. The user should never be blocked by a network issue.

## 4. Desktop First

The primary experience is a full-screen desktop web application. Mobile is a companion — key actions only.

## 5. AI Assists, AI Never Surprises

AI can create, summarize, suggest, and automate — but never take irreversible action without user confirmation. Every AI action is visible, auditable, and reversible.

## 6. No Fake Integrations

Every "Connected" status must represent a real, verified connection. No hardcoded green checkmarks. No mock data in production builds. No placeholder UI that simulates functionality.

## 7. Every Workflow End-to-End

A workflow is not complete until every step from start to finish works with real data. Partial workflows are not shipped.

## 8. Every Action Reversible

Delete is never final without confirmation. Every state change creates an audit trail. Version history is the default, not an opt-in.

## 9. Every Document Versioned

Agreements, proposals, invoices, and documents never overwrite. Each change creates a new version. Signed documents are immutable.

## 10. Everything Searchable

Every record, file, note, and transaction must be findable. Global search is a core feature, not an afterthought.

## 11. Everything Exportable

Every view, report, and document must be exportable (PDF, CSV, or both). No data is trapped in the UI.

## 12. Accessibility Is Mandatory

WCAG AA compliance is a requirement, not a goal. Keyboard navigation, screen reader support, color contrast, and focus management are built into every component.

## 13. Documentation Is the Source of Truth

Documentation defines the product. Code implements the documentation. If documentation and code disagree, the documentation is updated only after an approved product decision — not to match implementation shortcuts.

## 14. Business Workflow before Technical Workflow

The sidebar, navigation, and terminology follow the user's business process. The software's internal architecture is invisible to the user.

## 15. Evolution over Replacement

Never replace a subsystem when it can be extended. Always introduce interfaces before implementations. Prefer adapters over rewrites. Prefer migrations over breaking changes. Every subsystem must be replaceable. Every integration must be optional. Every workflow must degrade gracefully. Every feature must be independently testable.

## 16. Simplicity over Feature Bloat

Every feature must answer: Why does this exist? Who needs it? Why better than alternatives? Can it be removed? If it cannot justify its existence, it does not belong in v1.

## 17. Security by Default

OAuth, RBAC, encryption, CSP, rate limiting, and audit logs are built into the architecture, not added after the fact.

## 18. International by Default

Multi-currency, multi-timezone, multiple tax systems (GST, VAT, Sales Tax, Custom) are supported from day one. Localization is an architectural concern, not a UI afterthought.

## 19. Feature Readiness

Every feature is labeled with its readiness level: Concept → Research → Architecture → Design → Engineering → Testing → Certified → Released. No feature ships before it reaches Certified.
