"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, MessageSquare, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface HelpRequest {
  id: string
  victimId: string
  victimName: string
  victimProfilePicture?: string
  distance: number
  location: {
    lat: number
    lng: number
  }
  status: "pending" | "accepted" | "completed" | "cancelled"
  createdAt: string
}

interface HelpRequestsProps {
  volunteerId: string
  volunteerLocation: {
    lat: number
    lng: number
  }
}

export default function HelpRequests({ volunteerId, volunteerLocation }: HelpRequestsProps) {
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch help requests
  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const response = await fetch("/api/volunteers/requests?maxDistance=10")

        if (!response.ok) {
          throw new Error("Failed to fetch help requests")
        }

        const data = await response.json()
        setRequests(data.requests || [])
      } catch (error) {
        console.error("Error fetching help requests:", error)
        toast({
          title: "Error",
          description: "Failed to load help requests. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHelpRequests()

    // Set up polling for new requests every 30 seconds
    const interval = setInterval(fetchHelpRequests, 30000)

    return () => clearInterval(interval)
  }, [])

  // Handle accepting a help request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/volunteers/requests/${requestId}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to accept request")
      }

      // Update local state
      setRequests(
        requests.map((request) => (request.id === requestId ? { ...request, status: "accepted" as const } : request)),
      )

      toast({
        title: "Request Accepted",
        description: "You have accepted the help request. Please contact the victim.",
      })
    } catch (error) {
      console.error("Error accepting request:", error)
      toast({
        title: "Error",
        description: "Failed to accept the request. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium">No Help Requests</h3>
        <p className="text-gray-500 mt-2">There are currently no help requests in your area.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Help Requests</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={request.victimProfilePicture || "/placeholder.svg?height=48&width=48"}
                      alt={request.victimName}
                    />
                    <AvatarFallback>{request.victimName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{request.victimName}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{request.distance.toFixed(1)} km away</span>
                    </div>
                  </div>
                  <Badge className="ml-auto bg-rose-500">SOS</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-700 hover:bg-purple-800"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Accept Request
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
