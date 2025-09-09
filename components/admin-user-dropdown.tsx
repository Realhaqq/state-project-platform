"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, LogOut, Settings, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function AdminUserDropdown() {
  const { data: session } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setIsOpen(false)
    try {
      await signOut({ callbackUrl: "/auth/signin" })
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of the admin dashboard.",
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  if (!session?.user) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  const user = session.user
  const displayName = (user as any).name || user.email?.split("@")[0] || "Admin"
  const userRole = (user as any).role || "admin"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full hover:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
            aria-label="User menu"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="absolute top-full left-0 w-64 p-0 z-50 bg-background border shadow-lg mt-2"
          align="start"
          side="bottom"
          sideOffset={8}
          style={{ zIndex: 9999, position: 'absolute' }}
          avoidCollisions={false}
        >
          <div className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="flex items-center pt-1">
                    <Shield className="mr-1 h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground capitalize">
                      {userRole.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>

          <Separator />

          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
