"use client"

import Link from "next/link"
import Image from "next/image"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin
} from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <Link href="/" className="flex items-center justify-center sm:justify-start mb-4">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 mr-2">
                <Image 
                  src="/ajlogo.jpg" 
                  alt="AJ Academy Logo" 
                  width={40} 
                  height={40}
                  className="rounded-md"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">AJAcademy</span>
            </Link>
            <p className="text-blue-200 mb-4 text-sm sm:text-base">
              Empowering careers through education, mentorship, and opportunities.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a href="#" className="text-blue-300 hover:text-white transition-colors">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">
                <Linkedin size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/job-portal" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  Job Portal
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  Courses
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faqs" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-blue-300 hover:text-white text-sm sm:text-base transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start justify-center sm:justify-start">
                <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                  AJAcademy, 14D, Nehru St, near Arabindo school, Srinivasa Nagar, Friends Nagar, Mangadu, Chennai, Tamil Nadu 600122.
                </span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                <span className="text-blue-200 text-sm sm:text-base">+91 93614 89738</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                <span className="text-blue-200 text-xs sm:text-sm break-all">businessmanager@ajacademy.co.in</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-900 mt-8 sm:mt-10 pt-4 sm:pt-6 text-center">
          <p className="text-blue-300 text-sm sm:text-base">
            © {new Date().getFullYear()} AJAcademy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
