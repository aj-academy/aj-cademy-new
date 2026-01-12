"use client"

import { useState, useEffect } from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function CustomToaster() {
  const { toasts } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Return null during SSR to avoid hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bottom-0 right-0">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="bottom-0 right-0 fixed flex flex-col p-4 gap-2 w-full md:max-w-[420px]" />
    </ToastProvider>
  )
}

export default CustomToaster; 