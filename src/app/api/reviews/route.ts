import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  const reviews = await db.getReviews()
  return NextResponse.json(reviews)
}

export async function POST(request: Request) {
  const body = await request.json()
  const review = await db.createReview({
    clientId: body.clientId,
    projectId: body.projectId,
    rating: body.rating,
    content: body.content,
    status: 'Pending',
  })
  return NextResponse.json(review, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  const review = await db.updateReview(id, data)
  return NextResponse.json(review)
}
