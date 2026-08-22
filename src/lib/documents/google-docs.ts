import type { DocumentAdapter } from './index'

// ponytail: Google Docs adapter via REST API. Stub — swap in real API calls when env vars are set.

const API_BASE = 'https://docs.googleapis.com/v1'

async function docsFetch(path: string, options?: RequestInit) {
  const apiKey = process.env.GOOGLE_DOCS_API_KEY
  if (!apiKey) throw new Error('GOOGLE_DOCS_API_KEY not set')
  return fetch(`${API_BASE}${path}?key=${apiKey}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
}

export const googleDocsAdapter: DocumentAdapter = {
  async createDocument(title: string, content: string): Promise<string> {
    const res = await docsFetch('/documents', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
    if (!res.ok) throw new Error(`Docs create failed: ${res.status}`)
    const doc = await res.json()
    const docId = doc.documentId
    if (content) {
      await docsFetch(`/documents/${docId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [{ insertText: { location: { index: 0 }, text: content } }],
        }),
      })
    }
    return docId
  },

  async updateDocument(docId: string, content: string): Promise<void> {
    const docRes = await docsFetch(`/documents/${docId}`)
    if (!docRes.ok) throw new Error(`Docs read failed: ${docRes.status}`)
    const doc = await docRes.json()
    const bodyLen = doc.body?.content?.at(-1)?.endIndex ?? 1
    await docsFetch(`/documents/${docId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          { deleteContentRange: { range: { startIndex: 0, endIndex: bodyLen - 1 } } },
          { insertText: { location: { index: 0 }, text: content } },
        ],
      }),
    })
  },

  async exportToPdf(docId: string): Promise<Buffer> {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=application/pdf`)
    if (!res.ok) throw new Error(`Docs export failed: ${res.status}`)
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  },
}
