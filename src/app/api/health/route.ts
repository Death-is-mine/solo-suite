import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { getAllCounters } from '@/lib/observability'

// ponytail: health check with observability counters

export const GET = withAuth(async () => {
  const counters = getAllCounters()
  return NextResponse.json({
    status: 'ok',
    uptime: process.uptime(),
    counters,
    timestamp: new Date().toISOString(),
  })
})
