import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PublisherDashboard } from "@/components/publisher-dashboard"

export default async function PublisherPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const user = session.user as any

  if (user.role !== "publisher" && user.role !== "admin" && user.role !== "super_admin") {
    redirect("/")
  }

  return <PublisherDashboard user={user} />
}
