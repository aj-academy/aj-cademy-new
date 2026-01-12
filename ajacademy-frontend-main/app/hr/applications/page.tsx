"use client"

import { useState, useEffect } from "react"
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Download,
  ExternalLink,
  Check,
  X,
  User,
  Mail,
  Calendar,
  Clock,
  ArrowUpDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { fetchAPI } from '@/lib/api-client'
import { ApiResponse } from '@/lib/types'

// Application interface
interface Application {
  _id: string
  job: {
    _id: string
    title: string
    company: string
  }
  student: {
    _id: string
    firstName: string
    lastName: string
    email: string
    college?: string
    program?: string
    graduationYear?: string
    skills?: string[]
  }
  status: 'pending' | 'reviewed' | 'interviewed' | 'rejected' | 'hired'
  resume: string
  coverLetter?: string
  applicationDate: string
  updatedAt: string
  interviewDate?: string
  interviewTime?: string
  interviewLocation?: string
  interviewLink?: string
}

export default function HRApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()
  const [showInterviewDialog, setShowInterviewDialog] = useState(false)
  const [interviewDetails, setInterviewDetails] = useState({
    interviewDate: '',
    interviewTime: '10:00',
    interviewLocation: 'Remote',
    interviewLink: ''
  })
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{id: string, status: string} | null>(null)
  
  // Fetch applications on page load
  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchApplications()
  }, [])
  
  // Apply filters when search, status filter, or sorting changes
  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
    applyFilters()
  }, [searchQuery, statusFilter, sortBy, applications])
  
  // Fetch applications from API
  const fetchApplications = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetchAPI<any>('/hr/applications')
      console.log('HR Applications API response:', response);
      
      if (response.error) {
        setIsLoading(false)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        })
        setApplications([]);
        setFilteredApplications([]);
        return
      }
      
      // Handle nested response structure
      if (response.data) {
        // Check if data has the nested structure with success property
        if (response.data.success === true && Array.isArray(response.data.data)) {
          // Nested structure: response.data.data contains the applications array
          console.log('Applications extracted from response:', response.data.data);
          setApplications(response.data.data);
          setFilteredApplications(response.data.data);
        } else if (Array.isArray(response.data)) {
          // Direct array response
          console.log('Applications from direct array:', response.data);
          setApplications(response.data);
          setFilteredApplications(response.data);
        } else {
          console.error('Unexpected data structure:', response.data);
          setApplications([]);
          setFilteredApplications([]);
        }
      } else {
        console.error('Invalid response data:', response.data);
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Network or server error occurred",
        variant: "destructive"
      })
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setIsLoading(false)
    }
  }
  
  // Apply search, filters, and sorting
  const applyFilters = () => {
    if (!Array.isArray(applications)) {
      setFilteredApplications([]);
      return;
    }
    
    let result = [...applications];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(app => 
        `${app.student.firstName} ${app.student.lastName}`.toLowerCase().includes(query) || 
        app.student.email.toLowerCase().includes(query) ||
        app.job.title.toLowerCase().includes(query) ||
        app.job.company.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(app => app.status === statusFilter)
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime())
    } else if (sortBy === "nameAZ") {
      result.sort((a, b) => `${a.student.firstName} ${a.student.lastName}`.localeCompare(`${b.student.firstName} ${b.student.lastName}`))
    } else if (sortBy === "nameZA") {
      result.sort((a, b) => `${b.student.firstName} ${b.student.lastName}`.localeCompare(`${a.student.firstName} ${a.student.lastName}`))
    }
    
    setFilteredApplications(result)
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
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
  
  // Update application status
  const updateApplicationStatus = async (applicationId: string, status: string) => {
    // If status is 'interviewed', show interview dialog first
    if (status === 'interviewed') {
      setPendingStatusUpdate({ id: applicationId, status })
      setShowInterviewDialog(true)
      return
    }
    
    // Otherwise, proceed with status update
    try {
      const response: ApiResponse<any> = await fetchAPI(`/hr/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        })
        return
      }
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app._id === applicationId ? { ...app, status: status as any } : app
      )
      setApplications(updatedApplications)
      
      if (selectedApplication && selectedApplication._id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: status as any })
      }
      
      toast({
        title: "Success",
        description: "Application status updated",
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Network or server error occurred",
        variant: "destructive"
      })
    }
  }
  
  // Handle submission of interview details
  const handleInterviewDetailsSubmit = async () => {
    if (!pendingStatusUpdate) return
    
    const { id, status } = pendingStatusUpdate
    
    try {
      const response: ApiResponse<any> = await fetchAPI(`/hr/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          interviewDate: interviewDetails.interviewDate,
          interviewTime: interviewDetails.interviewTime,
          interviewLocation: interviewDetails.interviewLocation,
          interviewLink: interviewDetails.interviewLink
        }),
      })
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        })
        return
      }
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app._id === id ? { 
          ...app, 
          status: status as any,
          interviewDate: interviewDetails.interviewDate,
          interviewTime: interviewDetails.interviewTime,
          interviewLocation: interviewDetails.interviewLocation,
          interviewLink: interviewDetails.interviewLink
        } : app
      )
      setApplications(updatedApplications)
      
      if (selectedApplication && selectedApplication._id === id) {
        setSelectedApplication({ 
          ...selectedApplication, 
          status: status as any,
          interviewDate: interviewDetails.interviewDate,
          interviewTime: interviewDetails.interviewTime,
          interviewLocation: interviewDetails.interviewLocation,
          interviewLink: interviewDetails.interviewLink
        })
      }
      
      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      })
      
      // Reset and close dialog
      setShowInterviewDialog(false)
      setPendingStatusUpdate(null)
      setInterviewDetails({
        interviewDate: '',
        interviewTime: '10:00',
        interviewLocation: 'Remote',
        interviewLink: ''
      })
    } catch (error) {
      console.error('Error scheduling interview:', error)
      toast({
        title: "Error",
        description: "Network or server error occurred",
        variant: "destructive"
      })
    }
  }
  
  // View application details
  const viewApplication = (application: Application) => {
    setSelectedApplication(application)
    setIsViewDialogOpen(true)
  }
  
  return (
    <div className="space-y-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <h3 className="text-3xl font-semibold text-gray-900">{Array.isArray(applications) ? applications.length : 0}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <h3 className="text-3xl font-semibold text-blue-600">
                {Array.isArray(applications) ? applications.filter(app => app.status === 'pending').length : 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm font-medium text-gray-500">Reviewed</p>
              <h3 className="text-3xl font-semibold text-indigo-600">
                {Array.isArray(applications) ? applications.filter(app => app.status === 'reviewed').length : 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm font-medium text-gray-500">Interviewed</p>
              <h3 className="text-3xl font-semibold text-purple-600">
                {Array.isArray(applications) ? applications.filter(app => app.status === 'interviewed').length : 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm font-medium text-gray-500">Hired</p>
              <h3 className="text-3xl font-semibold text-green-600">
                {Array.isArray(applications) ? applications.filter(app => app.status === 'hired').length : 0}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search applications..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="md:col-span-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="nameAZ">Name (A-Z)</SelectItem>
              <SelectItem value="nameZA">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-1">
          <Button variant="outline" className="w-full" onClick={() => fetchApplications()}>
            <ArrowUpDown size={16} />
          </Button>
        </div>
      </div>
      
      {/* Applications list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading applications...</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start border-b pb-px">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="interviewed">Interviewed</TabsTrigger>
              <TabsTrigger value="hired">Hired</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard 
                    key={application._id} 
                    application={application} 
                    onView={() => viewApplication(application)}
                    onStatusChange={updateApplicationStatus}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => app.status === 'pending')
                  .map((application) => (
                    <ApplicationCard 
                      key={application._id} 
                      application={application} 
                      onView={() => viewApplication(application)}
                      onStatusChange={updateApplicationStatus}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reviewed" className="mt-6">
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => app.status === 'reviewed')
                  .map((application) => (
                    <ApplicationCard 
                      key={application._id} 
                      application={application} 
                      onView={() => viewApplication(application)}
                      onStatusChange={updateApplicationStatus}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="interviewed" className="mt-6">
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => app.status === 'interviewed')
                  .map((application) => (
                    <ApplicationCard 
                      key={application._id} 
                      application={application} 
                      onView={() => viewApplication(application)}
                      onStatusChange={updateApplicationStatus}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="hired" className="mt-6">
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => app.status === 'hired')
                  .map((application) => (
                    <ApplicationCard 
                      key={application._id} 
                      application={application} 
                      onView={() => viewApplication(application)}
                      onStatusChange={updateApplicationStatus}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              <div className="space-y-4">
                {filteredApplications
                  .filter(app => app.status === 'rejected')
                  .map((application) => (
                    <ApplicationCard 
                      key={application._id} 
                      application={application} 
                      onView={() => viewApplication(application)}
                      onStatusChange={updateApplicationStatus}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : "You don&apos;t have any applications yet"}
            </p>
          </div>
        )}
      </div>
      
      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Viewing application for {selectedApplication?.job?.title || 'Unknown position'} at {selectedApplication?.job?.company || 'Unknown company'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Application status */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedApplication?.status || '')}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Update Status</p>
                  <div className="flex space-x-2 mt-1">
                    <Select 
                      defaultValue={selectedApplication?.status}
                      onValueChange={(value) => updateApplicationStatus(selectedApplication?._id || '', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Applicant information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Applicant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-gray-700">
                        {selectedApplication?.student?.firstName || 'Unknown'} {selectedApplication?.student?.lastName || ''}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <p className="text-sm text-gray-700">{selectedApplication?.student?.email || 'No email provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {selectedApplication?.student?.college && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">University:</span> {selectedApplication.student.college}
                      </p>
                    )}
                    {selectedApplication?.student?.program && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Program:</span> {selectedApplication.student.program}
                      </p>
                    )}
                    {selectedApplication?.student?.graduationYear && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Graduation Year:</span> {selectedApplication.student.graduationYear}
                      </p>
                    )}
                  </div>
                </div>
                
                {selectedApplication?.student?.skills && selectedApplication.student.skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.student.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Job information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Job Information</h3>
                <p className="text-sm font-medium text-gray-700">{selectedApplication?.job?.title || 'Unknown position'}</p>
                <p className="text-sm text-gray-700">{selectedApplication?.job?.company || 'Unknown company'}</p>
              </div>
              
              <Separator />
              
              {/* Application details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-700">
                      Applied on {selectedApplication?.applicationDate ? formatDate(selectedApplication.applicationDate) : 'Unknown date'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-700">
                      Last updated on {selectedApplication?.updatedAt ? formatDate(selectedApplication.updatedAt) : 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Resume */}
              {selectedApplication?.resume && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Resume</h3>
                    <a 
                      href={selectedApplication.resume} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      Open in Google Docs
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                  <div className="aspect-[8.5/11] bg-white shadow-sm rounded-md border overflow-hidden">
                    <iframe
                      src={`${selectedApplication.resume.replace('/edit', '/preview')}`}
                      className="w-full h-full"
                      title="Resume Preview"
                    ></iframe>
                  </div>
                </div>
              )}
              
              {/* Cover Letter */}
              {selectedApplication?.coverLetter && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Interview details section when status is 'interviewed' */}
            {selectedApplication?.status === 'interviewed' && selectedApplication?.interviewDate && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Interview Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-sm">
                        {new Date(selectedApplication.interviewDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time</p>
                      <p className="text-sm">{selectedApplication?.interviewTime || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-sm">{selectedApplication?.interviewLocation || 'Not specified'}</p>
                    </div>
                    {selectedApplication?.interviewLink && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Meeting Link</p>
                        <a 
                          href={selectedApplication.interviewLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Interview Scheduling Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Set up interview details for the candidate
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="interviewDate" className="text-sm font-medium">
                Interview Date *
              </label>
              <Input 
                id="interviewDate" 
                type="date" 
                value={interviewDetails.interviewDate}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  interviewDate: e.target.value
                })}
                required
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="interviewTime" className="text-sm font-medium">
                Interview Time
              </label>
              <Input 
                id="interviewTime" 
                type="time" 
                value={interviewDetails.interviewTime}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  interviewTime: e.target.value
                })}
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="interviewLocation" className="text-sm font-medium">
                Interview Location
              </label>
              <Input 
                id="interviewLocation" 
                type="text" 
                value={interviewDetails.interviewLocation}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  interviewLocation: e.target.value
                })}
                placeholder="Office address or 'Remote'"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="interviewLink" className="text-sm font-medium">
                Meeting Link (for remote interviews)
              </label>
              <Input 
                id="interviewLink" 
                type="url" 
                value={interviewDetails.interviewLink}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  interviewLink: e.target.value
                })}
                placeholder="https://zoom.us/j/example"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowInterviewDialog(false)
                setPendingStatusUpdate(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleInterviewDetailsSubmit}
              disabled={!interviewDetails.interviewDate}
            >
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ApplicationCard component
interface ApplicationCardProps {
  application: Application
  onView: () => void
  onStatusChange: (id: string, status: string) => void
}

function ApplicationCard({ application, onView, onStatusChange }: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
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
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status || 'Unknown'}</Badge>
    }
  }
  
  // Make sure student and job objects exist
  const student = application?.student || {};
  const job = application?.job || {};
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {student.firstName || 'Unknown'} {student.lastName || ''}
                </h3>
                {getStatusBadge(application?.status)}
              </div>
              <p className="text-sm text-gray-500 mt-1">{student.email || 'No email provided'}</p>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Applied for:</p>
                <p className="text-sm text-gray-900">{job.title || 'Unknown position'} at {job.company || 'Unknown company'}</p>
              </div>
              
              {student.skills && student.skills.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {skill}
                      </Badge>
                    ))}
                    {student.skills.length > 3 && (
                      <Badge variant="outline">+{student.skills.length - 3} more</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {application?.resume && (
                  <DropdownMenuItem 
                    onClick={() => window.open(application.resume, '_blank', 'noopener,noreferrer')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Resume
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={application?.status === 'rejected'}
                  onClick={() => onStatusChange(application?._id, 'rejected')}
                  className="text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={application?.status === 'hired'}
                  onClick={() => onStatusChange(application?._id, 'hired')}
                  className="text-green-600"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Hire
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-sm">
          <div className="text-gray-500">
            Applied on {formatDate(application?.applicationDate)}
          </div>
          <div className="flex space-x-2">
            <Select 
              defaultValue={application?.status}
              onValueChange={(value) => onStatusChange(application?._id, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onView}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 