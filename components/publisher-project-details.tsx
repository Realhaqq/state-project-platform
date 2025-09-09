"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, MapPin, Calendar, DollarSign, User, MessageSquare, Image as ImageIcon } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  category: string
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
  creator_name: string | null
  comment_count: number
  image_count: number
}

interface ProjectImage {
  id: string
  storage_path: string
  caption: string | null
}

interface Comment {
  id: string
  content: string
  created_at: string
  author_name: string | null
}

interface PublisherProjectDetailsProps {
  projectId: string
  onBack: () => void
  onEdit: () => void
}

export function PublisherProjectDetails({ projectId, onBack, onEdit }: PublisherProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

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
    fetchProjectDetails()
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/publisher/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        setImages(data.images)
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error)
    } finally {
      setLoading(false)
    }
  }

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
    return <div className="text-center py-8">Loading project details...</div>
  }

  if (!project) {
    return <div className="text-center py-8">Project not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">Project Details</p>
          </div>
        </div>
        {project.approval_status !== 'approved' && (
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {getStatusBadge(project.status, project.approval_status)}
        <span className="text-sm text-muted-foreground">
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Project Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Category</h4>
                <p className="text-sm text-muted-foreground capitalize">{project.category}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Location</h4>
                <p className="text-sm text-muted-foreground">
                  {project.lga_name && project.ward_name
                    ? `${project.lga_name}, ${project.ward_name}`
                    : 'Not specified'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Budget</h4>
                <p className="text-sm text-muted-foreground">
                  {project.budget_naira
                    ? `₦${(project.budget_naira / 1000000).toFixed(1)}M`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Contractor</h4>
                <p className="text-sm text-muted-foreground">
                  {project.contractor || 'Not specified'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Start Date</h4>
                <p className="text-sm text-muted-foreground">
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">End Date</h4>
                <p className="text-sm text-muted-foreground">
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString()
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{project.comment_count}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{project.image_count}</div>
                <div className="text-sm text-muted-foreground">Images</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(image.storage_path)}
                    alt={image.caption || 'Project image'}
                    className="w-full h-48 object-cover"
                  />
                  {image.caption && (
                    <div className="p-2">
                      <p className="text-sm text-muted-foreground">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Comments */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-muted pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-sm">{comment.author_name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
