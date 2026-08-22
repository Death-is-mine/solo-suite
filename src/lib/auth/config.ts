import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      workspaceId: string
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = token.role ?? 'owner'
        token.workspaceId = token.workspaceId ?? user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.role = (token.role as string) ?? 'owner'
        session.user.workspaceId = (token.workspaceId as string) ?? token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
