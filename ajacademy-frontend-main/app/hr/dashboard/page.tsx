"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Search
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import JobForm from "@/components/hr/JobForm"
import { fetchAPI } from '@/lib/api-client'

// Interfaces for data types
interface Job {
  _id: string
  title: string
  company?: string
  location: string
  employmentType: string
  description: string
  requirements: string[]
  salary?: string
  status: 'active' | 'closed' | 'draft'
  applicationsCount: number
  createdAt: string
  updatedAt: string
}

interface Application {
  _id: string
  jobId: string
  jobTitle: string
  candidateName: string
  candidateEmail: string
  status: 'pending' | 'reviewed' | 'interviewed' | 'rejected' | 'hired'
  resume: string
  appliedAt: string
  updatedAt: string
}

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  hiredCandidates: number
}

interface APIResponse<T> {
  data: T
  error?: string
}

export default function HRDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    hiredCandidates: 0
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  
  // For job creation/editing
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    
    try {
      // Check if HR token exists
      const hrToken = localStorage.getItem('hrToken');
      if (!hrToken) {
        console.warn("No HR token found in localStorage!");
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/hr/login';
        }, 2000);
        return;
      }
      
      // Fetch dashboard stats - the API client will automatically add the token
      const statsData = await fetchAPI<{success: boolean, data: DashboardStats}>('/hr/dashboard/stats');
      if (statsData.error) {
        // Check for authentication error
        if (statsData.error.includes('Authentication') || statsData.error.includes('Unauthorized')) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          })
          
          // Clear any stored credentials
          localStorage.removeItem("hrToken")
          localStorage.removeItem("hrUser")
          
          // Redirect to login page
          setTimeout(() => {
            window.location.href = '/hr/login'
          }, 2000)
          return
        }
        throw new Error(statsData.error)
      }
      
      console.log('Stats API response:', statsData);
      
      // Extract the actual stats from the nested data structure
      if (statsData.data && statsData.data.data) {
        console.log('Stats extracted:', statsData.data.data);
        setStats(statsData.data.data);
      } else if (statsData.data) {
        // Handle case where data might not be nested
        console.log('Stats data (unnested):', statsData.data);
        
        // Check if the data is already in the expected format
        if ('totalJobs' in statsData.data) {
          // It's already a DashboardStats object
          setStats(statsData.data as unknown as DashboardStats);
        } else {
          // Default empty stats
          setStats({
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            pendingApplications: 0,
            hiredCandidates: 0
          });
        }
      }
      
      // Fetch recent job listings
      const jobsData = await fetchAPI<{success: boolean, data: Job[]}>('/hr/jobs')
      if (jobsData.error) {
        throw new Error(jobsData.error)
      }
      
      console.log('Jobs API response:', jobsData);
      
      // Extract the actual jobs array from the nested data structure
      if (jobsData.data && jobsData.data.data) {
        const jobs = jobsData.data.data;
        console.log('Jobs extracted:', jobs);
        setRecentJobs(jobs.slice(0, 5));
      } else if (jobsData.data) {
        // Handle case where data might not be nested
        console.log('Jobs data (unnested):', jobsData.data);
        setRecentJobs([]);
      }
      
      // Fetch recent applications
      const applicationsData = await fetchAPI<{success: boolean, data: Application[]}>('/hr/applications')
      if (applicationsData.error) {
        throw new Error(applicationsData.error)
      }
      
      console.log('Applications API response:', applicationsData);
      
      // Extract the actual applications array from the nested data structure
      if (applicationsData.data && applicationsData.data.data) {
        const applications = applicationsData.data.data;
        console.log('Applications extracted:', applications);
        setRecentApplications(applications.slice(0, 5));
      } else if (applicationsData.data) {
        // Handle case where data might not be nested
        console.log('Applications data (unnested):', applicationsData.data);
        setRecentApplications([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if HR token exists before fetching data
    if (typeof window !== 'undefined') {
      const hrToken = localStorage.getItem('hrToken');
      if (!hrToken) {
        toast({
          title: "Authentication Error",
          description: "You need to log in to access the HR dashboard",
          variant: "destructive"
        });
        setTimeout(() => {
          window.location.href = '/hr/login';
        }, 2000);
        return;
      }
    }
    
    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Closed</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Draft</Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Pending</Badge>
      case 'reviewed':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Reviewed</Badge>
      case 'interviewed':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Interviewed</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>
      case 'hired':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Hired</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>
    }
  }

  // Add a function to handle job creation success
  const handleJobCreationSuccess = () => {
    setIsJobDialogOpen(false)
    fetchDashboardData() // Refresh data
    toast({
      title: "Success",
      description: "Job created successfully",
    })
  }

  // Handle job deletion
  const handleJobDelete = async () => {
    if (!selectedJobId) return

    try {
      const data = await fetchAPI<APIResponse<unknown>>(`/hr/jobs/${selectedJobId}`, {
        method: 'DELETE'
      })

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Job Deleted",
          description: "The job listing has been deleted successfully",
        })
        setIsConfirmDeleteOpen(false)
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: "Error",
        description: "Failed to delete job listing",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsJobDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      {/* Stats section */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard Statistics</h2>
        <Link href="/hr/dashboard/stats">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            <Eye className="mr-2 h-4 w-4" />
            Detailed Stats
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <h3 className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalJobs}</h3>
              </div>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <h3 className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeJobs}</h3>
              </div>
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Applications</p>
                <h3 className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalApplications}</h3>
              </div>
              <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Applications</p>
                <h3 className="mt-1 text-3xl font-semibold text-gray-900">{stats.pendingApplications}</h3>
              </div>
              <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Hired</p>
                <h3 className="mt-1 text-3xl font-semibold text-gray-900">{stats.hiredCandidates}</h3>
              </div>
              <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent job listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Job Listings</CardTitle>
              <Link href="/hr/jobs">
                <Button variant="link" className="h-auto p-0 text-blue-600">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading job listings...</p>
                </div>
              ) : recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job._id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {job.location} • {job.employmentType}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {getStatusBadge(job.status)}
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                            {job.applicationsCount} applications
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/hr/jobs/${job._id}`} className="flex w-full items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedJobId(job._id)
                            setIsJobDialogOpen(true)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => {
                              setSelectedJobId(job._id)
                              setIsConfirmDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Posted on {formatDate(job.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No job listings found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsJobDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Post your first job
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent applications */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/hr/applications">
                <Button variant="link" className="h-auto p-0 text-blue-600">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading applications...</p>
                </div>
              ) : recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application._id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{application.candidateName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied for: <span className="font-medium">{application.jobTitle}</span>
                        </p>
                        <div className="flex gap-2 mt-2">
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/hr/applications/${application._id}`} className="flex w-full items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View Application
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/hr/jobs/${application.jobId}`} className="flex w-full items-center">
                              <Briefcase className="mr-2 h-4 w-4" />
                              View Job
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {application.candidateEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No applications received yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation dialog for deleting job */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job listing? This action cannot be undone, and all associated applications will be archived.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleJobDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Creation Dialog */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJobId ? "Edit Job" : "Create New Job"}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {selectedJobId ? "update" : "create"} a job listing.
            </DialogDescription>
          </DialogHeader>
          
          <JobForm 
            jobId={selectedJobId || undefined}
            onSuccess={handleJobCreationSuccess}
            onCancel={() => {
              setIsJobDialogOpen(false)
              setSelectedJobId(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 