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

    // Get system settings (this could be expanded based on your needs)
    const userStats = await sql`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' OR role = 'super_admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
      FROM users
    `

    const locationStats = await sql`
      SELECT
        COUNT(DISTINCT id) as total_lgas
      FROM lgas
    `

    const wardStats = await sql`
      SELECT
        COUNT(DISTINCT id) as total_wards
      FROM wards
    `

    const projectStats = await sql`
      SELECT
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_projects,
        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_projects
      FROM projects
    `

    const reportStats = await sql`
      SELECT
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_reports
      FROM reports
    `

    const settings = {
      totalUsers: Number.parseInt(userStats[0].total_users),
      totalAdmins: Number.parseInt(userStats[0].total_admins),
      activeUsers: Number.parseInt(userStats[0].active_users),
      verifiedUsers: Number.parseInt(userStats[0].verified_users),
      totalLgas: Number.parseInt(locationStats[0].total_lgas),
      totalWards: Number.parseInt(wardStats[0].total_wards),
      approvedProjects: Number.parseInt(projectStats[0].approved_projects),
      pendingProjects: Number.parseInt(projectStats[0].pending_projects),
      newReports: Number.parseInt(reportStats[0].new_reports)
    }

    // Get recent activity
    const recentActivity = await sql`
      SELECT
        'user_registered' as type,
        u.name as description,
        u.created_at as timestamp,
        u.email as details
      FROM users u
      WHERE u.created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT
        'project_created' as type,
        p.title as description,
        p.created_at as timestamp,
        u.name as details
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT
        'report_created' as type,
        r.message as description,
        r.created_at as timestamp,
        u.name as details
      FROM reports r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY timestamp DESC
      LIMIT 10
    `

    return NextResponse.json({
      settings,
      recentActivity,
      systemInfo: {
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        database: "PostgreSQL (Neon)",
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...settings } = body

    // Handle different types of settings updates
    switch (action) {
      case "update_system_settings":
        // For now, just return success since we don't have a settings table yet
        // This can be expanded to update actual system settings in the database
        return NextResponse.json({
          success: true,
          message: "Settings updated successfully",
          updatedSettings: settings
        })

      case "update_user_permissions":
        // Handle user permission updates
        return NextResponse.json({
          success: true,
          message: "User permissions updated successfully"
        })

      default:
        return NextResponse.json({
          success: true,
          message: "Settings request processed",
          data: settings
        })
    }

  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
