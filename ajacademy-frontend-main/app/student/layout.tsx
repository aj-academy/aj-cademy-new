"use client"

import { useState, useEffect, memo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserCircle, LogOut, Menu, X, BookOpen, FolderGit2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/useAuth"

// Define auth routes outside the component to prevent recreating on each render
const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password"
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname() || ""
  
  // Use our centralized auth hook
  const { isAuthenticated, isLoading, user, logout } = useAuth({
    skipRoutes: authRoutes,
    loginPath: "/auth/sign-in",
    tokenKey: "token"
  })

  // If on auth page, just render the children
  const isAuthPage = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }
  
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

  // Student name for sidebar footer
  let studentName = '';
  if (user && user.firstName && user.lastName) {
    studentName = `${user.firstName} ${user.lastName}`.trim();
  } else if (typeof window !== 'undefined') {
    studentName = localStorage.getItem('userName') || 'Student';
  } else {
    studentName = 'Student';
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
            <Link href="/student/dashboard" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AJ</span>
              </div>
              <span className="ml-2 font-semibold text-blue-900">Student Portal</span>
            </Link>
          </div>

          {/* Sidebar content - only profile */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link
              href="/student/dashboard"
              className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                pathname.startsWith("/student/dashboard")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <UserCircle
                className={`mr-3 h-5 w-5 ${
                  pathname.startsWith("/student/dashboard") ? "text-blue-600" : "text-gray-500"
                }`}
              />
              Dashboard
            </Link>
            
            <Link
              href="/student/learning"
              className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                pathname.startsWith("/student/learning")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BookOpen
                className={`mr-3 h-5 w-5 ${
                  pathname.startsWith("/student/learning") ? "text-blue-600" : "text-gray-500"
                }`}
              />
              My Learning
            </Link>
            
            <Link
              href="/student/myprojects"
              className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                pathname.startsWith("/student/myprojects")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FolderGit2
                className={`mr-3 h-5 w-5 ${
                  pathname.startsWith("/student/myprojects") ? "text-blue-600" : "text-gray-500"
                }`}
              />
              My Projects
            </Link>

            <Link
              href="/student/profile"
              className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                pathname.startsWith("/student/profile")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <UserCircle
                className={`mr-3 h-5 w-5 ${
                  pathname.startsWith("/student/profile") ? "text-blue-600" : "text-gray-500"
                }`}
              />
              Profile
            </Link>
          </nav>

          {/* Sidebar footer */}
          <div className="h-16 flex items-center px-6 border-t">
            {user && (
              <div className="flex items-center flex-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                  {user.name?.charAt(0) || "S"}
                </div>
                <div className="ml-2 truncate">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user.name || "Student"}
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