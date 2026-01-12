"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, BookOpen, Briefcase, GraduationCap, Heart, FileText } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { api } from "@/lib/api-client"
import { Student, StudentProfile } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define form schema for profile
const profileSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  bio: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  interests: z.string().optional(),
  resume: z.string().url().optional().or(z.literal(''))
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function StudentProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Create form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      bio: '',
      education: '',
      experience: '',
      skills: '',
      interests: '',
      resume: ''
    },
  })

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to view your profile',
            variant: 'destructive',
          })
          router.push('/student/login?returnUrl=/student/profile')
          return
        }
        
        const response = await api.student.getProfile()
        
        if (response.error) {
          if (response.error.includes('401') || response.error.includes('Authentication required')) {
            toast({
              title: 'Session Expired',
              description: 'Your session has expired. Please sign in again.',
              variant: 'destructive',
            })
            router.push('/student/login?returnUrl=/student/profile')
            return
          }
          
          throw new Error(response.error)
        }
        
        const payload = response.data?.data as Student | undefined
        if (payload) {
          const d = payload
          const fullName = d.name || ''
          const [first = '', last = ''] = fullName.split(' ')
          const profile = d.profile || {}
          form.reset({
            email: d.email ?? '',
            firstName: d.firstName || first,
            lastName: d.lastName || last,
            phone: d.phone || '',
            bio: profile.bio ?? '',
            education: profile.education ?? '',
            experience: profile.experience ?? '',
            skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '' as unknown as string),
            interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : (profile.interests || '' as unknown as string),
            resume: profile.resume ?? ''
          });
        } else {
          // If no data, try to fill with localStorage values
          const userName = localStorage.getItem('userName') || ''
          const userEmail = localStorage.getItem('userEmail') || ''
          
          const [firstNameFallback = '', lastNameFallback = ''] = userName.split(' ')
          form.reset({
            email: userEmail,
            firstName: firstNameFallback,
            lastName: lastNameFallback,
            bio: '',
            education: '',
            experience: '',
            skills: '',
            interests: '',
            resume: ''
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load profile'
        setError(errorMessage)
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [form, router, toast])

  // Form submission handler
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setSaving(true);
      const updatedProfile: any = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        bio: values.bio,
        education: values.education,
        experience: values.experience,
        skills: values.skills ? values.skills.split(',').map(skill => skill.trim()) : [],
        interests: values.interests ? values.interests.split(',').map(interest => interest.trim()) : [],
        resume: values.resume
      };
      const response = await api.student.updateProfile(updatedProfile);
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      })
      
      // Update local storage name and email
      const newName = `${values.firstName || ''} ${values.lastName || ''}`.trim()
      if (newName) localStorage.setItem('userName', newName)
      if (values.email) localStorage.setItem('userEmail', values.email)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      toast({
        title: "Error Updating Profile",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1,2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1,2,3].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Basic information about you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" /> First Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" /> Last Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email Address
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email address" readOnly disabled {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Enter your phone number" readOnly disabled {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" /> Bio
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A short description about yourself, your background, and your goals.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education & Skills</CardTitle>
                  <CardDescription>Your academic and professional profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" /> Education
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your educational background" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" /> Experience
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your work experience" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" /> Skills
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your skills (comma separated)" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Separate skills with commas (e.g., React, JavaScript, Python)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Heart className="h-4 w-4" /> Interests
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your interests (comma separated)" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Separate interests with commas (e.g., Web Development, AI, Mobile Apps)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Resume URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Link to your resume (Google Drive, Dropbox, etc.)" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to your uploaded resume (e.g., Google Drive or Dropbox link)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="mt-6">
              <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
} 