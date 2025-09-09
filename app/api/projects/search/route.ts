import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const lga = searchParams.get("lga") || ""
    const ward = searchParams.get("ward") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""

    const projects = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        ROUND(p.budget_naira::numeric, 2) as budget,
        p.status as project_status,
        p.start_date,
        p.end_date as expected_completion,
        l.name as lga_name,
        w.name as ward_name,
        u.name as publisher_name,
        p.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pi.id,
              'storage_path', pi.storage_path,
              'caption', pi.caption,
              'sort_order', pi.sort_order
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images
      FROM projects p
      JOIN lgas l ON p.lga_id = l.id
      JOIN wards w ON p.ward_id = w.id
      JOIN users u ON p.created_by = u.id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.approval_status = 'approved'
      ${query ? sql`AND (p.title ILIKE ${`%${query}%`} OR p.description ILIKE ${`%${query}%`})` : sql``}
      ${lga ? sql`AND p.lga_id = ${lga}` : sql``}
      ${ward ? sql`AND p.ward_id = ${ward}` : sql``}
      ${category ? sql`AND p.category = ${category}` : sql``}
      ${status && status !== 'all' ? sql`AND p.status = ${status}` : sql``}
      GROUP BY p.id, l.name, w.name, u.name
      ORDER BY p.created_at DESC
      LIMIT 50
    `

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Failed to search projects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
