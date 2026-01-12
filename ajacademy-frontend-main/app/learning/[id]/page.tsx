"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import GoogleDriveVideoPlayer from "@/components/GoogleDriveVideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Play, BookOpen, FileText } from "lucide-react";
import Link from "next/link";

// Types for course/lesson
interface Lesson {
  _id: string;
  title: string;
  videoId: string;
  description?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
  resources?: { title: string; url: string }[];
  completed?: boolean;
}

interface Section {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  thumbnailUrl: string;
  sections: Section[];
}

export default function LearningPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

  // Helper to detect Mongo ObjectId
  const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

  // Fetch course data and check enrollment
  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      setLoading(true);
      setError(null);
      try {
        const useSlug = !isObjectId(idParam);
        const apiPath = useSlug ? `/api/courses/slug/${idParam}` : `/api/courses/${idParam}`;
        const res = await fetch(apiPath);
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();
        const courseData = data.data || data;
        setCourse(courseData);
        // Check enrollment
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setIsEnrolled(false);
          return;
        }
        const enrollRes = await fetch(`/api/courses/${courseData._id}/check-enrollment`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        if (!enrollRes.ok) {
          setIsEnrolled(false);
          return;
        }
        const enrollData = await enrollRes.json();
        setIsEnrolled(!!(enrollData.enrolled || enrollData.isEnrolled));
        // If just enrolled and there is at least one lesson, auto-select the first lesson
        if (!enrollData.enrolled && !enrollData.isEnrolled) {
          // not enrolled, but proceed to show course outline
        }
        // Default to first lesson
        if (courseData.sections?.length > 0) {
          const firstSection = courseData.sections[0];
          setSelectedSectionId(firstSection._id);
          if (firstSection.lessons?.length > 0) {
            setCurrentLesson(firstSection.lessons[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (idParam) fetchCourseAndEnrollment();
  }, [idParam]);

  // Redirect back to course if not enrolled after load
  useEffect(() => {
    if (isEnrolled === false && course) {
      router.replace(`/courses/${course.slug}`);
    }
  }, [isEnrolled, course, router]);

  // Handle lesson selection
  const handleSelectLesson = (lesson: Lesson, sectionId: string) => {
    setCurrentLesson(lesson);
    setSelectedSectionId(sectionId);
  };

  // Calculate progress
  const getProgress = () => {
    if (!course) return 0;
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const completed = allLessons.filter((l) => l.completed).length;
    return Math.round((completed / allLessons.length) * 100);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;
  }
  if (error || !course) {
    return <div className="flex items-center justify-center h-[60vh] text-red-500">{error || "Course not found"}</div>;
  }
  if (isEnrolled === false) {
    return <div className="flex items-center justify-center h-[60vh] text-red-500">You must enroll in this course to access the content.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r flex flex-col p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Course Content</h2>
        <Progress value={getProgress()} className="mb-4" />
        <div className="text-xs text-gray-500 mb-2">{getProgress()}% completed</div>
        <div className="space-y-4">
          {course.sections.map((section) => (
            <div key={section._id}>
              <div className="font-semibold text-gray-700 mb-1">{section.title}</div>
              <div className="space-y-1 ml-2">
                {section.lessons.map((lesson) => (
                  <Button
                    key={lesson._id}
                    variant={currentLesson?._id === lesson._id ? "secondary" : "ghost"}
                    className="w-full flex justify-between items-center px-3 py-2 text-left"
                    onClick={() => handleSelectLesson(lesson, section._id)}
                  >
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-500" />
                      {lesson.title}
                    </span>
                    {lesson.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-8">
        <div className="w-full max-w-4xl">
          {/* Video Player */}
          {currentLesson?.videoId ? (
            <GoogleDriveVideoPlayer
              googleDriveId={currentLesson.videoId}
              title={currentLesson.title}
              courseId={course._id}
              videoId={currentLesson._id}
              totalDuration={currentLesson.duration}
            />
          ) : (
            <Card className="aspect-video flex items-center justify-center mb-6">
              <CardContent className="flex flex-col items-center justify-center w-full h-full">
                <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
                <div className="text-gray-500">No video available for this lesson</div>
              </CardContent>
            </Card>
          )}

          {/* Lesson Info */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
            <div className="text-gray-600 mb-4">{currentLesson?.description}</div>
            {currentLesson?.resources && currentLesson.resources.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" /> Resources
                </div>
                <ul className="list-disc ml-6">
                  {currentLesson.resources.map((res, idx) => (
                    <li key={idx}>
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {res.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 