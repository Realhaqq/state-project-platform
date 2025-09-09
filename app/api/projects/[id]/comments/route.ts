import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await sql`
      SELECT 
        c.id,
        c.content,
        c.author_name,
        u.role as author_role,
        c.created_at
      FROM comments c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.project_id = ${params.id} AND c.is_approved = true AND c.is_active = true
      ORDER BY c.created_at DESC
    `

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const comment = await sql`
      INSERT INTO comments (id, project_id, created_by, author_name, content, approval_status, is_approved)
      VALUES (gen_random_uuid(), ${params.id}, ${session.user.id}, ${session.user.name || session.user.email}, ${content.trim()}, 'approved', true)
      RETURNING *
    `

        // Log the action
    await sql`
      INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, meta, created_at)
      VALUES (gen_random_uuid(), ${session.user.id}, 'create', 'comment', ${comment[0].id}, ${JSON.stringify({
        details: 'Posted comment on project',
        ip_address: request.headers.get("x-forwarded-for") || "unknown"
      })}, NOW())
    `

    return NextResponse.json(comment[0])
  } catch (error) {
    console.error("Failed to create comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
