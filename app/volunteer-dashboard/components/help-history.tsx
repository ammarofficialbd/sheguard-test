"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock, MapPin, Star } from "lucide-react"
import toast from "react-hot-toast"


interface HelpTask {
  id: string
  victimId: string
  victimName: string
  victimProfilePicture?: string
  distance: number
  location: {
    lat: number
    lng: number
  }
  status: "completed" | "cancelled"
  completedAt: string
  rating?: number
}

interface HelpHistoryProps {
  volunteerId: string
}

export default function HelpHistory({ volunteerId }: HelpHistoryProps) {
  const [history, setHistory] = useState<HelpTask[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch help history
  useEffect(() => {
    const fetchHelpHistory = async () => {
      try {
        const response = await fetch("/api/volunteers/history")

        if (!response.ok) {
          toast("Failed to load help history")
        }

        const data = await response.json()
        setHistory(data.history || [])
      } catch (error) {
        console.error("Error fetching help history:", error)
        toast("Failed to load help history. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchHelpHistory()
  }, [])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <CalendarClock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium">No Help History</h3>
        <p className="text-gray-500 mt-2">You haven't completed any help tasks yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Help History</h2>
      <div className="space-y-4">
        {history.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage
                    src={task.victimProfilePicture || "/placeholder.svg?height=48&width=48"}
                    alt={task.victimName}
                  />
                  <AvatarFallback>{task.victimName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{task.victimName}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{task.distance.toFixed(1)} km</span>
                  </div>
                </div>
                <Badge className={task.status === "completed" ? "bg-green-500" : "bg-gray-500"}>
                  {task.status === "completed" ? "Completed" : "Cancelled"}
                </Badge>
              </div>

              <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-1" />
                  <span>{formatDate(task.completedAt)}</span>
                </div>

                {task.rating && (
                  <div className="flex items-center">
                    <span className="mr-1">Rating:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < task.rating! ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
