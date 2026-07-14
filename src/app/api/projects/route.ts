import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emit } from '@/lib/event-bus'

export async function GET() {
  const projects = await db.getProjects()
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const body = await request.json()
  const project = await db.createProject({
    clientId: body.clientId,
    name: body.name,
    status: body.status ?? 'Planning',
    startDate: body.startDate,
    endDate: body.endDate,
    agreementId: body.agreementId,
  })
  return NextResponse.json(project, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  try {
    const project = await db.updateProject(id, data)
    if (data.status === 'Completed') {
      await emit('project.completed', { projectId: id, clientId: project.clientId }, 'api/projects')
    }
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
