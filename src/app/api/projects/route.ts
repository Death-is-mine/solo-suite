import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { projectCreateSchema, projectUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const projects = await db.getProjects()
  return NextResponse.json(projects)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(projectCreateSchema, body)
  if (error) return error

  try {
    const project = await db.createProject({
      clientId: data.clientId,
      name: data.name,
      status: data.status ?? 'Planning',
      startDate: data.startDate,
      endDate: data.endDate,
      agreementId: data.agreementId,
    })
    return NextResponse.json(project, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(projectUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const project = await db.updateProject(id, updateData)
    if (updateData.status === 'Completed') {
      await emit('project.completed', { projectId: id, clientId: project.clientId }, 'api/projects')
    }
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
