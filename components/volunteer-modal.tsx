"use client"

import { useState } from "react"
import type { Volunteer } from "@/types/volunteer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageSquare, Phone, Star, X, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface VolunteerModalProps {
  volunteer: Volunteer
  onClose: () => void
}

export default function VolunteerModal({ volunteer, onClose }: VolunteerModalProps) {
  console.log("Rendering volunteer modal for:", volunteer.name)
  const [isFavorite, setIsFavorite] = useState(volunteer.isFavorite || false)

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: !isFavorite ? "Added to favorites" : "Removed from favorites",
      description: !isFavorite
        ? `${volunteer.name} has been added to your favorites.`
        : `${volunteer.name} has been removed from your favorites.`,
      duration: 3000,
    })
  }

  const handleRequestHelp = () => {
    toast({
      title: "Help Request Sent",
      description: `Your request has been sent to ${volunteer.name}. They will respond shortly.`,
      duration: 5000,
    })
  }

  const handleChat = () => {
    toast({
      title: "Opening chat",
      description: `Starting a conversation with ${volunteer.name}.`,
      duration: 3000,
    })
  }

  const handleCall = () => {
    toast({
      title: "Initiating call",
      description: `Calling ${volunteer.name}...`,
      duration: 3000,
    })
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative pb-2">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={volunteer.profilePicture || "/placeholder.svg"} alt={volunteer.name} />
              <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-bold">{volunteer.name}</h2>
                {volunteer.isVerified && <Badge className="ml-2 bg-blue-500">Verified</Badge>}
              </div>
              <div className="flex items-center mt-1">
                <Badge
                  className={`
                  ${
                    volunteer.status === "online"
                      ? "bg-green-500"
                      : volunteer.status === "busy"
                        ? "bg-amber-500"
                        : "bg-gray-500"
                  }
                `}
                >
                  {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
                </Badge>
                <span className="ml-2 text-sm text-gray-500">{volunteer.distance} km away</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">About</h3>
              <p className="text-sm">{volunteer.bio || "No bio available."}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
              <p className="text-sm">Usually responds within {volunteer.responseTime || "5 minutes"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Languages</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {(volunteer.languages || ["English"]).map((language, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {volunteer.skills && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {volunteer.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {volunteer.completedTasks !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
                <p className="text-sm">{volunteer.completedTasks} successful assists</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-16 space-y-1"
              onClick={handleChat}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Chat</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-16 space-y-1"
              onClick={handleCall}
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs">Call</span>
            </Button>

            <Button
              variant={isFavorite ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-16 space-y-1 ${
                isFavorite ? "bg-amber-500 hover:bg-amber-600" : ""
              }`}
              onClick={handleFavoriteToggle}
            >
              <Star className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`} />
              <span className="text-xs">Favorite</span>
            </Button>
          </div>

          <Button className="w-full bg-rose-500 hover:bg-rose-600" onClick={handleRequestHelp}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Request Help
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
