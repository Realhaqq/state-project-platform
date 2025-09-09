import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const approvalStatus = searchParams.get("approval_status") || "all"
    const projectStatus = searchParams.get("project_status") || "all"
    const search = searchParams.get("search") || ""
    const lga = searchParams.get("lga") || ""
    const ward = searchParams.get("ward") || ""
    const category = searchParams.get("category") || ""

    const offset = (page - 1) * limit

    // Build the query with parameterized conditions
    let conditions: any[] = []

    if (approvalStatus && approvalStatus !== "all") {
      conditions.push(sql`p.approval_status = ${approvalStatus}`)
    }

    if (projectStatus && projectStatus !== "all") {
      conditions.push(sql`p.status = ${projectStatus}`)
    }

    if (search) {
      conditions.push(sql`(p.title ILIKE ${'%' + search + '%'} OR p.description ILIKE ${'%' + search + '%'})`)
    }

    if (lga) {
      conditions.push(sql`p.lga_id = ${lga}`)
    }

    if (ward) {
      conditions.push(sql`p.ward_id = ${ward}`)
    }

    if (category && category !== "all") {
      conditions.push(sql`p.category = ${category}`)
    }

    // Build the WHERE clause from conditions
    let whereSql = sql``
    if (conditions.length > 0) {
      whereSql = conditions[0]
      for (let i = 1; i < conditions.length; i++) {
        whereSql = sql`${whereSql} AND ${conditions[i]}`
      }
      whereSql = sql`WHERE ${whereSql}`
    }

    // Build the main query with parameterized conditions
    let query = sql`
      SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.status as project_status,
        p.approval_status,
        p.rejection_reason,
        ROUND(p.budget_naira::numeric, 2) as budget,
        p.contractor,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        l.name as lga_name,
        w.name as ward_name,
        u.name as creator_name,
        u.email as creator_email,
        u.role as creator_role,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT pi.id) as image_count
      FROM projects p
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments c ON p.id = c.project_id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      ${whereSql}
      GROUP BY p.id, l.name, w.name, u.name, u.email, u.role
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const projects = await query

    // Get total count for pagination
    let countQuery = sql`SELECT COUNT(*) as total FROM projects p ${whereSql}`
    const countResult = await countQuery

    let total = 0
    try {
      const result = countResult as any
      total = result && result[0] ? Number.parseInt(result[0].total) : 0
    } catch (error) {
      console.error("Error parsing count result:", error)
      total = 0
    }
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      projects: Array.isArray(projects) ? (projects as any).map((project: any) => ({
        id: project.id,
        title: project.title,
        description: project.description || "",
        category: project.category,
        project_status: project.project_status,
        approval_status: project.approval_status,
        rejection_reason: project.rejection_reason,
        budget: project.budget,
        contractor: project.contractor,
        start_date: project.start_date,
        end_date: project.end_date,
        created_at: project.created_at,
        updated_at: project.updated_at,
        lga_name: project.lga_name,
        ward_name: project.ward_name,
        creator_name: project.creator_name,
        creator_email: project.creator_email,
        creator_role: project.creator_role,
        comment_count: Number.parseInt(project.comment_count),
        image_count: Number.parseInt(project.image_count)
      })) : [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
