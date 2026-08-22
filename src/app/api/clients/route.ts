import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { clientCreateSchema, clientUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const clients = await db.getClients()
  return NextResponse.json(clients)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(clientCreateSchema, body)
  if (error) return error

  try {
    const client = await db.createClient({
      company: data.company,
      contacts: data.contacts ?? '[]',
      notes: data.notes,
      tags: data.tags,
      portalAccess: data.portalAccess ?? false,
    })
    await emit('client.created', { clientId: client.id }, 'api/clients')
    return NextResponse.json(client, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(clientUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const client = await db.updateClient(id, updateData)
    return NextResponse.json(client)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
