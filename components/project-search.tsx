"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar, DollarSign, Eye } from "lucide-react"
import { LGAWardSelector } from "./lga-ward-selector"
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
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 10
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null)
  const [selectedWard, setSelectedWard] = useState<string | null>(null)
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
    const page = parseInt(searchParams.get("page") || "1", 10)

    setSearchTerm(query)
    setSelectedLGA(lga || null)
    setSelectedWard(ward || null)
    setCurrentPage(page)
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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set("q", searchTerm)
    } else {
      params.delete("q")
    }
    if (selectedLGA) {
      params.set("lga", selectedLGA)
    } else {
      params.delete("lga")
    }
    if (selectedWard) {
      params.set("ward", selectedWard)
    } else {
      params.delete("ward")
    }
    params.set("page", "1")
    router.push(`/projects?${params}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed":
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
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by title, description, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </form>
      <LGAWardSelector
        onSelectionChange={(lgaId, wardId) => {
          setSelectedLGA(lgaId)
          setSelectedWard(wardId)
          handleSearch()
        }}
      />

      <div className="text-sm text-muted-foreground">
        Found {projects.length} project{projects.length !== 1 ? "s" : ""}
      </div>

      <div className="grid gap-6">
        {projects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage).map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow rounded-xl border border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-semibold mb-2 text-balance leading-tight">{project.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-base font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.lga_name} LGA, {project.ward_name} Ward
                    </span>
                    <Badge variant="outline" className="text-xs px-2 py-1 font-semibold">{project.category}</Badge>
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(project.project_status)} className="text-xs px-2 py-1 font-semibold">
                  {project.project_status === "pending" ? "Proposed" : project.project_status.charAt(0).toUpperCase() + project.project_status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3 text-base font-normal">{project.description}</p>

              {project.images && project.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {project.images.slice(0, 3).map((image, index) => (
                    <img
                      key={image.id || index}
                      src={getImageUrl(image.storage_path)}
                      alt={image.caption || `${project.title} image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ))}
                  {project.images.length > 3 && (
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-base text-muted-foreground border border-border">
                      +{project.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-base text-muted-foreground font-medium">
                  Published by {project.publisher_name} • {new Date(project.created_at).toLocaleDateString()}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm" className="font-semibold">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {projects.length > projectsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set("page", (currentPage - 1).toString())
              router.push(`/projects?${params}`)
            }}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm font-medium">Page {currentPage} of {Math.ceil(projects.length / projectsPerPage)}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === Math.ceil(projects.length / projectsPerPage)}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set("page", (currentPage + 1).toString())
              router.push(`/projects?${params}`)
            }}
          >
            Next
          </Button>
        </div>
      )}

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
