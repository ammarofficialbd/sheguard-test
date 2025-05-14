import { verifyToken } from "@/lib/auth"
import User from "@/models/User"
import { connectToDatabase } from "@/lib/db"

/**
 * Authentication middleware for API routes
 * @param request Next.js request object
 * @returns User object if authenticated, null otherwise
 */
export async function authMiddleware(request: Request) {
  try {
    // Connect to database
    await connectToDatabase()

    // Get auth token from cookies
    const cookieHeader = request.headers.get("cookie")
    const cookies = cookieHeader ? Object.fromEntries(cookieHeader.split("; ").map(c => c.split("="))) : {}
    const authToken = cookies["auth_token"]

    console.log("Auth token:", authToken)

    if (!authToken) {
      return null
    }

  // Verify token and get user ID and role
  const tokenData = verifyToken(authToken)
  if (!tokenData || !tokenData.userId) {
    return null
  }

    // Find user by ID
    const user = await User.findById(tokenData.userId)
    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Auth middleware error:", error)
    return null
  }
}
