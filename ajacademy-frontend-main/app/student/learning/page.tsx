"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Search, GraduationCap, Clock, Calendar, CheckCircle, Play } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api-client"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoogleDriveImage from "@/components/GoogleDriveImage"
import { Skeleton } from "@/components/ui/skeleton"
import { Enrollment } from "@/lib/types"

export default function MyLearningPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Fetch enrollments when component mounts
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to view your courses',
            variant: 'destructive',
          })
          router.push('/student/login?returnUrl=/student/learning')
          return
        }
        
        const response = await api.student.getEnrollments()
        
        if (response.error) {
          if (response.error.includes('401') || response.error.includes('Authentication required')) {
            toast({
              title: 'Session Expired',
              description: 'Your session has expired. Please sign in again.',
              variant: 'destructive',
            })
            router.push('/student/login?returnUrl=/student/learning')
            return
          }
          
          throw new Error(response.error)
        }
        
        if (response.data) {
          setEnrollments(response.data as unknown as Enrollment[])
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

  // Filter enrollments based on search term
  const filteredEnrollments = searchTerm.trim() === ""
    ? enrollments
    : enrollments.filter(enrollment => 
        enrollment.courseId.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Get courses in progress (less than 100% completion)
  const coursesInProgress = enrollments.filter(
    enrollment => enrollment.completionPercentage < 100
  );

  // Get completed courses (100% completion)
  const completedCourses = enrollments.filter(
    enrollment => enrollment.completionPercentage === 100
  );

  // Get recently accessed courses
  const recentCourses = [...enrollments]
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Learning</h1>
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-red-600 mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Learning</h1>
        
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search your courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Enrolled Courses</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Browse our courses and start learning today!
          </p>
          <Button asChild size="lg">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <>
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

          <Tabs defaultValue="all" className="mt-8">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Courses ({enrollments.length})</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress ({coursesInProgress.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.length > 0 ? (
                  filteredEnrollments.map((enrollment) => (
                    <CourseCard key={enrollment._id} enrollment={enrollment} />
                  ))
                ) : (
                  <div className="col-span-3 py-12 text-center">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No matching courses found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search term</p>
                    <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="in-progress">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.filter(e => e.completionPercentage < 100).length > 0 ? (
                  filteredEnrollments
                    .filter(enrollment => enrollment.completionPercentage < 100)
                    .map((enrollment) => (
                      <CourseCard key={enrollment._id} enrollment={enrollment} />
                    ))
                ) : (
                  <div className="col-span-3 py-12 text-center">
                    <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses in progress</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? "No matching courses found. Try adjusting your search." : "Start learning from your enrolled courses"}
                    </p>
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.filter(e => e.completionPercentage === 100).length > 0 ? (
                  filteredEnrollments
                    .filter(enrollment => enrollment.completionPercentage === 100)
                    .map((enrollment) => (
                      <CourseCard key={enrollment._id} enrollment={enrollment} />
                    ))
                ) : (
                  <div className="col-span-3 py-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No completed courses yet</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? "No matching courses found. Try adjusting your search." : "Keep learning to complete your courses"}
                    </p>
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Looking for more courses?</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Expand your knowledge with our full catalog of courses
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href="/courses">Browse More Courses</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// CourseCard Component
function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const { courseId, enrolledAt, completionPercentage, lastAccessedAt } = enrollment;
  
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
  );
} 