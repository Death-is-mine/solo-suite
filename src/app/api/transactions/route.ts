import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { transactionCreateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const transactions = await db.getTransactions()
  return NextResponse.json(transactions)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(transactionCreateSchema, body)
  if (error) return error

  try {
    const transaction = await db.createTransaction({
      invoiceId: data.invoiceId,
      clientId: data.clientId,
      amount: data.amount,
      method: data.method ?? 'Other',
      reference: data.reference,
      receiptLink: data.receiptLink,
      status: data.status ?? 'Pending',
    })
    return NextResponse.json(transaction, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})
