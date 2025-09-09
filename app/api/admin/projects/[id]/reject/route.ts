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

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return NextResponse.json({ error: "Rejection note is required and cannot be empty" }, { status: 400 })
    }

    // Update project status to rejected
    await sql`
      UPDATE projects
      SET
        approval_status = 'rejected',
        rejection_reason = ${note},
        updated_at = NOW()
      WHERE id = ${projectId}
    `

    // Log the rejection action
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
        'project_rejected',
        'projects',
        ${projectId},
        ${JSON.stringify({ rejection_reason: note, approval_status: 'rejected' })},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      message: "Project rejected successfully"
    })

  } catch (error) {
    console.error("Failed to reject project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
