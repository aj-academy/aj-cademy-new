'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import CourseCurriculum from '@/components/admin/CourseCurriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Course {
  _id: string;
  title: string;
  slug: string;
  instructorName: string;
  sections: any[];
}

export default function CurriculumPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminAuthGuard>
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AdminAuthGuard>
    );
  }

  if (!course) {
    return (
      <AdminAuthGuard>
        <div className="container mx-auto py-8 px-4 md:px-6">
          <Card>
            <CardContent className="py-16 text-center">
              <h1 className="text-xl font-semibold">Course Not Found</h1>
              <p className="text-muted-foreground mt-2">
                The course you are looking for doesn't exist or may have been deleted.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/admin/courses')}
              >
                Go Back to Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/courses')}
                className="pl-0 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <h1 className="text-3xl font-bold">Manage Curriculum</h1>
              <p className="text-muted-foreground">
                {course.title} • {course.instructorName}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/admin/courses/edit/${id}`)}
              >
                Edit Course Details
              </Button>
              <Button 
                onClick={() => router.push(`/courses/${course.slug}`)}
              >
                View Course
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                Organize your course content by adding sections and videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseCurriculum courseId={id} initialSections={course.sections} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthGuard>
  );
} 