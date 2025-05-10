import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Volunteer } from "@/types/volunteer"
import { Star, Award, CheckCircle } from "lucide-react"

interface VolunteerProfileProps {
  volunteer: Volunteer
}

export default function VolunteerProfile({ volunteer }: VolunteerProfileProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={volunteer.profilePicture || "/placeholder.svg?height=96&width=96"} alt={volunteer.name} />
        <AvatarFallback className="text-2xl">{volunteer.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <h1 className="text-2xl font-bold">{volunteer.name}</h1>
          {volunteer.isVerified && (
            <Badge className="bg-blue-500 inline-flex">
              <CheckCircle className="h-3 w-3 mr-1" /> Verified
            </Badge>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
          {volunteer.skills?.map((skill, index) => (
            <Badge key={index} variant="outline" className="bg-purple-50">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-3 flex items-center">
              <Star className="h-5 w-5 text-amber-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">{volunteer.rating || 0}/5</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="font-medium">{volunteer.completedTasks || 0} tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-3">
              <p className="text-sm text-gray-500">Languages</p>
              <p className="font-medium">{volunteer.languages?.join(", ") || "Not specified"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
