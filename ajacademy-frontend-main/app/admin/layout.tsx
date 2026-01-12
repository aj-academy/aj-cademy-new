import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "@/app/globals.css"
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: "AJ Academy - Admin Panel",
  description: "Admin dashboard for AJ Academy",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/ajlogo.jpg', type: 'image/jpeg' }
    ],
    apple: '/ajlogo.jpg',
  },
}

// This is a nested layout for admin pages, not a complete replacement
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Admin content without site header and footer */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
