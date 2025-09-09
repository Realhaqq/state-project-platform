"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, MessageSquare, TrendingUp, Search, Filter } from "lucide-react"
import { PublisherProjectDetails } from "@/components/publisher-project-details"
import { ProjectEditForm } from "@/components/project-edit-form"

interface Project {
  id: string
  title: string
  description: string
  status: string
  approval_status: string
  budget_naira: number | null
  contractor: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  lga_name: string | null
  ward_name: string | null
  comment_count: number
  image_count: number
}

interface ProjectStats {
  total: number
  approved: number
  pending: number
  rejected: number
  planned: number
  ongoing: number
  completed: number
}

export function ProjectManagement({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [approvalFilter, setApprovalFilter] = useState("all")
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'edit'>('list')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, approvalFilter])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (approvalFilter !== "all") params.append("approval_status", approvalFilter)

      const response = await fetch(`/api/publisher/projects?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId)
    setCurrentView('details')
  }

  const handleEditProject = (projectId: string) => {
    setSelectedProjectId(projectId)
    setCurrentView('edit')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedProjectId(null)
  }

  const handleSaveProject = () => {
    // Refresh the projects list and go back to list view
    fetchProjects()
    setCurrentView('list')
    setSelectedProjectId(null)
  }

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string, approvalStatus: string) => {
    if (approvalStatus === "pending") {
      return <Badge variant="secondary">Pending Review</Badge>
    }
    if (approvalStatus === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>
    }

    switch (status) {
      case "planned":
        return <Badge variant="outline">Planned</Badge>
      case "ongoing":
        return <Badge variant="default">In Progress</Badge>
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>
  }

  // Render different views based on current state
  if (currentView === 'details' && selectedProjectId) {
    return (
      <PublisherProjectDetails
        projectId={selectedProjectId}
        onBack={handleBackToList}
        onEdit={() => handleEditProject(selectedProjectId)}
      />
    )
  }

  if (currentView === 'edit' && selectedProjectId) {
    return (
      <ProjectEditForm
        projectId={selectedProjectId}
        onBack={handleBackToList}
        onSave={handleSaveProject}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.ongoing}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="ongoing">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by approval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Approvals</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Manage and track your project submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No projects found</p>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-medium break-words">{project.title}</h3>
                      {getStatusBadge(project.status, project.approval_status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 break-words line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      {project.lga_name && project.ward_name && (
                        <span className="break-words">📍 {project.lga_name}, {project.ward_name}</span>
                      )}
                      {project.budget_naira && (
                        <span>💰 ₦{(project.budget_naira / 1000000).toFixed(1)}M</span>
                      )}
                      <span>💬 {project.comment_count}</span>
                      <span>🖼️ {project.image_count}</span>
                      <span>📅 {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProject(project.id)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project.id)}
                      disabled={project.approval_status === 'approved'}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
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
