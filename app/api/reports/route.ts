import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"

export const runtime = "nodejs"

const sql = neon(process.env.DATABASE_URL!)

const reportSchema = z.object({
  projectId: z.string().uuid(),
  reporterName: z.string().min(1).max(100).optional(),
  reporterEmail: z.string().email().optional(),
  reporterPhone: z.string().optional(),
  message: z.string().min(1).max(1000),
  captchaToken: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !["admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    if (status && status !== "all") {
      whereClause += ` AND r.status = '${status}'`
    }

    const reports = await sql`
      SELECT 
        r.*,
        p.title as project_title,
        l.name as lga_name,
        w.name as ward_name
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      JOIN lgas l ON p.lga_id = l.id
      JOIN wards w ON p.ward_id = w.id
      ${sql.unsafe(whereClause)}
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM reports r
      ${sql.unsafe(whereClause)}
    `

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total: Number.parseInt(count),
        pages: Math.ceil(Number.parseInt(count) / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || "unknown"
    const rateLimitKey = `report:${ip}`

    const [rateLimit] = await sql`
      SELECT count FROM rate_limits 
      WHERE key = ${rateLimitKey} 
      AND window_starts_at > NOW() - INTERVAL '1 hour'
    `

    if (rateLimit && rateLimit.count >= 5) {
      return new Response("Rate limit exceeded", { status: 429 })
    }

    const body = await request.json()
    const { projectId, reporterName, reporterEmail, reporterPhone, message, captchaToken } = reportSchema.parse(body)

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

    // Insert report
    const [report] = await sql`
      INSERT INTO reports (
        id,
        project_id, reporter_name, reporter_email, reporter_phone, message, status, 
        report_type, description, is_resolved
      )
      VALUES (
        gen_random_uuid(),
        ${projectId}, ${reporterName}, ${reporterEmail}, ${reporterPhone}, ${message}, 'new',
        'other', ${message}, false
      )
      RETURNING *
    `

    // Log the action
    await sql`
      INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, meta, created_at)
      VALUES (gen_random_uuid(), NULL, 'create', 'report', ${report.id}, ${JSON.stringify({
        project_id: projectId,
        reporter_name: reporterName,
        ip_address: ip,
      })}, NOW())
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

    return new Response(
      JSON.stringify({
        message: "Report submitted successfully",
        id: report.id,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Report submission error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
