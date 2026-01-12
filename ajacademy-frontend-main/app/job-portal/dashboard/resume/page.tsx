"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OldResumeRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to new resume location
    router.push('/jobseeker/dashboard/resume')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      <p className="ml-2">Redirecting to new resume page...</p>
    </div>
  )
} 