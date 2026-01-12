"use client"

import React from "react"
import { motion } from "framer-motion"
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, BookOpen, Users, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Acceptance of Terms",
    content: [
      "By accessing and using AJ Academy, you accept and agree to be bound by the terms and provision of this agreement.",
      "If you do not agree to abide by the above, please do not use this service.",
      "We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting."
    ]
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "User Accounts",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      "You agree to notify us immediately of any unauthorized use of your account or any other breach of security.",
      "You must be at least 13 years old to create an account. Users under 18 must have parental consent.",
      "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete."
    ]
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Use of Service",
    content: [
      "You agree to use the service only for lawful purposes and in accordance with these Terms of Service.",
      "You agree not to use the service to transmit any harmful code, viruses, or malicious software.",
      "You agree not to attempt to gain unauthorized access to any portion of the service or any other systems or networks connected to the service.",
      "You agree not to interfere with or disrupt the service or servers or networks connected to the service."
    ]
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Intellectual Property",
    content: [
      "All content on AJ Academy, including but not limited to text, graphics, logos, images, audio clips, and software, is the property of AJ Academy or its content suppliers and is protected by copyright laws.",
      "You may not reproduce, distribute, modify, create derivative works of, publicly display, or in any way exploit any of the content without our prior written permission.",
      "Course materials are provided for your personal, non-commercial use only. Sharing, reselling, or redistributing course content is strictly prohibited."
    ]
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: "Payment Terms",
    content: [
      "All course fees are due at the time of enrollment unless otherwise specified.",
      "Payment must be made through our secure payment gateway using accepted payment methods.",
      "All prices are in the currency specified and are subject to change without notice.",
      "We reserve the right to modify pricing for courses at any time, but changes will not affect already enrolled students."
    ]
  },
  {
    icon: <XCircle className="h-6 w-6" />,
    title: "Prohibited Conduct",
    content: [
      "You may not use the service to harass, abuse, or harm other users.",
      "You may not impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.",
      "You may not use the service to violate any local, state, national, or international law or regulation.",
      "You may not collect or store personal data about other users without their express permission."
    ]
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Termination",
    content: [
      "We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.",
      "Upon termination, your right to use the service will immediately cease.",
      "All provisions of these Terms of Service that by their nature should survive termination shall survive termination."
    ]
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Limitation of Liability",
    content: [
      "AJ Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.",
      "Our total liability to you for all claims arising from or related to the use of the service shall not exceed the amount you paid to us in the 12 months prior to the action giving rise to liability.",
      "Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitation may not apply to you."
    ]
  }
]

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 border-white/30 bg-white/10 backdrop-blur-sm mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Scale className="h-3.5 w-3.5" />
              Legal Information
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Please read these terms carefully before using our platform
            </p>
            <motion.p
              className="mt-6 text-sm text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-blue-100 shadow-lg">
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Welcome to AJ Academy. These Terms of Service ("Terms") govern your access to and use of our website, courses, and services. By using our platform, you agree to be bound by these Terms.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800 text-sm">
                      <strong>Important:</strong> If you do not agree to these Terms, you may not access or use our services. We recommend that you read these Terms carefully and keep a copy for your records.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-900">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {section.icon}
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Questions About Our Terms?</h2>
                <p className="text-gray-700 mb-6">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> <a href="mailto:ajacademy2819@gmail.com" className="text-blue-600 hover:text-blue-700">ajacademy2819@gmail.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:+919361489738" className="text-blue-600 hover:text-blue-700">+91 93614 89738</a></p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
