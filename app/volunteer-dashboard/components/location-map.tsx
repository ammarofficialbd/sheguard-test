"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, RefreshCw } from "lucide-react"

import dynamic from "next/dynamic"
import toast from "react-hot-toast"

// Dynamically import the map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700"></div>
    </div>
  ),
})

interface LocationMapProps {
  location: {
    lat: number
    lng: number
  }
  onLocationUpdate: (lat: number, lng: number) => void
}

export default function LocationMap({ location, onLocationUpdate }: LocationMapProps) {
  const [currentLocation, setCurrentLocation] = useState(location)
  const [isUpdating, setIsUpdating] = useState(false)
  const [address, setAddress] = useState<string>("")

  // Reverse geocode to get address
  useEffect(() => {
    const getAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`,
        )

        if (!response.ok) {
          throw new Error("Failed to get address")
        }

        const data = await response.json()
        setAddress(data.display_name || "Unknown location")
      } catch (error) {
        console.error("Error getting address:", error)
        setAddress("Unable to determine address")
      }
    }

    getAddress()
  }, [location])

  // Update current location
  const updateCurrentLocation = () => {
    setIsUpdating(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          onLocationUpdate(latitude, longitude)

          toast('Location updated')

          setIsUpdating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast("Unable to get current location")

          setIsUpdating(false)
        },
      )
    } else {
      toast("geo loaction not supoorted")

      setIsUpdating(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Location</h2>
        <Button variant="outline" size="sm" onClick={updateCurrentLocation} disabled={isUpdating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
          Update Location
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-purple-700 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Current Address</p>
              <p className="text-sm text-gray-500 mt-1">{address}</p>
              <p className="text-xs text-gray-400 mt-1">
                Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="h-[400px] rounded-lg overflow-hidden">
        <MapWithNoSSR
          userLocation={[currentLocation.lat, currentLocation.lng]}
          volunteers={[]}
          onVolunteerClick={() => {}}
        />
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Note: Your location is only shared with victims when you accept their help request.
      </p>
    </div>
  )
}
