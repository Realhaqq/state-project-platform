import { HeroSlider } from "@/components/hero-slider"
import { LatestProjectsCarousel } from "@/components/latest-projects-carousel"
import { LGAWardSelector } from "@/components/lga-ward-selector"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { StatisticsSection } from "@/components/statistics-section"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <HeroSlider />
        </section>

        {/* Stats Section */}
        <StatisticsSection />

        {/* LGA/Ward Selector */}
        <section className="container mx-auto px-4 py-12">
          <LGAWardSelector />
        </section>

        {/* Latest Projects */}
        <section className="container mx-auto px-4 py-12">
          <LatestProjectsCarousel />
        </section>

        {/* Call to Action */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 text-balance">
              Stay Updated on Development Progress
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto text-pretty">
              Subscribe to receive notifications about new projects and updates in your area. Be part of the
              transparency initiative.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                size="lg"
                variant="secondary"
                asChild
                >
                <a href="/subscription">
                  Subscribe to Updates
                </a>
                </Button>
                <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
                >
                <a href="/projects">
                  View All Projects
                </a>
                </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
