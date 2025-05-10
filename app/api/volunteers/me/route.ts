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

    // Check if user is a volunteer
    if (user.role !== "volunteer") {
      return NextResponse.json({ success: false, message: "Only volunteers can access this endpoint" }, { status: 403 })
    }

    // Format volunteer data for response
    const volunteer = {
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      phone2: user.phone2 || "",
      profilePicture: user.profilePhotoUrl || "",
      location: user.location || { lat: 23.8103, lng: 90.4125 },
      status: user.volunteerDetails?.status || "offline",
      isVerified: user.volunteerDetails?.verifiedByAdmin || false,
      skills: user.volunteerDetails?.skills || [],
      rating: user.volunteerDetails?.rating || 0,
      completedTasks: user.volunteerDetails?.completedTasks || 0,
      languages: ["English", "Bengali"], // Default languages, could be stored in user model
    }

    return NextResponse.json({
      success: true,
      volunteer,
    })
  } catch (error) {
    console.error("Error fetching volunteer data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch volunteer data" }, { status: 500 })
  }
}
