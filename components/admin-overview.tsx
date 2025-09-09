"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, FileText, Flag, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalProjects: number
  pendingProjects: number
  approvedProjects: number
  totalReports: number
  pendingReports: number
  usersByRole: {
    citizen: number
    publisher: number
    admin: number
  }
  projectsByStatus: {
    planning: number
    ongoing: number
    completed: number
    suspended: number
  }
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading admin overview...</div>
  }

  if (!stats) {
    return <div className="text-center py-8">Failed to load admin statistics</div>
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Development projects tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingProjects}</div>
            <p className="text-xs text-muted-foreground">Projects awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Reports requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>Breakdown of user roles on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Citizens</span>
                <span className="text-sm font-medium">{stats.usersByRole.citizen}</span>
              </div>
              <Progress value={(stats.usersByRole.citizen / stats.totalUsers) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Publishers</span>
                <span className="text-sm font-medium">{stats.usersByRole.publisher}</span>
              </div>
              <Progress value={(stats.usersByRole.publisher / stats.totalUsers) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Admins</span>
                <span className="text-sm font-medium">{stats.usersByRole.admin}</span>
              </div>
              <Progress value={(stats.usersByRole.admin / stats.totalUsers) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Status Overview</CardTitle>
            <CardDescription>Current status of all development projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Planning</span>
              <Badge variant="secondary">{stats.projectsByStatus.planning}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Ongoing</span>
              <Badge variant="default">{stats.projectsByStatus.ongoing}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed</span>
              <Badge variant="outline" className="border-green-500 text-green-700">
                {stats.projectsByStatus.completed}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Suspended</span>
              <Badge variant="destructive">{stats.projectsByStatus.suspended}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>Latest actions requiring admin attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New project submission pending review</p>
                <p className="text-xs text-muted-foreground">Road construction project in Minna ward</p>
              </div>
              <Badge variant="secondary">2 hours ago</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Flag className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Content report filed</p>
                <p className="text-xs text-muted-foreground">Inappropriate comment on water project</p>
              </div>
              <Badge variant="secondary">4 hours ago</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Project approved and published</p>
                <p className="text-xs text-muted-foreground">School renovation in Bosso LGA</p>
              </div>
              <Badge variant="secondary">6 hours ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
