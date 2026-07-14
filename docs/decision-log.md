# Decision Log

> Minor product decisions that don't warrant a full ADR but should be recorded for history.

| Date | Decision | Reason | Owner | Affected Docs | Affected Modules |
|------|----------|--------|-------|---------------|------------------|
| 2026-07-14 | Renamed Contract → Agreement | More approachable terminology | Product | 02_PRD, 06_DDD, 18_Glossary | Agreements |
| 2026-07-14 | Renamed Finance → Finance & Accounting | Accuracy — no payment processing | Product | 02_PRD, 05_ARD, 10_DB, 21_Risk | Finance & Accounting |
| 2026-07-14 | Removed payment gateway integrations | Freelancer workflow reality; payment is manual verification | Architecture | All docs | Finance & Accounting |
| 2026-07-14 | Renamed Intelligence Layer → Workspace Intelligence | Reflects broader responsibility (context, memory, MCP) | Architecture | 05_ARD, 12_MCP | Workspace Intelligence |
| 2026-07-14 | Added Document IDs (LD-, CL-, PR-, etc.) | Professional references, easier search/audit | Product | 02_PRD, 10_DB, 18_Glossary | All modules |
| 2026-07-14 | Added Business Events + System Events separation | Cleaner automation, better observability | Architecture | 05_ARD, 13_Auto | Event Bus |
| 2026-07-14 | Workspace Context Engine as central component | Single source of runtime context | Architecture | 05_ARD, 08_SDD | All modules |
| 2026-07-14 | Adapter architecture for all external services | Replaceable implementations, testable code | Architecture | 05_ARD, 08_SDD | All adapters |
| 2026-07-14 | Google Sheets as DB but abstracted behind WorkspaceDatabase interface | User owns data; future DB options | Architecture | 05_ARD, 10_DB | Database |
| 2026-07-14 | InProcessQueueAdapter for Job Queue v1 | Sheets as audit log, not execution engine | Engineering | 05_ARD, 13_Auto | Job Queue |
| 2026-07-14 | MCP replaces hardcoded AI providers | Provider-agnostic, pluggable AI | Architecture | 12_MCP, 05_ARD | Workspace Intelligence |
