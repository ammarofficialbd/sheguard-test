import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectToDatabase()

    // Get credentials from request body
    const { contactInfo, password } = await request.json()

    if (!contactInfo || !password) {
      return NextResponse.json(
        { success: false, message: "Contact information and password are required" },
        { status: 400 },
      )
    }

    // Check if it's an email or phone number
    const isEmail = contactInfo.includes("@")
    const query = isEmail ? { email: contactInfo } : { phone: contactInfo }

    // Find user with the provided contact info
    const user = await User.findOne(query)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Account not verified. Please verify your account first" },
        { status: 401 },
      )
    }

    // Check if password exists and is correct
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "Password not set. Please reset your password" },
        { status: 401 },
      )
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 })
    }

    // Generate JWT token with user ID and role
    const token = generateToken(user._id.toString(), user.role || "")

    // Set cookie with token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
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

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ success: false, message: "Failed to log in" }, { status: 500 })
  }
}
