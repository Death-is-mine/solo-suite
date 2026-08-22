import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth, type AuthSession } from '@/lib/auth/api-auth'
import { withContext } from '@/lib/workspace-context'

type NextRouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

type AuthenticatedHandler = (
  request: NextRequest,
  session: AuthSession,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function withAuth(handler: AuthenticatedHandler): NextRouteHandler {
  return async (request, context) => {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error

    const { session } = authResult

    return withContext(
      {
        userId: session.userId,
        workspaceId: session.workspaceId,
        role: session.role,
      },
      () => handler(request, session, context)
    )
  }
}
