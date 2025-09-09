"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectSubmissionForm } from "@/components/project-submission-form"
import { ProjectManagement } from "@/components/project-management"
import { PublisherAnalytics } from "@/components/publisher-analytics"
import { Plus, BarChart3, FolderOpen, Bell } from "lucide-react"

interface PublisherDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    lga_id?: string
    ward_id?: string
  }
}

export function PublisherDashboard({ user }: PublisherDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 break-words">Publisher Dashboard</h1>
          <p className="text-muted-foreground break-words">
            Welcome back, {user.name}. Manage your development projects and track their progress.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-max min-w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">My Projects</span>
                <span className="sm:hidden">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="submit" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Submit Project</span>
                <span className="sm:hidden">Submit</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <PublisherAnalytics userId={user.id} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManagement userId={user.id} />
          </TabsContent>

          <TabsContent value="submit">
            <ProjectSubmissionForm userId={user.id} lgaId={user.lga_id} wardId={user.ward_id} />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Recent activity on your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 p-4 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 sm:mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">New comment on "Minna-Bida Road Rehabilitation"</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 p-4 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2 sm:mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">Project "Healthcare Center" approved by admin</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 p-4 border border-border rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2 sm:mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">Update required for "Water Borehole Project"</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
