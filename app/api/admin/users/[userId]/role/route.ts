import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || ((session.user as any).role !== "admin" && (session.user as any).role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, lga_id, ward_id } = await request.json()

    // Validate role
    const validRoles = ["citizen", "publisher", "admin", "super_admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Prevent users from modifying their own role or other super admins
    const currentUser = session.user as any
    if (params.userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot modify your own role" }, { status: 403 })
    }

    // Check if target user is a super admin (only super admins can modify other super admins)
    if (currentUser.role !== "super_admin") {
      const targetUser = await sql`
        SELECT role FROM users WHERE id = ${params.userId}
      `

      if (targetUser.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (targetUser[0].role === "super_admin") {
        return NextResponse.json({ error: "Cannot modify super admin role" }, { status: 403 })
      }
    }

    // Update user role and location data
    if (lga_id !== undefined && ward_id !== undefined) {
      await sql`
        UPDATE users
        SET role = ${role}, lga_id = ${lga_id}, ward_id = ${ward_id}, updated_at = NOW()
        WHERE id = ${params.userId}
      `
    } else if (lga_id !== undefined) {
      await sql`
        UPDATE users
        SET role = ${role}, lga_id = ${lga_id}, updated_at = NOW()
        WHERE id = ${params.userId}
      `
    } else {
      await sql`
        UPDATE users
        SET role = ${role}, updated_at = NOW()
        WHERE id = ${params.userId}
      `
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully"
    })
  } catch (error) {
    console.error("Failed to update user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
