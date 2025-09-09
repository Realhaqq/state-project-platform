import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
    }

    const body = await request.json()
    const { type, path, tag } = body

    switch (type) {
      case "project_approved":
        revalidatePath("/")
        revalidatePath("/projects")
        revalidateTag("latest-projects")
        revalidateTag("hero-projects")
        break

      case "comment_approved":
        revalidatePath(`/projects/${body.projectId}`)
        revalidateTag(`project-${body.projectId}`)
        break

      case "project_updated":
        revalidatePath(`/projects/${body.projectId}`)
        revalidatePath("/projects")
        revalidateTag(`project-${body.projectId}`)
        break

      default:
        if (path) revalidatePath(path)
        if (tag) revalidateTag(tag)
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    console.error("Revalidation error:", error)
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 })
  }
}
