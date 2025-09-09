import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PasscodeClaimForm } from "@/components/passcode-claim-form"

export const metadata: Metadata = {
  title: "Claim Publisher Passcode - Niger State Development Platform",
  description: "Claim your publisher passcode to submit development projects",
}

export default async function ClaimPasscodePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/auth/claim-passcode")
  }

  if (session.user.role === "publisher" || session.user.role === "admin" || session.user.role === "super_admin") {
    redirect("/publisher")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Publisher Access</h1>
              <p className="text-gray-600">Enter your passcode to become a project publisher</p>
            </div>

            <PasscodeClaimForm />
          </div>
        </div>
      </div>
    </div>
  )
}
