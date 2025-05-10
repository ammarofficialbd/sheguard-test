import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"
import { uploadImage } from "@/lib/upload"

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectToDatabase()

    // Get auth token from cookies
    const cookies = request.headers.get("cookie") || ""
    const authToken = cookies.split("; ").find(cookie => cookie.startsWith("auth_token="))?.split("=")[1]


   // console.log('authToken', authToken);


    if (!authToken) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Verify token and get user ID
    const userId = verifyToken(authToken)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid authentication token" }, { status: 401 })
    }

    // Find user by ID
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Get form data
    const formData = await request.formData()
    const role = formData.get("role") as string
    const name = formData.get("name") as string
    const gender = formData.get("gender") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const phone2 = formData.get("phone2") as string
    const profilePhoto = formData.get("profilePhoto") as File | null
    const lat = Number.parseFloat(formData.get("lat") as string) || 23.8103
    const lng = Number.parseFloat(formData.get("lng") as string) || 90.4125

   // console.log(formData, "formData");
    

    // Validate required fields
    if (!role || !name) {
      return NextResponse.json({ success: false, message: "Role and name are required" }, { status: 400 })
    }

    // Upload profile photo if provided
    let profilePhotoUrl = null
    if (profilePhoto) {
      profilePhotoUrl = await uploadImage(profilePhoto)
    }

    // Update user with common fields
    if (!["victim", "volunteer", "admin"].includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role provided" }, { status: 400 })
    }
    user.role = role as "victim" | "volunteer" | "admin"
    user.name = name
    user.gender = gender
    if (email) user.email = email
    if (phone) user.phone = phone
    if (profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl
    user.location = {
      type: "Point",
      coordinates: [lng, lat], // [longitude, latitude]
    }

    // Handle role-specific fields
    if (role === "volunteer") {
      const nidNumber = formData.get("nidNumber") as string
      const nidPhoto = formData.get("nidPhoto") as File | null
      const skills = formData.getAll("skills") as string[]

      if (!nidNumber || !nidPhoto) {
        return NextResponse.json(
          { success: false, message: "NID number and photo are required for volunteers" },
          { status: 400 },
        )
      }

      // Upload NID photo
      const nidPhotoUrl = await uploadImage(nidPhoto)

      // Set volunteer-specific fields
      user.volunteerDetails = {
        nidNumber,
        nidImageUrl: nidPhotoUrl,
        verifiedByAdmin: false,
        status: "offline",
        skills: skills,
        rating: 0,
        completedTasks: 0,
      }

      if (phone2) user.phone2 = phone2
    }

    // Save updated user
    await user.save()

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ success: false, message: "Failed to register user" }, { status: 500 })
  }
}
