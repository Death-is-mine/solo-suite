import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

export async function GET() {
  const leads = await db.getLeads()
  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  const body = await request.json()
  const lead = await db.createLead({
    ...body,
    stage: body.stage ?? 'New',
  })
  await emit('lead.created', { leadId: lead.id }, 'api/leads')
  return NextResponse.json(lead, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  const lead = await db.updateLead(id, data)

  if (data.stage === 'Won') {
    const client = await db.createClient({
      company: lead.name,
      contacts: JSON.stringify([{ name: lead.name, email: lead.email, phone: lead.phone }]),
      portalAccess: false,
    })
    await db.updateLead(id, { clientId: client.id })
    await emit('lead.converted', { leadId: id, clientId: client.id }, 'api/leads')
  }

  return NextResponse.json(lead)
}
