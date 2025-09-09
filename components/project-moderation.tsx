"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Eye, Search, Filter } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PendingProject {
  id: string
  title: string
  description: string
  lga: string
  ward: string
  category: string
  budget: number
  publisher: {
    name: string
    email: string
  }
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  images: Array<{
    id: string
    storage_path: string
    caption?: string
    sort_order: number
    created_at: string
  }>
}

export function ProjectModeration() {
  const [projects, setProjects] = useState<PendingProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null)
  const [reviewNote, setReviewNote] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    fetchPendingProjects()
  }, [])

  const fetchPendingProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects/pending")
      if (response.ok) {
        const data = await response.json()
        const transformedProjects = (data.projects || []).map((project: any) => {
          console.log('Project images:', project.images); // Debug logging
          return {
            id: project.id,
            title: project.title,
            description: project.description || "",
            lga: project.lga_name || "",
            ward: project.ward_name || "",
            category: project.category || "infrastructure",
            budget: project.budget_naira || 0,
            publisher: {
              name: project.creator_name || "Unknown",
              email: project.creator_email || ""
            },
            submittedAt: project.created_at,
            status: project.approval_status as "pending" | "approved" | "rejected",
            images: project.images || []
          }
        })
        setProjects(transformedProjects)
      }
    } catch (error) {
      console.error("Failed to fetch pending projects:", error)
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
        fetchPendingProjects()
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
        description: error.message || `Failed to ${action} project. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const openReviewDialog = (project: PendingProject) => {
    setSelectedProject(project)
    setIsDialogOpen(true)
  }

  const closeReviewDialog = () => {
    setSelectedProject(null)
    setReviewNote("")
    setIsDialogOpen(false)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.ward.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="text-center py-8">Loading projects for moderation...</div>
  }

  return (
    <div className="space-y-6">
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
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>
                    {project.lga} LGA, {project.ward} Ward • {project.category}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    project.status === "pending"
                      ? "secondary"
                      : project.status === "approved"
                        ? "default"
                        : "destructive"
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {project.images.length > 0 && (
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(project.images[0].storage_path)}
                      alt={project.images[0].caption || project.title}
                      className="w-20 h-20 object-cover rounded-md"
                      onError={(e) => {
                        console.log('Image failed to load:', project.images[0].storage_path);
                        console.log('Constructed URL:', getImageUrl(project.images[0].storage_path));
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p>
                        <strong>Budget:</strong> ₦{project.budget_naira ? Number(project.budget_naira).toLocaleString() : 'N/A'}
                      </p>
                      <p>
                        <strong>Publisher:</strong> {project.publisher.name}
                      </p>
                      <p>
                        <strong>Submitted:</strong> {new Date(project.submittedAt).toLocaleDateString()}
                      </p>
                      {project.images.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {project.images.length} image{project.images.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openReviewDialog(project)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              {selectedProject.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Project Images ({selectedProject.images.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProject.images.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <img
                          src={getImageUrl(image.storage_path)}
                          alt={image.caption || selectedProject.title}
                          className="w-full h-32 object-cover rounded-md border"
                          onError={(e) => {
                            console.log('Gallery image failed to load:', image.storage_path);
                            console.log('Constructed URL:', getImageUrl(image.storage_path));
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {image.caption && (
                          <p className="text-xs text-muted-foreground">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Project Details</h4>
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Location:</strong> {selectedProject.lga} LGA, {selectedProject.ward} Ward
                </div>
                <div>
                  <strong>Category:</strong> {selectedProject.category}
                </div>
                <div>
                  <strong>Budget:</strong> ₦{selectedProject.budget_naira ? Number(selectedProject.budget_naira).toLocaleString() : 'N/A'}
                </div>
                <div>
                  <strong>Publisher:</strong> {selectedProject.publisher.name}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Review Note <span className="text-red-500">*</span></label>
                <Textarea
                  placeholder="Please provide a reason for rejecting this project..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog} disabled={isActionLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedProject && handleProjectAction(selectedProject.id, "reject")}
              disabled={isActionLoading || !reviewNote || reviewNote.trim().length === 0}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No projects found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
