"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Filter, X } from "lucide-react"

interface FilterOptions {
  lgas: Array<{ id: string; name: string }>
  wards: Array<{ id: string; name: string; lga_id: string }>
  categories: string[]
}

export function ProjectFilters() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ lgas: [], wards: [], categories: [] })
  const [selectedLGA, setSelectedLGA] = useState("all")
  const [selectedWard, setSelectedWard] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [wards, setWards] = useState<Array<{ id: string; name: string; lga_id: string }>>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    fetchFilterOptions()

    // Set initial values from URL params
    setSelectedLGA(searchParams.get("lga") || "all")
    setSelectedWard(searchParams.get("ward") || "all")
    setSelectedCategory(searchParams.get("category") || "all")
    setSelectedStatus(searchParams.get("status") || "all")
  }, [searchParams])

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedLGA && selectedLGA !== "all") {
        try {
          const response = await fetch(`/api/wards?lga_id=${selectedLGA}`)
          if (response.ok) {
            const data = await response.json()
            setWards(data.wards || [])
          } else {
            console.error("Failed to fetch wards, status:", response.status)
            setWards([])
          }
        } catch (error) {
          console.error("Failed to fetch wards:", error)
          setWards([])
        }
        setSelectedWard("all") // Reset ward selection when LGA changes
      } else {
        setWards([])
        setSelectedWard("all")
      }
    }

    fetchWards()
  }, [selectedLGA])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/projects/filters")
      if (response.ok) {
        const data = await response.json()
        setFilterOptions(data)
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    }
  }

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Clear ward when LGA changes
    if (key === "lga" && value !== selectedLGA) {
      params.delete("ward")
      setSelectedWard("all")
    }

    router.push(`/projects?${params}`)
  }

  const clearAllFilters = () => {
    router.push("/projects")
  }

  const availableWards = wards

  const hasActiveFilters =
    selectedLGA !== "all" || selectedWard !== "all" || selectedCategory !== "all" || selectedStatus !== "all"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <CardDescription>Narrow down your project search</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Local Government Area</label>
          <Select
            value={selectedLGA}
            onValueChange={(value) => {
              setSelectedLGA(value)
              updateFilters("lga", value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select LGA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All LGAs</SelectItem>
              {filterOptions.lgas.map((lga) => (
                <SelectItem key={lga.id} value={lga.id}>
                  {lga.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Ward</label>
          <Select
            value={selectedWard}
            onValueChange={(value) => {
              setSelectedWard(value)
              updateFilters("ward", value)
            }}
            disabled={selectedLGA === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedLGA !== "all" ? "Select Ward" : "Select LGA first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {availableWards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value)
              updateFilters("category", value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {filterOptions.categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value)
              updateFilters("status", value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planned">Planning</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <>
            <Separator />
            <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
