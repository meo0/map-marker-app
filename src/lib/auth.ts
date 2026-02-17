import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { isMemberEmail } from "@/lib/member-whitelist"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return true

      if (isMemberEmail(user.email)) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } })
        if (dbUser && dbUser.role === "user") {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "member" },
          })
        }
      }

      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user as { role?: string }).role || "user"
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
