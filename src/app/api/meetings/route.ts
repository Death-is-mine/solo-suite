import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { meetingCreateSchema, meetingUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (request, session) => {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const meetings = await db.getMeetings(projectId)
  return NextResponse.json(meetings)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(meetingCreateSchema, body)
  if (error) return error

  try {
    const meeting = await db.createMeeting({
      projectId: data.projectId,
      title: data.title,
      date: data.date,
      duration: data.duration ?? 30,
      attendees: data.attendees,
      notes: data.notes,
      recordingLink: data.recordingLink,
    })
    return NextResponse.json(meeting, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(meetingUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const meeting = await db.updateMeeting(id, updateData)
    return NextResponse.json(meeting)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
