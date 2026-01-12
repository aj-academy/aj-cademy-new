"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

function LoginRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || undefined
  
  useEffect(() => {
    // Redirect to sign-in and preserve the returnUrl if present
    const redirectPath = returnUrl 
      ? `/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/auth/sign-in'
    
    router.replace(redirectPath)
  }, [router, returnUrl])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login page...</p>
      </div>
    </div>
  )
}

export default function LoginRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginRedirectContent />
    </Suspense>
  )
} 
