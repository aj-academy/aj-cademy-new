'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Plus,
  Pencil,
  Trash,
} from 'lucide-react';

/* =====================================
   ✅ GOOGLE DRIVE → IMAGE URL CONVERTER
   ===================================== */
function getThumbnailUrl(value?: string) {
  if (!value || value.trim() === '') {
    return '/placeholder.jpg';
  }

  // If already a full URL (http/https)
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Assume Google Drive File ID
  return `https://drive.google.com/uc?export=view&id=${value}`;
}

/* =====================================
   TYPES
   ===================================== */
interface Course {
  _id: string;
  title: string;
  slug: string;
  instructorName?: string;
  thumbnailUrl?: string;
  status: 'draft' | 'published';
  category?: string;
  regularPrice: number;
  salePrice?: number;
  enrollmentCount?: number;
  averageRating?: number;
  createdAt: string;
}

/* =====================================
   PAGE
   ===================================== */
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ==========================
     FETCH COURSES
     ========================== */
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await axios.get('/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.data || res.data?.courses || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     SEARCH
     ========================== */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  /* ==========================
     DELETE
     ========================== */
  const confirmDelete = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');

      await axios.delete(`/api/courses/${courseToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses((prev) =>
        prev.filter((c) => c._id !== courseToDelete._id)
      );

      toast({ title: 'Course deleted successfully' });
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <AdminAuthGuard>
      <div className="container mx-auto py-8 px-4">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Courses</h1>
          <Button onClick={() => router.push('/admin/courses/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* SEARCH */}
        <Card className="mb-6">
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div className="flex gap-3 items-center">
                        <img
                          src={getThumbnailUrl(course.thumbnailUrl)}
                          alt={course.title}
                          className="h-12 w-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                        <div>
                          <div className="font-semibold">{course.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {course.category || 'Uncategorized'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {course.salePrice
                        ? formatPrice(course.salePrice)
                        : formatPrice(course.regularPrice)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          router.push(`/admin/courses/edit/${course._id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirmDelete(course)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* DELETE DIALOG */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{courseToDelete?.title}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AdminAuthGuard>
  );
}
