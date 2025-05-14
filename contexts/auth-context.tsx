"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import toast from "react-hot-toast"


type UserRole = "victim" | "volunteer" | "admin" | null
type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthUser {
  _id: string
  name: string
  email?: string
  phone?: string
  role: UserRole
  profilePhotoUrl?: string
  isVerified: boolean
}

interface AuthContextType {
  user: AuthUser | null
  status: AuthStatus
  login: (contactInfo: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (contactInfo: string, otp: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setStatus("authenticated")
        } else {
          setUser(null)
          setStatus("unauthenticated")

          // If on a protected route, redirect to login
          if (
            pathname?.includes("/victim-dashboard") ||
            pathname?.includes("/volunteer-dashboard") ||
            pathname?.includes("/admin-dashboard")
          ) {
            router.replace("/")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
        setStatus("unauthenticated")
      }
    }

    checkAuth()
  }, [pathname, router])

  // Login function
  const login = async (contactInfo: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactInfo, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast(data.message || "Login failed")
      }

      setUser(data.user)
      setStatus("authenticated")

      // Redirect based on user role
      if (data.user.role === "victim") {
        router.push("/victim-dashboard")
      } else if (data.user.role === "volunteer") {
        router.push("/volunteer-dashboard")
      } else if (data.user.role === "admin") {
        router.push("/admin-dashboard")
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      setUser(null)
      setStatus("unauthenticated")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast("Failed to log out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Register function (OTP verification)
  const register = async (contactInfo: string, otp: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactInfo, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast(data.message || 'OTP verfication failed')
      }

      // If user is already registered, set user and redirect
      if (data.user.isRegistrationComplete) {
        setUser(data.user)
        setStatus("authenticated")

        // Redirect based on user role
        if (data.user.role === "victim") {
          router.push("/victim-dashboard")
        } else if (data.user.role === "volunteer") {
          router.push("/volunteer-dashboard")
        }

        return true
      }

      // If registration is not complete, return true to continue with the registration process
      return true
    } catch (error) {
      toast(error instanceof Error ? error.message : "Invalid OTP")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout, register, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
