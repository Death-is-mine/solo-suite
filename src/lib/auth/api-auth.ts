import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export interface AuthSession {
  userId: string
  workspaceId: string
  role: 'owner' | 'admin' | 'member' | 'client'
}

export async function requireAuth(): Promise<
  | { session: AuthSession; error?: never }
  | { session?: never; error: NextResponse }
> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }
  return {
    session: {
      userId: session.user.id,
      workspaceId: session.user.workspaceId ?? session.user.id,
      role: (session.user.role as AuthSession['role']) ?? 'owner',
    },
  }
}

export function requireRole(
  session: AuthSession,
  ...allowed: AuthSession['role'][]
): NextResponse | null {
  if (!allowed.includes(session.role)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
  return null
}
