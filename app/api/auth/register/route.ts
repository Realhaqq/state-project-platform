import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        { status: 400 }
      )
    }

    const { name, email, password, phone, lga_id, ward_id } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required", code: "MISSING_FIELDS" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "INVALID_EMAIL" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long", code: "WEAK_PASSWORD" },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long", code: "INVALID_NAME" },
        { status: 400 }
      )
    }

    // Check if user already exists
    let existingUsers
    try {
      existingUsers = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}
      `
    } catch (dbError) {
      console.error("Database error checking existing user:", dbError)
      return NextResponse.json(
        { error: "Database error occurred", code: "DATABASE_ERROR" },
        { status: 500 }
      )
    }

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists", code: "USER_EXISTS" },
        { status: 409 }
      )
    }

    // Hash the password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 12)
    } catch (hashError) {
      console.error("Password hashing error:", hashError)
      return NextResponse.json(
        { error: "Failed to process password", code: "HASH_ERROR" },
        { status: 500 }
      )
    }

    // Create new user with hashed password
    let newUser
    try {
      const result = await sql`
        INSERT INTO users (id, email, name, password, phone, role, lga_id, ward_id, is_active, email_verified)
        VALUES (gen_random_uuid(), ${email.toLowerCase().trim()}, ${name.trim()}, ${hashedPassword}, ${phone?.trim() || null}, 'citizen', ${lga_id || null}, ${ward_id || null}, true, false)
        RETURNING id, name, email, role
      `
      newUser = result[0]
    } catch (dbError) {
      console.error("Database error creating user:", dbError)
      return NextResponse.json(
        { error: "Failed to create user account", code: "DATABASE_ERROR" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: newUser
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
