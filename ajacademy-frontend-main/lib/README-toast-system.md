# Toast Notification System

This document describes the standardized toast notification system implemented across AJ Academy's application.

## Overview

The toast notification system provides consistent, well-styled user feedback for all actions across the application. It's designed to give users immediate feedback for their actions while maintaining a consistent look and feel throughout all user roles (Admin, HR, Job Seeker, Student).

## Implementation

### Core Components

1. **Toast Component**: Based on Radix UI's Toast primitive, customized for AJ Academy's design system
2. **Toast Utils**: A comprehensive utility library providing standardized toast functions for all user types and actions
3. **Global Toaster**: Integrated in the root layout to display toast notifications throughout the application

### Toast Utils

The heart of the system is the `toast-utils.ts` file which contains:

- Generic success and error toast functions
- Role-specific toast functions organized by user type (admin, HR, job seeker, student)
- Action-specific toast functions within each user role (login, profile updates, job applications, etc.)

### Example Usage

```tsx
// Import the appropriate toast utilities
import { hrToasts, showErrorToast } from "@/lib/toast-utils";

// Show success notification for job creation
hrToasts.jobs.created();

// Show error notification
showErrorToast("Error Title", "Detailed error message");
```

## Benefits

1. **Consistency**: All notifications follow the same style and duration guidelines
2. **Maintainability**: Centralized management of notification content and styling
3. **DRY Code**: No repeated toast configuration across components
4. **User Experience**: Immediate feedback for all user actions

## Implementation Checklist

The following user roles and actions have been updated with the new toast system:

### HR Role
- [x] Login/Logout
- [x] Job Management (create, update, delete)
- [x] Application Status Management

### Job Seeker Role
- [x] Application Form
- [x] Resume Upload
- [x] Profile Management

### Student Role
- [x] Login (Traditional and Google)
- [ ] Course Enrollment
- [ ] Assignment Submission
- [ ] Profile Updates

### Admin Role
- [ ] HR Management
- [ ] Gallery Management
- [ ] General System Management

## Next Steps

1. Complete the implementation for all remaining user interactions
2. Review and standardize messaging across all user actions
3. Consider adding toast variants for different types of notifications (info, warning)

## Configuration

The toast display duration is set to 5 seconds (5000ms) in the `frontend/components/ui/use-toast.ts` file. This can be adjusted by modifying the `TOAST_REMOVE_DELAY` constant.

## Documentation

For detailed implementation examples, see the `frontend/doc/toast-implementation-examples.md` file. 