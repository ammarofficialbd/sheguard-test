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
      return NextResponse.json({ success: false, message: "Only volunteers can view help history" }, { status: 403 })
    }

    // In a real app, you would fetch from a HelpRequest collection
    // For this example, we'll return mock data
    const mockHistory = [
      {
        id: "hist1",
        victimId: "v1",
        victimName: "Sarah Ahmed",
        victimProfilePicture: "/placeholder.svg?height=48&width=48",
        distance: 1.2,
        location: { lat: 23.7104, lng: 90.4074 },
        status: "completed",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        rating: 5,
      },
      {
        id: "hist2",
        victimId: "v2",
        victimName: "Fatima Khan",
        victimProfilePicture: "/placeholder.svg?height=48&width=48",
        distance: 0.8,
        location: { lat: 23.7234, lng: 90.4234 },
        status: "completed",
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        rating: 4,
      },
      {
        id: "hist3",
        victimId: "v3",
        victimName: "Nadia Rahman",
        victimProfilePicture: "/placeholder.svg?height=48&width=48",
        distance: 2.1,
        location: { lat: 23.7334, lng: 90.4334 },
        status: "cancelled",
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
    ]

    return NextResponse.json({
      success: true,
      history: mockHistory,
    })
  } catch (error) {
    console.error("Error fetching help history:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch help history" }, { status: 500 })
  }
}
