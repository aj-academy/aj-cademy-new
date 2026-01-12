"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden px-2 py-2 text-blue-900 hover:bg-blue-50">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[280px] sm:w-[320px]">
        <SheetHeader className="border-b pb-4 mb-6">
          <SheetTitle>
            <Link 
              href="/" 
              className="flex items-center"
              onClick={() => setOpen(false)}
            >
              <div className="relative w-10 h-10 mr-3">
                <Image 
                  src="/ajlogo.jpg" 
                  alt="AJ Academy Logo" 
                  width={40} 
                  height={40}
                  className="rounded-md"
                />
              </div>
              <span className="text-xl font-bold text-blue-600">AJAcademy</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-2">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-blue-600 font-medium px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/job-portal" 
            className="text-gray-700 hover:text-blue-600 font-medium px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            onClick={() => setOpen(false)}
          >
            Job Portal
          </Link>
          <Link 
            href="/gallery" 
            className="text-gray-700 hover:text-blue-600 font-medium px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            onClick={() => setOpen(false)}
          >
            Gallery
          </Link>
          <Link 
            href="/courses" 
            className="text-gray-700 hover:text-blue-600 font-medium px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            onClick={() => setOpen(false)}
          >
            Courses
          </Link>
          <Link 
            href="/projects" 
            className="text-gray-700 hover:text-blue-600 font-medium px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            onClick={() => setOpen(false)}
          >
            Projects
          </Link>
          <Link 
            href="/contact" 
            className="text-gray-700 hover:text-blue-600 font-medium px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
          <div className="border-t pt-6 mt-6 flex flex-col space-y-3 px-4">
            <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-3 text-base">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 py-3 text-base">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
} 