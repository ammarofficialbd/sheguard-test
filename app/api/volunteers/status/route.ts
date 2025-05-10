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

    // Check if user is a volunteer
    if (user.role !== "volunteer") {
      return NextResponse.json({ success: false, message: "Only volunteers can update their status" }, { status: 403 })
    }

    // Get status from request body
    const { status } = await request.json()

    if (!status || !["online", "busy", "offline"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required (online, busy, or offline)" },
        { status: 400 },
      )
    }

    // Update volunteer status
    if (!user.volunteerDetails) {
      user.volunteerDetails = {
        status,
        verifiedByAdmin: false,
        rating: 0,
        completedTasks: 0,
      }
    } else {
      user.volunteerDetails.status = status
    }

    await user.save()

    return NextResponse.json({
      success: true,
      message: "Volunteer status updated successfully",
      status,
    })
  } catch (error) {
    console.error("Error updating volunteer status:", error)
    return NextResponse.json({ success: false, message: "Failed to update volunteer status" }, { status: 500 })
  }
}
