#!/usr/bin/env node

// Load environment variables from .env.local file
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function checkUsers() {
  try {
    console.log("🔍 Checking users...")

    const users = await sql`SELECT id, name, email, role FROM users`
    console.log("Users:", users)

    const [project] = await sql`SELECT created_by FROM projects LIMIT 1`
    console.log("Project created_by:", project?.created_by)

    if (project?.created_by) {
      const userExists = await sql`SELECT id, name FROM users WHERE id = ${project.created_by}`
      console.log("User exists:", userExists.length > 0, userExists[0])
    }

    // Test the full query
    console.log("\n🧪 Testing full query...")
    const testQuery = await sql`
      SELECT
        p.id, p.title, p.status, p.approval_status,
        l.name as lga_name, w.name as ward_name,
        u.name as creator_name
      FROM projects p
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LEFT JOIN users u ON p.created_by = u.id
      LIMIT 1
    `
    console.log("Full query result:", testQuery[0])

  } catch (error) {
    console.error("❌ Error:", error)
  }
}

checkUsers()
