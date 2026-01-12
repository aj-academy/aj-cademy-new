"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

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
import { showAuthToast } from "@/lib/auth-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      showAuthToast(toast, "password-reset-error", "Please enter your email address")
      return
    }
    
    setIsLoading(true)
    
    try {
      // This API endpoint would need to be implemented to send reset emails
      const response = await fetch("/api/auth/students/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSubmitted(true)
        showAuthToast(toast, "password-reset-sent")
      } else {
        showAuthToast(toast, "password-reset-error", data.error || "Failed to send reset instructions. Please try again.")
      }
    } catch (error) {
      console.error("Password reset error:", error)
      showAuthToast(toast, "password-reset-error", "An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 px-4 py-8">
      <Card className="w-full max-w-md bg-white border-blue-100 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">AJ</span>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Forgot Password</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive password reset instructions"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSubmitted ? (
            <div className="text-center p-4">
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
              <p className="mb-4">
                We&apos;ve sent an email to <strong>{email}</strong> with instructions to reset your password.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                If you don&apos;t receive an email within a few minutes, please check your spam folder or try again.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>
          )}
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
      <Toaster />
    </div>
  )
} 