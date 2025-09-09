import { Suspense } from "react"
import { ProjectSearch } from "@/components/project-search"
import { ProjectFilters } from "@/components/project-filters"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Development Projects</h1>
          <p className="text-muted-foreground">Explore development projects across Niger State's 274 wards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ProjectFilters />
            </Suspense>
          </div>
          <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading projects...</div>}>
              <ProjectSearch />
            </Suspense>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
