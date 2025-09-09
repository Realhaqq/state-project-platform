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

    // Get pending projects (projects that are not approved yet)
    const pendingProjects = await sql`
      SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.status,
        p.approval_status,
        p.created_at,
        p.updated_at,
        ROUND(p.budget_naira::numeric, 2) as budget_naira,
        p.contractor,
        p.start_date,
        p.end_date,
        p.completion_percentage,
        u.name as creator_name,
        u.email as creator_email,
        l.name as lga_name,
        w.name as ward_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'storage_path', pi.storage_path,
              'caption', pi.caption,
              'sort_order', pi.sort_order,
              'created_at', pi.created_at
            ) ORDER BY pi.sort_order
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) as images
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.approval_status = 'pending'
      GROUP BY p.id, u.name, u.email, l.name, w.name
      ORDER BY p.created_at DESC
    `

    return NextResponse.json({
      projects: pendingProjects,
      total: pendingProjects.length
    })
  } catch (error) {
    console.error("Failed to fetch pending projects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
