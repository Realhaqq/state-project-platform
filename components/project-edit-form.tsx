"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  category: string
  status: string
  budget_naira: number | null
  contractor: string | null
  start_date: string | null
  end_date: string | null
}

interface ProjectEditFormProps {
  projectId: string
  onBack: () => void
  onSave: () => void
}

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

export function ProjectEditForm({ projectId, onBack, onSave }: ProjectEditFormProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    start_date: "",
    end_date: "",
    contractor_name: "",
    contractor_contact: "",
    status: "pending",
  })

  useEffect(() => {
    fetchProjectDetails()
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/publisher/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        const projectData = data.project
        setProject(projectData)

        // Parse contractor info
        const contractorParts = projectData.contractor ? projectData.contractor.split(' - ') : ['', '']

        setFormData({
          title: projectData.title || "",
          description: projectData.description || "",
          category: projectData.category || "",
          budget: projectData.budget_naira ? projectData.budget_naira.toString() : "",
          start_date: projectData.start_date ? projectData.start_date.split('T')[0] : "",
          end_date: projectData.end_date ? projectData.end_date.split('T')[0] : "",
          contractor_name: contractorParts[0] || "",
          contractor_contact: contractorParts[1] || "",
          status: projectData.status || "pending",
        })
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error)
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/publisher/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project updated successfully",
        })
        onSave()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update project:", error)
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="text-center py-8">Loading project...</div>
  }

  if (!project) {
    return <div className="text-center py-8">Project not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold break-words">Edit Project</h1>
          <p className="text-muted-foreground break-words">Update project information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Update the basic project details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the project in detail"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (₦)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  placeholder="Enter budget amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="ongoing">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contractor Information</CardTitle>
            <CardDescription>Update contractor details (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor_name">Contractor Name</Label>
                <Input
                  id="contractor_name"
                  value={formData.contractor_name}
                  onChange={(e) => handleInputChange("contractor_name", e.target.value)}
                  placeholder="Enter contractor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor_contact">Contractor Contact</Label>
                <Input
                  id="contractor_contact"
                  value={formData.contractor_contact}
                  onChange={(e) => handleInputChange("contractor_contact", e.target.value)}
                  placeholder="Enter contact information"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
