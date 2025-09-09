"use client"

import { useState } from "react"
import { CldUploadWidget } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, Check } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ value = [], onChange, maxImages = 10, disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [useFallback, setUseFallback] = useState(true)
  const { toast } = useToast()

  const onUpload = (result: any) => {
    console.log("Upload result:", result)
    if (result?.info?.secure_url) {
      const newUrl = result.info.secure_url
      console.log("New image URL:", newUrl)
      const updatedUrls = [...value, newUrl]
      onChange(updatedUrls)
      setUploadSuccess(true)
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded and added to the project.",
      })
      // Keep uploading state for a moment to show success feedback
      setTimeout(() => {
        setIsUploading(false)
        setUploadSuccess(false)
      }, 2000)
    } else {
      console.log("Upload result missing secure_url:", result)
      setIsUploading(false)
    }
  }

  const onError = (error: any) => {
    console.error("Upload error:", error)
    setIsUploading(false)
    toast({
      title: "Upload failed",
      description: "There was an error uploading your image. Please try again.",
      variant: "destructive",
    })
  }

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url))
  }

  const handleFallbackUpload = async (file: File) => {
    if (!file) return

    console.log("Starting fallback upload for file:", file.name)
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default')
      formData.append('folder', 'niger-state-projects')

      console.log("Upload preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default')
      console.log("Cloud name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      console.log("Response status:", response.status)
      const result = await response.json()
      console.log("Upload result:", result)

      if (result.secure_url) {
        const updatedUrls = [...value, result.secure_url]
        onChange(updatedUrls)
        setUploadSuccess(true)
        toast({
          title: "Image uploaded successfully",
          description: "Your image has been uploaded and added to the project.",
        })
        setTimeout(() => {
          setIsUploading(false)
          setUploadSuccess(false)
        }, 2000)
      } else {
        throw new Error(result.error?.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Fallback upload error:', error)
      setIsUploading(false)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((url) => (
          <Card key={url} className="relative aspect-square overflow-hidden group">
            <Image
              src={url || "/placeholder.svg"}
              alt="Project image"
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <Button
              type="button"
              onClick={() => onRemove(url)}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </Card>
        ))}

        {value.length < maxImages && (
          <>
            {!useFallback ? (
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                options={{
                  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                  maxFiles: 1,
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  maxFileSize: 5000000, // 5MB
                  folder: "niger-state-projects",
                  multiple: false,
                  showUploadMoreButton: false,
                  showPoweredBy: false,
                  autoMinimize: false,
                  showCompletedButton: true,
                  showUploadList: true,
                  sources: ["local"],
                  cropping: false,
                  defaultSource: "local",
                  styles: {
                    palette: {
                      window: "#FFFFFF",
                      windowBorder: "#90A0B3",
                      tabIcon: "#0078FF",
                      menuIcons: "#5A616A",
                      textDark: "#000000",
                      textLight: "#FFFFFF",
                      link: "#0078FF",
                      action: "#FF620C",
                      inactiveTabIcon: "#0E2F5A",
                      error: "#F44235",
                      inProgress: "#0078FF",
                      complete: "#20B832",
                      sourceBg: "#E4EBF1"
                    }
                  }
                }}
                onUpload={onUpload}
                onError={(error) => {
                  console.error("Widget upload error:", error)
                  // If widget fails, switch to fallback
                  setUseFallback(true)
                  onError(error)
                }}
                onOpen={() => {
                  console.log("Widget opened")
                  setIsUploading(true)
                }}
                onClose={() => {
                  console.log("Widget closed")
                  // Only set uploading to false if upload hasn't completed yet
                  setTimeout(() => setIsUploading(false), 500)
                }}
              >
                {({ open }) => (
                  <Card
                    className={`aspect-square border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center ${
                      disabled || isUploading
                        ? "border-muted-foreground/25 cursor-not-allowed opacity-50"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onClick={() => !disabled && !isUploading && open()}
                  >
                    {isUploading ? (
                      uploadSuccess ? (
                        <div className="flex flex-col items-center">
                          <Check className="h-8 w-8 text-green-500 mb-2" />
                          <p className="text-sm text-green-600">Upload successful!</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      )
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">Click to upload image</p>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="mt-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUseFallback(true)
                          }}
                        >
                          Use simple upload
                        </Button>
                      </>
                    )}
                  </Card>
                )}
              </CldUploadWidget>
            ) : (
              <Card className="aspect-square border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFallbackUpload(file)
                    }
                  }}
                  disabled={disabled || isUploading}
                  className="hidden"
                  id="fallback-upload"
                />
                <label htmlFor="fallback-upload" className="cursor-pointer flex flex-col items-center">
                  {isUploading ? (
                    uploadSuccess ? (
                      <div className="flex flex-col items-center">
                        <Check className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-600">Upload successful!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    )
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">Choose file</p>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="mt-1 text-xs"
                        onClick={() => setUseFallback(false)}
                      >
                        Use advanced upload
                      </Button>
                    </>
                  )}
                </label>
              </Card>
            )}
          </>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {value.length}/{maxImages} images uploaded
      </p>
    </div>
  )
}
