export interface Volunteer {
  id: string
  name: string
  profilePicture: string
  location: {
    lat: number
    lng: number
  }
  status: "online" | "offline" | "busy"
  isVerified: boolean
  distance?: number
  isFavorite?: boolean
  bio?: string
  responseTime?: string
  languages?: string[]
  skills?: string[]
  rating?: number
  completedTasks?: number
}
