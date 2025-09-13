"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { User, Mail } from "lucide-react"

interface UserProfile {
    id: string
    name: string
    email: string
    role?: string
    phone?: string
    lga_name?: string
    ward_name?: string
    joined_at?: string
}

export default function ProfilePage() {
    const { data: session, status } = useSession()
        // Use only session user for profile
        const displayUser = session?.user ? {
        id: "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as any).role || "citizen"
    } : null;

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case "super_admin":
                return "System Administrator"
            case "admin":
                return "Administrator"
            case "publisher":
                return "Publisher"
            default:
                return "Citizen"
        }
    }

        if (status === "loading") {
        return <div className="text-center py-12">Loading profile...</div>
    }

    if (!displayUser) {
        return <div className="text-center py-12 text-destructive">Profile not found or you are not signed in.</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{displayUser.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{displayUser.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{getRoleDisplayName(displayUser.role)}</span>
                        </div>
                        <Separator />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
