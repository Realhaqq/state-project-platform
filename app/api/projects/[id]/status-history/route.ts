import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    const statusHistory = await sql`
      SELECT 
        psh.id,
        psh.old_status,
        psh.new_status,
        psh.changed_at,
        u.name as changed_by_name
      FROM project_status_history psh
      LEFT JOIN users u ON psh.changed_by = u.id
      WHERE psh.project_id = ${projectId}
      ORDER BY psh.changed_at DESC
    `

    return NextResponse.json(statusHistory)
  } catch (error) {
    console.error("Status history fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
