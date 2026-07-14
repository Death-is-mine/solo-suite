import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

export async function GET() {
  const expenses = await db.getExpenses()
  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const body = await request.json()
  const expense = await db.createExpense({
    category: body.category,
    amount: body.amount,
    currency: body.currency ?? 'USD',
    date: body.date ?? new Date().toISOString().split('T')[0],
    description: body.description,
    receiptLink: body.receiptLink,
  })
  await emit('expense.recorded', { expenseId: expense.id }, 'api/expenses')
  return NextResponse.json(expense, { status: 201 })
}
