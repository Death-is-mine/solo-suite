import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

export async function GET() {
  const clients = await db.getClients()
  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const body = await request.json()
  const client = await db.createClient({
    company: body.company,
    contacts: body.contacts ?? '[]',
    notes: body.notes,
    tags: body.tags,
    portalAccess: body.portalAccess ?? false,
  })
  await emit('client.created', { clientId: client.id }, 'api/clients')
  return NextResponse.json(client, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  try {
    const client = await db.updateClient(id, data)
    return NextResponse.json(client)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
