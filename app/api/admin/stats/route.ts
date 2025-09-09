import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user statistics
    const userStats = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'citizen' THEN 1 END) as citizens,
        COUNT(CASE WHEN role = 'publisher' THEN 1 END) as publishers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users
    `

    // Get project statistics
    const projectStats = await sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_projects,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_projects,
        COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned_projects,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
      FROM projects
    `

    // Get report statistics
    const reportStats = await sql`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_reports,
        COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_reports
      FROM reports
    `

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

    const stats = {
      totalUsers: Number.parseInt(userStats[0].total_users),
      totalProjects: Number.parseInt(projectStats[0].total_projects),
      approvedProjects: Number.parseInt(projectStats[0].approved_projects),
      pendingProjects: Number.parseInt(projectStats[0].pending_projects),
      totalReports: Number.parseInt(reportStats[0].total_reports),
      pendingReports: Number.parseInt(reportStats[0].new_reports),
      usersByRole: {
        citizen: Number.parseInt(userStats[0].citizens),
        publisher: Number.parseInt(userStats[0].publishers),
        admin: Number.parseInt(userStats[0].admins),
      },
      projectsByStatus: {
        pending: Number.parseInt(projectStats[0].pending_projects),
        planned: Number.parseInt(projectStats[0].planned_projects),
        ongoing: Number.parseInt(projectStats[0].ongoing_projects),
        completed: Number.parseInt(projectStats[0].completed_projects),
      },
      reportsByStatus: {
        new: Number.parseInt(reportStats[0].new_reports),
        inReview: Number.parseInt(reportStats[0].in_review_reports),
        resolved: Number.parseInt(reportStats[0].resolved_reports),
        rejected: Number.parseInt(reportStats[0].rejected_reports),
      },
      recentActivity: recentActivity,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
