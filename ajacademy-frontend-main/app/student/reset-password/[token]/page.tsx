"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const { token } = params
  
  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/students/verify-token?token=${token}`)
        const data = await response.json()
        
        if (!data.success) {
          setIsValid(false)
          toast({
            title: "Error",
            description: "This password reset link is invalid or has expired.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Token verification error:", error)
        setIsValid(false)
        toast({
          title: "Error",
          description: "Failed to verify reset token. Please try again.",
          variant: "destructive",
        })
      }
    }
    
    verifyToken()
  }, [token, toast])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter and confirm your new password",
        variant: "destructive",
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }
    
    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/students/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token,
          password 
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSuccess(true)
        toast({
          title: "Success",
          description: "Your password has been reset successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 px-4 py-8">
        <Card className="w-full max-w-md bg-white border-blue-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">AJ</span>
            </div>
            <CardTitle className="text-2xl font-bold text-blue-900">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please request a new password reset link.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/student/forgot-password")}
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 px-4 py-8">
        <Card className="w-full max-w-md bg-white border-blue-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">AJ</span>
            </div>
            <CardTitle className="text-2xl font-bold text-blue-900">Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been reset successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4 text-blue-700">
              <svg
                className="h-12 w-12 inline-block text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="mb-6">You can now login with your new password.</p>
            <Button
              onClick={() => router.push("/student/login")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 px-4 py-8">
      <Card className="w-full max-w-md bg-white border-blue-100 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">AJ</span>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Reset Password</CardTitle>
          <CardDescription>Create a new password for your account</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <span className="text-xs text-gray-500">
                Password must be at least 8 characters long
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link 
            href="/student/login" 
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 