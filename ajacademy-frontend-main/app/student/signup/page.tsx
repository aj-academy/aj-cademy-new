"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { setClientToken } from "@/lib/auth"
import { fetchAPI } from '@/lib/api-client'
import { showAuthToast } from "@/lib/auth-toast"
import { Toaster } from "@/components/ui/toaster"

export default function StudentSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState("")
  
  const router = useRouter()
  const { toast } = useToast()
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!name || !email || !password || !confirmPassword || !phone) {
      showAuthToast(toast, "signup-error", "Please fill in all required fields")
      return;
    }
    
    if (password !== confirmPassword) {
      showAuthToast(toast, "signup-error", "Passwords do not match")
      return;
    }
    
    if (password.length < 8) {
      showAuthToast(toast, "signup-error", "Password must be at least 8 characters long")
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetchAPI('/auth/students/register', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          phone,
          enrollmentNumber: undefined,
          course: undefined,
          yearOfStudy: undefined 
        }),
      });
      
      if (response.data && (response.data as any).token) {
        setClientToken((response.data as any).token);
        showAuthToast(toast, "signup-success")
        router.push("/student/dashboard");
      } else {
        showAuthToast(toast, "signup-error", response.error || "Failed to create account. Please try again.")
      }
    } catch (error) {
      console.error("Signup error:", error);
      showAuthToast(toast, "signup-error", "An unexpected error occurred. Please try again.")
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
          <CardTitle className="text-2xl font-bold text-blue-900">Create Student Account</CardTitle>
          <CardDescription>Enter your details to create your student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="name"
                  placeholder="Your full name"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
            
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
              <Label htmlFor="password">Password</Label>
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center flex-col space-y-4">
          <div className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link href="/student/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
} 