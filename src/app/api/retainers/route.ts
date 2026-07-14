import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  const retainers = await db.getRetainers()
  return NextResponse.json(retainers)
}

export async function POST(request: Request) {
  const body = await request.json()
  const retainer = await db.createRetainer({
    clientId: body.clientId,
    name: body.name,
    amount: body.amount,
    currency: body.currency ?? 'USD',
    frequency: body.frequency ?? 'Monthly',
    status: 'Active',
    startDate: body.startDate ?? new Date().toISOString().split('T')[0],
    endDate: body.endDate,
    nextBillingDate: body.nextBillingDate,
  })
  return NextResponse.json(retainer, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  const retainer = await db.updateRetainer(id, data)
  return NextResponse.json(retainer)
}
