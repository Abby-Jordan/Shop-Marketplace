import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for logout
  if (pathname === "/api/auth/logout") {
    return NextResponse.next();
  }

  // Prevent logged-in users from accessing /auth
  if (pathname === "/auth") {
    const isAuthUser = await isAuthenticated(request);
    if (isAuthUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const isAdminUser = await isAdmin(request);
    if (!isAdminUser) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // Authenticated routes
  if (pathname.startsWith("/profile") || pathname.startsWith("/orders") || pathname.startsWith("/checkout")) {
    const isAuthUser = await isAuthenticated(request);
    if (!isAuthUser) {
      return NextResponse.redirect(new URL(`/auth?redirect=${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/admin/:path*", "/profile/:path*", "/orders/:path*", "/checkout/:path*"],
}
