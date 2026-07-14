import { auth } from '@/lib/auth/config'

const handler = auth as unknown as (request: Request) => Response | Promise<Response>

export function proxy(request: Request) {
  return handler(request)
}

export const config = {
  matcher: ['/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)'],
}
