'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import CourseForm from '@/components/admin/CourseForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructorName: string;
  thumbnailUrl: string;
  status: 'draft' | 'published';
  category: string;
  regularPrice: number;
  salePrice?: number;
  saleEndDate?: string;
  slug: string;
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
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

  const handleFormSuccess = (courseId: string) => {
    toast({
      title: 'Course Updated',
      description: 'The course has been updated successfully.',
    });
    router.push('/admin/courses');
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
          <Card className="p-6 text-center">
            <h1 className="text-xl font-semibold">Course Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The course you are trying to edit doesn't exist or may have been deleted.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/admin/courses')}
            >
              Go Back to Courses
            </Button>
          </Card>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="space-y-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin/courses')}
              className="pl-0 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-muted-foreground">Update course details and information</p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/courses/${course.slug}`)}
            >
              View Course
            </Button>
            <Button 
              onClick={() => router.push(`/admin/courses/curriculum/${id}`)}
            >
              Manage Curriculum
            </Button>
          </div>
          
          <Separator />
          
          <CourseForm 
            initialData={course} 
            onSuccess={handleFormSuccess}
            onCancel={() => router.push('/admin/courses')}
          />
        </div>
      </div>
    </AdminAuthGuard>
  );
} 