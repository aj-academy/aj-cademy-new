"use client"

import { useState, useEffect, memo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/useAuth"

// Define auth routes outside the component to prevent recreating on each render
const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password"
]

// Navigation items defined outside to prevent recreating on each render
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Job Portal", href: "/job-portal", icon: Briefcase },
  { name: "Profile", href: "/profile", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname() || ""
  
  // Use our centralized auth hook
  const { isAuthenticated, isLoading, user, logout } = useAuth({
    skipRoutes: authRoutes,
    loginPath: "/auth/sign-in",
    tokenKey: "token"
  })
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-blue-600"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 transform bg-white w-64 transition duration-200 ease-in-out z-40 lg:z-0 shadow-lg lg:shadow-none`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="h-16 flex items-center px-6 border-b">
            <Link href="/dashboard" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AJ</span>
              </div>
              <span className="ml-2 font-semibold text-blue-900">Dashboard</span>
            </Link>
          </div>

          {/* Sidebar content */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="h-16 flex items-center px-6 border-t">
            {user && (
              <div className="flex items-center flex-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="ml-2 truncate">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.role || "Student"}</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="ml-auto p-2 text-gray-500 hover:text-red-600"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay to dismiss mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {isAuthenticated ? children : null}
        </main>
      </div>
      <Toaster />
    </div>
  )
} 