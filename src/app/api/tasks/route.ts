import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { taskCreateSchema, taskUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (request, session) => {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const tasks = await db.getTasks(projectId)
  return NextResponse.json(tasks)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(taskCreateSchema, body)
  if (error) return error

  try {
    const task = await db.createTask({
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status ?? 'Backlog',
      priority: data.priority ?? 'Medium',
      assignee: data.assignee,
      dueDate: data.dueDate,
    })
    return NextResponse.json(task, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(taskUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const task = await db.updateTask(id, updateData)
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
