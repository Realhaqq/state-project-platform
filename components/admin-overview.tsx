"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, FileText, Flag, CheckCircle, Clock, AlertTriangle, UserPlus, FileCheck } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalProjects: number
  pendingProjects: number
  approvedProjects: number
  totalReports: number
  pendingReports: number
  totalComments?: number
  usersByRole: {
    citizen: number
    publisher: number
    admin: number
  }
  projectsByStatus: {
    pending: number
    planned: number
    ongoing: number
    completed: number
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    details: string
  }>
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
        // Ensure totalComments is present for UI
        setStats({ ...data, totalComments: data.totalComments || 0 })
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case 'project_created':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'report_created':
        return <Flag className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'user_registered':
        return 'New user registered'
      case 'project_created':
        return 'Project submitted'
      case 'report_created':
        return 'Report filed'
      default:
        return 'Activity'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Less than 1 hour ago'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
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
              <span className="text-sm">Proposed</span>
              <Badge variant="secondary">{stats.projectsByStatus.planned}</Badge>
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
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm">Ward Covered</span>
              <Badge variant="default">274</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">IGAs Covered</span>
              <Badge variant="default">25</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Users</span>
              <Badge variant="default">{stats.totalUsers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Publishers</span>
              <Badge variant="secondary">{stats.usersByRole.publisher}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Comments</span>
              <Badge variant="default">{stats.totalComments || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Reports</span>
              <Badge variant="default">{stats.totalReports}</Badge>
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
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{getActivityTitle(activity.type)}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <Badge variant="secondary">{formatTimeAgo(activity.timestamp)}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
