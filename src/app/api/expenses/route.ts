import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { expenseCreateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const expenses = await db.getExpenses()
  return NextResponse.json(expenses)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(expenseCreateSchema, body)
  if (error) return error

  try {
    const expense = await db.createExpense({
      category: data.category,
      amount: data.amount,
      currency: data.currency ?? 'USD',
      date: data.date ?? new Date().toISOString().split('T')[0],
      description: data.description,
      receiptLink: data.receiptLink,
    })
    await emit('expense.recorded', { expenseId: expense.id }, 'api/expenses')
    return NextResponse.json(expense, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})
