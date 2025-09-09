import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get project statistics
    const [projectStats] = await sql`
      SELECT
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing_projects,
        COUNT(CASE WHEN status = 'planned' OR status = 'pending' THEN 1 END) as planned_projects
      FROM projects
      WHERE approval_status = 'approved'
    `

    // Get geographic statistics
    const [geoStats] = await sql`
      SELECT
        (SELECT COUNT(*) FROM lgas) as total_lgas,
        (SELECT COUNT(*) FROM wards) as total_wards,
        (SELECT COUNT(DISTINCT lga_id) FROM projects WHERE approval_status = 'approved') as lgas_with_projects,
        (SELECT COUNT(DISTINCT ward_id) FROM projects WHERE approval_status = 'approved') as wards_with_projects
    `

    // Get user statistics
    const [userStats] = await sql`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'publisher' THEN 1 END) as total_publishers,
        COUNT(CASE WHEN role = 'admin' OR role = 'super_admin' THEN 1 END) as total_admins
      FROM users
    `

    // Get engagement statistics
    const [engagementStats] = await sql`
      SELECT
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM reports) as total_reports,
        (SELECT COUNT(*) FROM subscriptions) as total_subscriptions
    `

    const statistics = {
      projects: {
        total: Number(projectStats.total_projects) || 0,
        completed: Number(projectStats.completed_projects) || 0,
  ongoing: Number(projectStats.ongoing_projects) || 0,
  planned: Number(projectStats.planned_projects) || 0
      },
      geography: {
        totalLgas: Number(geoStats.total_lgas) || 0,
        totalWards: Number(geoStats.total_wards) || 0,
        lgasWithProjects: Number(geoStats.lgas_with_projects) || 0,
        wardsWithProjects: Number(geoStats.wards_with_projects) || 0
      },
      users: {
        total: Number(userStats.total_users) || 0,
        publishers: Number(userStats.total_publishers) || 0,
        admins: Number(userStats.total_admins) || 0
      },
      engagement: {
        comments: Number(engagementStats.total_comments) || 0,
        reports: Number(engagementStats.total_reports) || 0,
        subscriptions: Number(engagementStats.total_subscriptions) || 0
      }
    }

    return NextResponse.json({
      success: true,
      statistics
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics", code: "DATABASE_ERROR" },
      { status: 500 }
    )
  }
}
