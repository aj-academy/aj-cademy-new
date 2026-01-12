"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  Briefcase, 
  Building, 
  Calendar, 
  Clock, 
  Eye, 
  MapPin, 
  Search, 
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HourglassIcon,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { fetchAPI } from "@/lib/api-client"

// Define Application interface
interface Application {
  _id: string
  job: {
    _id: string
    title: string
    company: string
    location: string
    companyLogo?: string
  }
  status: "pending" | "reviewed" | "interviewed" | "rejected" | "hired"
  resume: string
  coverLetter?: string
  applicationDate: string
  updatedAt: string
  interviewDate?: string
  interviewTime?: string
  interviewLocation?: string
  interviewLink?: string
}

export default function ApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetchAPI<any>("/api/jobseeker/dashboard/applications", {
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
          setApplications(response.data.data)
          setFilteredApplications(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load applications data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [toast])

  // Filter applications based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredApplications(applications)
      return
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const filtered = applications.filter(
      (app) =>
        app.job.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        app.job.company.toLowerCase().includes(lowerCaseSearchTerm) ||
        app.job.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        app.status.toLowerCase().includes(lowerCaseSearchTerm)
    )

    setFilteredApplications(filtered)
  }, [searchTerm, applications])

  // View application details
  const viewApplicationDetails = (application: Application) => {
    setSelectedApplication(application)
    setDetailsDialogOpen(true)
  }

  // Open withdraw dialog
  const openWithdrawDialog = (application: Application) => {
    setSelectedApplication(application)
    setWithdrawDialogOpen(true)
  }

  // Withdraw application
  const withdrawApplication = async () => {
    if (!selectedApplication) return

    setIsWithdrawing(true)

    try {
      const response = await fetchAPI(`/api/jobseeker/dashboard/applications/${selectedApplication._id}`, {
        method: "DELETE",
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
      } else {
        toast({
          title: "Success",
          description: "Application withdrawn successfully",
        })

        // Remove the application from state
        setApplications((prev) =>
          prev.filter((app) => app._id !== selectedApplication._id)
        )
        setFilteredApplications((prev) =>
          prev.filter((app) => app._id !== selectedApplication._id)
        )
      }
    } catch (error) {
      console.error("Error withdrawing application:", error)
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
      setWithdrawDialogOpen(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: Application["status"] }) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        variant: "outline" as const,
        icon: HourglassIcon,
        className: ""
      },
      reviewed: {
        label: "Reviewed",
        variant: "secondary" as const,
        icon: CheckCircle,
        className: ""
      },
      interviewed: {
        label: "Interviewed",
        variant: "default" as const,
        icon: Calendar,
        className: ""
      },
      rejected: {
        label: "Rejected",
        variant: "destructive" as const,
        icon: XCircle,
        className: ""
      },
      hired: {
        label: "Hired",
        variant: "default" as const,
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 hover:bg-green-200"
      },
    }

    const config = statusConfig[status]

    return (
      <Badge 
        variant={config.variant} 
        className={`flex items-center gap-1 ${config.className}`}
      >
        <config.icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  // No applications state
  const NoApplications = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Briefcase className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
      <p className="text-gray-500 mb-4">You haven&apos;t applied to any jobs yet.</p>
      <Button asChild>
        <Link href="/job-portal">Browse Jobs</Link>
      </Button>
    </div>
  )

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
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <p className="text-gray-600">Track and manage your job applications</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by job title, company, or status..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <NoApplications />
        ) : (
          filteredApplications.map((application) => (
            <Card key={application._id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                      {application.job.companyLogo ? (
                        <img
                          src={application.job.companyLogo}
                          alt={`${application.job.company} logo`}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{application.job.title}</CardTitle>
                      <CardDescription>
                        {application.job.company} • {application.job.location}
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>Applied on {formatDate(application.applicationDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>
                      Updated on {formatDate(application.updatedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex items-center space-x-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewApplicationDetails(application)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  {application.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => openWithdrawDialog(application)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Application Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Application for {selectedApplication?.job.title} at{" "}
              {selectedApplication?.job.company}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[400px]">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Job Title</h3>
                  <p>{selectedApplication.job.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p>{selectedApplication.job.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[400px]">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p>{selectedApplication.job.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <StatusBadge status={selectedApplication.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[400px]">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Applied On</h3>
                  <p>{formatDate(selectedApplication.applicationDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p>{formatDate(selectedApplication.updatedAt)}</p>
                </div>
              </div>

              {/* Interview details section - only show when status is 'interviewed' */}
              {selectedApplication.status === "interviewed" && selectedApplication.interviewDate && (
                <>
                  <Separator />
                  <div className="min-w-[400px]">
                    <h3 className="text-base font-medium text-gray-800 mb-2">Interview Details</h3>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100 overflow-x-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-blue-700 mr-2 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Date</h4>
                            <p className="text-sm">
                              {new Date(selectedApplication.interviewDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-700 mr-2 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Time</h4>
                            <p className="text-sm">{selectedApplication.interviewTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-blue-700 mr-2 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Location</h4>
                            <p className="text-sm break-words">{selectedApplication.interviewLocation}</p>
                          </div>
                        </div>
                        
                        {selectedApplication.interviewLink && (
                          <div className="flex items-center">
                            <ExternalLink className="h-4 w-4 text-blue-700 mr-2 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Meeting Link</h4>
                              <a 
                                href={selectedApplication.interviewLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline break-words"
                              >
                                Join Meeting
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 text-sm text-blue-700">
                        <AlertCircle className="h-4 w-4 inline mr-1 flex-shrink-0" />
                        Please be on time for your interview. Prepare your resume and be ready to discuss your experience.
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="min-w-[400px]">
                <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                <div className="mt-1 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Your uploaded resume</span>
                    <Button size="sm" variant="outline">
                      View Resume
                    </Button>
                  </div>
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div className="min-w-[400px]">
                  <h3 className="text-sm font-medium text-gray-500">Cover Letter</h3>
                  <div className="mt-1 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-line break-words">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setDetailsDialogOpen(false)
                window.open(`/job-portal/${selectedApplication?.job._id}`, "_blank")
              }}
            >
              View Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Application Dialog */}
      <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application for{" "}
              <span className="font-medium">
                {selectedApplication?.job.title}
              </span>{" "}
              at{" "}
              <span className="font-medium">
                {selectedApplication?.job.company}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={withdrawApplication}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 