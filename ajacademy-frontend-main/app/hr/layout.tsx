"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Briefcase, 
  Users, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search
} from "lucide-react"

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === "/hr/login") {
      return
    }

    // Check if user is authenticated
    const token = localStorage.getItem("hrToken")
    const userStr = localStorage.getItem("hrUser")
    
    if (!token || !userStr) {
      router.push("/hr/login")
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      setUserInfo(user)
      setIsAuthenticated(true)
    } catch (e) {
      localStorage.removeItem("hrToken")
      localStorage.removeItem("hrUser")
      router.push("/hr/login")
    }
  }, [pathname, router])

  // If on login page, just render the children
  if (pathname === "/hr/login") {
    return children
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("hrToken")
    localStorage.removeItem("hrUser")
    router.push("/hr/login")
  }

  // Navigation items
  const navItems = [
    { name: "Dashboard", href: "/hr/dashboard", icon: LayoutDashboard },
    { name: "Job Listings", href: "/hr/jobs", icon: Briefcase },
    { name: "Applications", href: "/hr/applications", icon: FileText },
    { name: "Leads Fetch", href: "/hr/leads", icon: Search },
    { name: "Settings", href: "/hr/settings", icon: Settings },
  ]

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
            <Link href="/hr/dashboard" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AJ</span>
              </div>
              <span className="ml-2 font-semibold text-blue-900">HR Portal</span>
            </Link>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
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
          </div>

          {/* Sidebar footer */}
          <div className="h-16 flex items-center px-6 border-t">
            {userInfo && (
              <div className="flex items-center flex-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                  {userInfo.firstName?.charAt(0) || userInfo.email?.charAt(0) || "U"}
                </div>
                <div className="ml-2 truncate">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ""}` : userInfo.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{userInfo.company || "HR"}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
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

      {/* Main content - Modified to remove header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {isAuthenticated ? children : null}
        </main>
      </div>
    </div>
  )
} 