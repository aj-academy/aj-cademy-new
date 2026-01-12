"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Lock as LockIcon, RefreshCcw, Book, Image as ImageIcon, LayoutDashboard, Briefcase, LogOut, Users, BarChart, PieChart, LineChart, TrendingUp, UserCog, BookOpen, GraduationCap, Eye, Calendar, Clock, MapPin, Link as LinkIcon, ExternalLink, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import GoogleDriveImage from "@/components/GoogleDriveImage";
import { GalleryImage as GalleryImageType } from "@/lib/types";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { validateGalleryCategory } from "@/lib/utils";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { StatsCard } from "@/components/admin/StatsCard";
import { extractGoogleDriveFileId } from "@/lib/utils";

interface GalleryImage extends GalleryImageType {
  id?: number;
  featured?: boolean;
  image?: string;
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  applications: number;
  newApplications: number;
  hiredCandidates: number;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  status: string;
  applicationsCount: number;
  createdAt: string;
}

interface Application {
  _id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  appliedAt: string;
  resume?: string;
  coverLetter?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewLink?: string;
}

interface Candidate {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  totalApplications: number;
  lastApplicationDate: string;
}

interface SupportRequest {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  adminResponse?: string;
  respondedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RunningTextAd {
  _id: string;
  text: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewJob {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: string;
  applicationDeadline: string;
  status: string;
}

interface HRUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

interface NewHRUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: string;
  phone: string;
}

interface Lesson {
  _id?: string;
  title: string;
  videoId: string;
  description?: string;
  duration?: number;
  order: number;
  isPreview?: boolean;
  resources?: { title: string, url: string }[];
}

interface Section {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  isPublished: boolean;
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
  enrolledStudents?: number;
  price?: number;
  duration?: number;
}

export default function AdminDashboardPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryTotalPages, setGalleryTotalPages] = useState(1);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [jobStats, setJobStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    applications: 0,
    newApplications: 0,
    hiredCandidates: 0
  });
  const [applicationTrends, setApplicationTrends] = useState<number[]>([]);
  const [newImage, setNewImage] = useState<Omit<GalleryImage, "_id">>({
    title: "",
    description: "",
    category: "campus" as const,
    tags: [],
    url: "",
    image: "",
    photographer: "",
    featured: false,
    isGoogleDriveImage: true,
    googleDriveId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [newTag, setNewTag] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showAddImageDialog, setShowAddImageDialog] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{id: string, status: string} | null>(null);
  const [interviewDetails, setInterviewDetails] = useState({
    interviewDate: '',
    interviewTime: '10:00',
    interviewLocation: 'Remote',
    interviewLink: ''
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<SupportRequest | null>(null);
  const [showSupportRequestDialog, setShowSupportRequestDialog] = useState(false);
  const [supportResponse, setSupportResponse] = useState("");
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [newJob, setNewJob] = useState<NewJob>({
    title: "",
    company: "",
    location: "",
    employmentType: "full-time",
    description: "",
    requirements: [],
    responsibilities: [],
    salary: "",
    applicationDeadline: "",
    status: "active"
  });
  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [hrUsers, setHRUsers] = useState<HRUser[]>([]);
  const [showHRDialog, setShowHRDialog] = useState(false);
  const [newHRUser, setNewHRUser] = useState<NewHRUser>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: "",
    phone: ""
  });
  const [editingHRUser, setEditingHRUser] = useState<HRUser | null>(null);
  const [showEditHRStatusDialog, setShowEditHRStatusDialog] = useState(false);

  // Course states
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [newCourse, setNewCourse] = useState<Course>({
    title: "",
    description: "",
    author: "",
    level: "beginner",
    thumbnailUrl: "",
    isPublished: false,
    sections: []
  });
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(-1);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(-1);

  const router = useRouter();
  const { toast } = useToast();

  // Safely check for authentication (debounced, single-run)
  useEffect(() => {
    const initializeData = async () => {
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (!adminAuthStr) {
          console.log("AdminDashboardPage: No admin auth found, redirecting to login");
          setTimeout(() => {
            router.push("/admin");
          }, 100);
          return;
        }
        try {
          const adminAuth = JSON.parse(adminAuthStr);
          if (!adminAuth?.token) {
            console.log("AdminDashboardPage: Invalid admin auth (no token), redirecting to login");
            setTimeout(() => {
              router.push("/admin");
            }, 100);
            return;
          }
          // Token exists, fetch data
          await fetchData();
        } catch (error) {
          console.error("Error parsing admin auth:", error);
          setTimeout(() => {
            router.push("/admin");
          }, 100);
        }
      } catch (error) {
        console.error("Error checking admin auth:", error);
      }
    };
    let mounted = true;
    if (mounted) initializeData();
    return () => { mounted = false };
  }, [galleryPage]); // refetch gallery on page change

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    let loaded = [];
    
    try {
      // Get admin auth token
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      // Helper function to handle API requests with rate limiting
      const fetchWithRateLimitHandling = async (url: string, options: RequestInit = {}) => {
        try {
          const response = await fetch(url, options);
          
          if (response.status === 429) {
            // Rate limit hit
            toast({
              title: "Rate Limit Exceeded",
              description: "Too many requests. Please wait a moment before trying again.",
              variant: "destructive"
            });
            return { success: false, error: "Rate limit exceeded" };
          }
          
          if (!response.ok) {
            return { success: false, error: `Request failed with status: ${response.status}` };
          }
          
          return await response.json();
        } catch (error: unknown) {
          console.error(`Error fetching ${url}:`, error);
          return { success: false, error: error instanceof Error ? error.message : "Network error" };
        }
      };

      // Add delay between requests to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      // Add a simple in-flight guard to avoid duplicate fetch bursts
      if ((window as any).__adminDashboardLoading) {
        return;
      }
      (window as any).__adminDashboardLoading = true;

      // Fetch gallery images
      try {
        const galleryResult = await fetchWithRateLimitHandling(`/api/gallery?page=${galleryPage}&limit=12`, { cache: 'no-store' });
        if (galleryResult.success === false) {
          console.error('Error fetching gallery:', galleryResult.error);
        } else if (Array.isArray(galleryResult)) {
          setGalleryImages(galleryResult);
          setGalleryTotal(galleryResult.length);
          loaded.push('gallery');
        } else if (galleryResult.success) {
          const items = galleryResult.data?.items || galleryResult.data || [];
          const totalPages = galleryResult.data?.totalPages || 1;
          const total = galleryResult.data?.total ?? items.length;
          setGalleryImages(items);
          setGalleryTotalPages(totalPages);
          setGalleryTotal(total);
          loaded.push('gallery');
        } else if (galleryResult.items) {
          setGalleryImages(galleryResult.items);
          setGalleryTotalPages(galleryResult.totalPages || 1);
          setGalleryTotal(galleryResult.total || galleryResult.items.length || 0);
          loaded.push('gallery');
        }
        
        // Add delay between requests
        await delay(300);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      }

      // Fetch job stats
      try {
        const statsResult = await fetchWithRateLimitHandling('/api/hr/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${adminAuth.token}`
          }
        });
        
        if (statsResult.success) {
          setJobStats({
            totalJobs: statsResult.data.totalJobs,
            activeJobs: statsResult.data.activeJobs,
            applications: statsResult.data.totalApplications,
            newApplications: statsResult.data.newApplications,
            hiredCandidates: statsResult.data.hiredCandidates
          });
          loaded.push('stats');
        }
        
        // Add delay between requests
        await delay(300);
      } catch (error) {
        console.error('Error fetching job stats:', error);
      }

      // Fetch HR users
      try {
        const hrUsersResult = await fetchWithRateLimitHandling('/api/admin/hr-users', {
          headers: {
            'Authorization': `Bearer ${adminAuth.token}`
          }
        });
        
        if (hrUsersResult.success) {
          setHRUsers(hrUsersResult.data);
          loaded.push('hrUsers');
        }
        
        // Add delay between requests
        await delay(300);
      } catch (error) {
        console.error('Error fetching HR users:', error);
      }

      // Fetch jobs
      try {
        const jobsResult = await fetchWithRateLimitHandling('/api/hr/jobs', {
          headers: {
            'Authorization': `Bearer ${adminAuth.token}`
          }
        });
        
        if (jobsResult.success) {
          setJobs(jobsResult.data);
          loaded.push('jobs');
        }
        
        // Add delay between requests
        await delay(300);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }

      // Fetch applications
      try {
        const applicationsResult = await fetchWithRateLimitHandling('/api/hr/applications', {
          headers: {
            'Authorization': `Bearer ${adminAuth.token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
        });
        
        if (applicationsResult.success) {
          setApplications(applicationsResult.data);
          loaded.push('applications');
          
          // Process applications to generate monthly trends
          const now = new Date();
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          
          // Create a map of months and application counts
          const monthCounts = new Map();
          for (let i = 0; i < 7; i++) {
            const month = new Date();
            month.setMonth(now.getMonth() - i);
            const monthKey = month.toLocaleString('default', { month: 'short' });
            monthCounts.set(monthKey, 0);
          }
          
          // Count applications by month
          applicationsResult.data.forEach((app: { appliedAt: string }) => {
            const appDate = new Date(app.appliedAt);
            if (appDate >= sixMonthsAgo) {
              const monthKey = appDate.toLocaleString('default', { month: 'short' });
              if (monthCounts.has(monthKey)) {
                monthCounts.set(monthKey, monthCounts.get(monthKey) + 1);
              }
            }
          });
          
          // Convert to array in reverse chronological order
          const trendsData = Array.from(monthCounts.values()).reverse();
          setApplicationTrends(trendsData);
          loaded.push('trends');
        }
        
        // Add delay between requests
        await delay(300);
      } catch (error) {
        console.error('Error processing application trends data:', error);
      }
      
      // Fetch support requests
      try {
        const supportResult = await fetchWithRateLimitHandling('/api/admin/support-requests', {
          headers: {
            'Authorization': `Bearer ${adminAuth.token}`
          }
        });
        
        if (supportResult.success) {
          setSupportRequests(supportResult.data);
          loaded.push('supportRequests');
        }
        
        // Add delay between requests
        await delay(300);
      } catch (error) {
        console.error('Error fetching support requests:', error);
      }

      // Fetch courses (do this last as it seems to be hitting rate limits)
      try {
        const coursesResult = await fetchWithRateLimitHandling('/api/courses?page=1&limit=12', {
          headers: {
            'Authorization': `Bearer ${adminAuth.token}`,
            // Add cache control to avoid multiple identical requests
            'Cache-Control': 'no-cache'
          }
        });
        
        if (coursesResult.success) {
          setCourses(coursesResult.data);
          loaded.push('courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
      
      // Single toast notification for all loaded items
      if (loaded.length > 0) {
        toast({ 
          title: 'Dashboard Loaded', 
          description: `Loaded ${loaded.length} dashboard components`
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      (window as any).__adminDashboardLoading = false;
    }
  }, [toast]);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Get admin auth token
      let adminToken = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          const adminAuth = JSON.parse(adminAuthStr);
          adminToken = adminAuth.token;
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in as an admin to add images",
          variant: "destructive"
        });
        return;
      }

      // Validate the category
      const validatedCategory = validateGalleryCategory(newImage.category);

      const imageData = {
        ...newImage,
        category: validatedCategory,
        image: newImage.url,
        googleDriveId: newImage.url,
        isGoogleDriveImage: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(imageData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewImage({
          title: "",
          description: "",
          category: "campus" as const,
          tags: [],
          url: "",
          image: "",
          photographer: "",
          featured: false,
          isGoogleDriveImage: true,
          googleDriveId: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setNewTag("");
        setShowAddImageDialog(false);
        await fetchData();
        toast({
          title: "Success",
          description: "Image added to gallery successfully",
        });
      } else {
        // Extract specific error message
        const errorMessage = result.error || result.message || "Failed to add image to gallery";
        console.error('Gallery upload error:', errorMessage, result);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding gallery image:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Network or server error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      // Get admin auth token
      let adminToken = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          const adminAuth = JSON.parse(adminAuthStr);
          adminToken = adminAuth.token;
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in as an admin to delete images",
          variant: "destructive"
        });
        return;
      }
      
      // Use the gallery API endpoint
      const apiUrl = `/api/gallery/${id}?t=${Date.now()}`;
      console.log('Deleting gallery image, sending request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Delete request failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Image deleted successfully",
        });
        await fetchData(); // Refresh the gallery data
      } else {
        throw new Error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (id: string | number) => {
    const image = galleryImages.find(img => img._id === id || img.id === id);
    if (image) {
      setEditingId(id);
      setNewImage({
        title: image.title,
        description: image.description,
        category: image.category,
        tags: image.tags || [],
        url: image.url || image.googleDriveId || "",
        image: image.image || image.url || "",
        photographer: image.photographer || "",
        featured: image.featured || false,
        isGoogleDriveImage: image.isGoogleDriveImage || true,
        googleDriveId: image.googleDriveId || image.url || "",
        createdAt: image.createdAt,
        updatedAt: image.updatedAt
      });
      setShowAddImageDialog(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsLoading(true);
    try {
      // Get admin auth token
      let adminToken = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          const adminAuth = JSON.parse(adminAuthStr);
          adminToken = adminAuth.token;
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in as an admin to edit images",
          variant: "destructive"
        });
        return;
      }

      // Validate the category
      const validatedCategory = validateGalleryCategory(newImage.category);

      // Update image data with proper fields for compatibility
      const imageData = {
        ...newImage,
        category: validatedCategory,
        image: newImage.url, // Set image field to url value for backend
        googleDriveId: newImage.url, // Set googleDriveId field to url value
        isGoogleDriveImage: true, // Force isGoogleDriveImage to true
      };

      const response = await fetch(`/api/gallery/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(imageData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEditingId(null);
        setNewImage({
          title: "",
          description: "",
          category: "campus" as const,
          tags: [],
          url: "",
          image: "",
          photographer: "",
          featured: false,
          isGoogleDriveImage: true,
          googleDriveId: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setNewTag("");
        setShowAddImageDialog(false);
        await fetchData();
        toast({
          title: "Success",
          description: "Image updated successfully",
        });
      } else {
        // Extract specific error message
        const errorMessage = result.error || result.message || "Failed to update image";
        console.error('Gallery update error:', errorMessage, result);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating the image",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newImage.tags.includes(newTag.trim())) {
      setNewImage(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewImage(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("adminAuth");
      sessionStorage.removeItem("adminAuth");
    } catch (error) {
      console.error('Error accessing storage:', error);
    }
    router.push("/admin");
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/hr/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setNewJob({
          title: "",
          company: "",
          location: "",
          employmentType: "full-time",
          description: "",
          requirements: [],
          responsibilities: [],
          salary: "",
          applicationDeadline: "",
          status: "active"
        });
        setNewRequirement("");
        setNewResponsibility("");
        setShowJobDialog(false);
        await fetchData();
        toast({
          title: "Success",
          description: "Job created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create job",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating the job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/hr/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminAuth.token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // Avoid reloading entire dashboard; refresh only gallery tile list
        try {
          const refreshed = await fetch('/api/gallery?page=1&limit=12', { cache: 'no-store' });
          const data = await refreshed.json();
          if (Array.isArray(data)) setGalleryImages(data);
          else if (data?.items) setGalleryImages(data.items);
        } catch {}
        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete job",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the job",
        variant: "destructive"
      });
    }
  };

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    // If status is 'interviewed', show interview dialog first
    if (status === 'interviewed' || status === 'interview') {
      setPendingStatusUpdate({ id, status: 'interviewed' });
      setShowInterviewDialog(true);
      return;
    }
    
    // For other statuses, update directly
    await updateStatusDirectly(id, status);
  };

  const updateStatusDirectly = async (id: string, status: string) => {
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/hr/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh just applications list instead of full dashboard
        try {
          const refreshed = await fetch('/api/hr/applications', { headers: { 'Authorization': `Bearer ${adminAuth.token}` }, cache: 'no-store' });
          const data = await refreshed.json();
          if (data?.data) setApplications(data.data);
        } catch {}
        toast({
          title: "Success",
          description: "Application status updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update application status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the application status",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSupportRequestStatus = async (id: string, status: string) => {
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/support-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh support requests
        try {
          const refreshed = await fetch('/api/admin/support-requests', { 
            headers: { 'Authorization': `Bearer ${adminAuth.token}` }, 
            cache: 'no-store' 
          });
          const data = await refreshed.json();
          if (data?.data) setSupportRequests(data.data);
        } catch {}
        toast({
          title: "Success",
          description: "Support request status updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update support request status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating support request status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the support request status",
        variant: "destructive"
      });
    }
  };

  const handleSupportRequestResponse = async () => {
    if (!selectedSupportRequest) return;

    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/support-requests/${selectedSupportRequest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify({ 
          status: 'resolved',
          adminResponse: supportResponse 
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh support requests
        try {
          const refreshed = await fetch('/api/admin/support-requests', { 
            headers: { 'Authorization': `Bearer ${adminAuth.token}` }, 
            cache: 'no-store' 
          });
          const data = await refreshed.json();
          if (data?.data) setSupportRequests(data.data);
        } catch {}
        toast({
          title: "Success",
          description: "Response sent successfully",
        });
        setShowSupportRequestDialog(false);
        setSelectedSupportRequest(null);
        setSupportResponse("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send response",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending the response",
        variant: "destructive"
      });
    }
  };

  const handleInterviewDetailsSubmit = async () => {
    if (!pendingStatusUpdate) return;
    
    const { id, status } = pendingStatusUpdate;
    
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/hr/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify({
          status: 'interviewed',
          interviewDate: interviewDetails.interviewDate,
          interviewTime: interviewDetails.interviewTime,
          interviewLocation: interviewDetails.interviewLocation,
          interviewLink: interviewDetails.interviewLink
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh applications list
        try {
          const refreshed = await fetch('/api/hr/applications', { headers: { 'Authorization': `Bearer ${adminAuth.token}` }, cache: 'no-store' });
          const data = await refreshed.json();
          if (data?.data) setApplications(data.data);
        } catch {}
        
        toast({
          title: "Success",
          description: "Interview scheduled successfully",
        });
        
        // Reset and close dialog
        setShowInterviewDialog(false);
        setPendingStatusUpdate(null);
        setInterviewDetails({
          interviewDate: '',
          interviewTime: '10:00',
          interviewLocation: 'Remote',
          interviewLink: ''
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to schedule interview",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: "Error",
        description: "An error occurred while scheduling the interview",
        variant: "destructive"
      });
    }
  };

  const handleAddHRUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/admin/hr-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify(newHRUser),
      });

      const result = await response.json();

      if (result.success) {
        setNewHRUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          company: "",
          phone: ""
        });
        setShowHRDialog(false);
        await fetchData();
        toast({
          title: "Success",
          description: "HR user created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create HR user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating HR user:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the HR user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHRUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this HR user?')) {
      return;
    }

    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/hr-users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminAuth.token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // Refresh just jobs list instead of full dashboard
        try {
          const refreshed = await fetch('/api/hr/jobs', { headers: { 'Authorization': `Bearer ${adminAuth.token}` }, cache: 'no-store' });
          const data = await refreshed.json();
          if (data?.data) setJobs(data.data);
        } catch {}
        toast({
          title: "Success",
          description: "HR user deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete HR user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting HR user:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the HR user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateHRUserStatus = async (status: string) => {
    if (!editingHRUser) return;
    
    setIsLoading(true);
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/hr-users/${editingHRUser._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditHRStatusDialog(false);
        await fetchData();
        toast({
          title: "Success",
          description: `HR user status updated to ${status}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update HR user status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating HR user status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the HR user status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setEditingHRUser(null);
    }
  };

  // COURSE HANDLER FUNCTIONS
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setNewCourse({
          title: "",
          description: "",
          author: "",
          level: "beginner",
          thumbnailUrl: "",
          isPublished: false,
          sections: []
        });
        setShowCourseDialog(false);
        await fetchData();
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create course",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating the course",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse({...course});
    setCurrentTab("edit-course");
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminAuth.token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // Refresh courses list without full reload
        try {
          const refreshed = await fetch('/api/courses?page=1&limit=12', { headers: { 'Authorization': `Bearer ${adminAuth.token}` }, cache: 'no-store' });
          const data = await refreshed.json();
          if (Array.isArray(data)) setCourses(data);
          else if (data?.data) setCourses(data.data);
        } catch {}
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete course",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the course",
        variant: "destructive"
      });
    }
  };

  const handleAddSection = () => {
    if (!editingCourse) return;
    
    const newSection: Section = {
      title: `Section ${(editingCourse.sections?.length || 0) + 1}`,
      order: (editingCourse.sections?.length || 0) + 1,
      lessons: [],
    };
    
    setCurrentSection(newSection);
    setShowSectionDialog(true);
  };

  const handleSaveSection = () => {
    if (!editingCourse || !currentSection) return;
    
    const updatedCourse = {...editingCourse};
    if (selectedSectionIndex >= 0) {
      // Update existing section
      updatedCourse.sections[selectedSectionIndex] = currentSection;
    } else {
      // Add new section
      updatedCourse.sections.push(currentSection);
    }
    
    setEditingCourse(updatedCourse);
    setCurrentSection(null);
    setSelectedSectionIndex(-1);
    setShowSectionDialog(false);
  };

  const handleEditSection = (index: number) => {
    if (!editingCourse || !editingCourse.sections) return;
    setCurrentSection({...editingCourse.sections[index]});
    setSelectedSectionIndex(index);
    setShowSectionDialog(true);
  };

  const handleDeleteSection = (index: number) => {
    if (!editingCourse || !editingCourse.sections) return;
    if (!confirm('Are you sure you want to delete this section and all its lessons?')) {
      return;
    }
    
    const updatedCourse = {...editingCourse};
    updatedCourse.sections.splice(index, 1);
    
    // Reorder remaining sections
    updatedCourse.sections = updatedCourse.sections.map((section, idx) => ({
      ...section,
      order: idx + 1
    }));
    
    setEditingCourse(updatedCourse);
  };

  const handleAddLesson = (sectionIndex: number) => {
    if (!editingCourse || !editingCourse.sections) return;
    
    const section = editingCourse.sections[sectionIndex];
    if (!section) return;
    
    const newLesson: Lesson = {
      title: `Lesson ${(section.lessons?.length || 0) + 1}`,
      videoId: "",
      order: (section.lessons?.length || 0) + 1,
      isPreview: false,
    };
    
    setCurrentLesson(newLesson);
    setSelectedSectionIndex(sectionIndex);
    setSelectedLessonIndex(-1);
    setShowLessonDialog(true);
  };

  const handleSaveLesson = () => {
    if (!editingCourse || !currentLesson || selectedSectionIndex < 0) return;
    
    const updatedCourse = {...editingCourse};
    if (selectedLessonIndex >= 0) {
      // Update existing lesson
      updatedCourse.sections[selectedSectionIndex].lessons[selectedLessonIndex] = currentLesson;
    } else {
      // Add new lesson
      updatedCourse.sections[selectedSectionIndex].lessons.push(currentLesson);
    }
    
    setEditingCourse(updatedCourse);
    setCurrentLesson(null);
    setSelectedLessonIndex(-1);
    setShowLessonDialog(false);
  };

  const handleEditLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!editingCourse || !editingCourse.sections) return;
    
    const section = editingCourse.sections[sectionIndex];
    if (!section || !section.lessons) return;
    
    setCurrentLesson({...section.lessons[lessonIndex]});
    setSelectedSectionIndex(sectionIndex);
    setSelectedLessonIndex(lessonIndex);
    setShowLessonDialog(true);
  };

  const handleDeleteLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!editingCourse || !editingCourse.sections) return;
    const section = editingCourse.sections[sectionIndex];
    if (!section || !section.lessons) return;
    
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    const updatedCourse = {...editingCourse};
    updatedCourse.sections[sectionIndex].lessons.splice(lessonIndex, 1);
    
    // Reorder remaining lessons
    updatedCourse.sections[sectionIndex].lessons = updatedCourse.sections[sectionIndex].lessons.map((lesson, idx) => ({
      ...lesson,
      order: idx + 1
    }));
    
    setEditingCourse(updatedCourse);
  };

  const handleSaveCourse = async () => {
    if (!editingCourse) return;
    
    setIsLoading(true);
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const courseId = editingCourse._id;
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify(editingCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        await fetchData();
        setCurrentTab("courses");
        setEditingCourse(null);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update course",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating the course",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishCourse = async (id: string, currentStatus: boolean) => {
    try {
      let adminAuth = null;
      try {
        const adminAuthStr = localStorage.getItem("adminAuth");
        if (adminAuthStr) {
          adminAuth = JSON.parse(adminAuthStr);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      if (!adminAuth) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/courses/${id}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuth.token}`
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        await fetchData();
        toast({
          title: "Success",
          description: !currentStatus ? "Course published successfully" : "Course unpublished successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update course status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating the course status",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header with Logo */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img 
                src="/ajlogo.jpg" 
                alt="AJ Academy Logo" 
                className="h-10 w-10 rounded-md shadow-sm"
              />
              <h1 className="text-xl font-bold text-blue-600">AJ Academy Admin</h1>
            </div>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="md:w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
              <nav className="space-y-1">
                <Button 
                  variant={currentTab === "dashboard" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentTab("dashboard")}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant={currentTab === "gallery" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentTab("gallery")}
                >
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Gallery
                </Button>
                <Button 
                  variant={currentTab === "courses" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentTab("courses")}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Courses
                </Button>
                <Button 
                  variant={currentTab === "jobs" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentTab("jobs")}
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  Jobs
                </Button>
                <Button 
                  variant={currentTab === "certificates" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => router.push('/admin/certificates')}
                >
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Certificates
                </Button>
                <Button 
                  variant={currentTab === "applications" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentTab("applications")}
                >
                  <Book className="h-5 w-5 mr-2" />
                  Applications
                </Button>
                <Button 
                  variant={currentTab === "hr-users" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentTab("hr-users")}
                >
                  <UserCog className="h-5 w-5 mr-2" />
                  HR Users
                </Button>
                <Button 
                  variant={currentTab === "support" ? "default" : "ghost"} 
                  className="w-full justify-start mb-1"
                  onClick={() => setCurrentTab("support")}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Support Requests
                </Button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Dashboard Tab */}
              {currentTab === "dashboard" && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
                    <p className="text-blue-700">Key metrics and analytics</p>
                  </div>
                
                  {/* StatsCard components for key metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard 
                      title="Gallery Images" 
                      value={galleryTotal.toString()}
                      icon={<ImageIcon className="h-5 w-5" />}
                      variant="blue"
                      trend={{ value: 12, isPositive: true }}
                    />
                    
                    <StatsCard 
                      title="Active Jobs" 
                      value={jobStats.activeJobs.toString()}
                      icon={<Briefcase className="h-5 w-5" />}
                      variant="green"
                      trend={{ value: 5, isPositive: true }}
                    />
                    
                    <StatsCard 
                      title="Total Applications" 
                      value={jobStats.applications.toString()}
                      icon={<Users className="h-5 w-5" />}
                      variant="purple"
                      trend={{ value: 18, isPositive: true }}
                    />
                    
                    <StatsCard 
                      title="New Candidates" 
                      value={jobStats.newApplications.toString()}
                      icon={<TrendingUp className="h-5 w-5" />}
                      variant="orange"
                      trend={{ value: 8, isPositive: true }}
                    />
                  </div>
                  
                  {/* Dashboard Charts */}
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <DashboardCharts 
                      jobStats={jobStats}
                      applicationsData={applicationTrends.length > 0 ? applicationTrends : undefined}
                      galleryStats={{ 
                        totalImages: galleryImages.length,
                        byCategory: galleryImages.reduce((acc, img) => {
                          const category = img.category || 'other';
                          if (!acc[category]) acc[category] = 0;
                          acc[category]++;
                          return acc;
                        }, {} as Record<string, number>)
                      }}
                      hrStats={{
                        totalHRs: hrUsers.length,
                        activeHRs: hrUsers.filter(hr => hr.status && hr.status.toLowerCase() === 'active').length
                      }}
                    />
                  )}
                </>
              )}
              
              {/* Gallery Tab */}
              {currentTab === "gallery" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-blue-900">Gallery Manager</h1>
                      <p className="text-blue-700">Add and manage gallery images</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingId(null);
                        setNewImage({
                          title: "",
                          description: "",
                          category: "campus" as const,
                          tags: [],
                          url: "",
                          image: "",
                          photographer: "",
                          featured: false,
                          isGoogleDriveImage: true,
                          googleDriveId: "",
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        });
                        setNewTag("");
                        setShowAddImageDialog(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add New Image
                    </Button>
                  </div>
                  
                  {/* Gallery Images Grid */}
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : galleryImages.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No images yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by adding a new image to the gallery.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {galleryImages.map((image) => {
                        const rawUrl = image.imageUrl || image.url || image.image || image.googleDriveId || "";
                        let imageUrl = rawUrl;
                        let isGoogleDrive = false;
                        if (/^[a-zA-Z0-9_-]{25,}$/.test(rawUrl)) {
                          imageUrl = `https://drive.google.com/file/d/${rawUrl}/preview`;
                          isGoogleDrive = true;
                        } else if (rawUrl.includes('drive.google.com/file/d/')) {
                          imageUrl = rawUrl;
                          isGoogleDrive = true;
                        }
                        return (
                          <Card key={image._id || image.id} className="overflow-hidden">
                            <div className="aspect-video relative">
                              {isGoogleDrive ? (
                                <iframe
                                  src={imageUrl}
                                  title={image.title}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0, borderRadius: '12px', minHeight: '200px', background: '#f8fafc' }}
                                  allow="autoplay"
                                />
                              ) : (
                                <img src={imageUrl} alt={image.title} className="object-cover w-full h-full" />
                              )}
                              {image.featured && (
                                <Badge className="absolute top-2 right-2 bg-yellow-500">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{image.title}</CardTitle>
                              <CardDescription>{image.category}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="text-sm text-gray-500 line-clamp-2">{image.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(image.tags || []).map((tag, index) => (
                                  <Badge key={index} className="bg-blue-100 text-blue-700 text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                            <div className="px-6 pb-4 flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(image._id || image.id || '')}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-200 hover:bg-red-50" 
                                onClick={() => handleDeleteImage(image._id || image.id || '')}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" disabled={galleryPage<=1} onClick={() => setGalleryPage(p => Math.max(1, p-1))}>Previous</Button>
                        <span className="text-sm text-gray-600">Page {galleryPage} of {galleryTotalPages}</span>
                        <Button variant="outline" size="sm" disabled={galleryPage>=galleryTotalPages} onClick={() => setGalleryPage(p => Math.min(galleryTotalPages, p+1))}>Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Jobs Tab */}
              {currentTab === "jobs" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-blue-900">Jobs Manager</h1>
                      <p className="text-blue-700">Add and manage job listings</p>
                    </div>
                    <Button
                      onClick={() => {
                        setNewJob({
                          title: "",
                          company: "",
                          location: "",
                          employmentType: "full-time",
                          description: "",
                          requirements: [],
                          responsibilities: [],
                          salary: "",
                          applicationDeadline: "",
                          status: "active"
                        });
                        setNewRequirement("");
                        setNewResponsibility("");
                        setShowJobDialog(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Post New Job
                    </Button>
                  </div>
                  
                  {/* Jobs List */}
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by posting a new job listing.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map(job => (
                        <Card key={job._id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-6">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                  <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                                </div>
                                <Badge className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="mt-2 flex items-center">
                                <Badge variant="outline" className="mr-2">{job.employmentType}</Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="mt-3">
                                <span className="text-blue-600 font-medium text-sm">
                                  {job.applicationsCount || 0} Applications
                                </span>
                              </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 flex md:flex-col justify-end items-center space-y-0 md:space-y-2 space-x-2 md:space-x-0">
                              <Button variant="outline" size="sm" className="w-full">
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteJob(job._id)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Applications Tab */}
              {currentTab === "applications" && (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-blue-900">Applications Manager</h1>
                    <p className="text-blue-700">View and manage job applications</p>
                  </div>
                  
                  {/* Applications List */}
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <Book className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Applications will appear here once candidates apply for jobs.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Candidate
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Job
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Applied On
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {applications.map((application) => (
                            <tr key={application._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {application.candidateName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {application.candidateEmail}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{application.jobTitle}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  application.status === 'review' ? 'bg-blue-100 text-blue-800' :
                                  application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                                  application.status === 'hired' ? 'bg-green-100 text-green-800' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(application.appliedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <select
                                    className="rounded border border-gray-300 text-sm px-2 py-1"
                                    value={application.status}
                                    onChange={(e) => handleUpdateApplicationStatus(application._id, e.target.value)}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="interviewed">Interview</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedApplication(application);
                                      setShowApplicationDetails(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
              
              {/* Support Requests Tab */}
              {currentTab === "support" && (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-blue-900">Support Requests</h1>
                    <p className="text-blue-700">View and manage customer support requests</p>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : supportRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No support requests yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Support requests will appear here when customers contact you.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Message
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {supportRequests.map((request) => (
                            <tr key={request._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{request.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{request.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate">{request.message}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <select
                                    className="rounded border border-gray-300 text-sm px-2 py-1"
                                    value={request.status}
                                    onChange={(e) => handleUpdateSupportRequestStatus(request._id, e.target.value)}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                  </select>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSupportRequest(request);
                                      setSupportResponse(request.adminResponse || "");
                                      setShowSupportRequestDialog(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
              
              {/* HR Users Tab */}
              {currentTab === "hr-users" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-blue-900">HR Users Manager</h1>
                      <p className="text-blue-700">Add and manage HR user accounts</p>
                    </div>
                    <Button
                      onClick={() => {
                        setNewHRUser({
                          firstName: "",
                          lastName: "",
                          email: "",
                          password: "",
                          company: "",
                          phone: ""
                        });
                        setShowHRDialog(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserCog className="w-4 h-4 mr-2" />
                      Add HR User
                    </Button>
                  </div>
                  
                  {/* HR Users List */}
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : hrUsers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <UserCog className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No HR users yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by adding an HR user account.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email & Phone
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Company
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {hrUsers.map((user) => (
                            <tr key={user._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.company}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status && user.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                                  user.status && user.status.toLowerCase() === 'suspended' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()) : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                      setEditingHRUser(user);
                                      setShowEditHRStatusDialog(true);
                                    }}
                                  >
                                    <LockIcon className="h-3 w-3 mr-1" />
                                    Status
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleDeleteHRUser(user._id)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
              
              {/* Courses Tab */}
              {currentTab === "courses" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-blue-900">Course Manager</h1>
                      <p className="text-blue-700">Create and manage courses</p>
                    </div>
                    <Button
                      onClick={() => {
                        setNewCourse({
                          title: "",
                          description: "",
                          author: "",
                          level: "beginner",
                          thumbnailUrl: "",
                          isPublished: false,
                          sections: []
                        });
                        setShowCourseDialog(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Create New Course
                    </Button>
                  </div>
                  
                  {/* Courses List */}
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by creating a new course.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course) => (
                        <Card key={course._id} className="overflow-hidden">
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
                                <BookOpen className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                            <Badge 
                              className={`absolute top-2 right-2 ${
                                course.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {course.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription>{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                            <p className="text-sm text-blue-600 mt-2">
                              {course.sections?.length || 0} {(course.sections?.length || 0) === 1 ? 'section' : 'sections'} | 
                              {' '}{course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0} lessons
                            </p>
                            <p className="text-sm text-gray-500 mt-1">By {course.author}</p>
                          </CardContent>
                          <div className="px-6 pb-4 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={course.isPublished ? 'text-yellow-600 border-yellow-200' : 'text-green-600 border-green-200'}
                              onClick={() => handlePublishCourse(course._id || '', course.isPublished)}
                            >
                              {course.isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                            <div className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditCourse(course)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-200 hover:bg-red-50" 
                                onClick={() => handleDeleteCourse(course._id || '')}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Edit Course Tab */}
              {currentTab === "edit-course" && editingCourse && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-blue-900">Edit Course: {editingCourse.title}</h1>
                      <p className="text-blue-700">Add sections and lessons to your course</p>
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentTab("courses")}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveCourse}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save Course
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Course Details Panel */}
                    <Card className="md:col-span-1">
                      <CardHeader>
                        <CardTitle>Course Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={editingCourse.title}
                              onChange={(e) => setEditingCourse(prev => ({...prev!, title: e.target.value}))}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                              id="description"
                              value={editingCourse.description}
                              onChange={(e) => setEditingCourse(prev => ({...prev!, description: e.target.value}))}
                              className="w-full min-h-[100px] p-2 border rounded-md mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="author">Author</Label>
                            <Input
                              id="author"
                              value={editingCourse.author}
                              onChange={(e) => setEditingCourse(prev => ({...prev!, author: e.target.value}))}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="level">Level</Label>
                            <select
                              id="level"
                              value={editingCourse.level}
                              onChange={(e) => setEditingCourse(prev => ({...prev!, level: e.target.value as 'beginner' | 'intermediate' | 'advanced'}))}
                              className="w-full p-2 border rounded-md mt-1"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                          
                          <div>
                            <Label htmlFor="thumbnailUrl">Thumbnail URL (Google Drive ID)</Label>
                            <Input
                              id="thumbnailUrl"
                              value={editingCourse.thumbnailUrl}
                              onChange={(e) => setEditingCourse(prev => ({...prev!, thumbnailUrl: e.target.value}))}
                              className="mt-1"
                            />
                          </div>
                          
                          {editingCourse.thumbnailUrl && (
                            <div className="aspect-video relative bg-gray-100 rounded-md overflow-hidden">
                              <GoogleDriveImage
                                url={editingCourse.thumbnailUrl}
                                aspectRatio="video"
                                className="w-full h-full object-cover"
                                isGoogleDriveImage={true}
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPublished"
                              checked={editingCourse.isPublished}
                              onChange={(e) => setEditingCourse(prev => ({...prev!, isPublished: e.target.checked}))}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="isPublished">Published</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Course Content Panel */}
                    <Card className="md:col-span-2">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Course Content</CardTitle>
                        <Button
                          size="sm"
                          onClick={handleAddSection}
                        >
                          Add Section
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {editingCourse.sections?.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <BookOpen className="h-8 w-8 mx-auto text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No sections yet</h3>
                            <p className="mt-1 text-xs text-gray-500">Get started by adding a section to your course.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {editingCourse.sections?.map((section, sectionIndex) => (
                              <div key={sectionIndex} className="border rounded-md">
                                <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                                  <div>
                                    <h3 className="font-medium">{section.title}</h3>
                                    {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleEditSection(sectionIndex)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="text-red-600" 
                                      onClick={() => handleDeleteSection(sectionIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="p-4">
                                  {(section.lessons?.length === 0) ? (
                                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                      <p className="text-sm text-gray-500">No lessons yet. Add your first lesson.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {section.lessons?.map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                          <div className="flex items-center space-x-3">
                                            <span className="text-gray-400 text-sm">{lessonIndex + 1}.</span>
                                            <div>
                                              <p className="font-medium">{lesson.title}</p>
                                              {lesson.isPreview && <Badge variant="outline" className="text-xs">Preview</Badge>}
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Button 
                                              size="sm" 
                                              variant="ghost"
                                              onClick={() => handleEditLesson(sectionIndex, lessonIndex)}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="ghost" 
                                              className="text-red-600" 
                                              onClick={() => handleDeleteLesson(sectionIndex, lessonIndex)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <Button 
                                    className="mt-4 w-full" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleAddLesson(sectionIndex)}
                                  >
                                    Add Lesson
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Image Dialog */}
        <Dialog open={showAddImageDialog} onOpenChange={setShowAddImageDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Image' : 'Add New Image'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update image details' : 'Add a new image to the gallery'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingId ? handleSaveEdit : handleAddImage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newImage.title}
                  onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newImage.description}
                  onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={newImage.category}
                  onChange={(e) => setNewImage(prev => ({
                    ...prev,
                    category: e.target.value as typeof GALLERY_CATEGORIES[number]
                  }))}
                  required
                >
                  {GALLERY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Google Drive Image ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    value={newImage.url}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewImage(prev => ({ 
                        ...prev, 
                        url: value,
                        image: value,
                        googleDriveId: value
                      }))
                    }}
                    placeholder="Enter Google Drive File ID"
                    required
                  />
                </div>
              </div>

              {/* Image Preview Section */}
              {newImage.url && (
                <div className="space-y-2">
                  <Label>Image Preview</Label>
                  <div className="rounded-md overflow-hidden border border-gray-200">
                    <GoogleDriveImage
                      url={newImage.url}
                      aspectRatio="video"
                      className="h-[200px]"
                      isGoogleDriveImage={true}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="photographer">Photographer</Label>
                <Input
                  id="photographer"
                  value={newImage.photographer}
                  onChange={(e) => setNewImage(prev => ({ ...prev, photographer: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newImage.tags.map((tag, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newImage.featured}
                  onChange={(e) => setNewImage(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="featured">Featured Image</Label>
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Save Changes' : 'Add Image'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Job Dialog */}
        <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post New Job</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new job listing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newJob.company}
                  onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newJob.location}
                  onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <select
                  id="employmentType"
                  value={newJob.employmentType}
                  onChange={(e) => setNewJob(prev => ({ ...prev, employmentType: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newRequirement.trim()) {
                          setNewJob(prev => ({
                            ...prev,
                            requirements: [...prev.requirements, newRequirement.trim()]
                          }));
                          setNewRequirement("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newRequirement.trim()) {
                        setNewJob(prev => ({
                          ...prev,
                          requirements: [...prev.requirements, newRequirement.trim()]
                        }));
                        setNewRequirement("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newJob.requirements.map((req, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700">
                      {req}
                      <button
                        type="button"
                        onClick={() => {
                          setNewJob(prev => ({
                            ...prev,
                            requirements: prev.requirements.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Responsibilities</Label>
                <div className="flex gap-2">
                  <Input
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="Add a responsibility"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newResponsibility.trim()) {
                          setNewJob(prev => ({
                            ...prev,
                            responsibilities: [...prev.responsibilities, newResponsibility.trim()]
                          }));
                          setNewResponsibility("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newResponsibility.trim()) {
                        setNewJob(prev => ({
                          ...prev,
                          responsibilities: [...prev.responsibilities, newResponsibility.trim()]
                        }));
                        setNewResponsibility("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newJob.responsibilities.map((resp, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700">
                      {resp}
                      <button
                        type="button"
                        onClick={() => {
                          setNewJob(prev => ({
                            ...prev,
                            responsibilities: prev.responsibilities.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  value={newJob.salary}
                  onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g., $50,000 - $70,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={newJob.applicationDeadline}
                  onChange={(e) => setNewJob(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Post Job
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add HR User Dialog */}
        <Dialog open={showHRDialog} onOpenChange={setShowHRDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New HR User</DialogTitle>
              <DialogDescription>
                Create a new HR user account with login credentials
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddHRUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newHRUser.firstName}
                    onChange={(e) => setNewHRUser(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newHRUser.lastName}
                    onChange={(e) => setNewHRUser(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newHRUser.email}
                  onChange={(e) => setNewHRUser(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newHRUser.password}
                  onChange={(e) => setNewHRUser(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newHRUser.company}
                  onChange={(e) => setNewHRUser(prev => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newHRUser.phone}
                  onChange={(e) => setNewHRUser(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create HR User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit HR User Status Dialog */}
        <Dialog open={showEditHRStatusDialog} onOpenChange={setShowEditHRStatusDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit HR User Status</DialogTitle>
              <DialogDescription>
                Update the status of the selected HR user
              </DialogDescription>
            </DialogHeader>
            {editingHRUser && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateHRUserStatus(editingHRUser.status);
              }} className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="font-medium text-base">{editingHRUser.firstName} {editingHRUser.lastName}</h3>
                    <p className="text-sm text-gray-600">{editingHRUser.email}</p>
                    <p className="text-sm text-gray-600">{editingHRUser.company} • {editingHRUser.phone}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={editingHRUser.status || ""}
                      onChange={(e) => {
                        if (editingHRUser) {
                          setEditingHRUser({
                            ...editingHRUser,
                            status: e.target.value as "active" | "inactive"
                          });
                        }
                      }}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                    <p>Active HR users can log in and manage job listings and applications.</p>
                    <p>Inactive HR users cannot log in to the system.</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowEditHRStatusDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Update Status
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add/Edit Course Dialog */}
        <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Enter the basic details for your course
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Course Title</Label>
                <Input
                  id="course-title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Introduction to Web Development"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-description">Description</Label>
                <textarea
                  id="course-description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Provide a detailed description of your course"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-author">Author</Label>
                <Input
                  id="course-author"
                  value={newCourse.author}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-level">Level</Label>
                <select
                  id="course-level"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={newCourse.level}
                  onChange={(e) => setNewCourse(prev => ({
                    ...prev,
                    level: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                  }))}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-thumbnail">Thumbnail URL (Google Drive ID)</Label>
                <Input
                  id="course-thumbnail"
                  value={newCourse.thumbnailUrl}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  placeholder="Enter Google Drive File ID for thumbnail"
                  required
                />
              </div>

              {/* Image Preview Section */}
              {newCourse.thumbnailUrl && (
                <div className="space-y-2">
                  <Label>Thumbnail Preview</Label>
                  <div className="rounded-md overflow-hidden border border-gray-200">
                    <GoogleDriveImage
                      url={newCourse.thumbnailUrl}
                      aspectRatio="video"
                      className="h-[200px]"
                      isGoogleDriveImage={true}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Course
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Section Dialog */}
        <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedSectionIndex >= 0 ? 'Edit Section' : 'Add New Section'}</DialogTitle>
              <DialogDescription>
                {selectedSectionIndex >= 0 ? 'Update section details' : 'Create a new section for your course'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-title">Section Title</Label>
                <Input
                  id="section-title"
                  value={currentSection?.title || ''}
                  onChange={(e) => setCurrentSection(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="e.g., Getting Started"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-description">Description (Optional)</Label>
                <textarea
                  id="section-description"
                  value={currentSection?.description || ''}
                  onChange={(e) => setCurrentSection(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief description of what this section covers"
                />
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentSection(null);
                    setSelectedSectionIndex(-1);
                    setShowSectionDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveSection}
                >
                  {selectedSectionIndex >= 0 ? 'Update Section' : 'Add Section'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Lesson Dialog */}
        <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedLessonIndex >= 0 ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
              <DialogDescription>
                {selectedLessonIndex >= 0 ? 'Update lesson details' : 'Create a new lesson for your course'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  value={currentLesson?.title || ''}
                  onChange={(e) => setCurrentLesson(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="e.g., Introduction to HTML"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-video">Video ID (Google Drive)</Label>
                <Input
                  id="lesson-video"
                  value={currentLesson?.videoId || ''}
                  onChange={(e) => setCurrentLesson(prev => prev ? { ...prev, videoId: e.target.value } : null)}
                  placeholder="Enter Google Drive File ID for the video"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-description">Description (Optional)</Label>
                <textarea
                  id="lesson-description"
                  value={currentLesson?.description || ''}
                  onChange={(e) => setCurrentLesson(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief description of what this lesson covers"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  value={currentLesson?.duration || ''}
                  onChange={(e) => setCurrentLesson(prev => prev ? { ...prev, duration: Number(e.target.value) } : null)}
                  placeholder="e.g., 15"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lesson-preview"
                  checked={currentLesson?.isPreview || false}
                  onChange={(e) => setCurrentLesson(prev => prev ? { ...prev, isPreview: e.target.checked } : null)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="lesson-preview">Make this lesson available as a preview</Label>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentLesson(null);
                    setSelectedSectionIndex(-1);
                    setSelectedLessonIndex(-1);
                    setShowLessonDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveLesson}
                >
                  {selectedLessonIndex >= 0 ? 'Update Lesson' : 'Add Lesson'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Interview Scheduling Dialog */}
        <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Enter interview details for this candidate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="interview-date">Interview Date</Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={interviewDetails.interviewDate}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, interviewDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-time">Interview Time</Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={interviewDetails.interviewTime}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, interviewTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-location">Location</Label>
                <Input
                  id="interview-location"
                  placeholder="e.g., Remote, Office Address"
                  value={interviewDetails.interviewLocation}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, interviewLocation: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-link">Meeting Link (Optional)</Label>
                <Input
                  id="interview-link"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={interviewDetails.interviewLink}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, interviewLink: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowInterviewDialog(false);
                setPendingStatusUpdate(null);
                setInterviewDetails({
                  interviewDate: '',
                  interviewTime: '10:00',
                  interviewLocation: 'Remote',
                  interviewLink: ''
                });
              }}>
                Cancel
              </Button>
              <Button onClick={handleInterviewDetailsSubmit} disabled={!interviewDetails.interviewDate || !interviewDetails.interviewLocation}>
                Schedule Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Application Details Dialog */}
        <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                View candidate application information
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Candidate Name</Label>
                    <p className="text-sm font-medium">{selectedApplication.candidateName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Email</Label>
                    <p className="text-sm font-medium">{selectedApplication.candidateEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Job Title</Label>
                    <p className="text-sm font-medium">{selectedApplication.jobTitle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Applied On</Label>
                    <p className="text-sm font-medium">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Status</Label>
                    <Badge className={
                      selectedApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedApplication.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      selectedApplication.status === 'interviewed' ? 'bg-purple-100 text-purple-800' :
                      selectedApplication.status === 'hired' ? 'bg-green-100 text-green-800' :
                      selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {selectedApplication.interviewDate && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Interview Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(selectedApplication.interviewDate).toLocaleDateString()}</span>
                      </div>
                      {selectedApplication.interviewTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{selectedApplication.interviewTime}</span>
                        </div>
                      )}
                      {selectedApplication.interviewLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedApplication.interviewLocation}</span>
                        </div>
                      )}
                      {selectedApplication.interviewLink && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Link:</span>
                          <a href={selectedApplication.interviewLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedApplication.resume && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Resume</Label>
                    <div className="mt-2">
                      <a 
                        href={selectedApplication.resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Resume
                      </a>
                    </div>
                  </div>
                )}

                {selectedApplication.coverLetter && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Cover Letter</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplicationDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Support Request Details Dialog */}
        <Dialog open={showSupportRequestDialog} onOpenChange={setShowSupportRequestDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Support Request Details</DialogTitle>
              <DialogDescription>
                View and respond to the support request
              </DialogDescription>
            </DialogHeader>
            {selectedSupportRequest && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Name</Label>
                    <p className="text-sm font-medium">{selectedSupportRequest.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Email</Label>
                    <p className="text-sm font-medium">{selectedSupportRequest.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Status</Label>
                    <Badge className={
                      selectedSupportRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSupportRequest.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      selectedSupportRequest.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedSupportRequest.status.charAt(0).toUpperCase() + selectedSupportRequest.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Date</Label>
                    <p className="text-sm font-medium">{new Date(selectedSupportRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-500">Message</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSupportRequest.message}</p>
                  </div>
                </div>

                {selectedSupportRequest.adminResponse && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Previous Response</Label>
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSupportRequest.adminResponse}</p>
                      {selectedSupportRequest.respondedBy && (
                        <p className="text-xs text-gray-500 mt-2">
                          Responded by: {selectedSupportRequest.respondedBy.firstName} {selectedSupportRequest.respondedBy.lastName}
                          {selectedSupportRequest.respondedAt && ` on ${new Date(selectedSupportRequest.respondedAt).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="support-response" className="text-sm font-semibold text-gray-500">Admin Response</Label>
                  <Textarea
                    id="support-response"
                    className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    rows={6}
                    value={supportResponse}
                    onChange={(e) => setSupportResponse(e.target.value)}
                    placeholder="Enter your response to the support request..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowSupportRequestDialog(false);
                setSelectedSupportRequest(null);
                setSupportResponse("");
              }}>
                Close
              </Button>
              <Button onClick={handleSupportRequestResponse} disabled={!supportResponse.trim()}>
                Send Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthGuard>
  );
} 