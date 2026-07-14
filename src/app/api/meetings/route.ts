import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const meetings = await db.getMeetings(projectId)
  return NextResponse.json(meetings)
}

export async function POST(request: Request) {
  const body = await request.json()
  const meeting = await db.createMeeting({
    projectId: body.projectId,
    title: body.title,
    date: body.date,
    duration: body.duration ?? 30,
    attendees: body.attendees,
    notes: body.notes,
    recordingLink: body.recordingLink,
  })
  return NextResponse.json(meeting, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  try {
    const meeting = await db.updateMeeting(id, data)
    return NextResponse.json(meeting)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
