import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectToDatabase()

    // Get contact info and OTP from request body
    const { contactInfo, otp } = await request.json()

    if (!contactInfo || !otp) {
      return NextResponse.json({ success: false, message: "Contact information and OTP are required" }, { status: 400 })
    }

    // Check if it's an email or phone number
    const isEmail = contactInfo.includes("@")
    const query = isEmail ? { email: contactInfo } : { phone: contactInfo }

    // Find user with the provided contact info
    const user = await User.findOne(query) 
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 })
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json({ success: false, message: "OTP has expired" }, { status: 400 })
    }

    // Mark user as verified
    user.isVerified = true
    user.otp = undefined
    user.otpExpiresAt = undefined
    await user.save()

    // Check if user has completed registration (has a role)
    const isRegistrationComplete = !!user.role

    // Generate JWT token
    const token = generateToken(user._id as string)

    // Set cookie with token
    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isRegistrationComplete,
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
    console.error("Error verifying OTP:", error)
    return NextResponse.json({ success: false, message: "Failed to verify OTP" }, { status: 500 })
  }
}
