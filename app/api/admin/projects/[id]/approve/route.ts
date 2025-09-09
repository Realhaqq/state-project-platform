import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id
    const body = await request.json()
    const { note } = body

    // Update project status to approved
    await sql`
      UPDATE projects
      SET
        approval_status = 'approved',
        updated_at = NOW(),
        published_at = NOW()
      WHERE id = ${projectId}
    `

    // Log the approval action
    await sql`
      INSERT INTO audit_logs (
        id,
        actor_id,
        action,
        entity,
        entity_id,
        meta,
        created_at
      ) VALUES (
        gen_random_uuid(),
        ${(session.user as any).id},
        'project_approved',
        'projects',
        ${projectId},
        ${note ? JSON.stringify({ note, approval_status: 'approved' }) : JSON.stringify({ approval_status: 'approved' })},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      message: "Project approved successfully"
    })

  } catch (error) {
    console.error("Failed to approve project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
