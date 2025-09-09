"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  category: string
  project_status: string
  approval_status: string
  rejection_reason: string | null
  budget: number | null
  contractor: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  lga_name: string | null
  ward_name: string | null
  creator_name: string | null
  creator_email: string | null
  creator_role: string | null
  comment_count: number
  image_count: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function ProjectModeration() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [reviewNote, setReviewNote] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("all")
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Helper function to get full image URL
  const getImageUrl = (storagePath: string) => {
    if (!storagePath) return ''

    // If it's already a full URL, return as is
    if (storagePath.startsWith('http')) {
      return storagePath
    }

    // If it's a Cloudinary public ID, construct the full URL
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dcjvtepix'
    return `https://res.cloudinary.com/${cloudName}/image/upload/${storagePath}`
  }

  useEffect(() => {
    fetchProjects()
  }, [currentTab, currentPage, searchTerm, statusFilter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        approval_status: currentTab,
        search: searchTerm,
        project_status: statusFilter
      })

      const response = await fetch(`/api/admin/projects/all?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProjectAction = async (projectId: string, action: "approve" | "reject") => {
    // Validate rejection note
    if (action === "reject" && (!reviewNote || reviewNote.trim().length === 0)) {
      toast({
        title: "Rejection note required",
        description: "Please provide a reason for rejecting this project.",
        variant: "destructive",
      })
      return
    }

    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: reviewNote }),
      })

      if (response.ok) {
        toast({
          title: `Project ${action}d`,
          description: `The project has been ${action}d successfully.`,
        })
        fetchProjects()
        setSelectedProject(null)
        setReviewNote("")
        setIsDialogOpen(false) // Close the dialog
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} project`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || `Failed to ${action} project. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const openReviewDialog = (project: Project) => {
    setSelectedProject(project)
    setIsDialogOpen(true)
  }

  const closeReviewDialog = () => {
    setSelectedProject(null)
    setReviewNote("")
    setIsDialogOpen(false)
  }

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewProject = (project: Project) => {
    if (project.approval_status === 'pending') {
      // For pending projects, open the review dialog
      openReviewDialog(project)
    } else {
      // For non-pending projects, navigate to project detail page
      window.open(`/projects/${project.id}`, '_blank')

    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading projects for moderation...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
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
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by project status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={currentTab} className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No projects found.</p>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2 break-words">{project.title}</h3>
                      <p className="text-muted-foreground mb-3 line-clamp-2 break-words">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{project.category}</Badge>
                        <Badge variant={
                          project.approval_status === 'approved' ? 'default' :
                          project.approval_status === 'rejected' ? 'destructive' :
                          'secondary'
                        } className="text-xs">
                          {project.approval_status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{project.project_status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="break-words">📍 {project.lga_name}, {project.ward_name}</p>
                        <p className="break-words">👤 {project.creator_name} ({project.creator_role})</p>
                        <p>💰 ₦{project.budget?.toLocaleString() || 'N/A'}</p>
                        <p>📅 Created: {new Date(project.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:ml-4 sm:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProject(project)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {/* {project.approval_status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleProjectAction(project.id, 'approve')}
                            disabled={isActionLoading}
                            className="w-full sm:w-auto"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openReviewDialog(project)}
                            disabled={isActionLoading}
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )} */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} projects
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm whitespace-nowrap">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Controlled Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
            <DialogDescription>Review and moderate this project submission</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              {/* Project Images */}
              {selectedProject.image_count > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Project Images ({selectedProject.image_count})</h4>
                  <p className="text-sm text-muted-foreground">Images will be displayed here when available</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Project Details</h4>
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Location:</strong> <span className="break-words">{selectedProject.lga_name}, {selectedProject.ward_name}</span>
                </div>
                <div>
                  <strong>Category:</strong> <span className="break-words">{selectedProject.category}</span>
                </div>
                <div>
                  <strong>Budget:</strong> ₦{selectedProject.budget?.toLocaleString() || 'N/A'}
                </div>
                <div>
                  <strong>Creator:</strong> <span className="break-words">{selectedProject.creator_name}</span>
                </div>
                <div>
                  <strong>Status:</strong> <span className="break-words">{selectedProject.project_status}</span>
                </div>
                <div>
                  <strong>Comments:</strong> {selectedProject.comment_count}
                </div>
              </div>
              {selectedProject.approval_status === 'rejected' && selectedProject.rejection_reason && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Rejection Reason</h4>
                  <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded-md">{selectedProject.rejection_reason}</p>
                </div>
              )}
              {selectedProject.approval_status === 'pending' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Review Note <span className="text-red-500">*</span></label>
                  <Textarea
                    placeholder="Please provide a reason for rejecting this project..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeReviewDialog} disabled={isActionLoading} className="w-full sm:w-auto">
              Cancel
            </Button>
            {selectedProject?.approval_status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedProject && handleProjectAction(selectedProject.id, "reject")}
                  disabled={isActionLoading || !reviewNote || reviewNote.trim().length === 0}
                  className="w-full sm:w-auto"
                >
                  {isActionLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => selectedProject && handleProjectAction(selectedProject.id, "approve")}
                  disabled={isActionLoading}
                  className="w-full sm:w-auto"
                >
                  {isActionLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
