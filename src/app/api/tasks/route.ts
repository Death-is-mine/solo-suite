import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const tasks = await db.getTasks(projectId)
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const task = await db.createTask({
    projectId: body.projectId,
    title: body.title,
    description: body.description,
    status: body.status ?? 'Backlog',
    priority: body.priority ?? 'Medium',
    assignee: body.assignee,
    dueDate: body.dueDate,
  })
  return NextResponse.json(task, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  try {
    const task = await db.updateTask(id, data)
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
