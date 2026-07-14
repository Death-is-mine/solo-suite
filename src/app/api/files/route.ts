import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const files = await db.getFiles(projectId)
  return NextResponse.json(files)
}

export async function POST(request: Request) {
  const body = await request.json()
  const file = await db.createFile({
    projectId: body.projectId,
    name: body.name,
    type: body.type,
    size: body.size ?? 0,
    url: body.url,
    uploadedBy: body.uploadedBy,
  })
  return NextResponse.json(file, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await db.deleteFile(id)
  return NextResponse.json({ success: true })
}
