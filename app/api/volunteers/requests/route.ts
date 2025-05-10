import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { authMiddleware } from "@/middlewares/auth"
import { calculateDistance } from "@/lib/utils"

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
      return NextResponse.json({ success: false, message: "Only volunteers can view help requests" }, { status: 403 })
    }

    // Check if volunteer is verified
    if (!user.volunteerDetails?.verifiedByAdmin) {
      return NextResponse.json(
        { success: false, message: "Your volunteer account is pending verification" },
        { status: 403 },
      )
    }

    // Get URL parameters
    const url = new URL(request.url)
    const maxDistance = Number.parseInt(url.searchParams.get("maxDistance") || "10") // Default 10km
    const limit = Number.parseInt(url.searchParams.get("limit") || "20") // Default 20 requests

    // Get volunteer's location
    const volunteerLocation = user.location
    if (!volunteerLocation) {
      return NextResponse.json({ success: false, message: "Volunteer location not available" }, { status: 400 })
    }

    // Find help requests within the specified distance
    // In a real app, you would have a separate HelpRequest model
    // For this example, we'll simulate by finding victims within the distance
    const nearbyVictims = await User.find({
      role: "victim",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [volunteerLocation.lng, volunteerLocation.lat],
          },
          $maxDistance: maxDistance * 1000, // Convert km to meters
        },
      },
    })
      .limit(limit)
      .select("_id name profilePhotoUrl location")

    // Calculate distance for each victim
    const victimsWithDistance = nearbyVictims.map((victim) => {
      const distance = calculateDistance(
        volunteerLocation.lat,
        volunteerLocation.lng,
        victim.location.lat,
        victim.location.lng,
      )

      return {
        _id: victim._id,
        name: victim.name,
        profilePhotoUrl: victim.profilePhotoUrl,
        distance,
      }
    })

    return NextResponse.json({
      success: true,
      requests: victimsWithDistance,
    })
  } catch (error) {
    console.error("Error fetching help requests:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch help requests" }, { status: 500 })
  }
}
