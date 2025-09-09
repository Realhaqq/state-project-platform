#!/usr/bin/env node

// Load environment variables from .env.local file
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function checkTables() {
  try {
    console.log("🔍 Checking table structures...")

    // Check LGA structure
    const lgas = await sql`SELECT * FROM lgas LIMIT 1`
    console.log("LGA columns:", lgas.length > 0 ? Object.keys(lgas[0]) : "No data")
    if (lgas.length > 0) {
      console.log("Sample LGA:", lgas[0])
    }

    // Check Ward structure
    const wards = await sql`SELECT * FROM wards LIMIT 1`
    console.log("Ward columns:", wards.length > 0 ? Object.keys(wards[0]) : "No data")
    if (wards.length > 0) {
      console.log("Sample Ward:", wards[0])
    }

    // Check if the IDs match
    const [project] = await sql`SELECT lga_id, ward_id FROM projects LIMIT 1`
    console.log("Project LGA ID:", project?.lga_id)
    console.log("Project Ward ID:", project?.ward_id)

    // Test the JOIN
    const testJoin = await sql`
      SELECT p.id, p.title, l.name as lga_name, w.name as ward_name
      FROM projects p
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LIMIT 1
    `
    console.log("JOIN test result:", testJoin[0])

  } catch (error) {
    console.error("❌ Error checking tables:", error)
  }
}

checkTables()
