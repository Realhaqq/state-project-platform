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

    // Get all reports with their details
    const reports = await sql`
      SELECT
        r.id,
        r.message as title,
        r.description,
        r.status,
        r.created_at,
        r.resolved_at,
        r.report_type,
        p.title as project_title,
        p.id as project_id,
        COALESCE(r.reporter_name, u.name) as reporter_name,
        COALESCE(r.reporter_email, u.email) as reporter_email,
        ru.name as resolver_name,
        l.name as lga_name,
        w.name as ward_name
      FROM reports r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN users ru ON r.resolved_by = ru.id
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      ORDER BY r.created_at DESC
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

    return NextResponse.json({
      reports,
      stats: reportStats[0],
      total: reports.length
    })
  } catch (error) {
    console.error("Failed to fetch reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
