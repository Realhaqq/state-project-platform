"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface LGA {
  id: string
  name: string
}

interface Ward {
  id: string
  name: string
  lga_id: string
}

interface LGAWardSelectorProps {
  onSelectionChange?: (lgaId: string | null, wardId: string | null) => void
}

export function LGAWardSelector({ onSelectionChange }: LGAWardSelectorProps) {
  const [selectedLGA, setSelectedLGA] = useState<string>("none")
  const [selectedWard, setSelectedWard] = useState<string>("none")
  const [lgas, setLGAs] = useState<LGA[]>([])
  const [availableWards, setAvailableWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLGAs = async () => {
      try {
        const response = await fetch("/api/lgas")
        if (response.ok) {
          const data = await response.json()
          setLGAs(data.lgas || [])
        } else {
          console.error("Failed to fetch LGAs, status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch LGAs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLGAs()
  }, [])

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedLGA && selectedLGA !== "none") {
        try {
          const response = await fetch(`/api/wards?lga_id=${selectedLGA}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableWards(data.wards || [])
          } else {
            console.error("Failed to fetch wards, status:", response.status);
            setAvailableWards([])
          }
        } catch (error) {
          console.error("Failed to fetch wards:", error)
          setAvailableWards([])
        }
        setSelectedWard("none") // Reset ward selection when LGA changes
      } else {
        setAvailableWards([])
        setSelectedWard("none")
      }
    }

    fetchWards()
  }, [selectedLGA])

  useEffect(() => {
    const lgaId = selectedLGA === "none" ? null : selectedLGA
    const wardId = selectedWard === "none" ? null : selectedWard
    onSelectionChange?.(lgaId, wardId)
  }, [selectedLGA, selectedWard, onSelectionChange])

  const handleSearch = () => {
    // This would trigger the search/filter functionality
    const lgaId = selectedLGA === "none" ? null : selectedLGA
    const wardId = selectedWard === "none" ? null : selectedWard

    // Trigger parent component's search functionality
    onSelectionChange?.(lgaId, wardId)
  }

  const handleReset = () => {
    setSelectedLGA("none")
    setSelectedWard("none")
    setAvailableWards([])
  }

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Find Projects by Location</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Local Government Area</label>
          <Select value={selectedLGA} onValueChange={(value: string) => {
            setSelectedLGA(value);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select LGA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                Select LGA
              </SelectItem>
              {lgas.map((lga) => (
                <SelectItem key={lga.id} value={lga.id}>
                  {lga.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Ward</label>
          <Select value={selectedWard} onValueChange={(value: string) => {
            setSelectedWard(value);
          }} disabled={!selectedLGA || selectedLGA === "none"}>
            <SelectTrigger>
              <SelectValue placeholder="Select Ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                Select Ward
              </SelectItem>
              {availableWards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={handleReset} className="w-full bg-transparent">
            Reset
          </Button>
        </div>
      </div>

      {selectedLGA && selectedLGA !== "none" && (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            {selectedWard && selectedWard !== "none" ? (
              <>
                Showing projects in{" "}
                <span className="font-medium">
                  {availableWards.find((w) => w.id === selectedWard)?.name}
                </span>{" "}
                ward, <span className="font-medium">{lgas.find((l) => l.id === selectedLGA)?.name}</span> LGA
              </>
            ) : (
              <>
                Showing all projects in{" "}
                <span className="font-medium">{lgas.find((l) => l.id === selectedLGA)?.name}</span> LGA
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
