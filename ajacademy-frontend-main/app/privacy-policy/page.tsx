"use client"

import React from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, FileText, Database, UserCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Information We Collect",
    content: [
      "We collect information that you provide directly to us, such as when you create an account, enroll in a course, or contact us for support.",
      "This includes your name, email address, phone number, payment information, and any other information you choose to provide.",
      "We also automatically collect certain information when you use our services, including your IP address, browser type, device information, and usage patterns."
    ]
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "How We Use Your Information",
    content: [
      "We use the information we collect to provide, maintain, and improve our services, including processing your enrollments and managing your account.",
      "We use your information to communicate with you about your account, courses, and important updates.",
      "We may use aggregated, anonymized data for analytics and to improve our platform's functionality and user experience."
    ]
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Data Security",
    content: [
      "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.",
      "All sensitive data, including payment information, is encrypted using secure socket layer (SSL) technology.",
      "We regularly review and update our security practices to ensure the highest level of protection for your data."
    ]
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Information Sharing",
    content: [
      "We do not sell, trade, or rent your personal information to third parties.",
      "We may share your information with trusted service providers who assist us in operating our platform, conducting our business, or serving our users, provided they agree to keep this information confidential.",
      "We may disclose your information if required by law or to protect our rights, property, or safety, or that of our users or others."
    ]
  },
  {
    icon: <UserCheck className="h-6 w-6" />,
    title: "Your Rights",
    content: [
      "You have the right to access, update, or delete your personal information at any time through your account settings.",
      "You can opt-out of receiving promotional communications from us by following the unsubscribe instructions in those messages.",
      "You may request a copy of your personal data or request that we delete your account and associated data by contacting our support team."
    ]
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Cookies and Tracking",
    content: [
      "We use cookies and similar tracking technologies to track activity on our platform and hold certain information.",
      "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
      "However, if you do not accept cookies, you may not be able to use some portions of our service."
    ]
  }
]

export default function PrivacyPolicyPage() {
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
              <Shield className="h-3.5 w-3.5" />
              Privacy & Security
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
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
                  At AJ Academy, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-800 text-sm">
                      <strong>Important:</strong> By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Policy Sections */}
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
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Questions About Privacy?</h2>
                <p className="text-gray-700 mb-6">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
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
