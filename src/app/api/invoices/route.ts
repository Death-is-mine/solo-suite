import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

export async function GET() {
  const invoices = await db.getInvoices()
  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const body = await request.json()
  const invoice = await db.createInvoice({
    clientId: body.clientId,
    lineItems: body.lineItems ?? '[]',
    subtotal: body.subtotal ?? 0,
    tax: body.tax ?? 0,
    taxType: body.taxType ?? 'None',
    total: body.total ?? 0,
    currency: body.currency ?? 'USD',
    status: 'Draft',
    dueDate: body.dueDate,
  })
  return NextResponse.json(invoice, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  const invoice = await db.updateInvoice(id, data)

  if (data.status === 'Sent') {
    await emit('invoice.sent', { invoiceId: id, clientId: invoice.clientId }, 'api/invoices')
  }
  if (data.status === 'Paid') {
    await emit('invoice.paid', { invoiceId: id, clientId: invoice.clientId }, 'api/invoices')
  }

  return NextResponse.json(invoice)
}
