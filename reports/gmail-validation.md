# Phase E — Gmail Validation

**Date:** 2026-07-14
**Tester:** Code analysis
**Status:** ❌ NOT IMPLEMENTED — no Gmail adapter exists

---

## 1. Current State

| Component | Status | File |
|-----------|--------|------|
| `MailAdapter` interface | ✅ Defined | `src/lib/mail/index.ts` |
| Google Gmail implementation | ❌ Missing | No adapter file exists |
| Gmail API package | ❌ Not installed | Not in `package.json` |
| Email sending UI | ❌ Missing | No compose/send UI exists |

---

## 2. Interface Analysis

The `MailAdapter` interface requires:

```typescript
sendEmail(to: string, subject: string, body: string): Promise<void>
sendTemplate(to: string, template: string, data: Record<string, string>): Promise<void>
```

### Observations

- Minimal interface — only send operations, no read/inbox/search
- `body` is plain text — no HTML support in interface
- `sendTemplate` suggests server-side template rendering
- No attachment support in interface
- No reply-to, threading, CC/BCC support
- Interface is **not imported anywhere** — orphaned

---

## 3. Gap Analysis — Interface Design Issues

| Issue | Problem | Suggestion |
|-------|---------|------------|
| No HTML body support | Emails are plain text only | Add `html?: string` to interface |
| No attachments | Can't send PDF invoices | Add `attachments?: { filename: string; content: Buffer }[]` |
| No reply-to | Replies go to service account | Add `replyTo?: string` |
| No threading | Can't track conversation | Add `threadId?: string` |
| No CC/BCC | Can't include stakeholders | Add `cc?: string[]; bcc?: string[]` |

---

## 4. Email Templates Required

Based on codebase analysis, the following transactional emails need templates:

| Template | Trigger | Recipient | Variables |
|----------|---------|-----------|-----------|
| Proposal | Lead moved to "Proposal Sent" | Lead email | `{clientName, proposalLink, yourName}` |
| Agreement | Agreement status → Sent | Client email | `{companyName, agreementLink, expirationDate}` |
| Invoice | Invoice status → Sent | Client email | `{invoiceId, amount, dueDate, paymentLink}` |
| Receipt | Transaction created | Client email | `{invoiceId, amount, paidDate, receiptLink}` |
| Follow-up | Lead stage unchanged for 7 days | Lead email | `{leadName, yourName}` |

---

## 5. Validation Checklist (Post-Implementation)

| Test | Expected |
|------|----------|
| Send proposal email | Email delivered with correct template |
| Send agreement email | Email delivered with attachment |
| Send invoice email | Email delivered with payment link |
| Send receipt email | Email delivered with receipt details |
| Send follow-up email | Email delivered correctly |
| HTML template rendering | CSS inlined, responsive |
| Plain text fallback | Text version present |
| Attachments | PDF/DOCX attached correctly |
| Reply-To header | Replies go to sender, not service account |
| Threading | `In-Reply-To` and `References` headers set |
| Failure handling | 550/ bounce → logged to Job Queue |
| Rate limits | Exponential backoff on 429 |

---

## 6. Missing Infrastructure

### Implementation Required
`src/lib/mail/gmail.ts` — `GmailAdapter implements MailAdapter` using `google.gmail({version:'v1'})`

### Package Required
```
npm install @googleapis/gmail
```

### API Enablement Required
Gmail API must be enabled at https://console.cloud.google.com/apis/library/gmail.googleapis.com

### Scope Required
```
https://www.googleapis.com/auth/gmail.send
```
Send-only access (cannot read inbox).

### Auth Consideration
Gmail requires either:
1. Service account with domain-wide delegation (Google Workspace only)
2. OAuth 2.0 with user consent for the sending user

The current JWT service account approach works for Workspace domains with domain-wide delegation enabled.

---

## 7. Conclusion

**No Gmail adapter exists.** The interface is too minimal for production use cases (no HTML, no attachments, no threading). Template rendering, MIME construction, and proper error handling all need to be built. The Gmail API must be enabled and domain-wide delegation configured for the service account.

**Gate: ❌ NOT IMPLEMENTED — adapter must be built, interface must be extended**
