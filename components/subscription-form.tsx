"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Mail, MapPin } from "lucide-react"

const subscriptionSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneCall: z.string().min(10, "Please enter a valid phone number"),
  phoneWhatsapp: z.string().optional(),
  address: z.string().optional(),
  lgaId: z.string().min(1, "Please select an LGA"),
  wardId: z.string().optional(),
  pollingUnitId: z.string().optional(),
  traits: z.array(z.string()).min(1, "Please select at least one interest"),
}).refine((data) => {
  if (data.lgaId && (!data.wardId || data.wardId.length === 0)) {
    return false
  }
  return true
}, {
  message: "Please select a ward",
  path: ["wardId"],
}).refine((data) => {
  if (data.wardId && (!data.pollingUnitId || data.pollingUnitId.length === 0)) {
    return false
  }
  return true
}, {
  message: "Please select a polling unit",
  path: ["pollingUnitId"],
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

export function SubscriptionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lgas, setLgas] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [pollingUnits, setPollingUnits] = useState<any[]>([])
  const [loadingLgas, setLoadingLgas] = useState(true)
  const [loadingWards, setLoadingWards] = useState(false)
  const [loadingPollingUnits, setLoadingPollingUnits] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      traits: [],
    },
  })

  const watchedLgaId = watch("lgaId")
  const watchedWardId = watch("wardId")
  const watchedTraits = watch("traits")

  const interestOptions = [
    { id: "infrastructure", label: "Infrastructure Development" },
    { id: "education", label: "Education Projects" },
    { id: "healthcare", label: "Healthcare Facilities" },
    { id: "agriculture", label: "Agricultural Programs" },
    { id: "water", label: "Water Supply Projects" },
    { id: "electricity", label: "Power & Electricity" },
    { id: "roads", label: "Road Construction" },
    { id: "housing", label: "Housing Development" },
    { id: "environment", label: "Environmental Projects" },
    { id: "social", label: "Social Programs" },
  ]

  useEffect(() => {
    fetchLgas()
  }, [])

  useEffect(() => {
    if (watchedLgaId) {
      fetchWards(watchedLgaId)
      setValue("wardId", undefined)
      setValue("pollingUnitId", undefined)
    }
  }, [watchedLgaId, setValue])

  useEffect(() => {
    if (watchedWardId) {
      fetchPollingUnits(watchedWardId)
      setValue("pollingUnitId", undefined)
    }
  }, [watchedWardId, setValue])

  const fetchLgas = async () => {
    try {
      setLoadingLgas(true)
      const response = await fetch("/api/lgas")
      if (response.ok) {
        const data = await response.json()
        setLgas(data.lgas || [])
      }
    } catch (error) {
      console.error("Failed to fetch LGAs:", error)
      toast({
        title: "Error",
        description: "Failed to load LGAs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingLgas(false)
    }
  }

  const fetchWards = async (lgaId: string) => {
    try {
      setLoadingWards(true)
      setWards([])
      const response = await fetch(`/api/wards?lga_id=${lgaId}`)
      if (response.ok) {
        const data = await response.json()
        setWards(data.wards || [])
      }
    } catch (error) {
      console.error("Failed to fetch wards:", error)
      toast({
        title: "Error",
        description: "Failed to load wards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingWards(false)
    }
  }

  const fetchPollingUnits = async (wardId: string) => {
    try {
      setLoadingPollingUnits(true)
      setPollingUnits([])
      const response = await fetch(`/api/polling-units?wardId=${wardId}`)
      if (response.ok) {
        const data = await response.json()
        setPollingUnits(data)
      }
    } catch (error) {
      console.error("Failed to fetch polling units:", error)
      toast({
        title: "Error",
        description: "Failed to load polling units. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingPollingUnits(false)
    }
  }

  const handleTraitChange = (traitId: string, checked: boolean) => {
    const currentTraits = watchedTraits || []
    if (checked) {
      setValue("traits", [...currentTraits, traitId])
    } else {
      setValue(
        "traits",
        currentTraits.filter((t) => t !== traitId),
      )
    }
  }

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to subscribe")
      }

      toast({
        title: "Subscription successful!",
        description: "You've been subscribed to quarterly development reports. Check your email for confirmation.",
      })

      reset()
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
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
          <Mail className="h-5 w-5" />
          Subscribe for Quarterly Reports
        </CardTitle>
        <CardDescription>Get updates about development projects in your area every quarter</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Enter your full name" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register("email")} placeholder="your@email.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneCall">Phone Number</Label>
                <Input id="phoneCall" {...register("phoneCall")} placeholder="+234..." />
                {errors.phoneCall && <p className="text-sm text-destructive">{errors.phoneCall.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneWhatsapp">WhatsApp Number (Optional)</Label>
                <Input id="phoneWhatsapp" {...register("phoneWhatsapp")} placeholder="+234..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input id="address" {...register("address")} placeholder="Your address" />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lgaId">Local Government Area</Label>
                <Select value={watchedLgaId} onValueChange={(value) => setValue("lgaId", value)} disabled={loadingLgas}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingLgas ? "Loading LGAs..." : "Select LGA"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lgas.map((lga) => (
                      <SelectItem key={lga.id} value={lga.id}>
                        {lga.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lgaId && <p className="text-sm text-destructive">{errors.lgaId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wardId">Ward</Label>
                <Select value={watchedWardId} onValueChange={(value) => setValue("wardId", value)} disabled={!watchedLgaId || loadingWards}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !watchedLgaId
                        ? "Select LGA first"
                        : loadingWards
                        ? "Loading wards..."
                        : "Select Ward"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.wardId && <p className="text-sm text-destructive">{errors.wardId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pollingUnitId">Polling Unit</Label>
                <Select value={watch("pollingUnitId")} onValueChange={(value) => setValue("pollingUnitId", value)} disabled={!watchedWardId || loadingPollingUnits}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !watchedWardId
                        ? "Select ward first"
                        : loadingPollingUnits
                        ? "Loading polling units..."
                        : "Select Polling Unit"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {pollingUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pollingUnitId && <p className="text-sm text-destructive">{errors.pollingUnitId.message}</p>}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Areas of Interest</h3>
            <p className="text-sm text-muted-foreground">
              Select the types of development projects you'd like to receive updates about
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interestOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={watchedTraits?.includes(option.id) || false}
                    onCheckedChange={(checked) => handleTraitChange(option.id, checked as boolean)}
                  />
                  <Label htmlFor={option.id} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.traits && <p className="text-sm text-destructive">{errors.traits.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Subscribing..." : "Subscribe to Reports"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
