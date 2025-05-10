"use client"

import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import type { Volunteer } from "@/types/volunteer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface VolunteerMarkerProps {
  volunteer: Volunteer
  onClick: () => void
}

export default function VolunteerMarker({ volunteer, onClick }: VolunteerMarkerProps) {
  // Create a custom icon based on volunteer status
  const getMarkerIcon = (status: string) => {
    const statusColors = {
      online: "#10b981", // green
      offline: "#6b7280", // gray
      busy: "#f59e0b", // amber
    }

    const color = statusColors[status as keyof typeof statusColors] || "#6b7280"

    return L.divIcon({
      className: "custom-volunteer-marker",
      html: `
        <div style="
          background-color: white;
          border: 2px solid ${color};
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background-color: ${color};
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
  }

  // Ensure we have valid coordinates
  const position: [number, number] = [volunteer.location.lat, volunteer.location.lng]

  return (
    <Marker
      position={position}
      icon={getMarkerIcon(volunteer.status)}
      eventHandlers={{
        click: () => {
          console.log("Marker clicked for:", volunteer.name, "at", position)
          onClick()
        },
      }}
    >
      <Popup>
        <div className="flex flex-col items-center p-1">
          <Avatar className="h-12 w-12 mb-2">
            <AvatarImage src={volunteer.profilePicture || "/placeholder.svg"} alt={volunteer.name} />
            <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium">{volunteer.name}</div>
          <Badge
            className={`mt-1 ${
              volunteer.status === "online"
                ? "bg-green-500"
                : volunteer.status === "busy"
                  ? "bg-amber-500"
                  : "bg-gray-500"
            }`}
          >
            {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
          </Badge>
          <div className="text-xs mt-1">{volunteer.distance} km away</div>
          <div className="text-xs mt-1 text-gray-500">
            {volunteer.location.lat.toFixed(6)}, {volunteer.location.lng.toFixed(6)}
          </div>
          <Button
            size="sm"
            className="mt-2 bg-rose-500 hover:bg-rose-600 text-white"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            View Profile
          </Button>
        </div>
      </Popup>
    </Marker>
  )
}
