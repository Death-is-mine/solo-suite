# ADR-003: MCP for AI Integration

**Status:** Accepted  
**Date:** 2026-07-14  
**Context:** Need to integrate AI capabilities without depending on a single provider.  
**Decision:** Use Model Context Protocol (MCP) with a pluggable provider architecture.  
**Rationale:** Provider-agnostic; any MCP-compatible model works; no vendor lock-in.  
**Consequences:** MCP Manager becomes core infrastructure; some provider-specific features unavailable.  
**Affected Docs:** 12_MCP, 05_ARD
