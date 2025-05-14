import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { authMiddleware } from "@/middlewares/auth"

export async function GET(request: Request) {
  try {
    // Connect to database
    await connectToDatabase()

    // Authenticate user
    const user = await authMiddleware(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhotoUrl: user.profilePhotoUrl,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch user data" }, { status: 500 })
  }
}
