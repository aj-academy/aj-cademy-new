"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, MapPin, Clock, Calendar, Building, ChevronLeft, ExternalLink, CheckCircle, HourglassIcon, XCircle, InfoIcon, DollarSign, Users, TrendingUp, Award } from "lucide-react"
import { motion } from "framer-motion"
import Image from 'next/image'
import Link from 'next/link'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import JobApplicationForm from "@/components/job-portal/JobApplicationForm"
import { fetchAPI } from '@/lib/api-client'
import { ApiResponse } from '@/lib/types'

// Define job type
interface Job {
  _id: string
  title: string
  company: string
  location: string
  employmentType: string
  description: string
  requirements: string[]
  responsibilities: string[]
  salary?: string
  applicationDeadline?: string
  status: string
  recruiter: {
    _id: string
    firstName: string
    lastName: string
    company: string
    companyLogo?: string
    companyWebsite?: string
    companyDescription?: string
    industry?: string
    companySize?: string
    yearFounded?: string
    headquarters?: string
  }
  createdAt: string
  updatedAt: string
  applicationsCount: number
}

// Define application status type
interface ApplicationStatus {
  hasApplied: boolean
  applicationDetails?: {
    applicationId: string
    applicationDate: string
  }
  applicationStatus?: string
  interviewDetails?: {
    date: string
    time: string
    location: string
    link?: string
  }
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationDate, setApplicationDate] = useState<string | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [interviewDetails, setInterviewDetails] = useState<{ date: string; time: string; location: string; link?: string } | null>(null)

  // Format date
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "No deadline"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }, [])

  // Calculate time since job was posted
  const getTimeSincePosted = useCallback((dateString?: string) => {
    if (!dateString) return "Recently";
    
    const posted = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - posted.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    }
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  }, [])

  // Get company initials for logo placeholder
  const getCompanyInitials = useCallback((companyName?: string) => {
    if (!companyName) return "CO"; // Default initials if company name is undefined
    
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUserRole = localStorage.getItem('userRole')
    
    if (token) {
      setIsAuthenticated(true)
      setUserRole(storedUserRole)
    }
  }, [])

  // Check if user has already applied for this job
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!isAuthenticated || !params.id) return;
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        console.log(`Checking application status for job ${params.id}`);
        const response = await fetchAPI<ApiResponse<ApplicationStatus>>(`/api/jobs/${params.id}/has-applied`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.error) {
          console.error('Error checking application status:', response.error);
          return;
        }
        
        console.log('Application status response:', response);
        
        // Check different possible response structures
        if (response.data?.data?.hasApplied) {
          console.log('Found hasApplied in response.data.data');
          setHasApplied(true);
          setApplicationDate(response.data.data.applicationDetails?.applicationDate || null);
          setApplicationStatus(response.data.data.applicationStatus || null);
          setInterviewDetails(response.data.data.interviewDetails || null);
        } else if (response.data && 'hasApplied' in response.data) {
          // This handles the case where the response is directly in data without being nested
          console.log('Found hasApplied directly in response.data');
          const applicationData = response.data as unknown as ApplicationStatus;
          setHasApplied(applicationData.hasApplied);
          setApplicationDate(applicationData.applicationDetails?.applicationDate || null);
          setApplicationStatus(applicationData.applicationStatus || null);
          setInterviewDetails(applicationData.interviewDetails || null);
        } else {
          console.log('Could not find hasApplied in response');
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };
    
    checkApplicationStatus();
  }, [isAuthenticated, params.id]);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        console.log(`Fetching job details for ID: ${params.id}`);
        const response = await fetchAPI<ApiResponse<Job>>(`/api/jobs/${params.id}`)
        if (response.error) {
          console.error("Error fetching job details:", response.error)
          setError(response.error)
          // Create mock job data for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log("Using mock job data for debugging")
            const mockJob: Job = {
              _id: params.id,
              title: "Software Engineer",
              company: "Debug Company",
              location: "Remote",
              employmentType: "Full-time",
              description: "This is a mock job description for debugging purposes.",
              requirements: ["React", "Node.js", "TypeScript"],
              responsibilities: ["Develop web applications", "Write clean code", "Collaborate with team"],
              salary: "$80,000 - $120,000",
              applicationDeadline: new Date().toISOString(),
              status: "active",
              recruiter: {
                _id: "mock-recruiter-id",
                firstName: "John",
                lastName: "Doe",
                company: "Debug Company",
                companyDescription: "This is a mock company description for debugging.",
                companyWebsite: "https://example.com"
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              applicationsCount: 0
            };
            setJob(mockJob);
            setError(null);
            setLoading(false);
            return;
          }
          setLoading(false)
          return
        }
        if (!response.data) {
          setError("Job not found")
          setLoading(false)
          return
        }
        if (response.data && response.data.data) {
          setJob(response.data.data)
          setError(null)
        } else {
          setError("Could not process job data")
        }
      } catch (error) {
        console.error("Error fetching job details:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch job details")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJobDetails()
    }
  }, [params.id])

  // Handle apply button click
  const handleApplyClick = useCallback(() => {
    if (!isAuthenticated) {
      // Redirect to job seeker sign-in page with return URL
      const returnUrl = `/job-portal/${params.id}`
      router.push(`/job-portal/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }
    
    // If user is not a job seeker, show error message
    if (userRole && userRole !== 'jobseeker' && userRole !== 'admin') {
      toast({
        title: "Cannot Apply",
        description: "Only job seekers can apply for jobs. Please create a job seeker account.",
        variant: "destructive"
      })
      return
    }
    
    // Check if already applied
    if (hasApplied) {
      toast({
        title: "Already Applied",
        description: "You have already applied for this job.",
        variant: "default"
      })
      return
    }
    
    // Show application form for job seekers
    setShowApplicationForm(true)
  }, [isAuthenticated, params.id, router, userRole, toast, hasApplied])

  // Handle application form close
  const handleCloseForm = useCallback(() => {
    setShowApplicationForm(false)
  }, [])

  // Handle successful application
  const handleApplicationSuccess = useCallback(() => {
    setShowApplicationForm(false)
    setHasApplied(true)
    setApplicationDate(new Date().toISOString())
    toast({
      title: "Application Submitted",
      description: "Your application has been successfully submitted.",
    })
  }, [toast])

  if (loading) {
    return (
      <div className="container max-w-4xl py-10 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="text-center space-y-4 py-12">
          <h1 className="text-2xl font-bold">Job Not Found</h1>
          <p className="text-gray-500">
            The job you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/job-portal')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Job Portal
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-12 md:py-16">
        <div className="container max-w-6xl mx-auto px-4 md:px-6">
          {/* Navigation back to job portal */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="ghost" 
              className="mb-6 text-white/90 hover:text-white hover:bg-white/10"
              onClick={() => router.push('/job-portal')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Job Portal
            </Button>
          </motion.div>
          
          {/* Job Header */}
          <motion.div 
            className="flex flex-col md:flex-row md:items-start md:justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start space-x-6 flex-1">
              <motion.div 
                className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white/30"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {job.recruiter?.companyLogo ? (
                  <Image
                    src={job.recruiter.companyLogo}
                    alt={`${job.company} logo`}
                    width={96}
                    height={96}
                    className="rounded-xl object-contain p-2"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getCompanyInitials(job.company)}
                  </span>
                )}
              </motion.div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{job.title}</h1>
                <p className="text-xl text-white/90 mb-4">{job.company}</p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex items-center gap-1.5 px-3 py-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location || "Remote"}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex items-center gap-1.5 px-3 py-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.employmentType || "Not specified"}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex items-center gap-1.5 px-3 py-1">
                    <Clock className="h-3.5 w-3.5" />
                    Posted {getTimeSincePosted(job.createdAt)}
                  </Badge>
                  {job.salary && (
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex items-center gap-1.5 px-3 py-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {job.salary}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <motion.div 
              className="flex flex-col items-start md:items-end space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {hasApplied ? (
                <div className="flex items-center text-white bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30 shadow-lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-semibold">Already Applied</p>
                    {applicationDate && (
                      <p className="text-sm text-white/80">
                        Applied on {new Date(applicationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <Button 
                  size="lg"
                  className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6"
                  onClick={handleApplyClick}
                >
                  Apply Now
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-8">
      
        {/* Job Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Description Card */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description || "No description provided."}</p>
              </CardContent>
            </Card>
            
            {job.requirements && job.requirements.length > 0 && (
              <Card className="border-indigo-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Award className="h-5 w-5 text-indigo-600" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {job.requirements.map((requirement, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-3 text-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{requirement}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-purple-600" />
                    Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {job.responsibilities.map((responsibility, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-3 text-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{responsibility}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Application Deadline Card */}
            {job.applicationDeadline && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    Application Deadline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-amber-900">{formatDate(job.applicationDeadline)}</p>
                  <p className="text-sm text-amber-700 mt-1">Apply before the deadline</p>
                </CardContent>
              </Card>
            )}
            
            {/* Company Information Card */}
            <Card className="border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                  About {job.company}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.recruiter && job.recruiter.companyDescription ? (
                  <>
                    <p className="text-gray-700 text-sm leading-relaxed">{job.recruiter.companyDescription}</p>
                    
                    {/* Additional company details */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-semibold mb-3 text-blue-900">Company Details</h3>
                      <div className="space-y-3">
                        {job.recruiter.industry && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">Industry</p>
                            <p className="text-sm font-medium text-gray-800">{job.recruiter.industry}</p>
                          </div>
                        )}
                        {job.recruiter.companySize && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">Company Size</p>
                            <p className="text-sm font-medium text-gray-800">{job.recruiter.companySize}</p>
                          </div>
                        )}
                        {job.recruiter.yearFounded && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">Founded</p>
                            <p className="text-sm font-medium text-gray-800">{job.recruiter.yearFounded}</p>
                          </div>
                        )}
                        {(job.recruiter.headquarters || job.location) && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">Headquarters</p>
                            <p className="text-sm font-medium text-gray-800">{job.recruiter.headquarters || job.location}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {job.recruiter.companyWebsite && (
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        asChild
                      >
                        <a 
                          href={job.recruiter.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Company Website
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic text-sm">No company description provided.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      
        {/* Application Status Section - Only shows when user has applied */}
        {hasApplied && applicationStatus && (
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Your Application Status</h2>
          
          {/* Application progress */}
          <div className="relative mb-6">
            <div className="h-2 bg-blue-100 rounded-full">
              <div 
                className="h-2 bg-blue-600 rounded-full"
                style={{ 
                  width: applicationStatus === 'pending' ? '25%' : 
                        applicationStatus === 'reviewed' ? '50%' : 
                        applicationStatus === 'interviewed' ? '75%' : 
                        applicationStatus === 'hired' ? '100%' : '25%'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-blue-600 mt-2">
              <div className={`font-medium ${applicationStatus === 'pending' ? 'text-blue-800' : ''}`}>Applied</div>
              <div className={`font-medium ${applicationStatus === 'reviewed' ? 'text-blue-800' : ''}`}>Under Review</div>
              <div className={`font-medium ${applicationStatus === 'interviewed' ? 'text-blue-800' : ''}`}>Interview</div>
              <div className={`font-medium ${applicationStatus === 'hired' ? 'text-blue-800' : ''}`}>Hired</div>
            </div>
          </div>
          
          {/* Status details */}
          <div className="bg-white p-4 rounded-md border border-blue-100">
            <div className="flex items-start space-x-3">
              {applicationStatus === 'pending' && (
                <HourglassIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              )}
              {applicationStatus === 'reviewed' && (
                <CheckCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
              )}
              {applicationStatus === 'interviewed' && (
                <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
              )}
              {applicationStatus === 'hired' && (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              )}
              {applicationStatus === 'rejected' && (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              
              <div>
                <h3 className="font-medium">
                  {applicationStatus === 'pending' ? 'Application Under Review' :
                   applicationStatus === 'reviewed' ? 'Application Reviewed' :
                   applicationStatus === 'interviewed' ? 'Interview Scheduled' :
                   applicationStatus === 'hired' ? 'You Got the Job!' :
                   'Application Not Selected'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {applicationStatus === 'pending' ? 'Your application is being reviewed by the hiring team.' :
                   applicationStatus === 'reviewed' ? 'Your application has been reviewed. Check for updates soon.' :
                   applicationStatus === 'interviewed' ? interviewDetails ? 'Your interview has been scheduled.' : 'Prepare for your upcoming interview.' :
                   applicationStatus === 'hired' ? 'Congratulations! The employer has selected you for this position.' :
                   'Thank you for your interest in this position. The employer has decided to move forward with other candidates.'}
                </p>
                
                {/* Interview details if status is 'interviewed' and details exist */}
                {applicationStatus === 'interviewed' && interviewDetails && (
                  <div className="mt-4 bg-purple-50 p-3 rounded border border-purple-100">
                    <h4 className="text-sm font-medium text-purple-800 mb-2">Interview Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>{' '}
                        <span className="font-medium">{new Date(interviewDetails.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>{' '}
                        <span className="font-medium">{interviewDetails.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>{' '}
                        <span className="font-medium">{interviewDetails.location}</span>
                      </div>
                      {interviewDetails.link && (
                        <div>
                          <span className="text-gray-500">Link:</span>{' '}
                          <a 
                            href={interviewDetails.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-blue-600 mt-4">
            <InfoIcon className="h-4 w-4 inline-block mr-1" />
            You can view all your applications and their statuses in the{' '}
            <Link href="/jobseeker/dashboard/applications" className="font-medium underline">
              Applications Dashboard
            </Link>
          </p>
          </motion.div>
        )}
        
        {/* Apply button at bottom */}
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
        {hasApplied ? (
          <div className="flex items-center justify-center text-green-600 bg-green-50 px-6 py-3 rounded-md border border-green-200 w-full">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="font-medium">You have already applied for this position</p>
          </div>
        ) : (
          <Button 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            onClick={handleApplyClick}
            size="lg"
          >
            Apply for this position
          </Button>
        )}
        </motion.div>
      </div>
      
      {/* Application Form Dialog */}
      {showApplicationForm && (
        <JobApplicationForm 
          jobId={params.id}
          jobTitle={job.title}
          companyName={job.company}
          onClose={handleCloseForm}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  )
} 