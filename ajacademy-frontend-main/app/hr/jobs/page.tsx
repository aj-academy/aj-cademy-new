"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Briefcase, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowUpDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import JobForm from "@/components/hr/JobForm"
import { api } from '@/lib/api-client'
import { Job } from '@/lib/types'
import { hrToasts, showErrorToast } from "@/lib/toast-utils"

export default function HRJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.hr.getAllJobs();
      
      console.log('HR Jobs API response:', response);
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        })
        setJobs([]);
        setFilteredJobs([]);
      } else if (response.data && Array.isArray(response.data.data)) {
        // response.data is PaginatedResponse<Job>
        setJobs(response.data.data);
        setFilteredJobs(response.data.data);
      } else {
        console.error('Unexpected data structure:', response.data);
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Network or server error occurred",
        variant: "destructive"
      })
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setIsLoading(false)
    }
  }, [toast])
  
  // Apply search, filters, and sorting
  const applyFilters = useCallback(() => {
    let result = [...jobs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) || 
        job.location.toLowerCase().includes(query) || 
        job.company?.toLowerCase().includes(query) ||
        job.employmentType.toLowerCase().includes(query)
      )
    }
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(job => job.status === statusFilter)
    }
    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === "applications") {
      result.sort((a, b) => b.applicationsCount - a.applicationsCount)
    }
    setFilteredJobs(result)
  }, [jobs, searchQuery, statusFilter, sortBy])
  
  // Fetch jobs on page load
  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchJobs()
  }, [fetchJobs])
  
  // Apply filters when search, status filter, or sorting changes
  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
    applyFilters()
  }, [applyFilters])
  
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
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Closed</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Draft</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>
    }
  }
  
  // Delete job
  const handleDeleteJob = async () => {
    if (!selectedJobId) return
    
    try {
      const response = await api.hr.deleteJob(selectedJobId)
      console.log('Delete job response:', response);
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Remove job from state
      setJobs(prevJobs => prevJobs.filter(job => job._id !== selectedJobId))
      setFilteredJobs(prevJobs => prevJobs.filter(job => job._id !== selectedJobId))
      
      // Show success toast notification
      hrToasts.jobs.deleted()
    } catch (error) {
      console.error('Error deleting job:', error)
      showErrorToast("Error", "Failed to delete job listing")
    } finally {
      setIsConfirmDeleteOpen(false)
      setSelectedJobId(null)
    }
  }
  
  // Handle successful job creation/edit
  const handleJobFormSuccess = () => {
    setIsJobDialogOpen(false)
    setSelectedJobId(null)
    fetchJobs()
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => {
          setSelectedJobId(null)
          setIsJobDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search jobs..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
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
              <SelectItem value="alphabetical">A-Z</SelectItem>
              <SelectItem value="applications">Most Applications</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-1">
          <Button variant="outline" className="w-full" onClick={() => fetchJobs()}>
            <ArrowUpDown size={16} />
          </Button>
        </div>
      </div>
      
      {/* Job listings */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading job listings...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {job.company} • {job.location} • {job.employmentType}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
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
                  
                  <div className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {job.description}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {req}
                      </Badge>
                    ))}
                    {job.requirements.length > 3 && (
                      <Badge variant="outline" className="bg-gray-50">
                        +{job.requirements.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-sm">
                  <div className="flex space-x-4 text-gray-500">
                    <span>Posted: {formatDate(job.createdAt)}</span>
                    <span>{job.applicationsCount} Applications</span>
                    {job.salary && <span>{job.salary}</span>}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No job listings found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : "You don&apos;t have any job listings yet"}
            </p>
            {!searchQuery && (
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => {
                setSelectedJobId(null);
                setIsJobDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Post Your First Job
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Job form dialog */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJobId ? "Edit Job Listing" : "Create New Job Listing"}</DialogTitle>
            <DialogDescription>
              {selectedJobId 
                ? "Update the details of your job listing" 
                : "Fill out the form to create a new job listing"}
            </DialogDescription>
          </DialogHeader>
          <JobForm 
            jobId={selectedJobId || undefined} 
            onSuccess={handleJobFormSuccess} 
            onCancel={() => setIsJobDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Confirm delete dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteJob}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 