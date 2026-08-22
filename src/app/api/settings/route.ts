import { db } from '@/lib/database'
import { NextResponse } from 'next/server'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { settingsUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { requireRole } from '@/lib/auth/api-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (req, session) => {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key query param required' }, { status: 400 })
  const value = await db.getSetting(key)
  return NextResponse.json({ value })
})

export const PUT = withAuth(async (req, session) => {
  const roleError = requireRole(session, 'owner', 'admin')
  if (roleError) return roleError

  const { body, error: jsonError } = await parseJsonBody(req)
  if (jsonError) return jsonError

  const { data, error } = validateBody(settingsUpdateSchema, body)
  if (error) return error

  try {
    await db.setSetting(data.key, data.value)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return handleApiError(e)
  }
})
