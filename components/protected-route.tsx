"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    } else if (status === "authenticated" && user && !allowedRoles.includes(user.role || "")) {
      // Redirect to appropriate dashboard based on role
      if (user.role === "victim") {
        router.replace("/victim-dashboard")
      } else if (user.role === "volunteer") {
        router.replace("/volunteer-dashboard")
      } else if (user.role === "admin") {
        router.replace("/admin-dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [status, user, allowedRoles, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  if (status === "unauthenticated" || (user && !allowedRoles.includes(user.role || ""))) {
    return null
  }

  return <>{children}</>
}
