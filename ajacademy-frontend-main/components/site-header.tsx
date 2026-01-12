"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  UserCircle,
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
} from "lucide-react"

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUserName = localStorage.getItem("userName")
    const storedUserEmail = localStorage.getItem("userEmail")
    const storedUserRole = localStorage.getItem("userRole")

    if (token) {
      setIsAuthenticated(true)
      const safeName =
        storedUserName && storedUserName.toLowerCase() !== "student"
          ? storedUserName
          : storedUserEmail || "User"

      setUserName(safeName)
      setUserRole(storedUserRole || "")
    } else {
      setIsAuthenticated(false)
      setUserName("")
      setUserRole("")
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <MobileNav />

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/ajlogo.jpg"
              alt="AJ Academy Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFC300] to-[#B8860B] bg-clip-text text-transparent">
              AJ Academy
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/job-portal" className="nav-link">Job Portal</Link>
            <Link href="/gallery" className="nav-link">Gallery</Link>
            <Link href="/courses" className="nav-link">Courses</Link>

            {/* ✅ CERTIFICATES ADDED */}
            <Link href="/certificates" className="nav-link">
              Certificates
            </Link>

            <Link href="/projects" className="nav-link">Projects</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <UserCircle className="h-4 w-4 mr-2" />
                  {userName}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                {userRole === "student" && (
                  <DropdownMenuItem asChild>
                    <Link href="/student/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}

                {userRole === "jobseeker" && (
                  <DropdownMenuItem asChild>
                    <Link href="/jobseeker/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/auth/sign-in">As Student</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/job-portal/auth/sign-in">As Jobseeker</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/auth/sign-up">As Student</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/job-portal/auth/sign-up">As Jobseeker</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* SIMPLE NAV STYLE */}
      <style jsx>{`
        .nav-link {
          font-weight: 500;
          color: #374151;
        }
        .nav-link:hover {
          color: #2563eb;
        }
      `}</style>
    </header>
  )
}
