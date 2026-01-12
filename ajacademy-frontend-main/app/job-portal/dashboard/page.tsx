"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OldDashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to new dashboard location
    router.push('/jobseeker/dashboard')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      <p className="ml-2">Redirecting to new dashboard...</p>
    </div>
  )
} 