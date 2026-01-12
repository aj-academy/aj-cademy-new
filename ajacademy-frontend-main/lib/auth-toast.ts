export type AuthToastType = 
  | "login-success" 
  | "login-error" 
  | "google-login-success" 
  | "google-login-error"
  | "signup-success" 
  | "signup-error" 
  | "google-signup-success" 
  | "google-signup-error"
  | "logout-success"
  | "password-reset-sent"
  | "password-reset-error"
  | "password-change-success"
  | "password-change-error"
  | "session-expired"
  | "session-error"

type ToastFunction = (options: { title: string; description: string; variant?: "default" | "destructive" }) => void

// Helper function to show consistent auth-related toast notifications
export const showAuthToast = (toast: ToastFunction, type: AuthToastType, customMessage?: string) => {
  switch (type) {
    case "login-success":
      toast({
        title: "Logged In",
        description: customMessage || "You have successfully logged in.",
      })
      break
    case "login-error":
      toast({
        title: "Login Failed",
        description: customMessage || "Please check your credentials and try again.",
        variant: "destructive",
      })
      break
    case "google-login-success":
      toast({
        title: "Logged In",
        description: customMessage || "You have successfully logged in with Google.",
      })
      break
    case "google-login-error":
      toast({
        title: "Google Login Failed",
        description: customMessage || "There was a problem logging in with Google.",
        variant: "destructive",
      })
      break
    case "signup-success":
      toast({
        title: "Account Created",
        description: customMessage || "Your account has been created successfully!",
      })
      break
    case "signup-error":
      toast({
        title: "Signup Failed",
        description: customMessage || "There was a problem creating your account.",
        variant: "destructive",
      })
      break
    case "google-signup-success":
      toast({
        title: "Account Created",
        description: customMessage || "Your account has been created with Google!",
      })
      break
    case "google-signup-error":
      toast({
        title: "Google Signup Failed",
        description: customMessage || "There was a problem creating your account with Google.",
        variant: "destructive",
      })
      break
    case "logout-success":
      toast({
        title: "Logged Out",
        description: customMessage || "You have been successfully logged out.",
      })
      break
    case "password-reset-sent":
      toast({
        title: "Reset Email Sent",
        description: customMessage || "Password reset instructions have been sent to your email.",
      })
      break
    case "password-reset-error":
      toast({
        title: "Reset Failed",
        description: customMessage || "There was a problem sending password reset instructions.",
        variant: "destructive",
      })
      break
    case "password-change-success":
      toast({
        title: "Password Changed",
        description: customMessage || "Your password has been changed successfully.",
      })
      break
    case "password-change-error":
      toast({
        title: "Password Change Failed",
        description: customMessage || "There was a problem changing your password.",
        variant: "destructive",
      })
      break
    case "session-expired":
      toast({
        title: "Session Expired",
        description: customMessage || "Your session has expired. Please log in again.",
        variant: "destructive",
      })
      break
    case "session-error":
      toast({
        title: "Authentication Error",
        description: customMessage || "There was a problem with your session. Please log in again.",
        variant: "destructive",
      })
      break
    default:
      toast({
        title: "Notice",
        description: customMessage || "An action has been completed.",
      })
  }
} 