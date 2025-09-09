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
    const url = new URL(request.url)
    const action = url.pathname.split('/').pop() // Get 'approve' or 'reject' from URL

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const body = await request.json()
    const { note } = body

    // Update project status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const rejectionReason = action === 'reject' ? note : null

    await sql`
      UPDATE projects
      SET
        approval_status = ${newStatus},
        rejection_reason = ${rejectionReason},
        updated_at = NOW(),
        published_at = ${action === 'approve' ? 'NOW()' : null}
      WHERE id = ${projectId}
    `

    // Log the action
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
        ${action === 'approve' ? 'project_approved' : 'project_rejected'},
        'project',
        ${projectId},
        ${note ? JSON.stringify({ note }) : null},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      message: `Project ${action}d successfully`
    })

  } catch (error) {
    console.error(`Failed to process project action:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
