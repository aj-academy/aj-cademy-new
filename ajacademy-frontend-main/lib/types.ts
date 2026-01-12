// Course types
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  reviews: number;
  duration: number;
  price: number;
  originalPrice: number;
  tag?: string;
  image: string;
  category: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

// Announcement types
export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

import { GalleryCategory } from './constants';

// Gallery types
export interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  tags: string[];
  url: string;
  imageUrl?: string;
  photographer: string;
  featured?: boolean;
  isGoogleDriveImage?: boolean;
  googleDriveId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Recruiter types
export interface Recruiter {
  _id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  createdAt: string;
  updatedAt: string;
}

// Job types
export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  description: string;
  requirements: string[];
  responsibilities?: string[];
  salary?: string;
  applicationDeadline?: string;
  status: 'draft' | 'active' | 'closed' | 'filled';
  applicationsCount: number;
  postedBy?: string;
  recruiter?: {
    _id: string;
    firstName: string;
    lastName: string;
    company: string;
    companyLogo?: string;
    companyWebsite?: string;
    companyDescription?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'hr' | 'recruiter';
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// HR Dashboard types
export interface DashboardStats {
  applications: number;
  interviews: number;
  offers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  hiredCandidates: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Project {
  _id: string;
  userId: string;
  projectName: string;
  description: string;
  githubUrl: string;
  technologies: string[];
  readmeUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: 'student' | 'admin' | 'hr' | 'recruiter';
  profilePicture?: string;
  phone?: string;
  source?: string;
  profile?: StudentProfile;
}

export interface StudentProfile {
  bio?: string;
  education?: string;
  skills?: string[];
  experience?: string;
  interests?: string[];
  resume?: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: 'pending' | 'reviewed' | 'interviewed' | 'rejected' | 'hired';
  appliedAt: string;
  updatedAt: string;
  resume: string;
  coverLetter?: string;
}

// JobSeeker interface for HR purposes
export interface JobSeeker {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  skills: string[]
  education: {
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    current?: boolean
  }[]
  experience: {
    company?: string
    position?: string
    description?: string
    startDate?: string
    endDate?: string
    current?: boolean
    isFresher?: boolean
  }[]
  status?: 'new' | 'contacted' | 'interviewing' | 'shortlisted' | 'hired' | 'rejected'
  createdAt: string
  updatedAt?: string
}

// Add the Enrollment interface
export interface Enrollment {
  _id: string
  courseId: {
    _id: string
    title: string
    slug: string
    thumbnailUrl: string
    sections: {
      _id: string
      title: string
      lessons: {
        _id: string
        title: string
      }[]
    }[]
  }
  enrolledAt: string
  completionPercentage: number
  lastAccessedAt: string
} 