"use client"

import { useState, useRef, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Upload, FileText, Check, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchAPI } from '@/lib/api-client'
import { ApiResponse, Job } from '@/lib/types'
import ProfileCompletionAlert from '@/components/jobseeker/ProfileCompletionAlert'
import { jobSeekerToasts, showSuccessToast, showErrorToast } from '@/lib/toast-utils'

// Form schema
const formSchema = z.object({
  coverLetter: z.string().optional(),
  resume: z.string().min(1, "Resume is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface JobApplicationFormProps {
  jobId: string
  jobTitle: string
  companyName: string
  onClose: () => void
  onSuccess: () => void
}

export default function JobApplicationForm({
  jobId,
  jobTitle,
  companyName,
  onClose,
  onSuccess,
}: JobApplicationFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverLetter: "",
      resume: "",
    },
  })
  
  // Fetch profile data on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchAPI<any>("/api/jobseeker/profile")
        
        if (response.error) {
          console.error("Error fetching profile:", response.error)
          setLoadingProfile(false)
          return
        }
        
        // Check if profile exists and has data
        if (response.data?.data) {
          setProfileData(response.data.data)
          
          // If resume exists in profile, pre-fill the form
          if (response.data.data.resume) {
            form.setValue("resume", response.data.data.resume)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoadingProfile(false)
      }
    }
    
    fetchProfile()
  }, [form])
  
  // Check if profile is complete
  const isProfileComplete = () => {
    if (!profileData) return false;
    
    return !!(
      profileData.firstName &&
      profileData.lastName &&
      profileData.email &&
      profileData.phone &&
      profileData.resume &&
      profileData.skills?.length > 0 &&
      profileData.education?.length > 0 &&
      profileData.experience?.length > 0
    );
  }
  
  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Only allow PDF, DOC, DOCX
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      showErrorToast("Invalid file type", "Please upload a PDF or Word document")
      return
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("File too large", "File size should be less than 5MB")
      return
    }
    
    try {
      setFileUploading(true)
      
      // In a real application, you would upload the file to your server or cloud storage
      // For this example, we'll simulate the upload with a delay and use a data URL
      
      // Create a mock Google Docs URL for demonstration purposes
      // In a real app, you would upload to cloud storage and get a real URL
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate upload delay
      
      // Here you would make an API call to upload the file
      // For now, we'll just create a fake URL
      const fakeGoogleDocsUrl = `https://docs.google.com/document/d/example-${Date.now()}/edit`
      
      // Update form with the URL
      form.setValue("resume", fakeGoogleDocsUrl)
      
      // Also update the profile with this resume
      try {
        const updateResponse = await fetchAPI("/api/jobseeker/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: fakeGoogleDocsUrl,
          }),
        });
        
        if (updateResponse.error) {
          console.error("Error updating profile with resume:", updateResponse.error);
        } else {
          // Update local profile data
          setProfileData({
            ...profileData,
            resume: fakeGoogleDocsUrl,
          });
        }
      } catch (updateError) {
        console.error("Failed to update profile with resume:", updateError);
      }
      
      jobSeekerToasts.profile.resumeUploaded();
    } catch (error) {
      console.error("Error uploading file:", error)
      showErrorToast("Upload failed", "Failed to upload your resume. Please try again.")
    } finally {
      setFileUploading(false)
    }
  }
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!isProfileComplete()) {
      showErrorToast(
        "Incomplete Profile", 
        "Please complete your profile before applying"
      )
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetchAPI<ApiResponse<any>>(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetter: values.coverLetter,
          resume: values.resume,
        }),
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Show success notification
      jobSeekerToasts.applications.submitted()
      
      // Close dialog and trigger success callback
      onClose()
      onSuccess()
    } catch (error) {
      console.error("Error submitting application:", error)
      showErrorToast(
        "Application Failed", 
        error instanceof Error ? error.message : "Failed to submit your application. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  
  // Check if resume is uploaded
  const isResumeUploaded = !!form.watch("resume")
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 w-[95vw]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-gray-800">Apply for {jobTitle}</DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            Submit your application to {companyName}
          </DialogDescription>
        </DialogHeader>
        
        {loadingProfile ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Loading profile information...</span>
          </div>
        ) : (
          <>
            {/* Profile Completion Alert */}
            <div className="my-4">
              <ProfileCompletionAlert profileData={profileData} isLoading={loadingProfile} />
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Resume Upload */}
                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem className="bg-gray-50 p-4 rounded-lg">
                      <FormLabel className="text-gray-800 font-medium">Resume *</FormLabel>
                      <FormControl>
                        <>
                          <input
                            type="hidden"
                            {...field}
                          />
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                          />
                          {isResumeUploaded ? (
                            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                              <FileText className="text-green-600 mr-3 h-5 w-5 flex-shrink-0" />
                              <div className="flex-1 overflow-hidden">
                                <a 
                                  href={field.value} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate flex items-center"
                                >
                                  <span className="truncate mr-1">Resume</span>
                                  <LinkIcon className="h-3 w-3 flex-shrink-0" />
                                </a>
                                <p className="text-xs text-gray-500 truncate">{field.value}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 ml-1 flex-shrink-0 text-gray-500 hover:text-red-500"
                                onClick={() => form.setValue("resume", "")}
                                title="Remove resume"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              onClick={handleUploadClick}
                              className="border-2 border-dashed border-gray-300 bg-white rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                            >
                              {fileUploading ? (
                                <>
                                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
                                  <p className="text-sm text-gray-600 font-medium">Uploading resume...</p>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                                  <p className="text-sm text-gray-700 font-medium">Click to upload your resume</p>
                                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                {/* Cover Letter */}
                <FormField
                  control={form.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem className="bg-gray-50 p-4 rounded-lg">
                      <FormLabel className="text-gray-800 font-medium">Cover Letter (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us why you're interested in this position and why you're a good fit..."
                          className="resize-y min-h-[120px] bg-white border-gray-300 focus:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <Alert className="bg-blue-50 border border-blue-100 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <AlertDescription className="text-sm text-blue-700">
                      Your application will include your complete profile information, including education, experience, and skills.
                    </AlertDescription>
                  </div>
                </Alert>
                
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-3 pt-4 border-t mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !isProfileComplete()} 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 