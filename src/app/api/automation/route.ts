import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  const rules = await db.getAutomationRules()
  return NextResponse.json(rules)
}

export async function POST(request: Request) {
  const body = await request.json()
  const rule = await db.createAutomationRule({
    name: body.name,
    trigger: body.trigger,
    action: body.action,
    config: body.config ?? '{}',
    status: 'Active',
  })
  return NextResponse.json(rule, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  try {
    const rule = await db.updateAutomationRule(id, data)
    return NextResponse.json(rule)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
