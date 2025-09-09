import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lgaId = searchParams.get("lga_id")

    if (!lgaId) {
      return NextResponse.json({ success: false, error: "LGA ID is required" }, { status: 400 })
    }

    const wards = await sql`
      SELECT id::text, name, lga_id::text
      FROM wards
      WHERE lga_id::text = ${lgaId}
      ORDER BY name ASC
    `

    return NextResponse.json({
      success: true,
      wards: wards,
    })
  } catch (error) {
    console.error("Error fetching wards:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch wards" }, { status: 500 })
  }
}
