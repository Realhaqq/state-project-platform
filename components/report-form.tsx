"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CaptchaWrapper } from "@/components/captcha-wrapper"
import { Flag, AlertTriangle } from "lucide-react"

const reportSchema = z.object({
  reporterName: z.string().min(2, "Name must be at least 2 characters").optional(),
  reporterEmail: z.string().email("Please enter a valid email address").optional(),
  reporterPhone: z.string().optional(),
  message: z.string().min(10, "Please provide more details about the issue"),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportFormProps {
  projectId: string
  projectTitle: string
}

export function ReportForm({ projectId, projectTitle }: ReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  })

  const onSubmit = async (data: ReportFormData) => {
    if (!captchaToken) {
      toast({
        title: "Captcha required",
        description: "Please complete the captcha verification.",
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
          projectId,
          ...data,
          captchaToken,
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
      setCaptchaToken(null)
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Reporter Information (Optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              Providing your contact information helps us follow up on your report
            </p>

            <div className="space-y-2">
              <Label htmlFor="reporterName">Your Name</Label>
              <Input id="reporterName" {...register("reporterName")} placeholder="Enter your name (optional)" />
              {errors.reporterName && <p className="text-sm text-destructive">{errors.reporterName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Email Address</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  {...register("reporterEmail")}
                  placeholder="your@email.com (optional)"
                />
                {errors.reporterEmail && <p className="text-sm text-destructive">{errors.reporterEmail.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterPhone">Phone Number</Label>
                <Input id="reporterPhone" {...register("reporterPhone")} placeholder="+234... (optional)" />
                {errors.reporterPhone && <p className="text-sm text-destructive">{errors.reporterPhone.message}</p>}
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Report Details</h3>

            <div className="space-y-2">
              <Label htmlFor="message">Describe the Issue</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Please provide detailed information about the issue you're reporting..."
                rows={5}
              />
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>
          </div>

          {/* Captcha */}
          <div className="space-y-2">
            <Label>Security Verification</Label>
            <CaptchaWrapper onVerify={setCaptchaToken} onError={() => setCaptchaToken(null)} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !captchaToken}>
            {isSubmitting ? "Submitting Report..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
