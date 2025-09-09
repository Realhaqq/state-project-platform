#!/usr/bin/env node

// Load environment variables from .env.local file
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function checkProjects() {
  try {
    console.log("🔍 Checking projects in database...")

    // Check total count
    const [countResult] = await sql`
      SELECT COUNT(*) as total FROM projects
    `
    console.log(`📊 Total projects: ${countResult.total}`)

    if (countResult.total > 0) {
      // Get all projects with details
      const projects = await sql`
        SELECT
          id, title, description, category, status, approval_status,
          budget_naira, contractor, start_date, end_date,
          lga_id, ward_id, created_by, created_at
        FROM projects
        ORDER BY created_at DESC
      `

      console.log("📋 All projects:")
      projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.title}`)
        console.log(`   Status: ${project.status}, Approval: ${project.approval_status}`)
        console.log(`   Category: ${project.category}, LGA: ${project.lga_id}, Ward: ${project.ward_id}`)
        console.log(`   Created by: ${project.created_by}`)
        console.log("")
      })

      // Check if LGAs and Wards exist
      const [lgaCount] = await sql`SELECT COUNT(*) as total FROM lgas`
      const [wardCount] = await sql`SELECT COUNT(*) as total FROM wards`
      const [userCount] = await sql`SELECT COUNT(*) as total FROM users`

      console.log(`📍 LGAs: ${lgaCount.total}, Wards: ${wardCount.total}, Users: ${userCount.total}`)
    }

  } catch (error) {
    console.error("❌ Error checking projects:", error)
  }
}

checkProjects()
