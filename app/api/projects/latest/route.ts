import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const projects = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.status as project_status,
        p.approval_status as status,
        p.completion_percentage,
        ROUND(p.budget_naira::numeric, 2) as budget,
        p.start_date,
        l.name as lga_name,
        w.name as ward_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pi.id,
              'storage_path', pi.storage_path,
              'caption', pi.caption,
              'sort_order', pi.sort_order
            ) ORDER BY pi.sort_order
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) as images
      FROM projects p
      JOIN lgas l ON p.lga_id = l.id
      JOIN wards w ON p.ward_id = w.id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.approval_status = 'approved'
      GROUP BY p.id, l.name, w.name
      ORDER BY p.created_at DESC
      LIMIT 6
    `

    return NextResponse.json({
      success: true,
      projects: projects,
    })
  } catch (error) {
    console.error("Error fetching latest projects:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 })
  }
}
