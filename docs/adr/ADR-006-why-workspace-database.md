# ADR-006: Workspace Database Abstraction

**Status:** Accepted  
**Date:** 2026-07-14  
**Context:** Need to prevent tight coupling to Google Sheets as the database layer.  
**Decision:** Abstract all database operations behind a `WorkspaceDatabase` interface. Google Sheets is the v1 implementation.  
**Rationale:** Transparency, portability, easy backup, user data ownership, no vendor lock-in, simplicity for freelancers.  
**Consequences:** More files and interfaces; all modules depend on the interface only; future implementations (PostgreSQL, Supabase, SQLite) can be swapped in.  
**Affected Docs:** 05_ARD, 10_DB, 08_SDD
