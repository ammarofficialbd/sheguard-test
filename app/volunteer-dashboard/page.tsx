"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, LogOut, MapPin, Users, History } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { Volunteer } from "@/types/volunteer"
import VolunteerProfile from "./components/volunteer-profile"
import StatusToggle from "./components/status-toggle"
import HelpRequests from "./components/help-requests"
import HelpHistory from "./components/help-history"
import LocationMap from "./components/location-map"
import toast from "react-hot-toast"
import ProtectedRoute from "@/components/protected-route"

export default function VolunteerDashboard() {
  const router = useRouter()
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Fetch volunteer data
  useEffect(() => {
    const fetchVolunteerData = async () => {
      try {
        const response = await fetch("/api/volunteers/me")

        if (!response.ok) {
          // If not authenticated or not a volunteer, redirect to login
          if (response.status === 401 || response.status === 403) {
            router.push("/")
            return
          }
          throw new Error("Failed to fetch volunteer data")
        }

        const data = await response.json()
        setVolunteer(data.volunteer)
      } catch (error) {
        console.error("Error fetching volunteer data:", error)
        /* toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        }) */
       toast("Failed to load your profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchVolunteerData()
  }, [router])

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })

          // Update location in database
          updateVolunteerLocation(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast("Unable to get your current location.")
        },
      )
    }
  }, [])

  // Update volunteer location in database
  const updateVolunteerLocation = async (lat: number, lng: number) => {
    try {
      const response = await fetch("/api/volunteers/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng }),
      })

      if (!response.ok) {
        toast("Failed to update location.")
      }
    } catch (error) {
      console.error("Error updating location:", error)
    }
  }

  // Handle status change
  const handleStatusChange = async (newStatus: "online" | "busy" | "offline") => {
    if (!volunteer) return

    try {
      const response = await fetch("/api/volunteers/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      const data = await response.json()

      // Update local state
      setVolunteer({
        ...volunteer,
        status: newStatus,
      })

      toast(`Status Updated, You are now ${newStatus}`,)
    } catch (error) {
      console.error("Error updating status:", error)
      toast("Failed to update status. Please try again.")
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
       toast("Failed to logout.")
      }

      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast("failed to logout. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  if (!volunteer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
        <p className="mb-6">Unable to load your volunteer profile. Please try again later.</p>
        <Button onClick={() => router.push("/login")}>Return to Login</Button>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-purple-700 mr-2" />
            <span className="font-bold text-purple-900">SheGuard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Profile and Status Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <VolunteerProfile volunteer={volunteer} />
          <div className="mt-4">
            <StatusToggle status={volunteer.status} onChange={handleStatusChange} />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="requests" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Help Requests</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Location</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="bg-white rounded-lg shadow-md p-4">
            <HelpRequests volunteerId={volunteer.id} volunteerLocation={currentLocation || volunteer.location} />
          </TabsContent>

          <TabsContent value="history" className="bg-white rounded-lg shadow-md p-4">
            <HelpHistory volunteerId={volunteer.id} />
          </TabsContent>

          <TabsContent value="location" className="bg-white rounded-lg shadow-md p-4">
            <LocationMap
              location={currentLocation || volunteer.location}
              onLocationUpdate={(lat, lng) => updateVolunteerLocation(lat, lng)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ProtectedRoute>
  )
}
