import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Use trigram similarity for suggestions
    const suggestions = await sql`
      SELECT DISTINCT title
      FROM projects 
      WHERE approval_status = 'approved'
      AND similarity(title, ${query}) > 0.3
      ORDER BY similarity(title, ${query}) DESC
      LIMIT 5
    `

    return NextResponse.json(suggestions.map((s) => s.title))
  } catch (error) {
    console.error("Search suggestions error:", error)
    return NextResponse.json([])
  }
}
