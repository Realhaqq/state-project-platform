import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/email"

export const runtime = "edge"

const sql = neon(process.env.DATABASE_URL!)

const subscriptionSchema = z.object({
  fullName: z.string().min(1).max(100),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid(),
  pollingUnitId: z.string().uuid(),
  address: z.string().optional(),
  phoneWhatsapp: z.string().optional(),
  phoneCall: z.string().min(1),
  email: z.string().email(),
  traits: z.array(z.string()),
  captchaToken: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || "unknown"
    const rateLimitKey = `subscription:${ip}`

    const [rateLimit] = await sql`
      SELECT count FROM rate_limits 
      WHERE key = ${rateLimitKey} 
      AND window_starts_at > NOW() - INTERVAL '1 hour'
    `

    if (rateLimit && rateLimit.count >= 3) {
      return new Response("Rate limit exceeded", { status: 429 })
    }

    const body = await request.json()
    const { fullName, lgaId, wardId, pollingUnitId, address, phoneWhatsapp, phoneCall, email, traits, captchaToken } =
      subscriptionSchema.parse(body)

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

    // Check for existing subscription by email or phone
    const existing = await sql`
      SELECT id FROM subscriptions 
      WHERE email = ${email} OR phone_call = ${phoneCall}
    `

    if (existing.length > 0) {
      return new Response("Subscription already exists with this email or phone", { status: 409 })
    }

    // Insert subscription
    const [subscription] = await sql`
      INSERT INTO subscriptions (
        id,
        full_name, lga_id, ward_id, polling_unit_id, address, 
        phone_whatsapp, phone_call, email, traits, status
      )
      VALUES (
        gen_random_uuid(),
        ${fullName}, ${lgaId}, ${wardId}, ${pollingUnitId}, ${address},
        ${phoneWhatsapp}, ${phoneCall}, ${email}, ${JSON.stringify(traits)}, 'active'
      )
      RETURNING *
    `

    // Update rate limit
    await sql`
      INSERT INTO rate_limits (id, key, window_starts_at, count)
      VALUES (gen_random_uuid(), ${rateLimitKey}, NOW(), 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE 
          WHEN rate_limits.window_starts_at < NOW() - INTERVAL '1 hour' 
          THEN 1 
          ELSE rate_limits.count + 1 
        END,
        window_starts_at = CASE 
          WHEN rate_limits.window_starts_at < NOW() - INTERVAL '1 hour' 
          THEN NOW() 
          ELSE rate_limits.window_starts_at 
        END
    `

    // Send welcome email
    try {
      await sendWelcomeEmail(email, fullName)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Continue with success response even if email fails
    }

    return new Response(
      JSON.stringify({
        message: "Subscription created successfully",
        id: subscription.id,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Subscription creation error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
