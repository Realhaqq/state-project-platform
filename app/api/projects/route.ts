import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

const createProjectSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string(),
  budget: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  contractor_name: z.string().optional(),
  contractor_contact: z.string().optional(),
  images: z.array(z.string()).max(10).optional(),
  published_by: z.string(),
  lga_id: z.string().nullable().optional(),
  ward_id: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log("Session:", session)
    console.log("Session user:", session?.user)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // Check if user has permission to create projects
    if (!["publisher", "admin", "super_admin"].includes(session.user.role)) {
      console.log("User role:", session.user.role)
      return NextResponse.json(
        { error: "Insufficient permissions to create projects", code: "FORBIDDEN" },
        { status: 403 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        { status: 400 }
      )
    }

    let validatedData
    try {
      validatedData = createProjectSchema.parse(body)
    } catch (validationError: any) {
      console.log("Validation error details:", validationError.errors)
      console.log("Request body:", body)
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: validationError.errors
        },
        { status: 400 }
      )
    }

    // Validate budget is a valid number
    const budgetValue = Number.parseFloat(validatedData.budget)
    if (isNaN(budgetValue) || budgetValue < 0) {
      return NextResponse.json(
        { error: "Invalid budget amount", code: "INVALID_BUDGET" },
        { status: 400 }
      )
    }

    // Validate date formats
    const startDate = new Date(validatedData.start_date)
    const endDate = new Date(validatedData.end_date)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format", code: "INVALID_DATE" },
        { status: 400 }
      )
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date", code: "INVALID_DATE_RANGE" },
        { status: 400 }
      )
    }

    // Create project
    let project
    try {
      // Combine contractor name and contact into a single string
      const contractor = validatedData.contractor_name && validatedData.contractor_contact
        ? `${validatedData.contractor_name} - ${validatedData.contractor_contact}`
        : validatedData.contractor_name || validatedData.contractor_contact || null

      const result = await sql`
        INSERT INTO projects (
          id, title, description, category, status, budget_naira, start_date, end_date,
          contractor, lga_id, ward_id, created_by, approval_status
        ) VALUES (
          gen_random_uuid(), ${validatedData.title}, ${validatedData.description}, ${validatedData.category},
          'pending', ${budgetValue}, ${validatedData.start_date}, ${validatedData.end_date},
          ${contractor}, ${validatedData.lga_id || null}, ${validatedData.ward_id || null},
          ${session.user.id}, 'pending'
        ) RETURNING id
      `
      project = result[0]
    } catch (dbError) {
      console.error("Database error creating project:", dbError)
      return NextResponse.json(
        { error: "Failed to save project to database", code: "DATABASE_ERROR" },
        { status: 500 }
      )
    }

    // Insert project images if any
    if (validatedData.images && validatedData.images.length > 0) {
      try {
        for (let i = 0; i < validatedData.images.length; i++) {
          await sql`
            INSERT INTO project_images (project_id, storage_path, sort_order, created_at)
            VALUES (${project.id}, ${validatedData.images[i]}, ${i}, NOW())
          `
        }
      } catch (imageError) {
        console.error("Error saving project images:", imageError)
        // Don't fail the entire request if image saving fails
        // Could implement cleanup of created project here if needed
      }
    }

    // Log audit (don't fail if audit logging fails)
    try {
      await sql`
        INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, meta, created_at)
        VALUES (gen_random_uuid(), ${session.user.id}, 'create', 'projects', ${project.id}, ${JSON.stringify({ title: validatedData.title, category: validatedData.category })}, NOW())
      `
    } catch (auditError) {
      console.error("Error logging audit:", auditError)
      // Continue without failing
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      message: "Project created successfully and submitted for approval"
    })
  } catch (error) {
    console.error("Unexpected error creating project:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
