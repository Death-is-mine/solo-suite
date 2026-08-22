import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateBody, parseJsonBody } from '@/lib/api/validate'
import { reviewCreateSchema, reviewUpdateSchema } from '@/lib/api/schemas'
import { withAuth } from '@/lib/api/with-auth'
import { handleApiError } from '@/lib/api/errors'

export const GET = withAuth(async (_req, session) => {
  const reviews = await db.getReviews()
  return NextResponse.json(reviews)
})

export const POST = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(reviewCreateSchema, body)
  if (error) return error

  try {
    const review = await db.createReview({
      clientId: data.clientId,
      projectId: data.projectId,
      rating: data.rating,
      content: data.content,
      status: data.status ?? 'Pending',
    })
    return NextResponse.json(review, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
})

export const PUT = withAuth(async (request, session) => {
  const { body, error: jsonError } = await parseJsonBody(request)
  if (jsonError) return jsonError

  const { data, error } = validateBody(reviewUpdateSchema, body)
  if (error) return error

  const { id, ...updateData } = data
  try {
    const review = await db.updateReview(id, updateData)
    return NextResponse.json(review)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
})
