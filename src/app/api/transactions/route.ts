import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  const transactions = await db.getTransactions()
  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const transaction = await db.createTransaction({
    invoiceId: body.invoiceId,
    clientId: body.clientId,
    amount: body.amount,
    method: body.method ?? 'Other',
    reference: body.reference,
    receiptLink: body.receiptLink,
    status: 'Pending',
  })
  return NextResponse.json(transaction, { status: 201 })
}
