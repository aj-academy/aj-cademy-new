"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getClientToken, setClientToken } from "@/lib/auth"
import { Toaster } from "@/components/ui/toaster"
import { studentToasts, showErrorToast } from "@/lib/toast-utils"

export default function StudentLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Check if already logged in
  useEffect(() => {
    const token = getClientToken();
    if (token) {
      router.push("/student/dashboard");
    }
  }, [router]);
  
  // Handle traditional login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showErrorToast("Login Error", "Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/students/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store the token
        setClientToken(data.token);
        
        // Show success notification
        studentToasts.auth.login();
        
        // Redirect to dashboard
        router.push("/student/dashboard");
      } else {
        showErrorToast("Login Failed", data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showErrorToast("Login Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 px-4 py-8">
      <Card className="w-full max-w-md bg-white border-blue-100 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-4">
            <Image 
              src="/ajlogo.jpg" 
              alt="AJ Academy Logo" 
              width={80} 
              height={80} 
              className="rounded-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Student Login</CardTitle>
          <CardDescription>Enter your credentials to access your student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/student/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center flex-col space-y-4">
          <div className="text-sm text-gray-600 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/student/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
} 