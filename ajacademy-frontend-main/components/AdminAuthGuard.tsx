"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Set mounted state on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Skip if not mounted (server-side)
    if (!isMounted) return;

    // Check if admin is authenticated
    const checkAuth = () => {
      let adminAuthStr;
      try {
        adminAuthStr = localStorage.getItem('adminAuth')
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        return false
      }

      if (!adminAuthStr) {
        console.log("AdminAuthGuard: No adminAuth found in localStorage");
        // Redirect with a slight delay to prevent immediate redirect loops
        setTimeout(() => {
          router.push('/admin')
        }, 100)
        return false
      }

      try {
        const adminAuth = JSON.parse(adminAuthStr)
        
        // Check if token exists
        if (!adminAuth || !adminAuth.token) {
          console.log("AdminAuthGuard: Invalid adminAuth object (no token)");
          // Don't show toast on initial load to prevent notification spam in redirect loops
          try {
            localStorage.removeItem('adminAuth')
          } catch (e) {
            console.error('Error removing from localStorage:', e)
          }
          // Redirect with a slight delay to prevent immediate redirect loops
          setTimeout(() => {
            router.push('/admin')
          }, 100)
          return false
        }
        
        // Check if token is expired
        if (adminAuth.expiresAt && new Date(adminAuth.expiresAt) < new Date()) {
          console.log("AdminAuthGuard: Token expired");
          toast({
            title: 'Session Expired',
            description: 'Your admin session has expired. Please log in again',
            variant: 'destructive',
          })
          try {
            localStorage.removeItem('adminAuth')
          } catch (e) {
            console.error('Error removing from localStorage:', e)
          }
          // Redirect with a slight delay
          setTimeout(() => {
            router.push('/admin')
          }, 100)
          return false
        }
        
        console.log("AdminAuthGuard: Authentication successful");
        return true
      } catch (error) {
        console.error('Error parsing admin auth:', error)
        // Don't show toast on initial load to prevent notification spam in redirect loops
        try {
          localStorage.removeItem('adminAuth')
        } catch (e) {
          console.error('Error removing from localStorage:', e)
        }
        // Redirect with a slight delay
        setTimeout(() => {
          router.push('/admin')
        }, 100)
        return false
      }
    }

    const isAuth = checkAuth()
    setIsAuthenticated(isAuth)
    setIsLoading(false)
  }, [isMounted, router, toast])

  // Initial state - show loading only after mounted to avoid hydration mismatch
  if (!isMounted || isLoading) {
    return isMounted ? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : null; // Return null during server-side rendering
  }

  return isAuthenticated ? <>{children}</> : null
} 