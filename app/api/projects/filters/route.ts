import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get LGAs
    const lgas = await sql`
      SELECT id::text, name FROM lgas ORDER BY name
    `

    // Get Wards
    const wards = await sql`
      SELECT id::text, name, lga_id::text FROM wards ORDER BY name
    `

    // Get Categories
    const categories = await sql`
      SELECT DISTINCT category FROM projects 
      WHERE approval_status = 'approved' AND category IS NOT NULL
      ORDER BY category
    `

    return NextResponse.json({
      lgas,
      wards,
      categories: categories.map((c) => c.category),
    })
  } catch (error) {
    console.error("Failed to fetch filter options:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
