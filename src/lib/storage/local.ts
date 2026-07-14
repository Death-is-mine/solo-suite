import fs from 'node:fs/promises'
import path from 'node:path'
import type { StorageAdapter } from './index'

export class LocalFileSystemAdapter implements StorageAdapter {
  private root: string

  constructor(root?: string) {
    this.root = root ?? path.join(process.cwd(), 'storage')
  }

  async uploadFile(filePath: string, content: Buffer | string, _mimeType: string): Promise<string> {
    const absolute = path.join(this.root, filePath)
    await fs.mkdir(path.dirname(absolute), { recursive: true })
    await fs.writeFile(absolute, content)
    return filePath
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    return fs.readFile(path.join(this.root, filePath))
  }

  async deleteFile(filePath: string): Promise<void> {
    await fs.rm(path.join(this.root, filePath), { force: true })
  }

  async listFiles(folder: string): Promise<{ id: string; name: string; mimeType: string }[]> {
    const dir = path.join(this.root, folder)
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      return entries.map((e) => ({ id: path.join(folder, e.name), name: e.name, mimeType: e.isDirectory() ? 'directory' : 'file' }))
    } catch {
      return []
    }
  }

  async createFolder(name: string): Promise<string> {
    await fs.mkdir(path.join(this.root, name), { recursive: true })
    return name
  }
}
