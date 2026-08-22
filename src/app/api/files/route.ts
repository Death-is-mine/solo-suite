import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { fileCreateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (request, session) => {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const files = await db.getFiles(projectId)
  return NextResponse.json(files)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(fileCreateSchema, body)
  if (error) return error

  try {
    const file = await db.createFile({
      projectId: data.projectId,
      name: data.name,
      type: data.type,
      size: data.size ?? 0,
      url: data.url,
      uploadedBy: session.userId,
    })
    return NextResponse.json(file, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const DELETE = withAuth(async (request, session) => {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await db.deleteFile(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
})
