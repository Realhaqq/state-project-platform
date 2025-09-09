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

    // Build WHERE clause
    let whereConditions = []
    let params: any[] = []

    if (approvalStatus && approvalStatus !== "all") {
      whereConditions.push(`p.approval_status = $${params.length + 1}`)
      params.push(approvalStatus)
    }

    if (projectStatus && projectStatus !== "all") {
      whereConditions.push(`p.status = $${params.length + 1}`)
      params.push(projectStatus)
    }

    if (search) {
      whereConditions.push(`(p.title ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`)
      params.push(`%${search}%`)
    }

    if (lga) {
      whereConditions.push(`p.lga_id = $${params.length + 1}`)
      params.push(lga)
    }

    if (ward) {
      whereConditions.push(`p.ward_id = $${params.length + 1}`)
      params.push(ward)
    }

    if (category && category !== "all") {
      whereConditions.push(`p.category = $${params.length + 1}`)
      params.push(category)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Get projects with pagination
    const projectsQuery = `
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
      ${whereClause}
      GROUP BY p.id, l.name, w.name, u.name, u.email, u.role
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const projects = await sql.unsafe(projectsQuery)

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      ${whereClause}
    `

    const countResult = await sql.unsafe(countQuery)

    const total = Number.parseInt((countResult as any)[0].total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      projects: (projects as any).map((project: any) => ({
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
      })),
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
