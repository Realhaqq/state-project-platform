"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Eye, MessageSquare, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign, Badge } from "lucide-react"

interface PublisherAnalyticsProps {
  userId: string
}

interface AnalyticsData {
  stats: {
    total_projects: number
    published_projects: number
    pending_approval: number
    in_progress: number
    completed: number
    total_budget: number
    avg_budget: number
  }
  recentProjects: Array<{
    id: string
    title: string
    status: string
    approval_status: string
    created_at: string
    budget_naira: number | null
    comment_count: number
  }>
  monthlyStats: Array<{
    month: string
    count: number
  }>
}

export function PublisherAnalytics({ userId }: PublisherAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/publisher/analytics")
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-8">Failed to load analytics</div>
  }

  const { stats, recentProjects, monthlyStats } = data

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total_projects}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.published_projects}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending_approval}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₦{(stats.total_budget / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Project Views
            </CardTitle>
            <CardDescription>Total views across all your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">{stats.in_progress + stats.completed}</div>
            <p className="text-sm text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community Engagement
            </CardTitle>
            <CardDescription>Comments and feedback on your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {recentProjects.reduce((sum, project) => sum + project.comment_count, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Comments</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Overview</CardTitle>
          <CardDescription>Current status of all your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.in_progress}</div>
              <div className="text-sm text-blue-800">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
              <div className="text-sm text-green-800">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending_approval}</div>
              <div className="text-sm text-yellow-800">Pending Approval</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your latest project submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No projects yet</p>
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium break-words">{project.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">{project.status}</Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        <Badge variant={
                          project.approval_status === 'approved' ? 'default' :
                          project.approval_status === 'rejected' ? 'destructive' :
                          'secondary'
                        } className="text-xs">
                          {project.approval_status}
                        </Badge>
                      </span>
                      <span>💬 {project.comment_count}</span>
                      {project.budget_naira && (
                        <span>💰 ₦{(project.budget_naira / 1000000).toFixed(1)}M</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground self-start sm:self-center">
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
