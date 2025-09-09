import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { ProjectDetails } from "@/components/project-details"
import { ProjectComments } from "@/components/project-comments"

const sql = neon(process.env.DATABASE_URL!)

interface ProjectPageProps {
  params: {
    id: string
  }
}

async function getProject(id: string) {
  try {
    const projects = await sql`
      SELECT 
        p.*,
        l.name as lga_name,
        w.name as ward_name,
        u.name as publisher_name,
        u.email as publisher_email,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'storage_path', pi.storage_path,
              'caption', pi.caption,
              'sort_order', pi.sort_order
            ) ORDER BY pi.sort_order
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) as images
      FROM projects p
      JOIN lgas l ON p.lga_id = l.id
      JOIN wards w ON p.ward_id = w.id
      JOIN users u ON p.created_by = u.id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.id = ${id} AND p.approval_status = 'approved'
      GROUP BY p.id, l.name, w.name, u.name, u.email
    `

    return projects[0] || null
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return null
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions)
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <ProjectDetails project={project} session={session} />
        <div className="mt-8">
          <ProjectComments projectId={params.id} session={session} />
        </div>
      </main>
    </div>
  )
}
