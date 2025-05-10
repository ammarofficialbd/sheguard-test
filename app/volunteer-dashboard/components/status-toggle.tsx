"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface StatusToggleProps {
  status: "online" | "busy" | "offline"
  onChange: (status: "online" | "busy" | "offline") => void
}

export default function StatusToggle({ status, onChange }: StatusToggleProps) {
  const getNextStatus = (currentStatus: "online" | "busy" | "offline"): "online" | "busy" | "offline" => {
    switch (currentStatus) {
      case "online":
        return "busy"
      case "busy":
        return "offline"
      case "offline":
        return "online"
      default:
        return "online"
    }
  }

  const getStatusDetails = (status: "online" | "busy" | "offline") => {
    switch (status) {
      case "online":
        return {
          label: "Online",
          description: "You are available to help",
          color: "bg-green-500",
          icon: <CheckCircle className="h-5 w-5" />,
        }
      case "busy":
        return {
          label: "Busy",
          description: "You are currently helping someone",
          color: "bg-amber-500",
          icon: <Clock className="h-5 w-5" />,
        }
      case "offline":
        return {
          label: "Offline",
          description: "You are not available to help",
          color: "bg-gray-500",
          icon: <XCircle className="h-5 w-5" />,
        }
    }
  }

  const statusDetails = getStatusDetails(status)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center mb-4 sm:mb-0">
        <Badge className={`${statusDetails.color} h-10 w-10 rounded-full flex items-center justify-center mr-3`}>
          {statusDetails.icon}
        </Badge>
        <div>
          <h3 className="font-medium text-lg">{statusDetails.label}</h3>
          <p className="text-sm text-gray-500">{statusDetails.description}</p>
        </div>
      </div>

      <Button onClick={() => onChange(getNextStatus(status))} className="bg-purple-700 hover:bg-purple-800">
        Change Status
      </Button>
    </div>
  )
}
