import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

interface RateLimitOptions {
  key: string
  limit: number
  window: number // in seconds
}

export async function checkRateLimit({ key, limit, window }: RateLimitOptions) {
  const now = new Date()
  const windowStart = new Date(now.getTime() - window * 1000)

  try {
    // Clean up old entries
    await sql`
      DELETE FROM rate_limits 
      WHERE window_starts_at < ${windowStart}
    `

    // Get current count for this key
    const [existing] = await sql`
      SELECT count, window_starts_at 
      FROM rate_limits 
      WHERE key = ${key} 
      AND window_starts_at >= ${windowStart}
    `

    if (existing) {
      if (existing.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(existing.window_starts_at.getTime() + window * 1000),
        }
      }

      // Increment count
      await sql`
        UPDATE rate_limits 
        SET count = count + 1 
        WHERE key = ${key} 
        AND window_starts_at >= ${windowStart}
      `

      return {
        allowed: true,
        remaining: limit - existing.count - 1,
        resetTime: new Date(existing.window_starts_at.getTime() + window * 1000),
      }
    } else {
      // Create new entry
      await sql`
        INSERT INTO rate_limits (id, key, window_starts_at, count)
        VALUES (gen_random_uuid(), ${key}, ${now}, 1)
      `

      return { allowed: true, remaining: limit - 1, resetTime: new Date(now.getTime() + window * 1000) }
    }
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // Allow request if rate limiting fails
    return { allowed: true, remaining: limit, resetTime: new Date(now.getTime() + window * 1000) }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, limit = 10, window = 60 } = await request.json()

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    const result = await checkRateLimit({ key, limit, window })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Rate limit check failed" }, { status: 500 })
  }
}
