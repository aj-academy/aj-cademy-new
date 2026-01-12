"use client"

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getClientToken, getClientUser } from '@/lib/auth'

export default function Header() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const token = getClientToken()
    const user = getClientUser()
    setIsLoggedIn(!!token && !!user)
    
    if (user) {
      setUserName(user.email || '')
    } else {
      setUserName('')
    }
  }, [pathname])

  return (
    <header className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/ajlogo.jpg"
            alt="AJ Academy Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <span className="text-xl font-bold text-gray-900">AJ Academy</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/"
            className={`text-sm font-medium ${pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Home
          </Link>
          <Link 
            href="/job-portal"
            className={`text-sm font-medium ${pathname === '/job-portal' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Job Portal
          </Link>
          <Link 
            href="/gallery"
            className={`text-sm font-medium ${pathname === '/gallery' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Gallery
          </Link>
          <Link 
            href="/courses"
            className={`text-sm font-medium ${pathname === '/courses' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Courses
          </Link>
          <Link 
            href="/contact"
            className={`text-sm font-medium ${pathname === '/contact' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm font-medium text-gray-600">
                {userName}
              </span>
              <Link 
                href="/student/dashboard" 
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="text-sm font-medium bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/student/login" 
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Login
              </Link>
              <Link 
                href="/student/signup" 
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 