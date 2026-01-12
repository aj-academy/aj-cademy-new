"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserCircle, Mail, FileText, ArrowRight, User, Play, CheckCircle, BookOpen, Calendar, Clock, GraduationCap } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api-client"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoogleDriveImage from "@/components/GoogleDriveImage"
import { Skeleton } from "@/components/ui/skeleton"
import { Enrollment } from "@/lib/types"

export default function StudentDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  // Authentication check and get user info
  useEffect(() => {
    const checkAuthAndLoadData = () => {
      const token = localStorage.getItem('token')
      const userRole = localStorage.getItem('userRole')
      const storedUserName = localStorage.getItem('userName')
      const storedUserEmail = localStorage.getItem('userEmail')
      
      console.log("Dashboard auth check - Token:", !!token, "Role:", userRole)
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access your dashboard",
          variant: "destructive"
        })
        router.push('/auth/sign-in?returnUrl=/student/dashboard')
        return false
      }
      
      if (userRole !== 'student') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the student dashboard",
          variant: "destructive"
        })
        router.push('/')
        return false
      }
      
      // Set user data with fallbacks
      setUserName(storedUserName || 'Student')
      setUserEmail(storedUserEmail || 'No email provided')
      return true
    }
    
    // Delayed check to ensure localStorage is updated
    const timer = setTimeout(() => {
      const isAuthed = checkAuthAndLoadData()
      
      if (isAuthed) {
        // Fetch student dashboard data
        const fetchData = async () => {
          try {
            const response = await api.student.getDashboard()
            
            if (response.error) {
              console.error("Error fetching student dashboard data:", response.error)
              setError(response.error)
              
              // If authentication error, redirect to login
              if (response.error === "Authentication required") {
                toast({
                  title: "Session Expired",
                  description: "Please sign in again to continue",
                  variant: "destructive"
                })
                localStorage.removeItem('token')
                router.push('/auth/sign-in?returnUrl=/student/dashboard')
                return
              }
            } else if (response.data) {
              setDashboardData(response.data)
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            console.error("Error fetching student dashboard data:", errorMessage)
            setError(errorMessage)
          } finally {
            setLoading(false)
          }
        }
        
        fetchData()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [router, toast])
  
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to view your dashboard',
            variant: 'destructive',
          })
          router.push('/student/login?returnUrl=/student/dashboard')
          return
        }
        
        const response = await api.student.getEnrollments();
        
        if (response.error) {
          if (response.error.includes('401') || response.error.includes('Authentication required')) {
            toast({
              title: 'Session Expired',
              description: 'Your session has expired. Please sign in again.',
              variant: 'destructive',
            })
            router.push('/student/login?returnUrl=/student/dashboard')
            return
          }
          
          throw new Error(response.error);
        }
        
        if (response.data) {
          setEnrollments(response.data);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [router, toast])
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Learning Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-red-600 mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }
  
  // Get the courses in progress (less than 100% completion)
  const coursesInProgress = enrollments.filter(
    enrollment => enrollment.completionPercentage < 100
  )

  // Get the completed courses (100% completion)
  const completedCourses = enrollments.filter(
    enrollment => enrollment.completionPercentage === 100
  )

  // Get recently accessed courses
  const recentCourses = [...enrollments]
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Learning Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
            <CardDescription>Courses you're currently taking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Play className="h-12 w-12 text-blue-600 p-2 bg-blue-100 rounded-full mr-3" />
                <span className="text-3xl font-bold">{coursesInProgress.length}</span>
              </div>
              <Button variant="link" asChild>
                <Link href="#in-progress">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
            <CardDescription>Courses you've finished</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-12 w-12 text-green-600 p-2 bg-green-100 rounded-full mr-3" />
                <span className="text-3xl font-bold">{completedCourses.length}</span>
              </div>
              <Button variant="link" asChild>
                <Link href="#completed">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Enrollments</CardTitle>
            <CardDescription>All your enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-12 w-12 text-indigo-600 p-2 bg-indigo-100 rounded-full mr-3" />
                <span className="text-3xl font-bold">{enrollments.length}</span>
              </div>
              <Button variant="link" asChild>
                <Link href="/courses">Browse More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      {recentCourses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((enrollment) => (
              <Card key={enrollment._id} className="overflow-hidden flex flex-col">
                <div className="aspect-video relative">
                  {enrollment.courseId.thumbnailUrl ? (
                    <GoogleDriveImage
                      url={enrollment.courseId.thumbnailUrl}
                      aspectRatio="video"
                      className="w-full h-full object-cover"
                      isGoogleDriveImage={true}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ width: `${enrollment.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{enrollment.courseId.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Last accessed {format(new Date(enrollment.lastAccessedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{enrollment.completionPercentage}% complete</span>
                  </div>
                  <Progress value={enrollment.completionPercentage} className="h-2" />
                </CardContent>
                <CardFooter className="pt-0 mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/learning/${enrollment.courseId.slug}`}>
                      Continue Learning
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tabbed Course Lists */}
      <Tabs defaultValue="all" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="in-progress" id="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed" id="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <CourseCard key={enrollment._id} enrollment={enrollment} />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="text-gray-500 mb-4">You haven't enrolled in any courses</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesInProgress.length > 0 ? (
              coursesInProgress.map((enrollment) => (
                <CourseCard key={enrollment._id} enrollment={enrollment} />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <Play className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses in progress</h3>
                <p className="text-gray-500 mb-4">Start learning from your enrolled courses</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.length > 0 ? (
              completedCourses.map((enrollment) => (
                <CourseCard key={enrollment._id} enrollment={enrollment} />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed courses yet</h3>
                <p className="text-gray-500 mb-4">Keep learning to complete your courses</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// CourseCard Component
function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const { courseId, enrolledAt, completionPercentage, lastAccessedAt } = enrollment
  
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video relative">
        {courseId.thumbnailUrl ? (
          <GoogleDriveImage
            url={courseId.thumbnailUrl}
            aspectRatio="video"
            className="w-full h-full object-cover"
            isGoogleDriveImage={true}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className={`h-full ${completionPercentage === 100 ? 'bg-green-600' : 'bg-blue-600'}`} 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{courseId.title}</CardTitle>
        <CardDescription className="flex flex-col space-y-1 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Enrolled on {format(new Date(enrolledAt), 'MMM d, yyyy')}</span>
          </div>
          {courseId.sections && (
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>
                {courseId.sections.length} sections • {courseId.sections.reduce(
                  (total, section) => total + section.lessons.length, 0
                )} lessons
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{completionPercentage}% complete</span>
          {completionPercentage === 100 && (
            <span className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </span>
          )}
        </div>
        <Progress 
          value={completionPercentage} 
          className={`h-2 ${completionPercentage === 100 ? 'bg-green-100' : 'bg-blue-100'}`}
        />
      </CardContent>
      <CardFooter className="pt-2 mt-auto">
        <Button asChild className="w-full">
          <Link href={`/learning/${courseId.slug}`}>
            {completionPercentage === 100 ? 'Review Course' : 'Continue Learning'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 