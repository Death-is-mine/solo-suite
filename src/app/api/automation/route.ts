import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { automationRuleCreateSchema, automationRuleUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const rules = await db.getAutomationRules()
  return NextResponse.json(rules)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(automationRuleCreateSchema, body)
  if (error) return error

  try {
    const rule = await db.createAutomationRule({
      name: data.name,
      trigger: data.trigger,
      action: data.action,
      config: data.config ?? '{}',
      status: data.status ?? 'Active',
    })
    return NextResponse.json(rule, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(automationRuleUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const rule = await db.updateAutomationRule(id, updateData)
    return NextResponse.json(rule)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
