# ADR-001: Google Sheets as Database

**Status:** Accepted  
**Date:** 2026-07-14  
**Context:** Need a database for Solo Suite's structured data (leads, clients, invoices, etc.).  
**Decision:** Use Google Sheets via the Workspace Database abstraction layer.  
**Rationale:** User owns their data; transparent; portable; no vendor lock-in; simple for solo users.  
**Consequences:** Database adapter must abstract Sheets specifics; not suitable for high-write workloads.  
**Affected Docs:** 05_ARD, 10_DB, 03_PDR
