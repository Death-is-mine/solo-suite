import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

export async function GET() {
  const agreements = await db.getAgreements()
  return NextResponse.json(agreements)
}

export async function POST(request: Request) {
  const body = await request.json()
  const agreement = await db.createAgreement({
    clientId: body.clientId,
    type: body.type ?? 'Proposal',
    status: 'Draft',
    version: 1,
    content: body.content ?? '',
  })
  return NextResponse.json(agreement, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  try {
    const agreement = await db.updateAgreement(id, data)
    if (data.status === 'Sent') {
      await emit('agreement.sent', { agreementId: id, clientId: agreement.clientId }, 'api/agreements')
    }
    if (data.status === 'Signed') {
      await emit('agreement.signed', { agreementId: id, clientId: agreement.clientId }, 'api/agreements')
    }
    return NextResponse.json(agreement)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
