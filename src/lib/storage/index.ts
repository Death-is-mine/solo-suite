export interface StorageAdapter {
  uploadFile(path: string, content: Buffer | string, mimeType: string): Promise<string>
  downloadFile(fileId: string): Promise<Buffer>
  deleteFile(fileId: string): Promise<void>
  listFiles(folder: string): Promise<{ id: string; name: string; mimeType: string }[]>
  createFolder(name: string): Promise<string>
}
