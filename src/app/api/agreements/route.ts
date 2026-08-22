import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { agreementCreateSchema, agreementUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const agreements = await db.getAgreements()
  return NextResponse.json(agreements)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(agreementCreateSchema, body)
  if (error) return error

  try {
    const agreement = await db.createAgreement({
      clientId: data.clientId,
      type: data.type ?? 'Proposal',
      status: data.status ?? 'Draft',
      version: data.version ?? 1,
      content: data.content ?? '',
    })
    return NextResponse.json(agreement, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(agreementUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const agreement = await db.updateAgreement(id, updateData)
    if (updateData.status === 'Sent') {
      await emit('agreement.sent', { agreementId: id, clientId: agreement.clientId }, 'api/agreements')
    }
    if (updateData.status === 'Signed') {
      await emit('agreement.signed', { agreementId: id, clientId: agreement.clientId }, 'api/agreements')
    }
    return NextResponse.json(agreement)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
