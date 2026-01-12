"use client"

import { ToastTest } from "@/components/toast-test"

export default function ToastTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Toast Notification System Test</h1>
      <div className="border rounded-lg p-6 bg-gray-50">
        <ToastTest />
      </div>
    </div>
  )
} 