import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

const updateProjectSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string(),
  budget: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  contractor_name: z.string().optional(),
  contractor_contact: z.string().optional(),
  status: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "publisher" && (session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    const projectId = params.id

    // Get project with all details
    const project = await sql`
      SELECT
        p.*,
        l.name as lga_name,
        w.name as ward_name,
        u.name as creator_name,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT pi.id) as image_count
      FROM projects p
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments c ON p.id = c.project_id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.id = ${projectId} AND p.created_by = ${user.id}
      GROUP BY p.id, l.name, w.name, u.name
    `

    if (project.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get project images
    const images = await sql`
      SELECT id, project_id, storage_path, caption, sort_order, created_at
      FROM project_images
      WHERE project_id = ${projectId}
      ORDER BY sort_order, created_at
    `

    // Get recent comments
    const comments = await sql`
      SELECT
        c.*,
        u.name as author_name
      FROM comments c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.project_id = ${projectId} AND c.approval_status = 'approved'
      ORDER BY c.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      project: project[0],
      images,
      comments
    })
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "publisher" && (session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    const projectId = params.id

    // Check if project exists and belongs to user
    const existingProject = await sql`
      SELECT id, approval_status FROM projects
      WHERE id = ${projectId} AND created_by = ${user.id}
    `

    if (existingProject.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Only allow editing if project is not approved yet
    if (existingProject[0].approval_status === 'approved') {
      return NextResponse.json({ error: "Cannot edit approved projects" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // Parse budget
    const budgetValue = validatedData.budget ? parseFloat(validatedData.budget.replace(/,/g, '')) : null

    // Combine contractor name and contact
    const contractor = validatedData.contractor_name && validatedData.contractor_contact
      ? `${validatedData.contractor_name} - ${validatedData.contractor_contact}`
      : validatedData.contractor_name || validatedData.contractor_contact || null

    // Update project
    await sql`
      UPDATE projects SET
        title = ${validatedData.title},
        description = ${validatedData.description},
        category = ${validatedData.category},
        budget_naira = ${budgetValue},
        start_date = ${validatedData.start_date},
        end_date = ${validatedData.end_date},
        contractor = ${contractor},
        status = ${validatedData.status || 'pending'},
        updated_at = NOW()
      WHERE id = ${projectId} AND created_by = ${user.id}
    `

    return NextResponse.json({ message: "Project updated successfully" })
  } catch (error) {
    console.error("Failed to update project:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
