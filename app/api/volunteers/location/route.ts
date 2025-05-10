import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { authMiddleware } from "@/middlewares/auth"

export async function PATCH(request: Request) {
  try {
    // Connect to database
    await connectToDatabase()

    // Authenticate user
    const user = await authMiddleware(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Check if user is a volunteer and victim
    if (user.role !== "volunteer" || "victim") {
      return NextResponse.json(
        { success: false, message: "Only volunteers can update their location" },
        { status: 403 },
      )
    }

    // Get location from request body
    const { lat, lng } = await request.json()

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { success: false, message: "Valid latitude and longitude are required" },
        { status: 400 },
      )
    }

    // Update volunteer location
    user.location = {coordinates:[lat, lng]}
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      location: { lat, lng },
    })
  } catch (error) {
    console.error("Error updating volunteer location:", error)
    return NextResponse.json({ success: false, message: "Failed to update location" }, { status: 500 })
  }
}
