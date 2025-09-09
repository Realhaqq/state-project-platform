import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const lgas = await sql`
      SELECT id::text, name
      FROM lgas
      ORDER BY name ASC
    `

    return NextResponse.json({
      success: true,
      lgas: lgas,
    })
  } catch (error) {
    console.error("Error fetching LGAs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch LGAs" }, { status: 500 })
  }
}
