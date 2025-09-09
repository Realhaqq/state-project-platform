"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatusChange {
  id: string
  old_status: string | null
  new_status: string
  changed_at: string
  changed_by_name: string
}

interface ProjectStatusTimelineProps {
  projectId: string
}

export function ProjectStatusTimeline({ projectId }: ProjectStatusTimelineProps) {
  const [statusHistory, setStatusHistory] = useState<StatusChange[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatusHistory = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/status-history`)
        if (response.ok) {
          const data = await response.json()
          setStatusHistory(data)
        }
      } catch (error) {
        console.error("Failed to fetch status history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatusHistory()
  }, [projectId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "ongoing":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "planned":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "ongoing":
        return "text-blue-600"
      case "planned":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {statusHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">No status changes recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {statusHistory.map((change, index) => (
              <div key={change.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(change.new_status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium capitalize ${getStatusColor(change.new_status)}`}>
                      {change.new_status}
                    </span>
                    {change.old_status && <span className="text-gray-500 text-sm">(from {change.old_status})</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(change.changed_at).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-sm text-gray-600">Updated by {change.changed_by_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
