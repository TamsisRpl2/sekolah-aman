"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (status === "loading") return // Still loading session

    if (requireAuth && status === "unauthenticated") {
      // Redirect to signin if not authenticated
      setIsRedirecting(true)
      router.replace("/auth/signin")
      return
    }

    if (!requireAuth && status === "authenticated") {
      // Redirect to dashboard if already authenticated and trying to access auth pages
      setIsRedirecting(true)
      router.replace("/dashboard")
      return
    }

    // Reset redirecting state if we're in the right place
    setIsRedirecting(false)
  }, [status, requireAuth, router])

  // Show loading while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting unauthenticated users
  if (requireAuth && status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-gray-600">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting authenticated users from auth pages
  if (!requireAuth && status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-gray-600">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-gray-600">Mengalihkan...</p>
        </div>
      </div>
    )
  }

  // Render children when authenticated and in right place
  if (requireAuth && status === "authenticated") {
    return <>{children}</>
  }

  // Render children when not requiring auth and not authenticated
  if (!requireAuth && status === "unauthenticated") {
    return <>{children}</>
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  )
}
