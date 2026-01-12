'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseForm from '@/components/admin/CourseForm';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import CourseCurriculum from '@/components/admin/CourseCurriculum';

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [courseId, setCourseId] = useState<string | null>(null);

  const handleBasicInfoSuccess = (id: string) => {
    setCourseId(id);
    setActiveTab('curriculum');
    toast({
      title: 'Course created',
      description: 'Now you can add sections and videos to your course',
    });
  };

  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New Course</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="curriculum" disabled={!courseId}>
              Curriculum
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-6">
            <CourseForm onSuccess={handleBasicInfoSuccess} onCancel={() => router.push('/admin/courses')} />
          </TabsContent>
          
          <TabsContent value="curriculum" className="mt-6">
            {courseId ? (
              <CourseCurriculum courseId={courseId} />
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  Please complete the basic information first
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
} 