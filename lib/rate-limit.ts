import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyPrefix: string // Prefix for the rate limit key
}

export interface RateLimitResult {
  allowed: boolean
  remainingRequests: number
  resetTime: Date
  currentCount: number
}

/**
 * Check and update rate limit for a given key
 */
export async function checkRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyPrefix } = options
  const rateLimitKey = `${keyPrefix}:${key}`

  try {
    // Get current rate limit data
    const [rateLimit] = await sql`
      SELECT count, window_starts_at
      FROM rate_limits
      WHERE key = ${rateLimitKey}
      AND window_starts_at > NOW() - INTERVAL '${windowMs} milliseconds'
    `

    const now = new Date()
    const windowStart = rateLimit?.window_starts_at ? new Date(rateLimit.window_starts_at) : now
    const timeSinceWindowStart = now.getTime() - windowStart.getTime()

    let currentCount = rateLimit?.count || 0
    let newWindowStart = windowStart

    // If window has expired, reset counter
    if (timeSinceWindowStart >= windowMs) {
      currentCount = 0
      newWindowStart = now
    }

    const allowed = currentCount < maxRequests
    const remainingRequests = Math.max(0, maxRequests - currentCount - 1)
    const resetTime = new Date(newWindowStart.getTime() + windowMs)

    if (allowed) {
      // Increment counter
      await sql`
        INSERT INTO rate_limits (key, window_starts_at, count)
        VALUES (${rateLimitKey}, ${newWindowStart.toISOString()}, 1)
        ON CONFLICT (key) DO UPDATE SET
          count = CASE
            WHEN rate_limits.window_starts_at < ${newWindowStart.toISOString()}
            THEN 1
            ELSE rate_limits.count + 1
          END,
          window_starts_at = CASE
            WHEN rate_limits.window_starts_at < ${newWindowStart.toISOString()}
            THEN ${newWindowStart.toISOString()}
            ELSE rate_limits.window_starts_at
          END
      `
      currentCount++
    }

    return {
      allowed,
      remainingRequests,
      resetTime,
      currentCount
    }
  } catch (error) {
    console.error("Rate limiting error:", error)
    // On error, allow the request to proceed (fail open)
    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime: new Date(Date.now() + windowMs),
      currentCount: 0
    }
  }
}

/**
 * Create rate limit middleware for API routes
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async (request: Request): Promise<{ allowed: boolean; error?: Response }> => {
    const ip = request.headers.get("x-forwarded-for") ||
               request.headers.get("x-real-ip") ||
               "unknown"

    const result = await checkRateLimit(ip, options)

    if (!result.allowed) {
      return {
        allowed: false,
        error: new Response(
          JSON.stringify({
            error: "Rate limit exceeded",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
            limit: options.maxRequests,
            remaining: 0
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString(),
              "X-RateLimit-Limit": options.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": result.resetTime.getTime().toString()
            }
          }
        )
      }
    }

    return { allowed: true }
  }
}

// Pre-configured rate limiters for common use cases
export const commentRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  keyPrefix: "comment"
})

export const reportRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  keyPrefix: "report"
})

export const subscriptionRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyPrefix: "subscription"
})

export const projectCreationRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  keyPrefix: "project_create"
})
