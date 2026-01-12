"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { notifyAuthStateChanged } from "@/lib/auth"

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  error?: string;
}

function SignInPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') ?? "/dashboard"
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Make API call to authenticate
      const response = await fetch('/api/auth/students/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      // Handle non-JSON responses
      let data: LoginResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing login response:', parseError);
        
        // Try to get raw text for better error diagnosis
        const rawText = await response.text().catch(() => 'Unable to read response text');
        
        toast({
          title: "Error",
          description: "Unexpected server response format. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        // Log the response data for debugging
        console.log('Login response data:', data);
        
        // Clear any existing auth data first
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // Wait a moment to ensure localStorage is cleared
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Store token and user info with fallbacks for missing data
        localStorage.setItem('token', data.token || '')
        localStorage.setItem('userRole', data.user?.role || 'student')
        localStorage.setItem('userId', data.user?._id || '')
        
        // Make sure we have a valid name or set fallback
        const firstName = data.user?.firstName || '';
        const lastName = data.user?.lastName || '';
        const computedName = `${firstName} ${lastName}`.trim()
        // Fallback to email instead of generic role label to avoid showing "Student"
        localStorage.setItem('userName', computedName || email)
        
        // Store email from form input (more reliable than response)
        localStorage.setItem('userEmail', email)

        // Notify all components about the auth state change
        notifyAuthStateChanged(true);

        toast({
          title: "Success!",
          description: "You have successfully signed in.",
        })

        // Use Promise to ensure localStorage is updated before redirecting
        await new Promise(resolve => {
          // Trigger a storage event to update other tabs
          window.dispatchEvent(new Event('storage'));
          
          // Give time for everything to sync up
          setTimeout(resolve, 500);
        });

        // Redirect based on user role or return URL
        if (data.user?.role === 'hr' || data.user?.role === 'admin') {
          router.push('/hr/dashboard')
        } else {
          router.push(returnUrl)
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.error || `Invalid email or password (${response.status}).`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-block">
            <div className="h-20 w-20 relative mx-auto">
              <Image 
                src="/ajlogo.jpg" 
                alt="AJ Academy Logo" 
                width={80} 
                height={80} 
                className="rounded-full object-cover"
              />
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-blue-900">Welcome back</h1>
          <p className="mt-2 text-blue-700">Sign in to your account to continue your learning journey</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white border-blue-100 shadow-xl overflow-hidden">
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-2xl text-blue-900 text-center">Sign in</CardTitle>
              <CardDescription className="text-blue-700 text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4 pt-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-blue-900">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className={`pl-10 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-300" : ""}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-blue-900">
                      Password
                    </Label>
                    <Link
                      href="/auth/reset-password"
                      className="text-xs text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`pl-10 pr-10 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-300" : ""}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <p className="text-center text-sm text-blue-800">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/sign-up" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                    Sign up
                  </Link>
                </p>
                {returnUrl && returnUrl !== "/dashboard" && (
                  <p className="text-center text-sm text-gray-500">
                    You&apos;ll be redirected back to continue your application after signing in.
                  </p>
                )}
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  )
}
