# ADR-005: No Payment Gateways

**Status:** Accepted  
**Date:** 2026-07-14  
**Context:** Need to handle payments in the Finance & Accounting module.  
**Decision:** Do not integrate payment gateways. Payments are manual verification with receipt upload.  
**Rationale:** Most freelancers already handle payments through their own bank/gateway; manual verification matches real workflow; avoids PCI compliance, processing fees, and high support burden.  
**Consequences:** Payment is not real-time; freelancer manually reconciles; gateway support added later via Plugin SDK.  
**Affected Docs:** 02_PRD, 05_ARD, 10_DB, 21_Risk
