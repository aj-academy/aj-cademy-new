"use client"

import { useState, useEffect } from "react"
import { fetchAPI, api } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Briefcase,
  GraduationCap,
  Clock,
  X,
  Download,
  RefreshCw
} from "lucide-react"

interface JobSeeker {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  skills: string[]
  education: {
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    current?: boolean
  }[]
  experience: {
    company: string
    position: string
    description?: string
    startDate: string
    endDate?: string
    current?: boolean
  }[]
  createdAt: string
}

export default function LeadsPage() {
  const { toast } = useToast()
  const [jobseekers, setJobseekers] = useState<JobSeeker[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    name: "",
    skills: "",
    education: "",
    experience: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Fetch jobseekers
  const fetchJobseekers = async () => {
    setLoading(true)
    try {
      // Make API request using the hr.getLeads function
      const response = await api.hr.getLeads({
        name: searchParams.name,
        skills: searchParams.skills,
        education: searchParams.education,
        experience: searchParams.experience,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder as 'asc' | 'desc',
        page: searchParams.page,
        limit: searchParams.limit
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Update state
      setJobseekers(response.data?.data || [])
      setPagination({
        total: response.data?.total || 0,
        pages: response.data?.pages || 1,
        currentPage: response.data?.page || 1
      })
    } catch (error) {
      console.error("Error fetching jobseekers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch jobseeker data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Update active filters
  useEffect(() => {
    const filters = []
    if (searchParams.name) filters.push(`Name: ${searchParams.name}`)
    if (searchParams.skills) filters.push(`Skills: ${searchParams.skills}`)
    if (searchParams.education) filters.push(`Education: ${searchParams.education}`)
    if (searchParams.experience) filters.push(`Experience: ${searchParams.experience}`)
    setActiveFilters(filters)
  }, [searchParams])

  // Initial fetch
  useEffect(() => {
    fetchJobseekers()
  }, [searchParams.page, searchParams.limit, searchParams.sortBy, searchParams.sortOrder])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobseekers()
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }))
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({
      name: "",
      skills: "",
      education: "",
      experience: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10
    })
    fetchJobseekers()
  }

  // Handle filter removal
  const removeFilter = (filter: string) => {
    const type = filter.split(":")[0].trim().toLowerCase()
    setSearchParams(prev => ({
      ...prev,
      [type]: "",
      page: 1
    }))
    fetchJobseekers()
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Jobseekers</CardTitle>
          <CardDescription>
            Filter candidates by name, skills, education, and experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Search by name"
                  value={searchParams.name}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="E.g. React, Node.js"
                  value={searchParams.skills}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  placeholder="Field or degree"
                  value={searchParams.education}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, education: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  placeholder="Position or company"
                  value={searchParams.experience}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, experience: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button type="submit" className="w-24">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-2" /> Clear
              </Button>
              <span className="text-sm text-gray-500 ml-auto">
                Total: {pagination.total} jobseekers
              </span>
            </div>
          </form>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge 
                  key={filter} 
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {filter}
                  <button onClick={() => removeFilter(filter)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>
              {jobseekers.length > 0 
                ? `Showing ${jobseekers.length} of ${pagination.total} jobseekers` 
                : "No jobseekers found"}
            </CardDescription>
            <Select 
              value={searchParams.limit.toString()} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortChange("firstName")}
                    >
                      Name
                      {searchParams.sortBy === "firstName" && (
                        <span className="ml-1">{searchParams.sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortChange("createdAt")}
                    >
                      Joined
                      {searchParams.sortBy === "createdAt" && (
                        <span className="ml-1">{searchParams.sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Experience</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && jobseekers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                      <p className="text-gray-500">Loading jobseekers...</p>
                    </TableCell>
                  </TableRow>
                ) : jobseekers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">No jobseekers found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobseekers.map((jobseeker) => (
                    <TableRow key={jobseeker._id}>
                      <TableCell>
                        <div className="font-medium">{jobseeker.firstName} {jobseeker.lastName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{jobseeker.email}</div>
                        {jobseeker.phone && <div className="text-sm text-gray-500">{jobseeker.phone}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm">{formatDate(jobseeker.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {jobseeker.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {jobseeker.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{jobseeker.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {jobseeker.education.length > 0 ? (
                          <div className="flex items-start gap-1">
                            <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-sm">{jobseeker.education[0].degree}</div>
                              <div className="text-xs text-gray-500">{jobseeker.education[0].institution}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {jobseeker.experience.length > 0 ? (
                          <div className="flex items-start gap-1">
                            <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-sm">{jobseeker.experience[0].position}</div>
                              <div className="text-xs text-gray-500">{jobseeker.experience[0].company}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.pages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 