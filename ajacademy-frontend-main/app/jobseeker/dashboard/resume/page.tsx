"use client"

import { useState, useEffect } from "react"
import { Upload, FileText, Trash2, Download, Loader2, Link2, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { fetchAPI } from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function ResumePage() {
  const { toast } = useToast()
  const [resume, setResume] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("link")
  const [googleDriveLink, setGoogleDriveLink] = useState("")
  const [isValidLink, setIsValidLink] = useState(true)

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetchAPI<any>("/api/jobseeker/profile", {
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
          setProfileData(response.data.data)
          if (response.data.data.resume) {
            setResume(response.data.data.resume)
            setGoogleDriveLink(response.data.data.resume)
          }
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
  }, [toast])

  // Validate Google Drive link
  const validateGoogleDriveLink = (link: string) => {
    // Simple validation for Google Drive links
    const isValid = link.startsWith('https://drive.google.com/') || 
                   link.startsWith('https://docs.google.com/');
    setIsValidLink(isValid || link === '');
    return isValid;
  }

  // Handle Google Drive link submission
  const handleGoogleDriveSubmit = async () => {
    if (!validateGoogleDriveLink(googleDriveLink)) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid Google Drive document link",
        variant: "destructive",
      })
      return;
    }

    setUploading(true);

    try {
      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          resume: googleDriveLink,
        }),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        setResume(googleDriveLink)
        toast({
          title: "Success",
          description: "Resume link saved successfully",
        })
      }
    } catch (error) {
      console.error("Error saving resume link:", error)
      toast({
        title: "Error",
        description: "Failed to save resume link",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle file upload (simulated)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // This is a simulation of file upload - in a real app, you would upload to Google Drive
    try {
      // Simulating upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, here you would:
      // 1. Upload the file to your server
      // 2. The server would upload to Google Drive using API
      // 3. Return the Google Drive link

      // Mock response with a fake Google Drive link
      const mockResumeUrl = `https://docs.google.com/document/d/example-${Date.now()}/edit`

      // Update profile with new resume URL
      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          resume: mockResumeUrl,
        }),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        setResume(mockResumeUrl)
        setGoogleDriveLink(mockResumeUrl)
        toast({
          title: "Success",
          description: "Resume uploaded successfully to Google Drive",
        })
      }
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle resume delete
  const handleResumeDelete = async () => {
    setUploading(true)

    try {
      const response = await fetchAPI("/api/jobseeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          resume: null,
        }),
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        setResume(null)
        setGoogleDriveLink("")
        toast({
          title: "Success",
          description: "Resume removed successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast({
        title: "Error",
        description: "Failed to remove resume",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
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
        <h1 className="text-2xl font-bold">Resume</h1>
        <p className="text-gray-600">
          Manage your resume for job applications
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Google Drive Resume</AlertTitle>
        <AlertDescription>
          We use Google Drive for resume management. This allows recruiters to easily view your resume without downloading files.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {resume ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Resume</CardTitle>
              <CardDescription>
                Your current resume on Google Drive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-10 w-10 text-blue-500 mr-4" />
                    <div>
                      <h3 className="font-medium">
                        Your Google Drive Resume
                      </h3>
                      <a 
                        href={resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        {resume.substring(0, 40)}...
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(resume, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleResumeDelete}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <iframe
                  src={`${resume.replace('/edit', '/preview')}`}
                  className="w-full h-[600px] border rounded-md"
                  title="Resume Preview"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add Your Resume</CardTitle>
              <CardDescription>
                Upload your resume or add a Google Drive link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="link">Google Drive Link</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                
                <TabsContent value="link" className="mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="googleDriveLink">Google Drive Document Link</Label>
                      <Input
                        id="googleDriveLink"
                        placeholder="https://docs.google.com/document/d/..."
                        value={googleDriveLink}
                        onChange={(e) => {
                          setGoogleDriveLink(e.target.value);
                          validateGoogleDriveLink(e.target.value);
                        }}
                        className={!isValidLink ? "border-red-500" : ""}
                      />
                      {!isValidLink && googleDriveLink && (
                        <p className="text-sm text-red-500">
                          Please enter a valid Google Drive link
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Share your Google Doc with view access before adding the link
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleGoogleDriveSubmit}
                      disabled={uploading || !googleDriveLink || !isValidLink}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Link2 className="mr-2 h-4 w-4" />
                          Save Google Drive Link
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-4">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-1">Upload to Google Drive</h3>
                    <p className="text-gray-500 mb-4">
                      Your file will be uploaded to Google Drive for better compatibility with recruiters
                    </p>
                    <Button 
                      variant="default" 
                      disabled={uploading}
                      onClick={() => document.getElementById('resumeInput')?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Resume
                        </>
                      )}
                    </Button>
                    <input
                      id="resumeInput"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 