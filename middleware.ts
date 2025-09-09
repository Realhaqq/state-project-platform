import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || (token.role !== "admin" && token.role !== "super_admin")) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Publisher routes
    if (pathname.startsWith("/publisher")) {
      if (!token || (token.role !== "publisher" && token.role !== "admin" && token.role !== "super_admin")) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes
        if (pathname === "/" || pathname.startsWith("/projects") || pathname.startsWith("/auth")) {
          return true
        }

        // Protected routes require authentication
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/admin/:path*", "/publisher/:path*", "/profile/:path*"],
}
