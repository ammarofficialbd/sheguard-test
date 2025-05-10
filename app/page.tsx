"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Shield, ArrowLeft, Check, Upload, User, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import OtpInput from "@/components/otp-input"
import Image from "next/image"
import toast from 'react-hot-toast';



// Authentication steps
type AuthStep =
  | "contact-input"
  | "otp-verification"
  | "role-selection"
  | "get-location"
  | "victim-signup"
  | "volunteer-signup"
  | "success"

// User roles
type UserRole = "victim" | "volunteer" | "admin"

// Skills for volunteers
const VOLUNTEER_SKILLS = [
  "First Aid",
  "Self Defense",
  "Crisis Management",
  "Counseling",
  "Medical Aid",
  "Emergency Response",
  "Security",
  "Navigation",
  "Emotional Support",
]

export default function Home() {
  // State management
  const [currentStep, setCurrentStep] = useState<AuthStep>("contact-input")
  const [contactInfo, setContactInfo] = useState("")
  const [otp, setOtp] = useState("")
  const [otpTimer, setOtpTimer] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [userExists, setUserExists] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // User form data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    phone2: "",
    gender: "",
    location: {
      lat: 23.8103,
      lng: 90.4125,
    },
    // Volunteer specific fields
    nidNumber: "",
    skills: [] as string[],
  })

  // File uploads
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [nidPhoto, setNidPhoto] = useState<File | null>(null)
  const [nidPhotoPreview, setNidPhotoPreview] = useState<string | null>(null)
  const [locationActivated, setLocationActivated] = useState(false)
  const [loading, setLoading] = useState(false)
  // Handle OTP timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    } else if (otpTimer === 0) {
      setIsTimerRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, otpTimer])

  // Handle sending OTP
  const handleSendOTP = async () => {
    // Validate contact info
    if (!contactInfo) {
      toast("Please enter your phone number or email")
      /* toast({
        title: "Error",
        description: "Please enter your phone number or email",
        variant: "destructive",
      }) */
      return
    }

    try {
      setIsLoading(true)

      // Call API to send OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactInfo }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast(data.message || "Failed to send OTP")
      }

      // Start timer
      setOtpTimer(60)
      setIsTimerRunning(true)

      // Set user exists flag
      setUserExists(data.userExists)

      // Show success message
      toast(
        "OTP Sent"
        /* description: `A verification code has been sent to ${contactInfo}`, */
      )

      // Move to OTP verification step
      setCurrentStep("otp-verification")

      // For development, show OTP in console
      if (process.env.NODE_ENV === "development" && data.otp) {
        console.log("Development OTP:", data.otp)
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast(error instanceof Error ? error.message : "Failed to send OTP")
      /* toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      }) */
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    // Validate OTP
    if (otp.length !== 6) {
      /* toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      }) */
      toast("Please enter a valid 6-digit OTP")
      return
    }

    try {
      setIsLoading(true)

      // Call API to verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactInfo, otp }),
      })

      const data = await response.json()
      console.log("OTP verification response:", data)
      if (!response.ok) {
       /*  throw new Error(data.message || "Failed to verify OTP") */
        toast(data.message || "Failed to verify OTP")
      }

      // If user has completed registration, go to success
      if (data.user.isRegistrationComplete) {
        /* toast({
          title: "Login Successful",
          description: "Welcome back to SheGuard!",
        }) */
        toast("Welcome back to SheGuard!")
        setCurrentStep("success")
      } else {
        // If new user, go to role selection
        setCurrentStep("role-selection")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      /* toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP",
        variant: "destructive",
      }) */
      toast(error instanceof Error ? error.message : "Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle role selection
  const handleRoleSelection = () => {
    if (!selectedRole) {
      /* toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      }) */
      toast("Please select a role")
      return
    }

    // Set phone or email from contact info
    if (contactInfo.includes("@")) {
      setUserData((prev) => ({ ...prev, email: contactInfo }))
    } else {
      setUserData((prev) => ({ ...prev, phone: contactInfo }))
    }

    // Navigate to appropriate signup form based on role
    if (selectedRole === "victim") {
      console.log(selectedRole);
      
      setCurrentStep("get-location")
    } else if (selectedRole === "volunteer") {
      console.log(selectedRole);
      setCurrentStep("get-location")
      console.log(currentStep)
    } else {
      // Admin role would typically be handled differently
      /* toast({
        title: "Admin Registration",
        description: "Admin registration requires approval",
      }) */
      toast("Admin registration requires approval")
    }
    
  }

  // Handle victim signup form submission
  const handleVictimSignup = async () => {
    // Validate required fields
    if (!userData.name || !userData.gender) {
     /*  toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      }) */
     toast("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)

      // Create form data for file upload
      const formData = new FormData()
      formData.append("role", "victim")
      formData.append("name", userData.name)
      formData.append("gender", userData.gender)

      if (userData.email) formData.append("email", userData.email)
      if (userData.phone) formData.append("phone", userData.phone)

      formData.append("lat", userData.location.lat.toString())
      formData.append("lng", userData.location.lng.toString())

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto)
      }

      // Call API to register user
      const response = await fetch("/api/users/signup", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        /* throw new Error(data.message || "Failed to register user") */
        toast(data.message || "Failed to register user")
      }

     /*  toast({
        title: "Account Created",
        description: "Your victim account has been created successfully",
      }) */
      toast("Your victim account has been created successfully")

      setCurrentStep("success")
    } catch (error) {
      console.error("Error registering victim:", error)
      /* toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register user",
        variant: "destructive",
      }) */
      toast(error instanceof Error ? error.message : "Failed to register user")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle volunteer signup form submission
  const handleVolunteerSignup = async () => {
    // Validate required fields
    if (!userData.name || !userData.nidNumber || !nidPhoto) {
      toast("Please fill in all required fields and upload your NID photo") 
      return
    }

    try {
      setIsLoading(true)

      // Create form data for file upload
      const formData = new FormData()
      formData.append("role", "volunteer")
      formData.append("name", userData.name)
      formData.append("gender", userData.gender)

      if (userData.email) formData.append("email", userData.email)
      if (userData.phone) formData.append("phone", userData.phone)
      if (userData.phone2) formData.append("phone2", userData.phone2)

      formData.append("lat", userData.location.lat.toString())
      formData.append("lng", userData.location.lng.toString())

      formData.append("nidNumber", userData.nidNumber)

      if (nidPhoto) {
        formData.append("nidPhoto", nidPhoto)
      }

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto)
      }

      // Add skills
      userData.skills.forEach((skill) => {
        formData.append("skills", skill)
      })

      // Call API to register user
      const response = await fetch("/api/users/signup", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
       /* toast.error({
          title: "Error",
          description: data.message || "Failed to register user",
        }) */
        toast(data.message || "Failed to register user")
      }
      
      /* toast({
        title: "Account Created",
        description: "Your volunteer account has been created and is pending admin verification",
      }) */
      toast("Your volunteer account has been created and is pending admin verification")

      setCurrentStep("success")
    } catch (error) {
      console.error("Error registering volunteer:", error)
      /* toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register user",
        variant: "destructive",
      }) */
      toast(error instanceof Error ? error.message : "Failed to register user")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file upload for profile photo
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePhoto(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePhotoPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle file upload for NID photo
  const handleNidPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNidPhoto(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNidPhotoPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle skill selection
  const handleSkillToggle = (skill: string) => {
    setUserData((prev) => {
      const skills = [...prev.skills]
      if (skills.includes(skill)) {
        return { ...prev, skills: skills.filter((s) => s !== skill) }
      } else {
        return { ...prev, skills: [...skills, skill] }
      }
    })
  }
  
  const activateLocation = () => {
    setLoading(true)

    // Set default Bangladesh location
    const defaultLocation: [number, number] = [23.709344807599095, 90.98880766838754]

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserData((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude || defaultLocation[0],
            lng: position.coords.longitude  || defaultLocation[1],
          },
        }))
      })
     
     
      setLocationActivated(true)
      if(locationActivated){
        if (selectedRole === "victim") {  
          console.log('====================================');
          console.log(selectedRole);
          console.log('====================================');
          setCurrentStep("victim-signup")
        }else if (selectedRole === "volunteer") {
          console.log(selectedRole);
          setCurrentStep("volunteer-signup")
        }
      }
      console.log("Location activated:", userData.location);
      setLoading(false)
  }
}
  // Render different steps based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case "contact-input":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-pink-50 to-purple-50">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                    <Shield className="h-10 w-10 text-purple-700" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-purple-900">Welcome to SheGuard</CardTitle>
                <CardDescription>Enter your phone number or email to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Phone number or email</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="contact"
                        type="text"
                        placeholder="Enter phone number or email"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="py-6"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6"
                  onClick={handleSendOTP}
                  disabled={!contactInfo || isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </CardFooter>
              <div className="px-6 pb-6 text-center">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </Card>
          </div>
        )

      case "otp-verification":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-pink-50 to-purple-50">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={() => setCurrentStep("contact-input")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-xl text-purple-900">Verify OTP</CardTitle>
                </div>
                <CardDescription>We've sent a verification code to {contactInfo}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <OtpInput value={otp} onChange={setOtp} length={6} />

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Didn't receive the code? {otpTimer > 0 ? `Resend in ${otpTimer}s` : ""}
                    </p>
                    <button
                      className={`text-sm ${otpTimer > 0 ? "text-gray-400" : "text-purple-700 hover:underline"}`}
                      disabled={otpTimer > 0 || isLoading}
                      onClick={handleSendOTP}
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6"
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )

      case "role-selection":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-pink-50 to-purple-50">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={() => setCurrentStep("otp-verification")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-xl text-purple-900">Select your role</CardTitle>
                </div>
                <CardDescription>Choose how you want to use SheGuard</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedRole || ""}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                  className="space-y-3"
                >
                  <div
                    className={`flex items-center space-x-3 border rounded-lg p-4 ${selectedRole === "victim" ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
                  >
                    <RadioGroupItem value="victim" id="victim" />
                    <Label htmlFor="victim" className="flex-1 cursor-pointer">
                      <div className="font-medium">Victim</div>
                      <div className="text-sm text-gray-500">I need protection and safety features</div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-3 border rounded-lg p-4 ${selectedRole === "volunteer" ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
                  >
                    <RadioGroupItem value="volunteer" id="volunteer" />
                    <Label htmlFor="volunteer" className="flex-1 cursor-pointer">
                      <div className="font-medium">Volunteer</div>
                      <div className="text-sm text-gray-500">I want to help others in need</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 border-gray-200 opacity-50">
                    <RadioGroupItem value="admin" id="admin" disabled />
                    <Label htmlFor="admin" className="flex-1 cursor-not-allowed">
                      <div className="font-medium">Admin</div>
                      <div className="text-sm text-gray-500">Restricted access</div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6"
                  onClick={handleRoleSelection}
                  disabled={!selectedRole}
                >
                  Continue
                </Button>
              </CardFooter>
            </Card>
          </div>
        )

      case "get-location": 
        return  (
          <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md text-center mb-8">
          <Shield className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">SheGuard Safety App</h1>
          <p className="text-gray-600 mb-6">
            Find nearby volunteers ready to help in emergency situations. Activate your location to see available
            helpers in your area.
          </p>
        </div>

        <Button
          onClick={activateLocation}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-6 rounded-full flex items-center gap-2 text-lg"
        >
          <MapPin className="h-5 w-5" />
          Activate Location
        </Button>

        <p className="text-xs text-gray-500 mt-4 max-w-xs text-center">
          Your location will only be used to find nearby volunteers and will not be stored or shared with third parties.
        </p>
      </div>
        )
         
       

      case "victim-signup":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-pink-50 to-purple-50">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={() => setCurrentStep("role-selection")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-xl text-purple-900">Complete Your Profile</CardTitle>
                </div>
                <CardDescription>Please provide your basic information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex">
                      <User className="h-4 w-4 text-gray-400 absolute mt-3 ml-3" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="pl-10 py-6"
                      />
                    </div>
                  </div>

                  {/* Show email field if phone was provided, or vice versa */}
                  {!contactInfo.includes("@") && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <div className="flex">
                        <Mail className="h-4 w-4 text-gray-400 absolute mt-3 ml-3" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          className="pl-10 py-6"
                        />
                      </div>
                    </div>
                  )}

                  {contactInfo.includes("@") && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex">
                        <Phone className="h-4 w-4 text-gray-400 absolute mt-3 ml-3" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          className="pl-10 py-6"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={userData.gender}
                      onValueChange={(value) => setUserData({ ...userData, gender: value })}
                    >
                      <SelectTrigger className="py-6">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Photo (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {profilePhotoPreview ? (
                        <div className="space-y-2">
                          <div className="relative h-32 w-32 mx-auto rounded-full overflow-hidden">
                            <Image
                              src={profilePhotoPreview || "/placeholder.svg"}
                              alt="Profile Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setProfilePhoto(null)
                              setProfilePhotoPreview(null)
                            }}
                          >
                            Change Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-center">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">Upload your profile photo</p>
                          <Input
                            id="profile-photo"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleProfilePhotoChange}
                          />
                          <Button variant="outline" onClick={() => document.getElementById("profile-photo")?.click()}>
                            Select Photo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6"
                  onClick={handleVictimSignup}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )

      case "volunteer-signup":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-pink-50 to-purple-50">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={() => setCurrentStep("role-selection")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-xl text-purple-900">Volunteer Registration</CardTitle>
                </div>
                <CardDescription>Please provide your details to register as a volunteer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="volunteer-name">Full Name</Label>
                  <div className="flex">
                    <User className="h-4 w-4 text-gray-400 absolute mt-3 ml-3" />
                    <Input
                      id="volunteer-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="pl-10 py-6"
                    />
                  </div>
                </div>

                {/* Show email field if phone was provided, or vice versa */}
                {!contactInfo.includes("@") && (
                  <div className="space-y-2">
                    <Label htmlFor="volunteer-email">Email</Label>
                    <div className="flex">
                      <Mail className="h-4 w-4 text-gray-400 absolute mt-3 ml-3" />
                      <Input
                        id="volunteer-email"
                        type="email"
                        placeholder="Enter your email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        className="pl-10 py-6"
                      />
                    </div>
                  </div>
                )}

                {contactInfo.includes("@") && (
                  <div className="space-y-2">
                    <Label htmlFor="volunteer-phone">Phone Number</Label>
                    <div className="flex">
                      <Phone className="h-4 w-4 text-gray-400 absolute mt-3 ml-3" />
                      <Input
                        id="volunteer-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        className="pl-10 py-6"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="volunteer-phone2">Secondary Phone (Optional)</Label>
                  <div className="flex">
                    <Phone className="h-4 w-4 text-gray-400 absolute mt-3 ml-3" />
                    <Input
                      id="volunteer-phone2"
                      type="tel"
                      placeholder="Enter secondary phone number"
                      value={userData.phone2}
                      onChange={(e) => setUserData({ ...userData, phone2: e.target.value })}
                      className="pl-10 py-6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-gender">Gender</Label>
                  <Select
                    value={userData.gender}
                    onValueChange={(value) => setUserData({ ...userData, gender: value })}
                  >
                    <SelectTrigger className="py-6">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {profilePhotoPreview ? (
                      <div className="space-y-2">
                        <div className="relative h-32 w-32 mx-auto rounded-full overflow-hidden">
                          <Image
                            src={profilePhotoPreview || "/placeholder.svg"}
                            alt="Profile Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProfilePhoto(null)
                            setProfilePhotoPreview(null)
                          }}
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Upload your profile photo</p>
                        <Input
                          id="volunteer-profile-photo"
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleProfilePhotoChange}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById("volunteer-profile-photo")?.click()}
                        >
                          Select Photo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nid">National ID Number</Label>
                  <Input
                    id="nid"
                    type="text"
                    placeholder="Enter your NID number"
                    value={userData.nidNumber}
                    onChange={(e) => setUserData({ ...userData, nidNumber: e.target.value })}
                    className="py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label>NID Photo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {nidPhotoPreview ? (
                      <div className="space-y-2">
                        <div className="relative h-40 w-full">
                          <Image
                            src={nidPhotoPreview || "/placeholder.svg"}
                            alt="NID Preview"
                            fill
                            className="object-contain rounded-md"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNidPhoto(null)
                            setNidPhotoPreview(null)
                          }}
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Upload your NID photo</p>
                        <p className="text-xs text-gray-400">PNG, JPG or JPEG (max. 5MB)</p>
                        <Input
                          id="nid-photo"
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleNidPhotoChange}
                        />
                        <Button variant="outline" onClick={() => document.getElementById("nid-photo")?.click()}>
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {VOLUNTEER_SKILLS.map((skill) => (
                      <div
                        key={skill}
                        className={`border rounded-md p-2 text-sm cursor-pointer transition-colors ${
                          userData.skills.includes(skill)
                            ? "bg-purple-100 border-purple-300 text-purple-700"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6"
                  onClick={handleVolunteerSignup}
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting Application..." : "Submit Application"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )

      case "success":
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-pink-50 to-purple-50">
            <Card className="w-full max-w-md mx-auto text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-purple-900 mb-2">
                  {userExists ? "Welcome Back!" : "Account Created Successfully!"}
                </h2>

                <p className="text-gray-600 mb-6">
                  {userExists
                    ? "You have successfully logged in to your SheGuard account."
                    : selectedRole === "victim"
                      ? "Your safety is our priority. You can now use SheGuard to stay protected."
                      : "Thank you for volunteering. Your application is under review."}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6"
                  onClick={() => {
                    // In a real app, this would redirect to the appropriate dashboard
                    window.location.href = selectedRole === "volunteer" ? "/volunteer-dashboard" : "/victim-dashboard"
                  }}
                >
                  {selectedRole} Dashboard
                </Button>
              </CardFooter>
            </Card>
          </div>
        )
    }
  }

  return (
    <main>
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-purple-700 mr-2" />
            <span className="font-bold text-purple-900">SheGuard</span>
          </div>
          {/* This would typically be a user menu or login button */}
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        </div>
      </div>
      <div className="pt-14">{renderStep()}</div>
    </main>
  )
}
