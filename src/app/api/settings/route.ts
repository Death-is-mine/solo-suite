import { db } from '@/lib/database'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key query param required' }, { status: 400 })
  const value = await db.getSetting(key)
  return NextResponse.json({ value })
}

export async function PUT(req: Request) {
  const { key, value } = await req.json()
  if (!key || value === undefined) return NextResponse.json({ error: 'key and value required' }, { status: 400 })
  try {
    await db.setSetting(key, value)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to set setting' }, { status: 500 })
  }
}
