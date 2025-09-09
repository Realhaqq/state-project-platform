import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"
import { Providers } from "@/components/providers"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import "@/lib/polyfills"

export const metadata: Metadata = {
  title: "Niger State Development Platform",
  description: "Tracking development projects across all 274 wards in Niger State",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col`}>
        <Providers>
          <SiteHeader />
          <main className="flex-1">
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
          <SiteFooter />
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}