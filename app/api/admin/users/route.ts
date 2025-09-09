import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all users with their details
    const users = await sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        u.email_verified,
        u.created_at,
        u.updated_at,
        l.name as lga_name,
        w.name as ward_name,
        COUNT(p.id) as total_projects,
        COUNT(CASE WHEN p.approval_status = 'approved' THEN 1 END) as approved_projects
      FROM users u
      LEFT JOIN lgas l ON u.lga_id = l.id
      LEFT JOIN wards w ON u.ward_id = w.id
      LEFT JOIN projects p ON u.id = p.created_by
      GROUP BY u.id, l.name, w.name
      ORDER BY u.created_at DESC
    `

    // Get user statistics
    const userStats = await sql`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'citizen' THEN 1 END) as citizens,
        COUNT(CASE WHEN role = 'publisher' THEN 1 END) as publishers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
      FROM users
    `

    return NextResponse.json({
      users,
      stats: userStats[0],
      total: users.length
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
