"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSlide {
  id: number
  title: string
  subtitle: string
  image_url: string
  link_url?: string
}

const defaultSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Niger State Ward Development Projects...",
    subtitle: "For good governance, greater ruler & community development.",
    image_url: "/slide1.jpg",
  },
  {
    id: 2,
    title: "Transforming Communities",
    subtitle: "All communities in 274 wards benefit. All Nigerlites benefit.",
    image_url: "/slide2.jpg",
  },
  {
    id: 3,
    title: "Transparent & Accountable Governance",
    subtitle: "Real-time updates in community development projects.",
    image_url: "/slide3.jpg",
  },
  {
    id: 4,
    title: "Community Engagement",
    subtitle: "Your voice matters in community planning. Tell your story.",
    image_url: "/slide4.jpg",
  },
  {
    id: 5,
    title: "Progress Monitoring",
    subtitle: "Track and see how projects are transforming communities.",
    image_url: "/slide5.jpg",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides] = useState<HeroSlide[]>(defaultSlides)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // 5 seconds as specified in feedback
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={slide.image_url || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-balance">{slide.title}</h1>
              <p className="text-lg md:text-xl mb-8 text-pretty">{slide.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {slide.link_url ? (
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    asChild
                  >
                    <a href={slide.link_url}>Track Projects</a>
                  </Button>
                ) : (
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Track Projects
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white text-white hover:bg-white/20"
                  asChild
                >
                  <a href="/subscription">Latest Updates</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
