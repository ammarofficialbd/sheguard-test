import type { Volunteer } from "@/types/volunteer"

// Generate random coordinates within a certain radius of a point
function generateRandomPoint(centerLat: number, centerLng: number, radiusInKm: number) {
  // Earth's radius in km
  const earthRadius = 6371

  // Convert radius from km to radians
  const radiusInRad = radiusInKm / earthRadius

  // Generate a random distance within the radius
  const randomDistance = Math.random() * radiusInRad

  // Generate a random angle in radians
  const randomAngle = Math.random() * Math.PI * 2

  // Calculate the random point's latitude
  const lat =
    Math.asin(
      Math.sin(centerLat * (Math.PI / 180)) * Math.cos(randomDistance) +
        Math.cos(centerLat * (Math.PI / 180)) * Math.sin(randomDistance) * Math.cos(randomAngle),
    ) *
    (180 / Math.PI)

  // Calculate the random point's longitude
  const lng =
    centerLng * (Math.PI / 180) +
    Math.atan2(
      Math.sin(randomAngle) * Math.sin(randomDistance) * Math.cos(centerLat * (Math.PI / 180)),
      Math.cos(randomDistance) - Math.sin(centerLat * (Math.PI / 180)) * Math.sin(lat * (Math.PI / 180)),
    ) *
      (180 / Math.PI)

  return { lat, lng }
}

// Mock volunteer data
export const mockVolunteers: Volunteer[] = [
  {
    id: "v1",
    name: "Sarah Johnson",
    profilePicture: "/placeholder.svg?height=100&width=100",
    location: { lat: 23.709344807599095, lng: 90.98880766838754 }, // Bangladesh coordinates
    status: "online",
    isVerified: true,
    bio: "Certified first aid responder with 5 years of experience. I'm here to help in emergency situations.",
    responseTime: "2 minutes",
    languages: ["English", "Bengali"],
    skills: ["First Aid", "Self Defense", "Crisis Management"],
    rating: 4.9,
    isFavorite: true,
    completedTasks: 47,
  },
  {
    id: "v2",
    name: "Michael Chen",
    profilePicture: "/placeholder.svg?height=100&width=100",
    location: { lat: 23.712344, lng: 90.989807 }, // Bangladesh coordinates
    status: "online",
    isVerified: true,
    bio: "Security professional with background in law enforcement. Available for emergency assistance.",
    responseTime: "3 minutes",
    languages: ["English", "Bengali", "Mandarin"],
    skills: ["Security", "Emergency Response"],
    rating: 4.7,
    completedTasks: 32,
  },
  {
    id: "v3",
    name: "Priya Patel",
    profilePicture: "/placeholder.svg?height=100&width=100",
    location: { lat: 23.706345, lng: 90.985807 }, // Bangladesh coordinates
    status: "busy",
    isVerified: true,
    bio: "Nurse and community volunteer. I can provide medical assistance and support in emergencies.",
    responseTime: "5 minutes",
    languages: ["English", "Hindi", "Bengali"],
    skills: ["Medical Aid", "Counseling"],
    rating: 4.8,
    completedTasks: 56,
  },
  {
    id: "v4",
    name: "David Wilson",
    profilePicture: "/placeholder.svg?height=100&width=100",
    location: { lat: 23.715344, lng: 90.991807 }, // Bangladesh coordinates
    status: "offline",
    isVerified: false,
    bio: "College student and volunteer. I'm trained in basic first aid and can assist in emergencies.",
    responseTime: "10 minutes",
    languages: ["English", "Bengali"],
    skills: ["Basic First Aid"],
    rating: 4.2,
    completedTasks: 12,
  },
  {
    id: "v5",
    name: "Aisha Mohammed",
    profilePicture: "/placeholder.svg?height=100&width=100",
    location: { lat: 23.702344, lng: 90.982807 }, // Bangladesh coordinates
    status: "online",
    isVerified: true,
    bio: "Social worker specializing in crisis intervention. Available to provide support and guidance.",
    responseTime: "4 minutes",
    languages: ["English", "Arabic", "Bengali"],
    skills: ["Crisis Intervention", "Counseling", "Self Defense"],
    rating: 4.9,
    completedTasks: 78,
  },
  {
    id: "v6",
    name: "Carlos Rodriguez",
    profilePicture: "/placeholder.svg?height=100&width=100",
    location: { lat: 23.718344, lng: 90.994807 }, // Bangladesh coordinates
    status: "online",
    isVerified: true,
    bio: "Former military medic with extensive emergency response training.",
    responseTime: "2 minutes",
    languages: ["English", "Spanish", "Bengali"],
    skills: ["Emergency Medicine", "Self Defense", "Navigation"],
    rating: 5.0,
    completedTasks: 93,
  },
  {
    id: "v7",
    name: "Emma Thompson",
    profilePicture: "/placeholder.svg?height=100&width=100",
    location: { lat: 25.699344, lng: 94.979807 }, // Bangladesh coordinates
    status: "busy",
    isVerified: true,
    bio: "Psychology student and hotline volunteer. I can provide emotional support during crises.",
    responseTime: "5 minutes",
    languages: ["English", "Bengali"],
    skills: ["Emotional Support", "Active Listening"],
    rating: 4.6,
    completedTasks: 41,
  },
]

// Generate random coordinates for Bangladesh (Dhaka area)
export function generateRandomBangladeshCoordinates() {
  // Base coordinates for Bangladesh (Dhaka area)
  const baseLatitude = 23.709344807599095
  const baseLongitude = 90.98880766838754

  // Generate random offsets (within roughly 3km)
  const latOffset = (Math.random() - 0.5) * 0.03
  const lngOffset = (Math.random() - 0.5) * 0.03

  return {
    lat: baseLatitude + latOffset,
    lng: baseLongitude + lngOffset,
  }
}

// Update volunteer locations based on user location
export function updateVolunteerLocations() {
  return mockVolunteers.map((volunteer) => {
    // Generate random Bangladesh area coordinates
    const randomLocation = generateRandomBangladeshCoordinates()

    return {
      ...volunteer,
      location: randomLocation,
    }
  })
}
