import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { retainerCreateSchema, retainerUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const retainers = await db.getRetainers()
  return NextResponse.json(retainers)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(retainerCreateSchema, body)
  if (error) return error

  try {
    const retainer = await db.createRetainer({
      clientId: data.clientId,
      name: data.name,
      amount: data.amount,
      currency: data.currency ?? 'USD',
      frequency: data.frequency ?? 'Monthly',
      status: data.status ?? 'Active',
      startDate: data.startDate ?? new Date().toISOString().split('T')[0],
      endDate: data.endDate,
      nextBillingDate: data.nextBillingDate,
    })
    return NextResponse.json(retainer, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(retainerUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const retainer = await db.updateRetainer(id, updateData)
    return NextResponse.json(retainer)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
