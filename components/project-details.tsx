"use client"

import { useState } from "react"
import { ReportForm } from "@/components/report-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, DollarSign, User, Flag, Share2, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProjectDetailsProps {
  project: any
  session: any
}

export function ProjectDetails({ project, session }: ProjectDetailsProps) {
  // ReportForm handles its own state and submission
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "secondary"
      case "ongoing":
        return "default"
      case "completed":
        return "outline"
      case "suspended":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planned":
        return <Clock className="h-4 w-4" />
      case "ongoing":
        return <AlertTriangle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "suspended":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const calculateProgress = () => {
    const start = new Date(project.start_date)
    const end = new Date(project.expected_completion)
    const now = new Date()

    if (now < start) return 0
    if (now > end) return 100

    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  // Removed custom report handler, now handled by ReportForm

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Project link copied to clipboard.",
        })
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Project link copied to clipboard.",
      })
    }
  }

  const progress = calculateProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{project.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {project.lga_name} LGA, {project.ward_name} Ward
            </span>
            <Badge variant="outline">{project.category}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(project.project_status)} className="flex items-center gap-1">
            {getStatusIcon(project.project_status)}
            {project.project_status}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setReportDialogOpen(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            {/* Use the shared ReportForm component for correct validation and submission */}
            <ReportForm projectId={project.id} projectTitle={project.title} onSuccess={() => setReportDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>

          {/* Project Images */}
          {project.images && project.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.images.map((image: any, index: number) => (
                    <div key={image.id || index} className="space-y-2">
                      <img
                        src={getImageUrl(image.storage_path)}
                        alt={image.caption || `${project.title} image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          console.log('Image failed to load:', image.storage_path);
                          console.log('Constructed URL:', getImageUrl(image.storage_path));
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      {image.caption && (
                        <p className="text-sm text-muted-foreground text-center">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Updates */}
          {project.updates && project.updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.updates.map((update: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <p className="font-medium">{update.title}</p>
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(update.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">₦{project.budget_naira ? Number(project.budget_naira).toLocaleString() : 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected Completion</p>
                  <p className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not specified'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Published by</p>
                  <p className="font-medium">{project.publisher_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {project.project_status === "ongoing" && (
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Timeline Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">Based on project timeline</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">For inquiries about this project, contact:</p>
              <p className="font-medium">{project.publisher_name}</p>
              <p className="text-sm text-muted-foreground">{project.publisher_email}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
