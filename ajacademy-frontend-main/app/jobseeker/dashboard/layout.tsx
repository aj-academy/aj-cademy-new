"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Briefcase, FileText, LogOut, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUserRole = localStorage.getItem('userRole')
    
    if (token) {
      setIsAuthenticated(true)
      setUserRole(storedUserRole)
    } else {
      // Redirect to login if not authenticated
      router.push('/job-portal/auth/sign-in?returnUrl=/jobseeker/dashboard')
    }
  }, [router])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    router.push('/job-portal')
  }

  // If not authenticated, show loading
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Ensure only jobseekers can access
  if (userRole !== 'jobseeker' && userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          This dashboard is only accessible to job seekers. Please sign in with a job seeker account.
        </p>
        <Button onClick={() => router.push('/job-portal')}>Return to Job Portal</Button>
      </div>
    )
  }

  // Dashboard navigation items
  const navItems = [
    { icon: User, label: "Profile", href: "/jobseeker/dashboard" },
    { icon: Briefcase, label: "Applications", href: "/jobseeker/dashboard/applications" },
    { icon: FileText, label: "Resume", href: "/jobseeker/dashboard/resume" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile header */}
      <header className="md:hidden py-4 px-4 bg-white border-b flex items-center justify-between">
        <Link href="/job-portal" className="text-xl font-bold text-blue-600">
          Job Portal
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col h-full pt-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-lg">Dashboard</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-red-600 mt-auto"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r p-6">
          <Link href="/job-portal" className="text-xl font-bold text-blue-600 mb-8">
            Job Portal
          </Link>
          <nav className="flex flex-col space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-red-600 mt-auto"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
} 