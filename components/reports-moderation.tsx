"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CheckCircle, XCircle, Eye, Flag, MessageSquare } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Report {
  id: string
  type: "project" | "comment"
  reason: string
  description: string
  status: "pending" | "resolved" | "dismissed"
  reportedAt: string
  reporter: {
    name: string
    email: string
  }
  target: {
    id: string
    title?: string
    content: string
    author: string
  }
}

export function ReportsModeration() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [resolutionNote, setResolutionNote] = useState("")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/admin/reports")
      if (response.ok) {
        const data = await response.json()
        const transformedReports = (data.reports || []).map((report: any) => ({
          id: report.id,
          type: report.project_id ? "project" : "comment",
          reason: report.report_type || "General",
          description: report.description || "",
          status: report.status === "new" ? "pending" : report.status === "in_review" ? "pending" : report.status === "resolved" ? "resolved" : "dismissed",
          reportedAt: report.created_at,
          reporter: {
            name: report.reporter_name || "Anonymous",
            email: report.reporter_email || ""
          },
          target: {
            id: report.project_id || report.id,
            title: report.project_title || "Report",
            content: report.description || "",
            author: report.reporter_name || "Unknown"
          }
        }))
        setReports(transformedReports)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: "resolve" | "dismiss") => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: resolutionNote }),
      })

      if (response.ok) {
        toast({
          title: `Report ${action}d`,
          description: `The report has been ${action}d successfully.`,
        })
        fetchReports()
        setSelectedReport(null)
        setResolutionNote("")
      } else {
        throw new Error(`Failed to ${action} report`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} report. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2 break-words">
                    {report.type === "project" ? <Flag className="h-5 w-5 flex-shrink-0" /> : <MessageSquare className="h-5 w-5 flex-shrink-0" />}
                    <span className="break-words">{report.type === "project" ? "Project Report" : "Comment Report"}</span>
                  </CardTitle>
                  <CardDescription className="break-words">
                    Reason: {report.reason} • Reported by {report.reporter.name}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    report.status === "pending" ? "secondary" : report.status === "resolved" ? "default" : "outline"
                  }
                  className="self-start sm:self-center"
                >
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 break-words">
                <strong>Description:</strong> {report.description}
              </p>
              <div className="bg-muted p-3 rounded-lg mb-4">
                <p className="text-sm break-words">
                  <strong>Reported Content:</strong> {report.target.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1 break-words">By: {report.target.author}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Reported: {new Date(report.reportedAt).toLocaleDateString()}
                </p>
                {report.status === "pending" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)} className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Report</DialogTitle>
                        <DialogDescription>Take action on this content report</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Report Details</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Type:</strong> <span className="break-words">{report.type}</span>
                            </div>
                            <div>
                              <strong>Reason:</strong> <span className="break-words">{report.reason}</span>
                            </div>
                            <div>
                              <strong>Reporter:</strong> <span className="break-words">{report.reporter.name}</span>
                            </div>
                            <div>
                              <strong>Reported:</strong> {new Date(report.reportedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm mt-2 break-words">
                            <strong>Description:</strong> {report.description}
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <h4 className="font-medium mb-2">Reported Content</h4>
                          <p className="text-sm break-words">{report.target.content}</p>
                          <p className="text-xs text-muted-foreground mt-1 break-words">By: {report.target.author}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Resolution Note</label>
                          <Textarea
                            placeholder="Add a note about your decision..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => handleReportAction(report.id, "dismiss")} className="w-full sm:w-auto">
                          <XCircle className="h-4 w-4 mr-2" />
                          Dismiss
                        </Button>
                        <Button onClick={() => handleReportAction(report.id, "resolve")} className="w-full sm:w-auto">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve & Take Action
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No reports to review at this time.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
