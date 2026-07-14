# Phase F — Google Docs Validation

**Date:** 2026-07-14
**Tester:** Code analysis
**Status:** ❌ NOT IMPLEMENTED — no Google Docs adapter exists

---

## 1. Current State

| Component | Status | File |
|-----------|--------|------|
| `DocumentAdapter` interface | ✅ Defined | `src/lib/documents/index.ts` |
| Google Docs implementation | ❌ Missing | No adapter file exists |
| Docs API package | ❌ Not installed | Not in `package.json` |
| Document generation UI | ⚠️ Partial | `src/app/documents/page.tsx` — textarea editor, Notion-style sidebar |
| Agreement generation | ⚠️ Partial | `src/app/agreements/page.tsx` — textarea editor with type/version/status |

---

## 2. Interface Analysis

The `DocumentAdapter` interface requires:

```typescript
createDocument(title: string, content: string): Promise<string>
updateDocument(docId: string, content: string): Promise<void>
exportToPdf(docId: string): Promise<Buffer>
```

### Observations

- Minimal interface — only create, update, and PDF export
- `content` is raw string — assumes Docs API batch update format
- No template support in interface
- No variable substitution
- No version history read
- Interface is **not imported anywhere** — orphaned

---

## 3. Gap Analysis

### Missing Capabilities

| Capability | Current State | Docs Requirement |
|------------|---------------|------------------|
| Agreement generation | Textarea editor | Create Google Doc from template with client variables |
| Proposal generation | Same textarea | Generate formatted proposal Doc |
| Variable substitution | Not implemented | `{{clientName}}` → actual client name |
| PDF export | Not implemented | `exportToPdf` via Docs export API |
| Version history | Not implemented | Docs auto-saves versions |
| Templates | Not implemented | Store template Docs, copy on new use |

### Document Templates Needed

| Template | Type | Variables |
|----------|------|-----------|
| Service Agreement | Legal | `{{clientName}}`, `{{companyName}}`, `{{scope}}`, `{{fee}}`, `{{startDate}}` |
| Proposal | Sales | `{{clientName}}`, `{{proposalDate}}`, `{{total}}`, `{{services}}` |
| SOW (Statement of Work) | Legal | `{{projectName}}`, `{{deliverables}}`, `{{timeline}}`, `{{cost}}` |
| NDA | Legal | `{{partyA}}`, `{{partyB}}`, `{{effectiveDate}}` |

---

## 4. Docs Generation Flow (Post-Implementation)

```
User clicks "Generate Agreement"
  → Load template Doc (stored in Drive)
  → Copy template → new Doc
  → Replace {{variables}} with entity data
  → Format according to agreement type
  → Return Doc ID
  → Optionally export to PDF
  → Store Doc ID in AgreementRecord
```

---

## 5. Validation Checklist (Post-Implementation)

| Test | Expected |
|------|----------|
| Create document from template | Doc created with correct title |
| Variable substitution | `{{clientName}}` replaced with `"Acme Corp"` |
| Update document content | Content reflects changes |
| PDF export | Valid PDF returned as Buffer |
| Agreement generation | Full agreement Doc with all sections |
| Proposal generation | Proposal Doc with pricing table |
| Version history | Document retains edit history |
| Formatting | Bold, lists, tables preserved |

---

## 6. Missing Infrastructure

### Implementation Required
`src/lib/documents/docs.ts` — `GoogleDocsAdapter implements DocumentAdapter`

### Package Required
```
npm install @googleapis/docs
```

### API Enablement Required
Google Docs API must be enabled at https://console.cloud.google.com/apis/library/docs.googleapis.com

### Scope Required
```
https://www.googleapis.com/auth/documents
```

---

## 7. Conclusion

**No Google Docs adapter exists.** The current document editing UI uses a plain textarea — no template system, no variable substitution, no PDF export. The Agreements page has the same limitation. Building the Docs adapter requires the `@googleapis/docs` package and Docs API enablement.

**Gate: ❌ NOT IMPLEMENTED — adapter must be built**
