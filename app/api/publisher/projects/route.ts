import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "publisher" && (session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const approvalStatus = searchParams.get("approval_status")

    // Build the query with proper parameterization
    let query = sql`
      SELECT
        p.id,
        p.title,
        p.description,
        p.status,
        p.approval_status,
        p.budget_naira,
        p.contractor,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        l.name as lga_name,
        w.name as ward_name,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT pi.id) as image_count
      FROM projects p
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LEFT JOIN comments c ON p.id = c.project_id AND c.approval_status = 'approved'
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.created_by = ${user.id}
    `

    // Add additional filters if provided
    if (status) {
      query = sql`${query} AND p.status = ${status}`
    }

    if (approvalStatus) {
      query = sql`${query} AND p.approval_status = ${approvalStatus}`
    }

    query = sql`${query}
      GROUP BY p.id, p.title, p.description, p.status, p.approval_status, p.budget_naira,
               p.contractor, p.start_date, p.end_date, p.created_at, p.updated_at,
               l.name, w.name
      ORDER BY p.created_at DESC
    `

    // Get projects with stats
    const projects = await query

    // Get project statistics
    const projectStats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM projects
      WHERE created_by = ${user.id}
    `

    return NextResponse.json({
      projects,
      stats: projectStats[0]
    })
  } catch (error) {
    console.error("Failed to fetch publisher projects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
