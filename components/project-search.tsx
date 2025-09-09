"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar, DollarSign, Eye } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string
  category: string
  budget: number
  project_status: string
  start_date: string
  expected_completion: string
  lga_name: string
  ward_name: string
  publisher_name: string
  created_at: string
  images: Array<{
    id: string
    storage_path: string
    caption?: string
    sort_order: number
  }>
}

export function ProjectSearch() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

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
    const query = searchParams.get("q") || ""
    const lga = searchParams.get("lga") || ""
    const ward = searchParams.get("ward") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""

    setSearchTerm(query)
    fetchProjects({ query, lga, ward, category, status })
  }, [searchParams])

  const fetchProjects = async (filters: {
    query?: string
    lga?: string
    ward?: string
    category?: string
    status?: string
  }) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/projects/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set("query", searchTerm)
    } else {
      params.delete("query")
    }
    router.push(`/projects?${params}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "secondary"
      case "ongoing":
        return "default"
      case "completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by title, description, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </form>

      <div className="text-sm text-muted-foreground">
        Found {projects.length} project{projects.length !== 1 ? "s" : ""}
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.lga_name} LGA, {project.ward_name} Ward
                    </span>
                    <Badge variant="outline">{project.category}</Badge>
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(project.project_status)}>{project.project_status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3">{project.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>₦{project.budget ? Number(project.budget).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Expected: {new Date(project.expected_completion).toLocaleDateString()}</span>
                </div>
              </div>

              {project.images && project.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {project.images.slice(0, 3).map((image, index) => (
                    <img
                      key={image.id || index}
                      src={getImageUrl(image.storage_path)}
                      alt={image.caption || `${project.title} image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ))}
                  {project.images.length > 3 && (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                      +{project.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Published by {project.publisher_name} • {new Date(project.created_at).toLocaleDateString()}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No projects found matching your search criteria.</p>
            <Button variant="outline" onClick={() => router.push("/projects")}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
