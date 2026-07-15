'use client'

import { useState, useCallback, useEffect } from 'react'
import { Trash2, Upload } from 'lucide-react'
import type { FileRecord } from '@/lib/database/types'

const typeIcons: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  doc: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  docx: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  xls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  xlsx: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  png: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  jpg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  jpeg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [url, setUrl] = useState('')
  const [projectId, setProjectId] = useState('')

  const load = useCallback(() => {
    fetch('/api/files')
      .then((res) => res.json())
      .then((data) => { setFiles(data); setLoading(false) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  async function createFile() {
    try {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, url, projectId, size: 0, uploadedBy: 'user' }),
      })
    } catch {}
    setName(''); setType(''); setUrl(''); setProjectId(''); setShowNew(false)
    load()
  }

  async function removeFile(id: string) {
    try {
      await fetch(`/api/files?id=${id}`, { method: 'DELETE' })
    } catch {}
    load()
  }

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-600">Loading...</div>

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Files</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Upload className="size-4" /> Add File
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 grid gap-3 md:grid-cols-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="File name" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (pdf, docx...)" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            <input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project ID" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          </div>
          <div className="flex gap-2">
            <button onClick={createFile} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Add</button>
            <button onClick={() => setShowNew(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-medium ${typeIcons[f.type] ?? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-600'}`}>
              {f.type.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{f.name}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 dark:text-zinc-600">{fileSize(f.size)} · {f.type}</p>
            </div>
            <button onClick={() => removeFile(f.id)} className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {files.length === 0 && <p className="col-span-full pt-8 text-center text-sm text-zinc-600">No files uploaded.</p>}
      </div>
    </div>
  )
}

