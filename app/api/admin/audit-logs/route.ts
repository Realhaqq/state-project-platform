import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !["admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const action = searchParams.get("action")
    const entity = searchParams.get("entity")
    const search = searchParams.get("search")
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (action && action !== "all") {
      whereClause += ` AND al.action = $${params.length + 1}`
      params.push(action)
    }

    if (entity && entity !== "all") {
      whereClause += ` AND al.entity = $${params.length + 1}`
      params.push(entity)
    }

    if (search) {
      whereClause += ` AND (al.action ILIKE $${params.length + 1} OR u.name ILIKE $${params.length + 1} OR al.meta::text ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    const logs = await sql`
      SELECT 
        al.id,
        al.action,
        al.entity,
        al.entity_id,
        al.meta,
        al.created_at,
        u.id as user_id,
        u.name as user_name,
        u.role as user_role,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      ${sql.unsafe(whereClause)}
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [{ count }] = await sql`
      SELECT COUNT(*) as count
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      ${sql.unsafe(whereClause)}
    `

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entity,
        entityId: log.entity_id,
        userId: log.user_id,
        userName: log.user_name || "System",
        userRole: log.user_role || "system",
        userEmail: log.user_email,
        details: typeof log.meta === "object" ? JSON.stringify(log.meta) : log.meta || "",
        ipAddress: log.meta?.ip_address || "Unknown",
        userAgent: log.meta?.user_agent || "Unknown",
        createdAt: log.created_at,
      })),
      pagination: {
        page,
        limit,
        total: Number.parseInt(count),
        pages: Math.ceil(Number.parseInt(count) / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch audit logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
