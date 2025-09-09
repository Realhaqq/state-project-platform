import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sql } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

const requestSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = requestSchema.parse(body)

    // Check if user exists
    const users = await sql`
      SELECT id, email, name, email_verified
      FROM users
      WHERE email = ${email} AND is_active = true
    `

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: "If an account with this email exists, a password reset link has been sent."
      })
    }

    const user = users[0]

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in database
    await sql`
      UPDATE users
      SET reset_token = ${resetToken}, reset_token_expiry = ${resetTokenExpiry}
      WHERE id = ${user.id}
    `

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken)

    return NextResponse.json({
      message: "If an account with this email exists, a password reset link has been sent."
    })

  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}
