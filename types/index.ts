// User role type
export type UserRole = "victim" | "volunteer" | "admin"

// Volunteer status type
export type VolunteerStatus = "online" | "busy" | "offline"

// Location type
export interface Location {
  lat: number
  lng: number
}

// Volunteer details type
export interface VolunteerDetails {
  nidNumber: string
  nidImageUrl?: string
  verifiedByAdmin: boolean
  status: VolunteerStatus
  skills?: string[]
  rating?: number
  completedTasks?: number
}

// User type
export interface User {
  _id: string
  name?: string
  email?: string
  phone?: string
  phone2?: string
  isVerified: boolean
  role?: UserRole
  gender?: string
  profilePhotoUrl?: string
  location?: Location
  volunteerDetails?: VolunteerDetails
  createdAt: string
  updatedAt: string
}

// API response type
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}
