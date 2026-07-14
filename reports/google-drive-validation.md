# Phase C — Google Drive Validation

**Date:** 2026-07-14
**Tester:** Code analysis
**Status:** ❌ NOT IMPLEMENTED — no Drive adapter exists

---

## 1. Current State

| Component | Status | File |
|-----------|--------|------|
| `StorageAdapter` interface | ✅ Defined | `src/lib/storage/index.ts` |
| Google Drive implementation | ❌ Missing | `src/lib/storage/` has no implementation file |
| `@googleapis/drive` package | ✅ Installed `^20.2.0` | `package.json` dependency |
| Workspace database integration | ❌ Missing | No entity references Drive files |
| UI file upload | ⚠️ Partial | `src/app/files/page.tsx` exists but uses in-memory storage |

---

## 2. Interface Analysis

The `StorageAdapter` interface requires:

```typescript
uploadFile(path: string, content: Buffer | string, mimeType: string): Promise<string>
downloadFile(fileId: string): Promise<Buffer>
deleteFile(fileId: string): Promise<void>
listFiles(folder: string): Promise<{ id: string; name: string; mimeType: string }[]>
createFolder(name: string): Promise<string>
```

### Observations

- `path` is a Unix-style path (`folder/file.ext`) — good for Drive folder hierarchy
- No `rename` or `move` operations — these would need Drive-specific `files.update`
- No permission management — all files inherit Drive folder permissions
- `Buffer` return type for downloads is correct
- The interface is **not imported anywhere** in `src/` — completely orphaned

---

## 3. Drive Integration Points in the Codebase

Use cases that will need Drive when implemented:

| Feature | Current State | Drive Requirement |
|---------|---------------|-------------------|
| Project files | In-memory via `db.createFile()` | Store files in Drive, metadata in Sheets |
| Agreement attachments | Text area in browser | Store PDF exports in Drive |
| Invoice receipts | URL field on `TransactionRecord` | Upload receipt PDFs/JPGs |
| Backup download | JSON via browser download | Store in Drive as scheduled backup |
| Workspace folders | Not created | Auto-create "Solo Suite" → "Projects" → "{Project}" hierarchy |

---

## 4. Validation Checklist (Post-Implementation)

| Test | Expected |
|------|----------|
| Create "Solo Suite" root folder | `createFolder` returns folder ID |
| Upload PDF to project folder | `uploadFile` returns file ID |
| Download file by ID | `downloadFile` returns Buffer with correct content |
| List files in folder | `listFiles` returns array of file metadata |
| Delete file | `deleteFile` removes file |
| Upload JPG | MIME type set correctly |
| Upload PNG | MIME type set correctly |
| Upload DOCX | MIME type set correctly |
| Rename file | Not in interface — gap |
| Folder hierarchy (Solo/Projects/{id}/) | Auto-creates nested folders |
| Permission inheritance | Files inherit parent folder permissions |

---

## 5. Gap Analysis

### Missing Implementation

No `GoogleDriveAdapter` class exists. The `@googleapis/drive` package (v20.2.0) is installed but never imported. Construction steps:

1. Create `src/lib/storage/drive.ts` with `GoogleDriveAdapter implements StorageAdapter`
2. Add `drive.file` scope to JWT auth scopes
3. Wire into the Workspace Database entity flow
4. Update the Files UI page to use Drive instead of in-memory

### API Enablement Required

The following Google APIs need to be enabled in the Cloud Console:
- ✅ Google Sheets API (already enabled for Sheets adapter)
- ❓ Google Drive API — must be enabled at https://console.cloud.google.com/apis/library/drive.googleapis.com

### Scope Required
```
https://www.googleapis.com/auth/drive.file
```
This scope gives access only to files created or opened by the app — minimal privilege.

---

## 6. Conclusion

**No Drive adapter exists.** The `@googleapis/drive` package is installed but unused. The `StorageAdapter` interface is orphaned. To complete Drive certification, a `GoogleDriveAdapter` must be implemented, the Drive API must be enabled in the Google Cloud project, and all file operations must be tested against a live Drive account.

**Gate: ❌ NOT IMPLEMENTED — adapter must be built**
