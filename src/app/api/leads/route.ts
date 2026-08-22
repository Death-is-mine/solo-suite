import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { leadCreateSchema, leadUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const leads = await db.getLeads()
  return NextResponse.json(leads)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(leadCreateSchema, body)
  if (error) return error

  try {
    const lead = await db.createLead({
      ...data,
      stage: data.stage ?? 'New',
    })
    await emit('lead.created', { leadId: lead.id }, 'api/leads')
    return NextResponse.json(lead, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(leadUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  let lead
  try {
    lead = await db.updateLead(id, updateData)
  } catch {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  if (updateData.stage === 'Won') {
    const client = await db.createClient({
      company: lead.name,
      contacts: JSON.stringify([{ name: lead.name, email: lead.email, phone: lead.phone }]),
      portalAccess: false,
    })
    await db.updateLead(id, { clientId: client.id })
    await emit('lead.converted', { leadId: id, clientId: client.id }, 'api/leads')
  }

  return NextResponse.json(lead)
})
