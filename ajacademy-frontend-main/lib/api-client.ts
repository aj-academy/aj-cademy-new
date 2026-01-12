/**
 * API Client for AJ Academy
 * This module provides a centralized way to communicate with the backend API
 */

import {
  Course,
  Announcement,
  GalleryImage,
  Recruiter,
  Job,
  User,
  LoginCredentials,
  RegisterCredentials,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  JobSeeker,
  Student,
  Enrollment,
  Project
} from './types';

// AuthResponse interface for login response
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    role?: string;
  }
}

// Get the appropriate API URL based on environment
const getApiBaseUrl = () => {
  // Always use environment variable if available
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    console.warn('NEXT_PUBLIC_BACKEND_URL not set, using fallback');
    return 'http://localhost:5000';
  }
  
  // Fallback for production
  console.warn('NEXT_PUBLIC_BACKEND_URL not set, using production fallback');
  return 'https://api.ajacademy.co.in';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Get the current user authentication token
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }
  }
  
  // Fallbacks
  return null; // Don't use fallbacks to prevent confusion
}

/**
 * Get HR authentication token from storage
 */
function getHrToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hrToken');
}

/**
 * Get admin authentication token from storage
 */
function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Admin token is stored inside the adminAuth object
  const adminAuthStr = localStorage.getItem('adminAuth');
  if (adminAuthStr) {
    try {
      const adminAuth = JSON.parse(adminAuthStr);
      if (adminAuth && adminAuth.token) {
        console.log("Found admin token:", adminAuth.token.substring(0, 10) + '...');
        return adminAuth.token;
      } else {
        console.log("Admin auth exists but has no token property");
      }
    } catch (error) {
      console.error('Error parsing admin auth:', error);
    }
  } else {
    console.log("No adminAuth found in localStorage");
  }
  
  // Fallbacks
  return null; // Don't use fallbacks to prevent confusion
}

/**
 * Wrapper function to handle API requests
 */
export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // Determine if we're running in the browser
  const isClient = typeof window !== 'undefined';
  
  // Always use absolute URLs for HR routes to bypass Next.js API route handling
  // This ensures HR requests go directly to the backend server
  let url;
  if (isClient && (endpoint.startsWith('/hr/') || endpoint.includes('/hr/'))) {
    // For HR routes, always use the backend API directly
    const apiPath = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    url = `${API_BASE_URL}${apiPath}`;
    console.log('HR API request using direct backend URL:', url);
  } else if (isClient) {
    // For client-side requests, check if we should use direct API
    // If in production or NEXT_PUBLIC_API_DIRECT=true, use direct API URL
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_API_DIRECT === 'true') {
      // In production, use the base URL from environment to avoid Next.js API routes
      const apiPath = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      url = `${API_BASE_URL}${apiPath}`;
      console.log('Production client-side API request using direct URL:', url);
    } else {
      // In development, use relative URLs (Next.js API routes)
      url = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      console.log('Development client-side API request using relative URL:', url);
    }
  } else {
    // In server-side code, use the full URL including domain
    const apiPath = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    url = `${API_BASE_URL}${apiPath}`;
    console.log('Server-side API request using absolute URL:', url);
  }
  
  console.log(`API Request: ${options.method || 'GET'} ${url}`)

  // Determine which auth token to use based on the endpoint
  let authToken = null;
  if (endpoint.startsWith('/hr') || endpoint.includes('/hr/')) {
    authToken = getHrToken();
    console.log('Using HR token for request:', endpoint);
  } else if (endpoint.startsWith('/admin') || endpoint.includes('/admin/')) {
    authToken = getAdminToken();
  } else {
    authToken = getAuthToken();
  }

  // Setup headers
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Add auth token if available
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    console.log(`Fetching from: ${url}`)
    console.time(`API call to ${endpoint}`)
    
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    console.timeEnd(`API call to ${endpoint}`)
    console.log(`API Response status: ${response.status} for ${url}`)

    // Check if the response is valid JSON
    let data: any
    try {
      const responseText = await response.text()
      console.log(`Response text (first 150 chars): ${responseText.substring(0, 150)}${responseText.length > 150 ? '...' : ''}`)
      
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error(`Failed to parse JSON response from ${url}:`, jsonError)
        console.error('Raw response:', responseText)
        return {
          data: null,
          error: 'Invalid JSON response from server'
        }
      }
    } catch (textError) {
      console.error(`Failed to get response text from ${url}:`, textError)
      return {
        data: null,
        error: 'Failed to read response from server'
      }
    }

    if (!response.ok) {
      console.error(`API Error (${response.status}):`, data)
      return {
        data: null,
        error: data.message || data.error || `Server error: ${response.status}`
      }
    }

    return {
      data: data as T,
      error: undefined
    }
  } catch (error) {
    console.error(`Network error when calling ${url}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error occurred'
    }
  }
}

// Helper function to handle API errors
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

// Export API functions organized by domain
export const api = {
  // Courses
  courses: {
    getAll: () => fetchAPI<ApiResponse<Course[]>>('/api/courses'),
    getById: (id: string) => fetchAPI<ApiResponse<Course>>(`/api/courses/${id}`),
    create: (data: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<Course>>('/api/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Course>) => 
      fetchAPI<ApiResponse<Course>>(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/courses/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Student methods
  student: {
    getDashboard: () => fetchAPI<any>('/api/student/dashboard'),
    getEnrollments: () => fetchAPI<Enrollment[]>('/api/courses/user/enrolled'),
    // The backend returns { success, data }
    getProfile: () => fetchAPI<{ success: boolean; data: Student }>('/api/student/profile'),
    updateProfile: (data: Partial<Student>) => 
      fetchAPI<Student>('/api/student/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  
  // Announcements
  announcements: {
    getAll: () => fetchAPI<ApiResponse<Announcement[]>>('/api/announcements'),
    getById: (id: string) => fetchAPI<ApiResponse<Announcement>>(`/api/announcements/${id}`),
    create: (data: Omit<Announcement, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<Announcement>>('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Announcement>) => 
      fetchAPI<ApiResponse<Announcement>>(`/api/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/announcements/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Gallery Images
  galleryImages: {
    getAll: () => fetchAPI<ApiResponse<GalleryImage[]>>('/api/galleryImages'),
    getById: (id: string) => fetchAPI<ApiResponse<GalleryImage>>(`/api/galleryImages/${id}`),
    create: (data: Omit<GalleryImage, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<GalleryImage>>('/api/galleryImages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<GalleryImage>) => 
      fetchAPI<ApiResponse<GalleryImage>>(`/api/galleryImages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/galleryImages/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Recruiters
  recruiters: {
    getAll: () => fetchAPI<ApiResponse<Recruiter[]>>('/api/recruiters'),
    getById: (id: string) => fetchAPI<ApiResponse<Recruiter>>(`/api/recruiters/${id}`),
    create: (data: Omit<Recruiter, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<Recruiter>>('/api/recruiters', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Recruiter>) => 
      fetchAPI<ApiResponse<Recruiter>>(`/api/recruiters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/recruiters/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Jobs
  jobs: {
    getAll: () => fetchAPI<ApiResponse<Job[]>>('/api/jobs'),
    getById: (id: string) => fetchAPI<ApiResponse<Job>>(`/api/jobs/${id}`),
    create: (data: Omit<Job, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<Job>>('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Job>) => 
      fetchAPI<ApiResponse<Job>>(`/api/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/jobs/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Users
  users: {
    getAll: () => fetchAPI<ApiResponse<User[]>>('/api/users'),
    getById: (id: string) => fetchAPI<ApiResponse<User>>(`/api/users/${id}`),
    create: (data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<User>>('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<User>) => 
      fetchAPI<ApiResponse<User>>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/users/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Login Credentials
  loginCredentials: {
    getAll: () => fetchAPI<ApiResponse<LoginCredentials[]>>('/api/loginCredentials'),
    getById: (id: string) => fetchAPI<ApiResponse<LoginCredentials>>(`/api/loginCredentials/${id}`),
    create: (data: Omit<LoginCredentials, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<LoginCredentials>>('/api/loginCredentials', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<LoginCredentials>) => 
      fetchAPI<ApiResponse<LoginCredentials>>(`/api/loginCredentials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/loginCredentials/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Register Credentials
  registerCredentials: {
    getAll: () => fetchAPI<ApiResponse<RegisterCredentials[]>>('/api/registerCredentials'),
    getById: (id: string) => fetchAPI<ApiResponse<RegisterCredentials>>(`/api/registerCredentials/${id}`),
    create: (data: Omit<RegisterCredentials, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<RegisterCredentials>>('/api/registerCredentials', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<RegisterCredentials>) => 
      fetchAPI<ApiResponse<RegisterCredentials>>(`/api/registerCredentials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/registerCredentials/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Dashboard Stats
  dashboardStats: {
    getAll: () => fetchAPI<ApiResponse<DashboardStats[]>>('/api/dashboardStats'),
    getById: (id: string) => fetchAPI<ApiResponse<DashboardStats>>(`/api/dashboardStats/${id}`),
    create: (data: Omit<DashboardStats, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<DashboardStats>>('/api/dashboardStats', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<DashboardStats>) => 
      fetchAPI<ApiResponse<DashboardStats>>(`/api/dashboardStats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/dashboardStats/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Paginated Responses
  paginatedResponses: {
    getAll: () => fetchAPI<ApiResponse<PaginatedResponse<unknown>[]>>('/api/paginatedResponses'),
    getById: (id: string) => fetchAPI<ApiResponse<PaginatedResponse<unknown>>>(`/api/paginatedResponses/${id}`),
    create: (data: Omit<PaginatedResponse<unknown>, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<PaginatedResponse<unknown>>>('/api/paginatedResponses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<PaginatedResponse<unknown>>) => 
      fetchAPI<ApiResponse<PaginatedResponse<unknown>>>(`/api/paginatedResponses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/paginatedResponses/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // API Errors
  apiErrors: {
    getAll: () => fetchAPI<ApiResponse<ApiError[]>>('/api/apiErrors'),
    getById: (id: string) => fetchAPI<ApiResponse<ApiError>>(`/api/apiErrors/${id}`),
    create: (data: Omit<ApiError, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<ApiError>>('/api/apiErrors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<ApiError>) => 
      fetchAPI<ApiResponse<ApiError>>(`/api/apiErrors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/apiErrors/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // Gallery
  gallery: {
    getAll: (page = 1, limit = 20) => fetchAPI(`/api/gallery?page=${page}&limit=${limit}`),
    getById: (id: string) => fetchAPI<ApiResponse<GalleryImage>>(`/api/galleryImages/${id}`),
    create: (data: Omit<GalleryImage, '_id' | 'createdAt' | 'updatedAt'>) => 
      fetchAPI<ApiResponse<GalleryImage>>('/api/galleryImages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<GalleryImage>) => 
      fetchAPI<ApiResponse<GalleryImage>>(`/api/galleryImages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/api/galleryImages/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // HR related functions
  hr: {
    // Get leads (jobseekers)
    getLeads: (params: {
      name?: string;
      skills?: string;
      education?: string;
      experience?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params.name) queryParams.append('name', params.name);
      if (params.skills) queryParams.append('skills', params.skills);
      if (params.education) queryParams.append('education', params.education);
      if (params.experience) queryParams.append('experience', params.experience);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      return fetchAPI<ApiResponse<PaginatedResponse<JobSeeker>>>(`/hr/leads${queryString ? `?${queryString}` : ''}`);
    },
    
    // Get candidate details
    getCandidate: (id: string) => fetchAPI<ApiResponse<JobSeeker>>(`/hr/candidates/${id}`),
    
    // Get all candidates
    getCandidates: (params: {
      name?: string;
      skills?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params.name) queryParams.append('name', params.name);
      if (params.skills) queryParams.append('skills', params.skills);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      return fetchAPI<ApiResponse<PaginatedResponse<JobSeeker>>>(`/hr/candidates${queryString ? `?${queryString}` : ''}`);
    },
    
    // Add candidate to shortlist or mark candidate status
    updateCandidateStatus: (id: string, status: string) => 
      fetchAPI<ApiResponse<JobSeeker>>(`/hr/candidates/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    
    // Login for HR
    login: (credentials: LoginCredentials) => 
      fetchAPI<ApiResponse<AuthResponse>>('/hr/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
      
    // Logout for HR
    logout: () => 
      fetchAPI<ApiResponse<void>>('/hr/auth/logout', {
        method: 'POST',
      }),
      
    // Job related methods
    getJobById: (id: string) => fetchAPI<ApiResponse<Job>>(`/hr/jobs/${id}`),
    
    createJob: (data: Partial<Job>) => 
      fetchAPI<ApiResponse<Job>>('/hr/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      
    updateJob: (id: string, data: Partial<Job>) => 
      fetchAPI<ApiResponse<Job>>(`/hr/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      
    deleteJob: (id: string) => 
      fetchAPI<ApiResponse<void>>(`/hr/jobs/${id}`, {
        method: 'DELETE',
      }),
      
    getAllJobs: (params?: {
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      return fetchAPI<ApiResponse<PaginatedResponse<Job>>>(`/hr/jobs${queryString ? `?${queryString}` : ''}`);
    },

    // Add this function for HR dashboard stats
    getDashboardStats: () => fetchAPI<ApiResponse<any>>('/api/hr/dashboard/stats'),
  },

  // Projects
  projects: {
    listPublic: () => fetchAPI<Project[]>('/api/projects'),
    listMine: () => fetchAPI<Project[]>('/api/projects/me'),
    create: (data: {
      projectName: string;
      description: string;
      githubUrl: string;
      technologies: string[] | string;
      readmeUrl?: string;
      isPublished?: boolean;
    }) => fetchAPI<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
}