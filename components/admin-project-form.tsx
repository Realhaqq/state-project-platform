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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/hooks/use-toast"

const adminProjectSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  status: z.enum(["planned", "ongoing", "completed"]),
  approval_status: z.enum(["pending", "approved", "rejected"]),
  budget_naira: z.string().optional(),
  contractor: z.string().optional(),
  images: z.array(z.string()).max(10).optional(),
})

type AdminProjectFormData = z.infer<typeof adminProjectSchema>

interface AdminProjectFormProps {
  project?: any
  onSave: (data: AdminProjectFormData) => void
  onCancel: () => void
}

export function AdminProjectForm({ project, onSave, onCancel }: AdminProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AdminProjectFormData>({
    resolver: zodResolver(adminProjectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      status: project?.status || "planned",
      approval_status: project?.approval_status || "pending",
      budget_naira: project?.budget_naira?.toString() || "",
      contractor: project?.contractor || "",
      images: project?.images || [],
    },
  })

  const watchedImages = watch("images") || []

  const handleImagesChange = (imageUrls: string[]) => {
    setValue("images", imageUrls)
  }

  const onSubmit = async (data: AdminProjectFormData) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
      toast({
        title: "Success",
        description: "Project updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project ? "Edit Project" : "Create Project"}</CardTitle>
        <CardDescription>Manage project details and images</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={4} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Project Status</Label>
                <Select onValueChange={(value) => setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval_status">Approval Status</Label>
                <Select onValueChange={(value) => setValue("approval_status", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select approval status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_naira">Budget (NGN)</Label>
                <Input id="budget_naira" type="number" {...register("budget_naira")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor">Contractor</Label>
                <Input id="contractor" {...register("contractor")} />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Project Images</Label>
              <ImageUpload value={watchedImages} onChange={handleImagesChange} maxImages={10} disabled={isSubmitting} />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Project"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
