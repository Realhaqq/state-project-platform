import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "publisher" && (session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any

    // Get publisher statistics
    const stats = await sql`
      SELECT
        COUNT(*) as total_projects,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as published_projects,
        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_approval,
        COUNT(CASE WHEN status = 'ongoing' AND approval_status = 'approved' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' AND approval_status = 'approved' THEN 1 END) as completed,
        COALESCE(SUM(CASE WHEN approval_status = 'approved' THEN budget_naira END), 0) as total_budget,
        COALESCE(AVG(CASE WHEN approval_status = 'approved' THEN budget_naira END), 0) as avg_budget
      FROM projects
      WHERE created_by = ${user.id}
    `

    // Get recent projects
    const recentProjects = await sql`
      SELECT
        p.id,
        p.title,
        p.status,
        p.approval_status,
        p.created_at,
        p.budget_naira,
        COUNT(c.id) as comment_count
      FROM projects p
      LEFT JOIN comments c ON p.id = c.project_id AND c.approval_status = 'approved'
      WHERE p.created_by = ${user.id}
      GROUP BY p.id, p.title, p.status, p.approval_status, p.created_at, p.budget_naira
      ORDER BY p.created_at DESC
      LIMIT 5
    `

    // Get monthly project submissions
    const monthlyStats = await sql`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM projects
      WHERE created_by = ${user.id}
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `

    return NextResponse.json({
      stats: stats[0],
      recentProjects,
      monthlyStats
    })
  } catch (error) {
    console.error("Failed to fetch publisher analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
