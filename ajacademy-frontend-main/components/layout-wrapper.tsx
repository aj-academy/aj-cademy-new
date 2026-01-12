"use client"

import { usePathname } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RunningTextAds } from "@/components/running-text-ads"
import { Chatbot } from "@/components/chatbot"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin') || false
  const isHR = pathname?.startsWith('/hr') || false

  if (isAdmin || isHR) {
    // Admin or HR routes - no header/footer
    return <>{children}</>
  }

  // Non-admin/HR routes - include header/footer
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex flex-col">
        <SiteHeader />
        <RunningTextAds />
      </div>
      <main className="flex-1 relative">
        <div className="garland absolute top-0 left-0 z-10">
          {/* Left Side Garland */}
          <div className="absolute left-0 top-0 w-32 h-full pointer-events-none">
            <img 
              src="/sb-12.png" 
              alt="Left Garland" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Right Side Garland */}
          <div className="absolute right-0 top-0 w-32 h-full pointer-events-none">
            <img 
              src="/sb-12.png" 
              alt="Right Garland" 
              className="w-full h-full object-contain scale-x-[-1]"
            />
          </div>
        </div>
        
        {children}
      </main>
      <SiteFooter />
      <Chatbot />
    </div>
  )
} 