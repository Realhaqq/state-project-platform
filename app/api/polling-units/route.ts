import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wardId = searchParams.get("wardId")

    if (!wardId) {
      return new Response("wardId parameter is required", { status: 400 })
    }

    const pollingUnits = await sql`
      SELECT id, name, code
      FROM polling_units
      WHERE ward_id = ${wardId}
      ORDER BY name
    `

    return new Response(JSON.stringify(pollingUnits), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Failed to fetch polling units:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
