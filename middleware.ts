import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Skip middleware for logout action
  if (request.nextUrl.pathname === "/api/auth/logout") {
    return NextResponse.next()
  }

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isAdminUser = await isAdmin(request)

    if (!isAdminUser) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protected routes that require authentication
  if (
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/orders") ||
    request.nextUrl.pathname.startsWith("/checkout")
  ) {
    const isAuthUser = await isAuthenticated(request)

    if (!isAuthUser) {
      return NextResponse.redirect(new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*", "/checkout/:path*"],
}
