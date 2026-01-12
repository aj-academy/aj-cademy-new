"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GoogleDriveImage from "@/components/GoogleDriveImage";
import { BookOpen, GraduationCap, Clock } from "lucide-react";
import Head from 'next/head';

interface Course {
  _id: string;
  title: string;
  description: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  isPublished: boolean;
  sections: {
    _id: string;
    title: string;
    lessons: {
      _id: string;
      title: string;
      duration?: number;
    }[];
  }[];
  enrolledStudents: number;
  duration?: number;
  slug: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Filter to only show published courses
          const publishedCourses = result.data.filter(
            (course: Course) => course.isPublished
          );
          setCourses(publishedCourses);
        } else {
          throw new Error(result.error || 'Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Calculate total lessons and duration for a course
  const getCourseSummary = (course: Course) => {
    const totalLessons = course.sections?.reduce(
      (total, section) => total + (section.lessons?.length || 0), 
      0
    ) || 0;
    
    const totalDuration = course.duration || course.sections?.reduce(
      (total, section) => 
        total + (section.lessons ? section.lessons.reduce(
          (sectionTotal, lesson) => sectionTotal + (lesson.duration || 0), 
          0
        ) : 0), 
      0
    ) || 0;
    
    return { totalLessons, totalDuration };
  };

  return (
    <>
      <Head>
        <title>Courses | AJ Academy</title>
        <meta name="description" content="Explore expert-led courses at AJ Academy. Learn new skills and advance your career." />
      </Head>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-2">AJ Academy Courses</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Expand your knowledge and skills with our carefully crafted courses. 
            Learn at your own pace and take your career to the next level.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-10 px-4">
            <p className="text-red-500 mb-4 text-sm sm:text-base">{error}</p>
            <Button onClick={() => window.location.reload()} className="text-sm sm:text-base">
              Try Again
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl mx-auto px-4">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg sm:text-xl font-medium text-gray-900">No courses available yet</h3>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">Check back soon as we're adding new courses regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {courses.map((course) => {
              const { totalLessons, totalDuration } = getCourseSummary(course);
              
              return (
                <Card key={course._id} className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="aspect-video relative bg-gray-100">
                    {course.thumbnailUrl ? (
                      <GoogleDriveImage
                        url={course.thumbnailUrl}
                        aspectRatio="video"
                        className="w-full h-full object-cover"
                        isGoogleDriveImage={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs">
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="text-sm">by {course.author}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4 flex-grow px-4 sm:px-6">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {course.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-3 sm:gap-4">
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{course.sections?.length || 0} sections</span>
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{totalLessons} lessons</span>
                      </div>
                      {totalDuration > 0 && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span>{totalDuration} min</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 mt-auto px-4 sm:px-6 pb-4 sm:pb-6">
                    <Link href={`/courses/${course.slug || course._id}`} className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-2.5">
                        View Course
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
} 