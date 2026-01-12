"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, MapPin, Briefcase, Clock, Filter, ArrowUpDown, CheckCircle } from "lucide-react"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Head from 'next/head'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchAPI } from '@/lib/api-client'
import { ApiResponse, Job } from '@/lib/types'

export default function JobPortalPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("newest")
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetchAPI<any>('/jobs')
        if (response.error) {
          setError(response.error)
          setLoading(false)
          return
        }

        // Check if response.data exists and if it has a data property (nested structure)
        if (!response.data) {
          setError("No jobs found")
          setLoading(false)
          return
        }

        // Extract jobs from the response - backend may return { success, count, data } structure
        let jobsData = response.data
        if (response.data.data && Array.isArray(response.data.data)) {
          jobsData = response.data.data
        }

        console.log('Jobs data:', jobsData)
        setJobs(jobsData)
        setError(null)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setError(error instanceof Error ? error.message : "Failed to fetch jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Check which jobs the user has already applied for
  useEffect(() => {
    const checkAppliedJobs = async () => {
      if (!isAuthenticated || !jobs.length) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const appliedJobsRecord: Record<string, boolean> = {};
      
      await Promise.all(jobs.map(async (job) => {
        try {
          const response = await fetchAPI<ApiResponse<any>>(`/jobs/${job._id}/has-applied`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data?.data?.hasApplied) {
            appliedJobsRecord[job._id] = true;
          }
        } catch (error) {
          console.error(`Error checking application status for job ${job._id}:`, error);
        }
      }));
      
      setAppliedJobs(appliedJobsRecord);
    };
    
    checkAppliedJobs();
  }, [isAuthenticated, jobs]);

  // Filter jobs based on search criteria
  const filteredJobs = useMemo(() => {
    // Ensure jobs is an array before spreading
    if (!jobs || !Array.isArray(jobs)) {
      return [];
    }
    
    let results = [...jobs];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        job => 
          job.title.toLowerCase().includes(term) || 
          job.description.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term)
      );
    }
    
    if (location) {
      const locationTerm = location.toLowerCase();
      results = results.filter(job => job.location.toLowerCase().includes(locationTerm));
    }
    
    if (jobType !== 'all') {
      results = results.filter(job => job.employmentType === jobType);
    }
    
    // Filter by selected categories (matching against title and description)
    if (selectedCategories.length > 0) {
      results = results.filter(job => {
        return selectedCategories.some(category => {
          const categoryLower = category.toLowerCase();
          return (
            job.title.toLowerCase().includes(categoryLower) ||
            job.description.toLowerCase().includes(categoryLower) ||
            job.company.toLowerCase().includes(categoryLower) ||
            job.employmentType.toLowerCase() === categoryLower
          );
        });
      });
    }
    
    // Sort jobs
    if (sortBy === "newest") {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "a-z") {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "z-a") {
      results.sort((a, b) => b.title.localeCompare(a.title));
    }
    
    return results;
  }, [searchTerm, location, jobType, jobs, selectedCategories, sortBy])

  // Handle search button click
  const handleSearch = () => {
    // Filters are already applied via useMemo
    // Close the filter panel if it's open
    setShowFilterPanel(false);
  }

  // Handle category checkbox toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
  }

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setShowFilterPanel(prev => !prev);
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setJobType("all");
    setSelectedCategories([]);
  }

  // Format date as "X days ago"
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    return `${diffInDays} days ago`
  }, [])

  // Get company initials for logo placeholder
  const getCompanyInitials = useCallback((company: string) => {
    return company
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  // Navigate to job details
  const handleJobClick = (jobId: string) => {
    router.push(`/job-portal/${jobId}`)
  }

  return (
    <>
      <Head>
        <title>Job Portal | AJ Academy</title>
        <meta name="description" content="Find your next career opportunity at AJ Academy. Browse job listings and apply for positions that match your skills and interests." />
        <meta name="google-site-verification" content="w5lhECaS4qWVcOagLKQdfS7IQEvRCSNf8ITulL9DGog" />
      </Head>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-50">Job Portal</h1>
            <p className="text-slate-600 dark:text-slate-400">Find your next career opportunity</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              onClick={toggleFilterPanel}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilterPanel ? "Hide Filters" : "Show Filters"}
            </Button>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="h-9 border-slate-300 text-slate-600 w-[140px]">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <span>Sort</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="a-z">A-Z</SelectItem>
                <SelectItem value="z-a">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className={`space-y-6 ${showFilterPanel ? 'block' : 'hidden md:block'}`}>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-50">Search</h3>
                <Button
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-slate-700"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Job title or keyword"
                    className="w-full rounded-md border border-slate-300 bg-transparent py-2 pl-8 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-800 dark:border-slate-700 dark:placeholder:text-slate-400 dark:focus:ring-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Location"
                    className="w-full rounded-md border border-slate-300 bg-transparent py-2 pl-8 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-800 dark:border-slate-700 dark:placeholder:text-slate-400 dark:focus:ring-slate-400"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                  onClick={handleSearch}
                >
                  Search Jobs
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-slate-50">Categories</h3>
              <div className="space-y-2">
                {[
                  "Web Development",
                  "Data Science",
                  "Design",
                  "Marketing",
                  "Sales",
                  "Customer Support",
                  "Product Management",
                  "Engineering",
                ].map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={category.toLowerCase().replace(/\s+/g, "-")}
                      className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800 dark:border-slate-700 dark:text-slate-400 dark:focus:ring-slate-400"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <label
                      htmlFor={category.toLowerCase().replace(/\s+/g, "-")}
                      className="ml-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start border-b pb-px dark:border-slate-700">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-800 data-[state=active]:text-slate-800 dark:data-[state=active]:border-slate-400 dark:data-[state=active]:text-slate-400"
                >
                  All Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-800 data-[state=active]:text-slate-800 dark:data-[state=active]:border-slate-400 dark:data-[state=active]:text-slate-400"
                >
                  Saved Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="applied"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-800 data-[state=active]:text-slate-800 dark:data-[state=active]:border-slate-400 dark:data-[state=active]:text-slate-400"
                >
                  Applied Jobs
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {loading ? (
                    // Skeleton loaders when loading
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Skeleton className="h-12 w-12 rounded" />
                              <div>
                                <Skeleton className="h-5 w-48 mb-2" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-5 w-28 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-full mt-4" />
                          <Skeleton className="h-4 w-4/5 mt-2" />
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex items-center justify-between">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-9 w-24" />
                        </CardFooter>
                      </Card>
                    ))
                  ) : filteredJobs.length === 0 ? (
                    // No jobs found message
                    <div className="p-8 text-center">
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No jobs found</h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-2">
                        We couldn&apos;t find any jobs matching your criteria.
                      </p>
                    </div>
                  ) : (
                    // Display actual job listings
                    filteredJobs.map((job) => (
                      <Card key={job._id} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="h-12 w-12 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                {job.recruiter && job.recruiter.companyLogo ? (
                                  <Image
                                      src={job.recruiter.companyLogo} 
                                    alt={`${job.company} logo`}
                                    width={48}
                                    height={48}
                                    className="rounded-md object-contain"
                                    />
                                  ) : (
                                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    {getCompanyInitials(job.company)}
                                  </span>
                                  )}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{job.title}</CardTitle>
                                <CardDescription>{job.company}</CardDescription>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                            >
                              Save
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:border-slate-800 dark:text-slate-400">
                              <Briefcase className="mr-1 h-3 w-3" />
                              {job.employmentType}
                            </div>
                            <div className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:border-slate-800 dark:text-slate-400">
                              <MapPin className="mr-1 h-3 w-3" />
                              {job.location}
                            </div>
                            <div className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:border-slate-800 dark:text-slate-400">
                              <Clock className="mr-1 h-3 w-3" />
                              Posted {formatDate(job.createdAt)}
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {job.description}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex items-center justify-between">
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-50">
                            {job.salary}
                          </div>
                          {appliedJobs[job._id] ? (
                            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              <span className="text-sm font-medium">Already Applied</span>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="bg-slate-800 hover:bg-slate-700 text-white"
                              onClick={() => handleJobClick(job._id)}
                            >
                              Apply Now
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="saved" className="mt-6">
                <div className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No saved jobs</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Save jobs to view them here later.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="applied" className="mt-6">
                <div className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No applications yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    When you apply for jobs, they&apos;ll appear here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}
