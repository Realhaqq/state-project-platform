import { type NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"
import { commentRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

const sql = neon(process.env.DATABASE_URL!)

const commentSchema = z.object({
  projectId: z.string().uuid(),
  authorName: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  captchaToken: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitCheck = await commentRateLimit(request)
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.error!
    }

    const body = await request.json()
    const { projectId, authorName, content, captchaToken } = commentSchema.parse(body)

    // Verify captcha
    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: captchaToken,
      }),
    })

    const captchaResult = await captchaResponse.json()
    if (!captchaResult.success) {
      return new Response("Captcha verification failed", { status: 400 })
    }

    // Insert comment
    await sql`
      INSERT INTO comments (id, project_id, author_name, content, approval_status, is_active, is_approved, is_flagged)
      VALUES (gen_random_uuid(), ${projectId}, ${authorName}, ${content}, 'pending', true, false, false)
    `

    return new Response("Comment submitted for moderation", { status: 201 })
  } catch (error) {
    console.error("Comment submission error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
