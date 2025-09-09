import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { createObjectCsvWriter } from "csv-writer"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !["admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // projects, subscriptions, reports
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let data: any[] = []
    let filename = ""
    let headers: any[] = []

    switch (type) {
      case "projects":
        data = await sql`
          SELECT 
            p.title,
            p.description,
            l.name as lga_name,
            w.name as ward_name,
            p.status,
            p.budget_naira,
            p.contractor,
            p.start_date,
            p.end_date,
            p.approval_status,
            p.created_at
          FROM projects p
          JOIN lgas l ON p.lga_id = l.id
          JOIN wards w ON p.ward_id = w.id
          WHERE p.created_at >= ${startDate || "2024-01-01"}
          AND p.created_at <= ${endDate || "2024-12-31"}
          ORDER BY p.created_at DESC
        `
        filename = "projects-export.csv"
        headers = [
          { id: "title", title: "Title" },
          { id: "description", title: "Description" },
          { id: "lga_name", title: "LGA" },
          { id: "ward_name", title: "Ward" },
          { id: "status", title: "Status" },
          { id: "budget_naira", title: "Budget (₦)" },
          { id: "contractor", title: "Contractor" },
          { id: "start_date", title: "Start Date" },
          { id: "end_date", title: "End Date" },
          { id: "approval_status", title: "Approval Status" },
          { id: "created_at", title: "Created At" },
        ]
        break

      case "subscriptions":
        data = await sql`
          SELECT 
            s.name,
            s.email,
            s.phone_call,
            s.phone,
            s.address,
            l.name as lga_name,
            w.name as ward_name,
            pu.name as polling_unit_name,
            s.traits,
            s.status,
            s.created_at
          FROM subscriptions s
          JOIN lgas l ON s.lga_id = l.id
          JOIN wards w ON s.ward_id = w.id
          JOIN polling_units pu ON s.polling_unit_id = pu.id
          WHERE s.created_at >= ${startDate || "2024-01-01"}
          AND s.created_at <= ${endDate || "2024-12-31"}
          ORDER BY s.created_at DESC
        `
        filename = "subscriptions-export.csv"
        headers = [
          { id: "name", title: "Full Name" },
          { id: "email", title: "Email" },
          { id: "phone_call", title: "Phone" },
          { id: "phone", title: "WhatsApp" },
          { id: "address", title: "Address" },
          { id: "lga_name", title: "LGA" },
          { id: "ward_name", title: "Ward" },
          { id: "polling_unit_name", title: "Polling Unit" },
          { id: "traits", title: "Interests" },
          { id: "status", title: "Status" },
          { id: "created_at", title: "Created At" },
        ]
        break

      case "reports":
        data = await sql`
          SELECT 
            r.reporter_name,
            r.reporter_email,
            r.reporter_phone,
            r.message,
            r.status,
            p.title as project_title,
            l.name as lga_name,
            w.name as ward_name,
            r.created_at
          FROM reports r
          JOIN projects p ON r.project_id = p.id
          JOIN lgas l ON p.lga_id = l.id
          JOIN wards w ON p.ward_id = w.id
          WHERE r.created_at >= ${startDate || "2024-01-01"}
          AND r.created_at <= ${endDate || "2024-12-31"}
          ORDER BY r.created_at DESC
        `
        filename = "reports-export.csv"
        headers = [
          { id: "reporter_name", title: "Reporter Name" },
          { id: "reporter_email", title: "Reporter Email" },
          { id: "reporter_phone", title: "Reporter Phone" },
          { id: "message", title: "Message" },
          { id: "status", title: "Status" },
          { id: "project_title", title: "Project Title" },
          { id: "lga_name", title: "LGA" },
          { id: "ward_name", title: "Ward" },
          { id: "created_at", title: "Created At" },
        ]
        break

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    // Create CSV content
    const csvWriter = createObjectCsvWriter({
      path: "", // We'll use stringifier instead
      header: headers,
    })

    // Convert to CSV string
    let csvContent = headers.map((h) => h.title).join(",") + "\n"

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header.id]
        if (value === null || value === undefined) return ""
        if (typeof value === "object") return JSON.stringify(value)
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvContent += values.join(",") + "\n"
    })

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
