# Toast Notification Implementation Guide

This guide provides examples of how to implement standardized toast notifications across different parts of the application.

## Getting Started

1. Import the required toast utilities:

```tsx
import { 
  showSuccessToast, 
  showErrorToast, 
  adminToasts, 
  hrToasts, 
  jobSeekerToasts, 
  studentToasts 
} from '@/lib/toast-utils';
```

2. Use the appropriate toast functions based on the user type and action.

## Admin Examples

### Admin Login

```tsx
// Import the required toast utilities
import { adminToasts } from '@/lib/toast-utils';

const handleLogin = async (credentials) => {
  try {
    const response = await api.admin.login(credentials);
    
    if (response.success) {
      // Show success notification
      adminToasts.login.success();
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } else {
      // Show error notification
      adminToasts.login.error(response.error);
    }
  } catch (error) {
    adminToasts.login.error("Failed to connect to server");
  }
};
```

### Creating HR Account

```tsx
import { adminToasts } from '@/lib/toast-utils';

const createHRAccount = async (data) => {
  try {
    const response = await api.admin.createHR(data);
    
    if (response.success) {
      // Show success notification
      adminToasts.hrManagement.created();
      
      // Refresh HR list
      fetchHRList();
    } else {
      adminToasts.general.error(response.error);
    }
  } catch (error) {
    adminToasts.general.error("Failed to create HR account");
  }
};
```

## HR Examples

### Job Management

```tsx
import { hrToasts } from '@/lib/toast-utils';

// Creating a new job
const createJob = async (jobData) => {
  try {
    const response = await api.hr.createJob(jobData);
    
    if (response.success) {
      hrToasts.jobs.created();
      closeModal();
      refreshJobList();
    } else {
      showErrorToast("Job Creation Failed", response.error);
    }
  } catch (error) {
    showErrorToast("Error", "Failed to connect to server");
  }
};

// Updating application status
const updateApplicationStatus = async (applicationId, newStatus) => {
  try {
    const response = await api.hr.updateApplicationStatus(applicationId, newStatus);
    
    if (response.success) {
      hrToasts.applications.statusUpdated(newStatus);
      refreshApplications();
    } else {
      showErrorToast("Update Failed", response.error);
    }
  } catch (error) {
    showErrorToast("Error", "Failed to update application status");
  }
};
```

## Job Seeker Examples

### Profile Management

```tsx
import { jobSeekerToasts } from '@/lib/toast-utils';

// Updating profile
const updateProfile = async (profileData) => {
  try {
    const response = await api.jobSeeker.updateProfile(profileData);
    
    if (response.success) {
      jobSeekerToasts.profile.updated();
    } else {
      showErrorToast("Update Failed", response.error);
    }
  } catch (error) {
    showErrorToast("Error", "Failed to update profile");
  }
};

// Applying for a job
const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await api.jobSeeker.applyForJob(jobId, applicationData);
    
    if (response.success) {
      jobSeekerToasts.applications.submitted();
      closeModal();
      router.push('/jobseeker/dashboard/applications');
    } else {
      showErrorToast("Application Failed", response.error);
    }
  } catch (error) {
    showErrorToast("Error", "Failed to submit application");
  }
};
```

## Student Examples

### Course Enrollment 

```tsx
import { studentToasts } from '@/lib/toast-utils';

const enrollInCourse = async (courseId) => {
  try {
    const response = await api.student.enrollInCourse(courseId);
    
    if (response.success) {
      studentToasts.courses.enrolled(response.data.courseName);
      refreshCourseList();
    } else {
      showErrorToast("Enrollment Failed", response.error);
    }
  } catch (error) {
    showErrorToast("Error", "Failed to enroll in course");
  }
};

// Submitting an assignment
const submitAssignment = async (assignmentId, submissionData) => {
  try {
    const response = await api.student.submitAssignment(assignmentId, submissionData);
    
    if (response.success) {
      studentToasts.assignments.submitted();
      router.push('/student/dashboard/assignments');
    } else {
      showErrorToast("Submission Failed", response.error);
    }
  } catch (error) {
    showErrorToast("Error", "Failed to submit assignment");
  }
};
```

## Implementation Checklist

When adding toast notifications to a new component:

1. Import the appropriate toast utilities at the top of the file
2. Replace direct `toast()` calls with the appropriate toast utility function
3. Ensure consistent messaging for similar actions across the application
4. Use error toasts for error conditions and success toasts for successful operations

## Toast Duration

The default toast display duration is set to 5 seconds (5000ms). You can adjust this by modifying the `TOAST_REMOVE_DELAY` constant in `frontend/components/ui/use-toast.ts`. 