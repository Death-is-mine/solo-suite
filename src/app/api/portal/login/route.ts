import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

// ponytail: client portal login — validates email + clientId.
// Returns client data for scoped portal access. No separate auth session for MVP —
// portal pages use the app's existing auth and scope data by clientId.

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { email, clientId } = body
  if (!email || !clientId) {
    return NextResponse.json({ error: 'Missing email or clientId' }, { status: 400 })
  }

  const client = await db.getClient(clientId)
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  if (!client.portalAccess) {
    return NextResponse.json({ error: 'Portal access not enabled' }, { status: 403 })
  }

  // Verify email matches one of the client's contacts
  try {
    const contacts = JSON.parse(client.contacts) as Array<{ email?: string }>
    const emailMatch = contacts.some((c) => c.email?.toLowerCase() === email.toLowerCase())
    if (!emailMatch) {
      return NextResponse.json({ error: 'Email does not match client record' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid client data' }, { status: 500 })
  }

  // ponytail: return scoped client data — portal pages filter by this clientId
  const [projects, agreements, invoices] = await Promise.all([
    db.getProjects(),
    db.getAgreements(),
    db.getInvoices(),
  ])

  return NextResponse.json({
    ok: true,
    client: { id: client.id, company: client.company },
    projects: projects.filter((p) => p.clientId === client.id),
    agreements: agreements.filter((a) => a.clientId === client.id),
    invoices: invoices.filter((i) => i.clientId === client.id),
  })
}