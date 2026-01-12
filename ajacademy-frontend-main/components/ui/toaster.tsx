"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Log when toast state changes
    if (toasts.length > 0) {
      console.log('Toast state updated:', toasts)
    }
  }, [toasts])

  // Return null during SSR to avoid hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className="z-[100] bg-white rounded-md border border-gray-200 shadow-lg p-6"
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-sm font-semibold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-100 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 w-full max-w-[420px]" />
    </ToastProvider>
  )
}
