import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { documentCreateSchema, documentUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (request, session) => {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const documents = await db.getDocuments(projectId)
  return NextResponse.json(documents)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(documentCreateSchema, body)
  if (error) return error

  try {
    const document = await db.createDocument({
      projectId: data.projectId,
      title: data.title ?? 'Untitled',
      content: data.content ?? '',
      type: data.type ?? 'Doc',
    })
    return NextResponse.json(document, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(documentUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const document = await db.updateDocument(id, updateData)
    return NextResponse.json(document)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
