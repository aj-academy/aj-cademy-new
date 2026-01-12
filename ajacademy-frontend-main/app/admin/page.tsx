"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Simple function to generate a more robust mock JWT token
function generateMockToken(payload: any): string {
  // This is an improved token generator but still for demo purposes only
  // In production, use a proper JWT library and backend authentication
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours expiry
  }));
  const signature = btoa('secure_mock_signature_' + Math.random().toString(36).substring(2));
  return `${header}.${encodedPayload}.${signature}`;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Set mounted state to confirm we're on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if already logged in
  useEffect(() => {
    if (!isMounted) return;
    
    const checkAuth = async () => {
      setCheckingAuth(true)
      try {
        const adminAuthStr = localStorage.getItem("adminAuth")
        if (adminAuthStr) {
          try {
            // Try to parse the auth data
            const adminAuth = JSON.parse(adminAuthStr)
            
            // Check if token exists and is not expired
            if (adminAuth?.token && (!adminAuth.expiresAt || new Date(adminAuth.expiresAt) > new Date())) {
              console.log("Admin login page: Already authenticated, redirecting to dashboard")
              toast({
                title: "Already logged in",
                description: "You are already authenticated as admin",
              })
              // Add a slight delay to prevent immediate redirect loops
              setTimeout(() => {
                router.push("/admin/dashboard")
              }, 100)
              return
            } else {
              console.log("Admin login page: Invalid or expired token")
              toast({
                title: "Session expired",
                description: "Your previous session has expired. Please login again.",
                variant: "default",
              })
              // Clear invalid auth data
              localStorage.removeItem("adminAuth")
            }
          } catch (error) {
            console.error('Error parsing adminAuth:', error)
            toast({
              title: "Authentication error",
              description: "There was a problem with your saved login. Please sign in again.",
              variant: "destructive",
            })
            // Clear invalid auth data
            localStorage.removeItem("adminAuth")
          }
        } else {
          console.log("Admin login page: No adminAuth found, staying on login page")
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        toast({
          title: "Browser storage error",
          description: "Unable to access browser storage. You may need to enable cookies.",
          variant: "destructive",
        })
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [isMounted, router, toast])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Clear any existing tokens first
      try {
        localStorage.removeItem("adminAuth")
        sessionStorage.removeItem("adminAuth")
      } catch (error) {
        console.error('Error accessing storage:', error)
      }
      
      // Get the API URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      console.log('Using API URL:', apiUrl);
      
      // Call the backend API for admin login
      const loginEndpoint = `${apiUrl}/auth/admin/login`;
      console.log('Sending admin login request to:', loginEndpoint);
      
      const loginData = {email, password };
      console.log('Login data:', { email, password: '****' });
      
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log("Admin login response:", data);

      if (response.ok && data.success) {
        // Store admin auth in localStorage with the token from backend
        const authData = {
          email: data.user.email,
          isAuthenticated: true,
          role: "admin",
          token: data.token,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        };
        
        console.log('Setting auth data in localStorage:', { ...authData, token: '****' });
        
        try {
          localStorage.setItem("adminAuth", JSON.stringify(authData));
          // No need to use sessionStorage - creates confusion
        } catch (error) {
          console.error('Error setting localStorage:', error);
          toast({
            title: "Warning",
            description: "Could not save login to browser storage. You may need to login again later.",
            variant: "destructive",
          });
        }

        toast({
          title: "Success!",
          description: "You have successfully signed in as admin.",
          variant: "default",
        });

        // Redirect to admin dashboard with a slight delay
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 100);
      } else {
        console.error("Login failed:", data.error || "Unknown error");
        toast({
          title: "Login Failed",
          description: data.error || "Invalid admin credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Server error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything until client-side auth check is complete
  if (!isMounted || checkingAuth) {
    return isMounted ? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : null; // Return null during server-side rendering
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
          <h1 className="mt-6 text-3xl font-bold text-blue-900">Admin Access</h1>
          <p className="mt-2 text-blue-700">Sign in to access the admin dashboard</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white border-blue-100 shadow-xl overflow-hidden">
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-2xl text-blue-900 text-center">Admin Login</CardTitle>
              <CardDescription className="text-blue-700 text-center">
                Enter your admin credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <div className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
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
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <div className="text-center mt-4">
          <Link href="/" className="text-blue-700 hover:text-blue-900 hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  )
} 
