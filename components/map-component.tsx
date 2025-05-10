"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Volunteer } from "@/types/volunteer"
import VolunteerMarker from "./volunteer-marker"

// Component to recenter map when user location changes
function RecenterAutomatically({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])
  return null
}

// Component to fit all markers in view
function FitBoundsToMarkers({ userLocation, volunteers }: { userLocation: [number, number]; volunteers: Volunteer[] }) {
  const map = useMap()

  useEffect(() => {
    if (volunteers.length > 0) {
      // Create bounds that include user location and all volunteers
      const bounds = L.latLngBounds([userLocation])

      // Add all volunteer locations to bounds
      volunteers.forEach((volunteer) => {
        bounds.extend([volunteer.location.lat, volunteer.location.lng])
      })

      // Fit the map to these bounds with some padding
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, userLocation, volunteers])

  return null
}

interface MapComponentProps {
  userLocation: [number, number]
  volunteers: Volunteer[]
  onVolunteerClick: (volunteer: Volunteer) => void
}

export default function MapComponent({ userLocation, volunteers, onVolunteerClick }: MapComponentProps) {
  const [mapReady, setMapReady] = useState(false)
  const leafletInitialized = useRef(false)

  useEffect(() => {
    if (!leafletInitialized.current) {
      // Fix Leaflet icon issues
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
      leafletInitialized.current = true
    }
  }, [])

  // Custom user location marker icon
  const userIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: "user-location-marker",
  })

  // Log volunteer locations for debugging
  useEffect(() => {
    if (volunteers.length > 0) {
      console.log("Map component received volunteers:", volunteers.length)
      console.log(
        "Volunteer locations:",
        volunteers.map((v) => `${v.name}: ${v.location.lat}, ${v.location.lng}`),
      )
    }
  }, [volunteers])

  return (
    <MapContainer
      center={userLocation}
      zoom={14} // Increased zoom level to better see markers
      style={{ height: "100%", width: "100%" }}
      whenReady={() => setMapReady(true)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location marker with accuracy circle */}
      <Marker position={userLocation} icon={userIcon}>
        <Popup>
          <div className="text-center">
            <strong>Your Location</strong>
            <div className="text-xs mt-1">
              {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
            </div>
          </div>
        </Popup>
      </Marker>
      <Circle
        center={userLocation}
        radius={300}
        pathOptions={{ color: "rgba(255, 0, 0, 0.2)", fillColor: "rgba(255, 0, 0, 0.1)" }}
      />

      {/* Volunteer markers */}
      {volunteers.map((volunteer) => (
        <VolunteerMarker
          key={volunteer.id}
          volunteer={volunteer}
          onClick={() => {
            console.log("Volunteer marker clicked:", volunteer.name)
            onVolunteerClick(volunteer)
          }}
        />
      ))}

      {/* Auto-recenter and fit bounds */}
      <RecenterAutomatically position={userLocation} />
      <FitBoundsToMarkers userLocation={userLocation} volunteers={volunteers} />
    </MapContainer>
  )
}
