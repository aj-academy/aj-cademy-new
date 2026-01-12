"use client"

import { Button } from "@/components/ui/button"
import { 
  showSuccessToast, 
  showErrorToast,
  adminToasts,
  hrToasts,
  jobSeekerToasts,
  studentToasts
} from "@/lib/toast-utils"

export function ToastTest() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold mb-2">Test Toast Notifications</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={() => showSuccessToast("Success Message", "Operation completed successfully!")}
          variant="outline"
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          Show Success Toast
        </Button>
        
        <Button 
          onClick={() => showErrorToast("Error Message", "Something went wrong!")}
          variant="outline"
          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        >
          Show Error Toast
        </Button>
        
        <Button 
          onClick={() => hrToasts.login.success()}
          variant="outline"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          HR Login Success
        </Button>
        
        <Button 
          onClick={() => jobSeekerToasts.applications.submitted()}
          variant="outline"
          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
        >
          Job Application Submitted
        </Button>
        
        <Button 
          onClick={() => studentToasts.auth.login()}
          variant="outline"
          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
        >
          Student Login
        </Button>
      </div>
    </div>
  )
} 