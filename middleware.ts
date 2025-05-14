import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

// Define protected routes and their allowed roles
const protectedRoutes = [
  { path: "/victim-dashboard", roles: ["victim"] },
  { path: "/volunteer-dashboard", roles: ["volunteer"] },
  { path: "/admin-dashboard", roles: ["admin"] },
]

// Public routes that don't need authentication
const publicRoutes = ["/", "/login", "/register"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route.path))
  const isPublicRoute = publicRoutes.includes(path)

  // If not a protected route, continue
  if (!isProtectedRoute || isPublicRoute) {
    return NextResponse.next()
  }

  // Get the auth token from cookies
  const cookieHeader = request.headers.get("cookie")
  const cookies = cookieHeader ? Object.fromEntries(cookieHeader.split("; ").map(c => c.split("="))) : {}
  const authToken = cookies["auth_token"]

  // If no token and trying to access protected route, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Verify the token and get user ID and role
  const tokenData = verifyToken(authToken)

  console.log('====================================');
  console.log(tokenData);
  console.log('====================================');

  /* if (!tokenData || !tokenData.userId || !tokenData.role) {
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.delete("auth_token")
    return response
  }

  // Check if user has permission to access this route
  const allowedRoute = protectedRoutes.find((route) => path.startsWith(route.path))

  if (allowedRoute && !allowedRoute.roles.includes(tokenData.role)) {
    // Redirect to appropriate dashboard based on role
    if (tokenData.role === "victim") {
      return NextResponse.redirect(new URL("/victim-dashboard", request.url))
    } else if (tokenData.role === "volunteer") {
      return NextResponse.redirect(new URL("/volunteer-dashboard", request.url))
    } else if (tokenData.role === "admin") {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url))
    }
  } */

  return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
