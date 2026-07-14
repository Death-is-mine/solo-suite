import { google, drive_v3 } from 'googleapis'
import type { StorageAdapter } from './index'

export class GoogleDriveAdapter implements StorageAdapter {
  private drive: drive_v3.Drive

  constructor() {
    const email = process.env.GOOGLE_SERVICE_EMAIL!
    const key = process.env.GOOGLE_PRIVATE_KEY!
    const auth = new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/drive.file'] })
    this.drive = google.drive({ version: 'v3', auth })
  }

  async uploadFile(path: string, content: Buffer | string, mimeType: string): Promise<string> {
    const parts = path.split('/')
    const fileName = parts.pop()!
    const folderId = await this.resolveOrCreate(parts)

    const res = await this.drive.files.create({
      requestBody: { name: fileName, parents: folderId ? [folderId] : undefined },
      media: { mimeType, body: typeof content === 'string' ? Buffer.from(content) : content },
      fields: 'id',
    })
    return res.data.id!
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const res = await this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' })
    return Buffer.from(res.data as ArrayBuffer)
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.drive.files.delete({ fileId })
  }

  async listFiles(folder: string): Promise<{ id: string; name: string; mimeType: string }[]> {
    const folderId = await this.resolveFolder(folder)
    if (!folderId) return []
    const res = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
    })
    return (res.data.files ?? []).map(f => ({ id: f.id!, name: f.name!, mimeType: f.mimeType! }))
  }

  async createFolder(name: string): Promise<string> {
    const res = await this.drive.files.create({
      requestBody: { name, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    })
    return res.data.id!
  }

  private async resolveFolder(path: string): Promise<string | null> {
    const parts = path.split('/').filter(Boolean)
    if (parts.length === 0) return null

    let parentId: string | null = null
    for (const name of parts) {
      const q: string = parentId
        ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      const res = await this.drive.files.list({ q, fields: 'files(id)', pageSize: 1 })
      if (res.data.files?.length) {
        parentId = res.data.files[0].id!
      } else {
        return null
      }
    }
    return parentId
  }

  private async resolveOrCreate(parts: string[]): Promise<string | null> {
    let parentId: string | null = null
    for (const name of parts) {
      const q: string = parentId
        ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      const listRes = await this.drive.files.list({ q, fields: 'files(id)', pageSize: 1 })
      if (listRes.data.files?.length) {
        parentId = listRes.data.files[0].id!
      } else {
        const createRes = await (this.drive.files.create as (...args: unknown[]) => Promise<{ data: { id: string } }>)({
          requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: parentId ? [parentId] : undefined },
          fields: 'id',
        })
        // ponytail: orphaned file, orphaned -> no type plumbing needed
        parentId = createRes.data.id
      }
    }
    return parentId
  }
}
