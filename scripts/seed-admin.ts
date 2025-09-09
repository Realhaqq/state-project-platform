#!/usr/bin/env node

// Load environment variables from .env.local file
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_SEED_EMAIL
    const adminPassword = process.env.ADMIN_SEED_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set")
      process.exit(1)
    }

    // Check if admin already exists
    const [existingAdmin] = await sql`
      SELECT id FROM users WHERE email = ${adminEmail}
    `

    if (existingAdmin) {
      console.log(`Admin user already exists: ${adminEmail}`)

      // Hash the password and update if not already hashed
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      await sql`
        UPDATE users 
        SET role = 'super_admin', password = ${hashedPassword}
        WHERE email = ${adminEmail}
      `

      console.log("Admin role updated to super_admin and password hashed")
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12)

      // Create new admin user with hashed password
      const [admin] = await sql`
        INSERT INTO users (
          email, 
          name, 
          password,
          role
        )
        VALUES (
          ${adminEmail}, 
          'System Administrator',
          ${hashedPassword},
          'super_admin'
        )
        RETURNING id, email, role
      `

      console.log(`Super admin created: ${admin.email} (${admin.role}) with hashed password`)
    }

    console.log("Admin seeding completed successfully")
  } catch (error) {
    console.error("Admin seeding failed:", error)
    process.exit(1)
  }
}

seedAdmin()