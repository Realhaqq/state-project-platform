#!/usr/bin/env node

// Load environment variables from .env.local file
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function testQuery() {
  try {
    console.log("🧪 Testing the exact API query...")

    const query = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.status as project_status,
        p.approval_status,
        p.rejection_reason,
        ROUND(p.budget_naira::numeric, 2) as budget,
        p.contractor,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        l.name as lga_name,
        w.name as ward_name,
        u.name as creator_name,
        u.email as creator_email,
        u.role as creator_role,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT pi.id) as image_count
      FROM projects p
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments c ON p.id = c.project_id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      GROUP BY p.id, l.name, w.name, u.name, u.email, u.role
      ORDER BY p.created_at DESC
      LIMIT 10 OFFSET 0
    `

    console.log("Query:", query)
    const result = await sql`
      SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.status as project_status,
        p.approval_status,
        p.rejection_reason,
        ROUND(p.budget_naira::numeric, 2) as budget,
        p.contractor,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        l.name as lga_name,
        w.name as ward_name,
        u.name as creator_name,
        u.email as creator_email,
        u.role as creator_role,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT pi.id) as image_count
      FROM projects p
      LEFT JOIN lgas l ON p.lga_id = l.id
      LEFT JOIN wards w ON p.ward_id = w.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments c ON p.id = c.project_id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      GROUP BY p.id, l.name, w.name, u.name, u.email, u.role
      ORDER BY p.created_at DESC
      LIMIT 10 OFFSET 0
    `
    console.log("Result type:", typeof result)
    console.log("Result:", result)
    console.log("Is array:", Array.isArray(result))
    console.log("Result length:", result?.length)
    if (result && result.length > 0) {
      console.log("First result:", result[0])
    }

  } catch (error) {
    console.error("❌ Error:", error)
  }
}

testQuery()
