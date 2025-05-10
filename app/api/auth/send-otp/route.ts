import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { generateOTP } from "@/lib/utils"
import nodemailer from "nodemailer"
import { Html } from "next/document"


export async function POST(request: Request) {
  try {
    // html generate
    const htmlContent = `<div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background-color: #f3f4f6;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="width: 64px; height: 64px; margin: 0 auto 16px; color: #f43f5e;">
      &#x1F6E1; <!-- Shield emoji as fallback for icon -->
    </div>
    <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">SheGuard Safety App</h1>
    <p style="color: #4b5563; font-size: 15px;">
      Find nearby volunteers ready to help in emergency situations. Activate your location to see available helpers in your area.
    </p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <p style="font-size: 16px; color: #1f2937;">Your One-Time Password (OTP):</p>
    <div style="font-size: 28px; font-weight: bold; color: #f43f5e; background: #ffe4e6; padding: 12px 24px; border-radius: 8px; display: inline-block; letter-spacing: 8px;">
      {{OTP_CODE}}
    </div>
  </div>

  <p style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">
    This code is valid for 5 minutes. If you didn’t request it, you can safely ignore this email.
  </p>

  <hr style="margin: 24px 0; border-color: #e5e7eb;" />

  <footer style="text-align: center; font-size: 12px; color: #9ca3af;">
    &copy; 2025 SheGuard. All rights reserved.<br />
    <a href="https://sheguard.app" style="color: #f43f5e; text-decoration: none;">sheguard.app</a>
  </footer>
</div>

`
    // Connect to database
    await connectToDatabase()

    // Get contact info from request body
    const { contactInfo } = await request.json()
    
    if (!contactInfo) {
      return NextResponse.json({ success: false, message: "Contact information is required" }, { status: 400 })
    }
    // create transporter for sending email
     const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
     })
    // Check if it's an email or phone number
    const isEmail = contactInfo.includes("@")
    const query = isEmail ? { email: contactInfo } : { phone: contactInfo }

    // Generate a 6-digit OTP
    const otp = generateOTP()
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
    
    // Function to send email
    const sendEmail = async (email: string, otp: string) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        html: htmlContent.replace('{{OTP_CODE}}', otp)
      }
      try {
        await transporter.sendMail(mailOptions)
        return NextResponse.json({ success: true, message: "OTP sent successfully" });
      } catch (error) {
        console.error("Error sending email:", error)
      }
    }
    // send otp to user via SMS or email
     if (isEmail) {
      await sendEmail(contactInfo, otp)
      // create a function to send email
      }
    // Check if user exists
    const existingUser = await User.findOne(query)
    const userExists = !!existingUser
    
    if (existingUser) {
      // Update existing user with new OTP
      existingUser.otp = otp
      existingUser.otpExpiresAt = otpExpiresAt
      await existingUser.save()
    } else {
      // Create a new user with just the contact info and OTP
      const newUser = new User({
        ...(isEmail ? { email: contactInfo } : { phone: contactInfo }),
        otp,
        otpExpiresAt,
        isVerified: false,
      })
      await newUser.save()
    }

    // In a real application, you would send the OTP via SMS or email here
    // For development, we'll just return it in the response
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      userExists,
      // Only include OTP in development
      ...(process.env.NODE_ENV === "development" && { otp }),
    })
  } catch (error) {
    console.error("Error sending OTP:", error)
    return NextResponse.json({ success: false, message: "Failed to send OTP" }, { status: 500 })
  }
}
