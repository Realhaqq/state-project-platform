import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "./db"
import type { User } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        passcode: { label: "Publisher Passcode", type: "text", required: false },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if user exists
          const users = await sql`
            SELECT id, name, phone, password, role, lga_id, ward_id, is_active, email_verified, created_at, updated_at 
            FROM users WHERE email = ${credentials.email} AND is_active = true
          `

          if (users.length === 0) {
            return null
          }

          const user = users[0] as User

          // Check if user has a password (for backward compatibility)
          if (!user.password) {
            // For users without passwords, use the old hardcoded check temporarily
            // This should be removed once all users have proper hashed passwords
            if (credentials.password !== "password123") {
              return null
            }
          } else {
            // Verify password using bcrypt
            const isValidPassword = await bcrypt.compare(credentials.password, user.password)
            if (!isValidPassword) {
              return null
            }
          }

          // If passcode is provided, validate it and potentially elevate to publisher
          if (credentials.passcode) {
            const passcodes = await sql`
              SELECT * FROM publisher_passcodes 
              WHERE passcode = ${credentials.passcode} 
              AND is_active = true 
              AND (expires_at IS NULL OR expires_at > NOW())
              AND current_uses < max_uses
            `

            if (passcodes.length > 0) {
              const passcode = passcodes[0] as any

              // Update user role to publisher
              await sql`
                UPDATE users 
                SET role = 'publisher', lga_id = ${passcode.lga_id}, ward_id = ${passcode.ward_id}
                WHERE id = ${user.id}
              `

              // Increment passcode usage
              await sql`
                UPDATE publisher_passcodes 
                SET current_uses = current_uses + 1
                WHERE id = ${passcode.id}
              `

              user.role = "publisher"
              user.lga_id = passcode.lga_id
              user.ward_id = passcode.ward_id
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            lga_id: user.lga_id,
            ward_id: user.ward_id,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.lga_id = (user as any).lga_id
        token.ward_id = (user as any).ward_id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).lga_id = token.lga_id
        ;(session.user as any).ward_id = token.ward_id
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
}
