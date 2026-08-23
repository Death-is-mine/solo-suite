import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

// ponytail: inbound email webhook — receives email notifications, creates leads or matches to clients.
// Body: { from, to, subject, body, messageId? }
// No auth required — called by external email providers (Gmail webhook, SendGrid, etc.)

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { from, subject, body: emailBody, messageId } = body
  if (!from || !subject) {
    return NextResponse.json({ error: 'Missing from or subject' }, { status: 400 })
  }

  // ponytail: extract sender email from "Name <email>" format
  const senderEmail = from.includes('<')
    ? (from.match(/<([^>]+)>/)?.[1] ?? from)
    : from

  // Try to match to existing client by email
  const clients = await db.getClients()
  const matchedClient = clients.find((c) => {
    try {
      const contacts = JSON.parse(c.contacts) as Array<{ email?: string }>
      return contacts.some((ct) => ct.email?.toLowerCase() === senderEmail.toLowerCase())
    } catch {
      return false
    }
  })

  if (matchedClient) {
    // Create a task for the matched client to follow up
    await db.createTask({
      projectId: '',
      title: `Follow up: ${subject}`,
      description: `From: ${from}\n\n${emailBody ?? ''}`,
      status: 'Todo',
      priority: 'Medium',
    })
    await emit('lead.updated', { leadId: matchedClient.id, changes: { source: 'inbound-email' } }, 'webhooks/email')
    return NextResponse.json({ status: 'matched', clientId: matchedClient.id })
  }

  // No match — create a new lead
  const lead = await db.createLead({
    name: from,
    email: senderEmail,
    source: 'inbound-email',
    notes: `Subject: ${subject}\n\n${emailBody ?? ''}`,
    stage: 'New',
  })
  await emit('lead.created', { leadId: lead.id, name: lead.name, email: lead.email }, 'webhooks/email')
  return NextResponse.json({ status: 'created', leadId: lead.id }, { status: 201 })
}