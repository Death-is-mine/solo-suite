export interface DocumentAdapter {
  createDocument(title: string, content: string): Promise<string>
  updateDocument(docId: string, content: string): Promise<void>
  exportToPdf(docId: string): Promise<Buffer>
}
