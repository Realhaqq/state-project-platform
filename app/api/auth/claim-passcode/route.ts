import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { passcode } = await request.json()
    if (!passcode?.trim()) {
      return NextResponse.json({ error: "Passcode is required" }, { status: 400 })
    }

    // Find active passcode
    const passcodeRecord = await sql`
      SELECT p.*, l.name as lga_name, w.name as ward_name
      FROM publisher_passcodes p
      JOIN lgas l ON p.lga_id = l.id
      JOIN wards w ON p.ward_id = w.id
      WHERE p.active = true 
      AND (p.expires_at IS NULL OR p.expires_at > NOW())
      AND p.used_count < p.max_uses
    `

    let validPasscode = null
    for (const record of passcodeRecord) {
      const isValid = await bcrypt.compare(passcode.trim(), record.code)
      if (isValid) {
        validPasscode = record
        break
      }
    }

    if (!validPasscode) {
      // Log failed attempt
      await sql`
        INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, meta)
        VALUES (gen_random_uuid(), ${session.user.id}, 'passcode_claim_failed', 'publisher_passcodes', NULL, ${JSON.stringify({ passcode_hint: passcode.substring(0, 3) + "***" })})
      `
      return NextResponse.json({ error: "Invalid or expired passcode" }, { status: 400 })
    }

    // Update user role and scope
    await sql`
      UPDATE users 
      SET role = 'publisher', lga_id = ${validPasscode.lga_id}, ward_id = ${validPasscode.ward_id}
      WHERE id = ${session.user.id}
    `

    // Increment passcode usage
    await sql`
      UPDATE publisher_passcodes 
      SET used_count = used_count + 1
      WHERE id = ${validPasscode.id}
    `

    // Log successful claim
    await sql`
      INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, meta)
      VALUES (gen_random_uuid(), ${session.user.id}, 'passcode_claimed', 'publisher_passcodes', ${validPasscode.id}, ${JSON.stringify({
        lga: validPasscode.lga_name,
        ward: validPasscode.ward_name,
      })})
    `

    return NextResponse.json({
      success: true,
      lga: validPasscode.lga_name,
      ward: validPasscode.ward_name,
    })
  } catch (error) {
    console.error("Passcode claim error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
