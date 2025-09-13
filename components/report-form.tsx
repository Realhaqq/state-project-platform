"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Flag, AlertTriangle } from "lucide-react"

type ReportFormData = {
  reporterName?: string
  reporterEmail?: string
  reporterPhone?: string
  reason: string
  message: string
}

interface ReportFormProps {
  projectId: string
  projectTitle: string
  onSuccess?: () => void
  // ...existing code...
}

export function ReportForm({ projectId, projectTitle, onSuccess }: ReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<ReportFormData>({
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    reason: "",
    message: "",
  })

  const reset = () => {
    setFormData({
      reporterName: "",
      reporterEmail: "",
      reporterPhone: "",
      reason: "",
      message: "",
    })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Manual validation
    if (!formData.reason || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please select a reason and provide a description.",
        variant: "destructive",
      })
      return
    }
    if (formData.message.length < 2) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 2 characters.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: String(projectId),
          message: String(formData.message),
          reason: formData.reason,
          reporterName: formData.reporterName,
          reporterEmail: formData.reporterEmail,
          reporterPhone: formData.reporterPhone,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit report")
      }
      toast({
        title: "Report submitted",
        description: "Thank you for your report. We'll review it and take appropriate action.",
      })
      reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Report submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Report an Issue
        </CardTitle>
        <CardDescription>Report problems or concerns about "{projectTitle}"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">Important</p>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Please provide accurate information. False reports may result in action being taken against your account.
          </p>
        </div>

  <form onSubmit={onSubmit} className="space-y-6">
          {/* Reporter Information (Optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              Providing your contact information helps us follow up on your report
            </p>

            <div className="space-y-2">
              <Label htmlFor="reporterName">Your Name</Label>
              <Input id="reporterName" value={formData.reporterName} onChange={e => setFormData(f => ({ ...f, reporterName: e.target.value }))} placeholder="Enter your name (optional)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Email Address</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  value={formData.reporterEmail}
                  onChange={e => setFormData(f => ({ ...f, reporterEmail: e.target.value }))}
                  placeholder="your@email.com (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterPhone">Phone Number</Label>
                <Input id="reporterPhone" value={formData.reporterPhone} onChange={e => setFormData(f => ({ ...f, reporterPhone: e.target.value }))} placeholder="+234... (optional)" />
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Report Details</h3>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reporting</Label>
              <select id="reason" value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} className="block w-full border rounded px-2 py-2 text-sm text-muted-foreground">
                <option value="">Select a reason</option>
                <option value="spam">Spam or irrelevant content</option>
                <option value="abuse">Abusive or harmful content</option>
                <option value="incorrect">Incorrect or misleading information</option>
                <option value="duplicate">Duplicate project</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Describe the Issue</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                placeholder="Please provide detailed information about the issue you're reporting..."
                rows={5}
                className="text-xs text-muted-foreground placeholder:text-xs placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting Report..." : "Submit Report"}
            </Button>
            {/* <Button type="button" variant="outline" className="w-full" onClick={() => reset()}>
              Cancel
            </Button> */}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
