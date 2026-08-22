import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { invoiceCreateSchema, invoiceUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const invoices = await db.getInvoices()
  return NextResponse.json(invoices)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(invoiceCreateSchema, body)
  if (error) return error

  try {
    const invoice = await db.createInvoice({
      clientId: data.clientId,
      lineItems: data.lineItems ?? '[]',
      subtotal: data.subtotal ?? 0,
      tax: data.tax ?? 0,
      taxType: data.taxType ?? 'None',
      total: data.total ?? 0,
      currency: data.currency ?? 'USD',
      status: data.status ?? 'Draft',
      dueDate: data.dueDate,
    })
    return NextResponse.json(invoice, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(invoiceUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const invoice = await db.updateInvoice(id, updateData)
    if (updateData.status === 'Sent') {
      await emit('invoice.sent', { invoiceId: id, clientId: invoice.clientId }, 'api/invoices')
    }
    if (updateData.status === 'Paid') {
      await emit('invoice.paid', { invoiceId: id, clientId: invoice.clientId }, 'api/invoices')
    }
    return NextResponse.json(invoice)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
