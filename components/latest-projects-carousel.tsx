"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string
  category: string
  status: string
  completion_percentage: number
  lga_name: string
  ward_name: string
  start_date: string
  budget: string | number
  images: Array<{
    id: string
    storage_path: string
    caption?: string
    sort_order: number
  }>
}

export function LatestProjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
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
    const fetchLatestProjects = async () => {
      try {
        const response = await fetch("/api/projects/latest")
        if (response.ok) {
          const data = await response.json()
          // Only show last 20 projects
          setProjects((data.projects || []).slice(0, 20))
        }
      } catch (error) {
        console.error("Failed to fetch latest projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProjects()
  }, [])

  useEffect(() => {
    if (projects.length > 3) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, projects.length - 2))
      }, 5000) // 5 seconds as specified

      return () => clearInterval(timer)
    }
  }, [projects.length])

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return 'N/A'
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed":
        return "bg-yellow-100 text-yellow-800"
      case "ongoing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Latest Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Responsive: 1 card on mobile, 3 on desktop
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const cardsToShow = isMobile ? 1 : 3
  const visibleProjects = projects.slice(currentIndex, currentIndex + cardsToShow)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Latest Projects</h2>
        {projects.length > 3 && (
          <div className="flex gap-2">
            {Array.from({ length: Math.max(1, projects.length - 2) }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-border"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No projects available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="bg-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl font-bold text-balance leading-tight">{project.title}</CardTitle>
                    <Badge className={getStatusColor(project.status) + " text-xs px-2 py-1 font-semibold"}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Image */}
                  {project.images && project.images.length > 0 && (
                    <div className="w-full h-36 overflow-hidden rounded-lg border border-border">
                      <img
                        src={getImageUrl(project.images[0].storage_path)}
                        alt={project.images[0].caption || project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  )}

                  <p className="text-base text-muted-foreground text-pretty font-normal">{project.description}</p>

                  <div className="flex items-center gap-2 text-base text-muted-foreground font-medium">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {project.ward_name}, {project.lga_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-base text-muted-foreground font-medium">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-base font-medium">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Progress
                      </span>
                      <span className="font-bold">{project.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-base font-bold text-foreground">Budget: {formatCurrency(project.budget)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
