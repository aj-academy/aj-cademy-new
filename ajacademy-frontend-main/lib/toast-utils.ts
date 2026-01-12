import { toast } from "@/components/ui/use-toast";

/**
 * Toast notification utilities organized by user type
 */

// General toast messages
export const showSuccessToast = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "success",
  });
};

export const showErrorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

// Admin toast messages
export const adminToasts = {
  login: {
    success: () => showSuccessToast("Admin Login Successful", "Welcome back to the admin dashboard"),
    error: (message: string = "Please check your credentials and try again") => 
      showErrorToast("Login Failed", message)
  },
  hrManagement: {
    created: () => showSuccessToast("HR Account Created", "New HR account has been successfully created"),
    updated: () => showSuccessToast("HR Account Updated", "HR account details have been updated"),
    deleted: () => showSuccessToast("HR Account Deleted", "HR account has been removed from the system")
  },
  gallery: {
    uploaded: () => showSuccessToast("Image Uploaded", "Image has been successfully added to the gallery"),
    deleted: () => showSuccessToast("Image Deleted", "Image has been removed from the gallery")
  },
  general: {
    saved: (item: string) => showSuccessToast("Changes Saved", `${item} has been successfully saved`),
    deleted: (item: string) => showSuccessToast("Item Deleted", `${item} has been removed`),
    error: (message: string) => showErrorToast("Error", message)
  }
};

// HR toast messages
export const hrToasts = {
  login: {
    success: () => showSuccessToast("HR Login Successful", "Welcome back to the HR dashboard"),
    error: (message: string = "Please check your credentials and try again") => 
      showErrorToast("Login Failed", message)
  },
  jobs: {
    created: () => showSuccessToast("Job Created", "New job listing has been successfully posted"),
    updated: () => showSuccessToast("Job Updated", "Job listing details have been updated"),
    deleted: () => showSuccessToast("Job Deleted", "Job listing has been removed")
  },
  applications: {
    statusUpdated: (status: string) => showSuccessToast(
      "Application Updated", 
      `Application status has been updated to ${status}`
    ),
    interviewScheduled: () => showSuccessToast(
      "Interview Scheduled",
      "Interview details have been saved and candidate will be notified"
    )
  },
  candidates: {
    contacted: () => showSuccessToast("Candidate Contacted", "Message has been sent to the candidate"),
    added: () => showSuccessToast("Candidate Added", "New candidate has been added to the database")
  }
};

// Job Seeker toast messages
export const jobSeekerToasts = {
  auth: {
    login: () => showSuccessToast("Login Successful", "Welcome back to your job seeker account"),
    register: () => showSuccessToast("Registration Complete", "Your job seeker account has been created"),
    logout: () => showSuccessToast("Logout Successful", "You have been logged out of your account")
  },
  profile: {
    updated: () => showSuccessToast("Profile Updated", "Your profile information has been saved"),
    resumeUploaded: () => showSuccessToast("Resume Uploaded", "Your resume has been successfully uploaded")
  },
  applications: {
    submitted: () => showSuccessToast("Application Submitted", "Your job application has been sent successfully"),
    withdrawn: () => showSuccessToast("Application Withdrawn", "Your application has been withdrawn")
  }
};

// Student toast messages
export const studentToasts = {
  auth: {
    login: () => showSuccessToast("Login Successful", "Welcome back to your student account"),
    register: () => showSuccessToast("Registration Complete", "Your student account has been created"),
    logout: () => showSuccessToast("Logout Successful", "You have been logged out of your account"),
    passwordReset: () => showSuccessToast("Password Reset", "Check your email for instructions")
  },
  courses: {
    enrolled: (courseName: string) => showSuccessToast("Enrollment Successful", `You have enrolled in ${courseName}`),
    completed: (courseName: string) => showSuccessToast("Course Completed", `You have completed ${courseName}`)
  },
  assignments: {
    submitted: () => showSuccessToast("Assignment Submitted", "Your assignment has been submitted successfully"),
    graded: () => showSuccessToast("Assignment Graded", "A new assignment has been graded")
  },
  profile: {
    updated: () => showSuccessToast("Profile Updated", "Your profile information has been saved")
  }
}; 