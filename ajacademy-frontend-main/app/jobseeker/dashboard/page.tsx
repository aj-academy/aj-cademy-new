"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { fetchAPI } from "@/lib/api-client"
import { ApiResponse } from "@/lib/types"

// Define profile schema
const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  profilePicture: z.string().optional(),
})

// Define education schema
const educationSchema = z.object({
  institution: z.string().min(2, "Institution name is required"),
  degree: z.string().min(2, "Degree is required"),
  field: z.string().min(2, "Field of study is required"),
  startDate: z.string().min(2, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
})

// Define experience schema
const experienceSchema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  isFresher: z.boolean().optional(),
}).refine((data) => {
  // If not fresher, company, position, and startDate are required
  if (!data.isFresher) {
    return data.company && data.company.length >= 2 && 
           data.position && data.position.length >= 2 && 
           data.startDate && data.startDate.length >= 2
  }
  return true
}, {
  message: "Company, position, and start date are required for work experience",
  path: ["company"]
})

interface ProfileData {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  profilePicture?: string
  resume?: string
  skills: string[]
  education: {
    _id?: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    current?: boolean
  }[]
  experience: {
    _id?: string
    company?: string
    position?: string
    description?: string
    startDate?: string
    endDate?: string
    current?: boolean
    isFresher?: boolean
  }[]
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { toast } = useToast()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
  })
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
    current: false,
    isFresher: false,
  })

  // Create form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      profilePicture: "",
    },
  })

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetchAPI<ApiResponse<any>>("/api/jobseeker/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        if (response.data?.data) {
          const profile = response.data.data
          setProfileData(profile)
          setSkills(profile.skills || [])

          // Set form default values
          form.reset({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone || "",
            profilePicture: profile.profilePicture || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [toast, form])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setSaving(true)

    try {
      const payload = {
        ...values,
        skills,
      }

      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })

        // Update profile data
        // @ts-expect-error
        if (response && response.data && response.data.data) {
          // @ts-expect-error
          setProfileData(response.data.data)
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  // Add education
  const addEducation = async () => {
    if (!newEducation.institution || !newEducation.degree || !newEducation.field || !newEducation.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const updatedEducation = [...(profileData?.education || []), newEducation]

      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          education: updatedEducation,
        }),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Education added successfully",
        })

        // Reset form and update profile data
        setNewEducation({
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          current: false,
        })

        // Update profile data
        // @ts-expect-error
        if (response && response.data && response.data.data) {
          // @ts-expect-error
          setProfileData(response.data.data)
        }
      }
    } catch (error) {
      console.error("Error adding education:", error)
      toast({
        title: "Error",
        description: "Failed to add education",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Remove education
  const removeEducation = async (index: number) => {
    setSaving(true)

    try {
      const updatedEducation = [...(profileData?.education || [])]
      updatedEducation.splice(index, 1)

      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          education: updatedEducation,
        }),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Education removed successfully",
        })

        // Update profile data
        // @ts-expect-error
        if (response && response.data && response.data.data) {
          // @ts-expect-error
          setProfileData(response.data.data)
        }
      }
    } catch (error) {
      console.error("Error removing education:", error)
      toast({
        title: "Error",
        description: "Failed to remove education",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Add experience
  const addExperience = async () => {
    // If not fresher, validate required fields
    if (!newExperience.isFresher) {
      if (!newExperience.company || !newExperience.position || !newExperience.startDate) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (Company, Position, and Start Date)",
          variant: "destructive",
        })
        return
      }
    }

    setSaving(true)

    try {
      const updatedExperience = [...(profileData?.experience || []), newExperience]

      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          experience: updatedExperience,
        }),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Experience added successfully",
        })

        // Reset form and update profile data
        setNewExperience({
          company: "",
          position: "",
          description: "",
          startDate: "",
          endDate: "",
          current: false,
          isFresher: false,
        })

        // Update profile data
        // @ts-expect-error
        if (response && response.data && response.data.data) {
          // @ts-expect-error
          setProfileData(response.data.data)
        }
      }
    } catch (error) {
      console.error("Error adding experience:", error)
      toast({
        title: "Error",
        description: "Failed to add experience",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Remove experience
  const removeExperience = async (index: number) => {
    setSaving(true)

    try {
      const updatedExperience = [...(profileData?.experience || [])]
      updatedExperience.splice(index, 1)

      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          experience: updatedExperience,
        }),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Experience removed successfully",
        })

        // Update profile data
        // @ts-expect-error
        if (response && response.data && response.data.data) {
          // @ts-expect-error
          setProfileData(response.data.data)
        }
      }
    } catch (error) {
      console.error("Error removing experience:", error)
      toast({
        title: "Error",
        description: "Failed to remove experience",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile Dashboard</h1>
        <p className="text-gray-600">
          Manage your profile information and job applications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your basic profile information
                  </CardDescription>
                </div>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profileData?.profilePicture || ""} />
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            defaultCountry="in"
                            value={field.value || ""}
                            onChange={(phone) => field.onChange(phone)}
                            className="phone-input"
                            inputClassName="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profilePicture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input placeholder="Profile picture URL" {...field} />
                            <Button type="button" variant="outline" size="icon">
                              <Camera className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter a URL for your profile picture
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <Input value={profileData?.email || ""} disabled />
                      <FormDescription>
                        Your email address cannot be changed
                      </FormDescription>
                    </FormItem>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Add your skills to stand out to employers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Remove {skill}</span>
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a skill (e.g., React, JavaScript, Project Management)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={async () => {
                    setSaving(true)
                    try {
                      const response = await fetchAPI("/api/jobseeker/profile", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({ skills }),
                      })

                      if (response.error) {
                        toast({
                          title: "Error",
                          description: response.error,
                          variant: "destructive",
                        })
                      } else {
                        toast({
                          title: "Success",
                          description: "Skills updated successfully",
                        })
                      }
                    } catch (error) {
                      console.error("Error updating skills:", error)
                      toast({
                        title: "Error",
                        description: "Failed to update skills",
                        variant: "destructive",
                      })
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Skills
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>
                Add your educational background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profileData?.education && profileData.education.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </button>
                        <h3 className="font-semibold">{edu.institution}</h3>
                        <p>
                          {edu.degree} in {edu.field}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No education history added yet</p>
                )}

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Add New Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Institution</label>
                      <Input
                        placeholder="University or school name"
                        value={newEducation.institution}
                        onChange={(e) =>
                          setNewEducation({ ...newEducation, institution: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Degree</label>
                      <Input
                        placeholder="e.g., Bachelor's, Master's"
                        value={newEducation.degree}
                        onChange={(e) =>
                          setNewEducation({ ...newEducation, degree: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Field of Study</label>
                    <Input
                      placeholder="e.g., Computer Science, Business"
                      value={newEducation.field}
                      onChange={(e) =>
                        setNewEducation({ ...newEducation, field: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={newEducation.startDate}
                        onChange={(e) =>
                          setNewEducation({ ...newEducation, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <Input
                        type="date"
                        value={newEducation.endDate}
                        onChange={(e) =>
                          setNewEducation({ ...newEducation, endDate: e.target.value })
                        }
                        disabled={newEducation.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="currentEducation"
                      checked={newEducation.current}
                      onChange={(e) =>
                        setNewEducation({ ...newEducation, current: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="currentEducation" className="text-sm">
                      I am currently studying here
                    </label>
                  </div>

                  <Button type="button" onClick={addEducation} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Education
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>
                Add your professional experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profileData?.experience && profileData.experience.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </button>
                        {exp.isFresher ? (
                          <>
                            <h3 className="font-semibold">Fresher</h3>
                            <p className="text-sm text-gray-600">No prior work experience</p>
                            {exp.description && (
                              <p className="text-sm mt-2">{exp.description}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <h3 className="font-semibold">{exp.position}</h3>
                            <p>{exp.company}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                            </p>
                            {exp.description && (
                              <p className="text-sm mt-2">{exp.description}</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No work experience added yet</p>
                )}

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Add New Experience</h3>
                  
                  {/* Fresher Option */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg bg-blue-50">
                    <input
                      type="checkbox"
                      id="isFresher"
                      checked={newExperience.isFresher}
                      onChange={(e) => {
                        const isFresher = e.target.checked
                        setNewExperience({ 
                          ...newExperience, 
                          isFresher,
                          // Clear fields when switching to fresher
                          company: isFresher ? "" : newExperience.company,
                          position: isFresher ? "" : newExperience.position,
                          startDate: isFresher ? "" : newExperience.startDate,
                          endDate: isFresher ? "" : newExperience.endDate,
                          current: isFresher ? false : newExperience.current,
                        })
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="isFresher" className="text-sm font-medium cursor-pointer">
                      I am a Fresher (No prior work experience)
                    </label>
                  </div>

                  {!newExperience.isFresher && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Company <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="Company name"
                            value={newExperience.company}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, company: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Position <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="Job title"
                            value={newExperience.position}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, position: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      placeholder={newExperience.isFresher ? "Add any additional information (e.g., internships, projects, certifications)" : "Brief description of your role and responsibilities"}
                      value={newExperience.description}
                      onChange={(e) =>
                        setNewExperience({ ...newExperience, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  {!newExperience.isFresher && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="date"
                            value={newExperience.startDate}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, startDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Date</label>
                          <Input
                            type="date"
                            value={newExperience.endDate}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, endDate: e.target.value })
                            }
                            disabled={newExperience.current}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="currentJob"
                          checked={newExperience.current}
                          onChange={(e) =>
                            setNewExperience({ ...newExperience, current: e.target.checked })
                          }
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="currentJob" className="text-sm">
                          I am currently working here
                        </label>
                      </div>
                    </>
                  )}

                  <Button type="button" onClick={addExperience} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Experience
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 