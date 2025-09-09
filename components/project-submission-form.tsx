"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { Calendar, DollarSign } from "lucide-react"

interface ProjectSubmissionFormProps {
  userId: string
  lgaId?: string
  wardId?: string
}

export function ProjectSubmissionForm({ userId, lgaId, wardId }: ProjectSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    start_date: "",
    end_date: "",
    contractor_name: "",
    contractor_contact: "",
    images: [] as string[],
  })

  const categories = [
    { value: "infrastructure", label: "Infrastructure" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "agriculture", label: "Agriculture" },
    { value: "water", label: "Water" },
    { value: "electricity", label: "Electricity" },
    { value: "roads", label: "Roads" },
    { value: "housing", label: "Housing" },
    { value: "environment", label: "Environment" },
    { value: "social", label: "Social" },
    { value: "economic", label: "Economic" },
    { value: "other", label: "Other" },
  ]

  const handleImagesChange = (imageUrls: string[]) => {
    setFormData(prev => ({ ...prev, images: imageUrls }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Manual validation like signup page
    if (!formData.title || !formData.description || !formData.category || !formData.budget || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (formData.title.length < 5) {
      toast({
        title: "Validation Error",
        description: "Title must be at least 5 characters.",
        variant: "destructive",
      })
      return
    }

    if (formData.description.length < 20) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 20 characters.",
        variant: "destructive",
      })
      return
    }

    // Validate budget is a number
    const budgetValue = Number.parseFloat(formData.budget.replace(/,/g, '').trim())
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid budget amount.",
        variant: "destructive",
      })
      return
    }

    // Validate dates
    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast({
        title: "Validation Error",
        description: "Please enter valid dates.",
        variant: "destructive",
      })
      return
    }

    if (endDate <= startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const projectData = {
        ...formData,
        budget: formData.budget.replace(/,/g, '').trim(), // Remove commas and trim
        start_date: new Date(formData.start_date).toISOString().split('T')[0], // Ensure YYYY-MM-DD format
        end_date: new Date(formData.end_date).toISOString().split('T')[0], // Ensure YYYY-MM-DD format
        published_by: userId,
        lga_id: lgaId,
        ward_id: wardId,
        images: formData.images || [],
      }

      console.log("Submitting project data:", projectData)

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit project")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: "Project submitted successfully! It will be reviewed by administrators.",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        budget: "",
        start_date: "",
        end_date: "",
        contractor_name: "",
        contractor_contact: "",
        images: [],
      })
    } catch (error) {
      console.error("Project submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Project</CardTitle>
        <CardDescription>Add a new development project for review and publication</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Location Information */}
          {/* {(lgaId || wardId) && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Project Location</h3>
              <p className="text-sm">
                This project will be submitted to your assigned location. Projects can only be submitted to the LGA and Ward assigned to your publisher account.
              </p>
              {(lgaId || wardId) && (
                <p className="text-sm font-medium mt-2">
                  Assigned Location: {lgaId ? `LGA ID: ${lgaId}` : ''} {wardId ? `Ward ID: ${wardId}` : ''}
                </p>
              )}
            </div>
          )} */}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a detailed description of the project"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (NGN)</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="Enter project budget"
                required
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Expected End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contractor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contractor Information (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor_name">Contractor Name</Label>
                <Input
                  id="contractor_name"
                  value={formData.contractor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractor_name: e.target.value }))}
                  placeholder="Enter contractor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor_contact">Contractor Contact</Label>
                <Input
                  id="contractor_contact"
                  value={formData.contractor_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractor_contact: e.target.value }))}
                  placeholder="Phone or email"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Images</h3>
            <p className="text-sm text-muted-foreground">Upload up to 10 images to showcase your project</p>

            <ImageUpload value={formData.images} onChange={handleImagesChange} maxImages={10} disabled={isSubmitting} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
