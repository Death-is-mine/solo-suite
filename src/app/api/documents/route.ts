import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const documents = await db.getDocuments(projectId)
  return NextResponse.json(documents)
}

export async function POST(request: Request) {
  const body = await request.json()
  const document = await db.createDocument({
    projectId: body.projectId,
    title: body.title ?? 'Untitled',
    content: body.content ?? '',
    type: body.type ?? 'Doc',
  })
  return NextResponse.json(document, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  try {
    const document = await db.updateDocument(id, data)
    return NextResponse.json(document)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
