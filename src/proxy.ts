import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export async function proxy(request: Request) {
  const session = await auth()
  if (!session) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)'],
}
