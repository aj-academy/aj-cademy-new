"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { fetchAPI } from '@/lib/api-client'
import { ApiResponse, RegisterCredentials, AuthResponse } from '@/lib/types'
import { handleApiError } from '@/lib/api-client'

export default function JobSeekerSignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') ?? '/job-portal'
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Password strength requirements
  const hasMinLength = formData.password.length >= 8
  const hasUpperCase = /[A-Z]/.test(formData.password)
  const hasLowerCase = /[a-z]/.test(formData.password)
  const hasNumber = /[0-9]/.test(formData.password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
      newErrors.password = "Password doesn&apos;t meet all requirements"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Log form data for debugging
      console.log('Submitting form data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: '********',
      })

      const response: ApiResponse<any> = await fetchAPI('/api/auth/jobseeker/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      // Log the entire response
      console.log('Registration complete response:', JSON.stringify(response))

      if (response.error) {
        console.error('Registration error response:', response.error);
        
        // Use a more visible toast with forced styling for errors
        toast({
          title: "Registration Failed",
          description: response.error || "Account creation failed. Please try again.",
          variant: "destructive",
          className: "z-50 border-2 border-red-500",
          duration: 5000, // 5 seconds
        })
        
        // Also update the UI to show the error
        setErrors({
          ...errors,
          email: response.error || "Registration failed"
        })
        
        setIsLoading(false)
        return
      }

      console.log('Registration success response:', response);
      
      // Use a more visible toast with forced styling for success
      toast({
        title: "Success!",
        description: "Your job seeker account has been created successfully.",
        variant: "default",
        className: "z-50 border-2 border-green-500 bg-green-50",
        duration: 5000, // 5 seconds
      })
      
      // Redirect immediately instead of using setTimeout
      const redirectUrl = `/job-portal/auth/sign-in${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`
      console.log(`Redirecting to: ${redirectUrl}`)
      router.push(redirectUrl)
      
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = handleApiError(error)
      
      // Use a more visible toast with forced styling for errors
      toast({
        title: "Error",
        description: errorMessage || "An unexpected error occurred",
        variant: "destructive",
        className: "z-50 border-2 border-red-500",
        duration: 5000, // 5 seconds
      })
      
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
          <Link href="/job-portal" className="inline-block">
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
          <h1 className="mt-6 text-3xl font-bold text-blue-900">Create Job Seeker Account</h1>
          <p className="mt-2 text-blue-700">Join thousands of job seekers finding opportunities with AJ Academy</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white border-blue-100 shadow-xl overflow-hidden">
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-2xl text-blue-900 text-center">Job Seeker Sign Up</CardTitle>
              <CardDescription className="text-blue-700 text-center">
                Enter your information to create a job seeker account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4 pt-6">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="text-blue-900">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      className={`pl-10 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.firstName ? "border-red-300 focus:border-red-400 focus:ring-red-300" : ""}`}
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="text-blue-900">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      className={`pl-10 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.lastName ? "border-red-300 focus:border-red-400 focus:ring-red-300" : ""}`}
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-blue-900">
                    Phone Number
                  </Label>
                  <PhoneInput
                    defaultCountry="in"
                    value={formData.phone}
                    onChange={(phone) => setFormData({ ...formData, phone })}
                    className="phone-input"
                    inputClassName={`h-10 w-full rounded-md border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-blue-900">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className={`pl-10 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-300" : ""}`}
                      value={formData.email}
                      onChange={handleChange}
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
                  <Label htmlFor="password" className="text-blue-900">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-300" : ""}`}
                      value={formData.password}
                      onChange={handleChange}
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

                  <div className="text-xs space-y-1 mt-1">
                    <p className="text-blue-700 font-medium">Password must contain:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`flex items-center ${hasMinLength ? "text-green-600" : "text-blue-600"}`}>
                        {hasMinLength ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <span className="h-3 w-3 mr-1 rounded-full border border-current" />
                        )}
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center ${hasUpperCase ? "text-green-600" : "text-blue-600"}`}>
                        {hasUpperCase ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <span className="h-3 w-3 mr-1 rounded-full border border-current" />
                        )}
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center ${hasLowerCase ? "text-green-600" : "text-blue-600"}`}>
                        {hasLowerCase ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <span className="h-3 w-3 mr-1 rounded-full border border-current" />
                        )}
                        <span>Lowercase letter</span>
                      </div>
                      <div className={`flex items-center ${hasNumber ? "text-green-600" : "text-blue-600"}`}>
                        {hasNumber ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <span className="h-3 w-3 mr-1 rounded-full border border-current" />
                        )}
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center ${hasSpecialChar ? "text-green-600" : "text-blue-600"}`}>
                        {hasSpecialChar ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <span className="h-3 w-3 mr-1 rounded-full border border-current" />
                        )}
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-blue-900">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40 ${errors.confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-300" : ""}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.confirmPassword}
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
                      Creating account...
                    </>
                  ) : (
                    "Create Job Seeker Account"
                  )}
                </Button>
                <p className="text-center text-sm text-blue-800">
                  Already have an account?{" "}
                  <Link 
                    href={`/job-portal/auth/sign-in${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
                {returnUrl && returnUrl !== "/job-portal" && (
                  <p className="text-center text-xs text-blue-600">
                    You&apos;ll be redirected back to continue your application after creating an account.
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