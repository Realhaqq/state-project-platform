"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, TrendingUp, MapPin, Users, MessageSquare, Flag, UserCheck, Building } from "lucide-react"

interface Statistics {
  projects: {
    total: number
    completed: number
    ongoing: number
    planned: number
  }
  geography: {
    totalLgas: number
    totalWards: number
    lgasWithProjects: number
    wardsWithProjects: number
  }
  users: {
    total: number
    publishers: number
    admins: number
  }
  engagement: {
    comments: number
    reports: number
    subscriptions: number
  }
}

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  color: string
  bgColor: string
}

function StatCard({ icon, value, label, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 ${bgColor} rounded-full`}>
            <div className={color}>
              {icon}
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {value.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatisticsSection() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/statistics")
        if (!response.ok) {
          throw new Error("Failed to fetch statistics")
        }
        const data = await response.json()
        setStatistics(data.statistics)
      } catch (err) {
        console.error("Error fetching statistics:", err)
        setError("Failed to load statistics")
        // Fallback to default values if API fails
        setStatistics({
          projects: { total: 0, completed: 0, ongoing: 0, planned: 0 },
          geography: { totalLgas: 25, totalWards: 274, lgasWithProjects: 0, wardsWithProjects: 0 },
          users: { total: 0, publishers: 0, admins: 0 },
          engagement: { comments: 0, reports: 0, subscriptions: 0 }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center p-6">
                  <div className="animate-pulse flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-16 h-6 bg-gray-300 rounded"></div>
                      <div className="w-20 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error && !statistics) {
    return (
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>Unable to load statistics at this time.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<BarChart3 className="h-6 w-6" />}
            value={statistics!.projects.total}
            label="Total Projects"
            color="text-primary"
            bgColor="bg-primary/10"
          />

          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            value={statistics!.projects.completed}
            label="Completed"
            color="text-secondary"
            bgColor="bg-secondary/10"
          />

          <StatCard
            icon={<BarChart3 className="h-6 w-6" />}
            value={statistics!.projects.ongoing}
            label="Ongoing"
            color="text-chart-1"
            bgColor="bg-chart-1/10"
          />

          <StatCard
            icon={<MapPin className="h-6 w-6" />}
            value={statistics!.projects.planned}
            label="Planned"
            color="text-chart-2"
            bgColor="bg-chart-2/10"
          />

          <StatCard
            icon={<MapPin className="h-6 w-6" />}
            value={statistics!.geography.wardsWithProjects}
            label="Wards Covered"
            color="text-accent"
            bgColor="bg-accent/10"
          />

          <StatCard
            icon={<Building className="h-6 w-6" />}
            value={statistics!.geography.lgasWithProjects}
            label="LGAs Active"
            color="text-chart-1"
            bgColor="bg-chart-1/10"
          />

          <StatCard
            icon={<Users className="h-6 w-6" />}
            value={statistics!.users.total}
            label="Active Users"
            color="text-chart-2"
            bgColor="bg-chart-2/10"
          />

          <StatCard
            icon={<UserCheck className="h-6 w-6" />}
            value={statistics!.users.publishers}
            label="Publishers"
            color="text-chart-3"
            bgColor="bg-chart-3/10"
          />

          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            value={statistics!.engagement.comments}
            label="Comments"
            color="text-chart-4"
            bgColor="bg-chart-4/10"
          />

          <StatCard
            icon={<Flag className="h-6 w-6" />}
            value={statistics!.engagement.reports}
            label="Reports"
            color="text-chart-5"
            bgColor="bg-chart-5/10"
          />
        </div>
      </div>
    </section>
  )
}
