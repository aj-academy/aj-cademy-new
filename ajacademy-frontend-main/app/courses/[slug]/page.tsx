'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Video, Users, BookOpen, ChevronRight, Info, ShoppingCart, AlertCircle, CheckCircle, User, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDuration } from '@/lib/googleDriveUtils';
import { format } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleDriveImage from '@/components/GoogleDriveImage';

interface Lesson {
  _id: string;
  title: string;
  videoId: string;
  description?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
  resources?: { title: string, url: string }[];
}

interface Section {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  isPublished: boolean;
  sections: Section[];
  enrolledStudents: number;
  price: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/courses/slug/${slug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        
        const result = await response.json();
        
        // Only update state if the component is still mounted
        if (!isMounted) return;
        
        if (result.success && result.data) {
          const courseData = result.data;
          if (!courseData || !courseData._id) {
            throw new Error('Course not found');
          }
          setCourse(courseData);
          checkEnrollment(courseData);
        } else {
          throw new Error(result.error || 'Failed to fetch course');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching course:', error);
          setError(error instanceof Error ? error.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourse();
    
    // Clean up function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Separate function to check enrollment status
  const checkEnrollment = async (courseData: Course) => {
    // Check if user is enrolled, but only if they are logged in
    const token = localStorage.getItem('token');
    
    if (token && courseData && courseData._id) {
      try {
        const enrollmentCheckResponse = await fetch(
          `/api/courses/${courseData._id}/check-enrollment`, 
          { 
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (enrollmentCheckResponse.ok) {
          const enrollmentResult = await enrollmentCheckResponse.json();
          // Backend returns { enrolled: boolean, ... }
          setIsEnrolled(!!(enrollmentResult.enrolled || enrollmentResult.isEnrolled));
        } else if (enrollmentCheckResponse.status === 401) {
          // Token expired or invalid, clear it
          console.log('Token expired or invalid, clearing local storage');
          localStorage.removeItem('token');
        } else if (enrollmentCheckResponse.status === 404) {
          // API endpoint might not exist yet
          console.log('Enrollment check endpoint not found');
        } else {
          console.error('Enrollment check failed:', enrollmentCheckResponse.status);
        }
      } catch (enrollError) {
        console.error('Error checking enrollment:', enrollError);
      }
    } else {
      if (!token) {
        console.log('User not logged in, skipping enrollment check');
      } else if (!courseData || !courseData._id) {
        console.log('Course ID is undefined, skipping enrollment check');
      }
    }
  };

  const handleEnrollment = async () => {
    if (!course) return;
    
    try {
      setEnrolling(true);
      
      // Check if user is logged in by getting token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User is not logged in, redirect to sign-in page
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to enroll in this course',
          variant: 'destructive',
        });
        
        // Redirect to login page with return URL
        router.push(`/auth/sign-in?returnUrl=${encodeURIComponent(`/courses/${slug}`)}`);
        return;
      }
      
      // Proceed with enrollment if user is logged in
      const response = await fetch(`/api/courses/${course._id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      // Check for authentication issues
      if (response.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Your session has expired. Please sign in again.',
          variant: 'destructive',
        });
        
        // Clear invalid token
        localStorage.removeItem('token');
        
        // Redirect to login page
        router.push(`/auth/sign-in?returnUrl=${encodeURIComponent(`/courses/${slug}`)}`);
        return;
      }
      
      // Handle 404 (API endpoint might not exist)
      if (response.status === 404) {
        toast({
          title: 'Service Unavailable',
          description: 'The enrollment service is currently unavailable. Please try again later.',
          variant: 'destructive',
        });
        return;
      }
      
      // Handle other error status codes
      if (!response.ok) {
        let errorMessage = 'Failed to enroll in course';
        let errorData = null;
        // Try to parse error response as JSON
        try {
          errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          try {
            const textError = await response.text();
            errorMessage = textError || `Error ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP error ${response.status}`;
          }
        }
        // Special case: already enrolled
        if (errorMessage && errorMessage.toLowerCase().includes('already enrolled')) {
          setIsEnrolled(true);
          toast({
            title: 'Already Enrolled',
            description: 'You are already enrolled in this course. Redirecting you to the course...',
          });
          router.push(`/learning/${course._id}`);
          return;
        }
        // Special case: incomplete profile
        if (errorMessage && errorMessage.toLowerCase().includes('profile')) {
          toast({
            title: 'Complete Your Profile',
            description: errorMessage,
            variant: 'destructive',
          });
          router.push('/student/profile');
          return;
        }
        throw new Error(errorMessage);
      }
      
      // Only try to parse JSON if response is OK
      const result = await response.json();
      
      if (result.success || result.enrolled === true) {
        setIsEnrolled(true);
        toast({
          title: 'Enrollment Successful',
          description: 'You have successfully enrolled in this course',
        });
        // small delay to ensure enrollment is visible on subsequent checks
        setTimeout(() => {
          router.push(`/learning/${course._id}?fromEnroll=1`);
        }, 250);
      } else {
        throw new Error(result.error || 'Failed to enroll in course');
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast({
        title: 'Enrollment Failed',
        description: err instanceof Error ? err.message : 'An error occurred during enrollment',
        variant: 'destructive',
      });
    } finally {
      setEnrolling(false);
    }
  };

  // Calculate total lessons and duration
  const getTotalLessons = (sections: Section[]) => {
    return sections.reduce((total, section) => total + (section.lessons?.length || 0), 0);
  };

  const getTotalDuration = (sections: Section[]) => {
    return sections.reduce(
      (total, section) => 
        total + (section.lessons ? section.lessons.reduce(
          (sectionTotal, lesson) => sectionTotal + (lesson.duration || 0), 
          0
        ) : 0), 
      0
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isOnSale = () => {
    return course?.price && course?.updatedAt && new Date(course.updatedAt) > new Date();
  };

  const getCurrentPrice = () => {
    if (isOnSale()) {
      return course?.price;
    }
    return course?.price;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3 space-y-4">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
            <div className="md:w-1/3">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-16 px-4 md:px-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold">Course Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The course you are looking for does not exist or might be unavailable.
        </p>
        <Link href="/courses">
          <Button className="mt-6">
            Browse Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="mt-2 flex flex-wrap gap-4 items-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {course?.level ? (course.level.charAt(0).toUpperCase() + course.level.slice(1)) : 'Intermediate'}
              </Badge>
              
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {/* Assuming course.averageRating is available */}
                  {/* Replace with actual implementation */}
                  4.5
                </span>
                <span className="text-xs text-muted-foreground">
                  ({/* Assuming course.totalRatings is available */}
                  {/* Replace with actual implementation */}
                  123 ratings)
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{course?.enrolledStudents || 0} students enrolled</span>
              </div>
              
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Created on {course?.createdAt ? format(new Date(course.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="aspect-video overflow-hidden rounded-lg">
            {course.thumbnailUrl ? (
              <GoogleDriveImage
                url={course.thumbnailUrl}
                aspectRatio="video"
                className="w-full h-full object-cover"
                isGoogleDriveImage={true}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">About this course</h2>
            <div className="prose max-w-none">
              <p>{course?.description || 'No description available'}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Course Content</h2>
              <div className="text-sm text-muted-foreground">
                {course?.sections?.length || 0} sections • {course?.sections ? getTotalLessons(course.sections) : 0} lessons
              </div>
            </div>
            
            <Accordion type="multiple" className="w-full">
              {course?.sections?.map((section) => (
                <AccordionItem key={section._id} value={section._id}>
                  <AccordionTrigger className="text-left">
                    <div>
                      <div>{section.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {section.lessons?.length || 0} lessons
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-6 border-l">
                      {section.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {section.description}
                        </p>
                      )}
                      
                      {/* Placeholder for lessons */}
                      {section.lessons?.map((lesson, index) => (
                        <div key={lesson._id || index} className="flex items-center py-2">
                          <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div className="text-sm">
                            {isEnrolled ? (
                              <span>{lesson.title}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                Preview unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Instructor</h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">
                  {course?.author ? course.author.charAt(0) : 'I'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{course?.author || 'Instructor'}</h3>
                <p className="text-sm text-muted-foreground">Course Instructor</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl">Enroll in this course</CardTitle>
              
              <div className="mt-2">
                {isOnSale() ? (
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold text-green-600">
                        {formatPrice(course?.price || 0)}
                      </span>
                      <span className="text-lg line-through text-muted-foreground">
                        {formatPrice(course?.price || 0)}
                      </span>
                    </div>
                    <div className="text-sm text-red-500 font-medium mt-1">
                      Sale ends in: {course?.updatedAt ? format(new Date(course.updatedAt), 'MMM d, yyyy') : 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold">
                    {formatPrice(course?.price || 0)}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <Info className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Already Enrolled</AlertTitle>
                    <AlertDescription className="text-green-700">
                      You enrolled in this course on {format(new Date(course.createdAt), 'MMM d, yyyy')}
                    </AlertDescription>
                  </Alert>
                  
                  <Link href={`/learning/${slug}`} className="w-full">
                    <Button className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleEnrollment} 
                  disabled={enrolling}
                >
                  {enrolling ? 'Processing...' : 'Enroll Now'}
                  <ShoppingCart className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              <div className="py-2">
                <h3 className="font-medium mb-2">This course includes:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      {course?.sections ? getTotalLessons(course.sections) : 0} lessons
                    </span>
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      {course?.sections?.length || 0} sections
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Full lifetime access
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 