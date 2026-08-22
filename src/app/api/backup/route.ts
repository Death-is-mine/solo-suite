import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { createBackup, restoreBackup, type BackupSnapshot } from '@/lib/backup'

// ponytail: backup API — POST to create, PUT to restore, GET to download

export const GET = withAuth(async () => {
  const snapshot = await createBackup()
  return NextResponse.json(snapshot)
})

export const POST = withAuth(async () => {
  const snapshot = await createBackup()
  return NextResponse.json({ ok: true, createdAt: snapshot.createdAt })
})

export const PUT = withAuth(async (request) => {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const snapshot = body as BackupSnapshot
  const result = await restoreBackup(snapshot)
  return NextResponse.json({ ok: true, imported: result.imported })
})
