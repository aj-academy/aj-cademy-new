"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { HelpCircle, ChevronDown, Search } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const faqs = [
  {
    category: "General",
    questions: [
      {
        question: "How do I enroll in a course?",
        answer: "You can enroll by visiting the Courses page, selecting your desired course, and clicking the Enroll button. Make sure you're signed in to your account. If you don't have an account, you can create one for free."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, and UPI payments. All transactions are secure and encrypted for your safety."
      },
      {
        question: "Can I access courses on mobile devices?",
        answer: "Yes! All our courses are fully responsive and can be accessed on any device - desktop, tablet, or mobile. You can learn on the go, anytime, anywhere."
      },
      {
        question: "How long do I have access to a course?",
        answer: "Once enrolled, you have lifetime access to the course materials. You can revisit the content, download resources, and access updates at any time."
      }
    ]
  },
  {
    category: "Support & Contact",
    questions: [
      {
        question: "How do I contact support?",
        answer: "You can contact support via the Support page, by emailing support@ajacademy.co.in, or by using the chatbot on our website. We typically respond within 24 hours."
      },
      {
        question: "What are your support hours?",
        answer: "Our support team is available Monday through Friday, 9 AM to 6 PM IST. For urgent matters, please use the emergency contact option on the Support page."
      },
      {
        question: "Can I get help with course content?",
        answer: "Absolutely! You can reach out to course instructors through the course discussion forum, or contact our support team for assistance with any course-related questions."
      }
    ]
  },
  {
    category: "Policies",
    questions: [
      {
        question: "Can I transfer my enrollment to another course?",
        answer: "Yes, you can transfer your enrollment to another course of equal or lesser value within 30 days of purchase. Contact support for assistance with course transfers."
      },
      {
        question: "What happens if I can't complete a course?",
        answer: "You have lifetime access to all enrolled courses, so you can complete them at your own pace. If you need additional time or have questions, feel free to contact our support team."
      }
    ]
  },
  {
    category: "Account & Access",
    questions: [
      {
        question: "How do I reset my password?",
        answer: "Click on 'Forgot Password' on the login page, enter your email address, and you'll receive a password reset link. Make sure to check your spam folder if you don't see the email."
      },
      {
        question: "Can I share my account with others?",
        answer: "No, account sharing is not allowed. Each account is for individual use only. Sharing accounts violates our Terms of Service and may result in account suspension."
      },
      {
        question: "How do I update my profile information?",
        answer: "You can update your profile information by going to your Dashboard and clicking on 'Profile Settings'. From there, you can edit your personal information, change your password, and update your preferences."
      }
    ]
  }
]

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

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
              <HelpCircle className="h-3.5 w-3.5" />
              Frequently Asked Questions
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Find answers to common questions about our courses, enrollment, and support
            </p>
            
            {/* Search Bar */}
            <motion.div
              className="relative max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* FAQs Content */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        {filteredFAQs.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or browse by category</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <Card className="border-blue-100 shadow-lg">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                      <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                      {category.category}
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem
                          key={index}
                          value={`item-${categoryIndex}-${index}`}
                          className="border-b border-blue-100"
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-4">
                            <span className="text-lg font-semibold text-blue-900 pr-4">
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-blue-700 leading-relaxed pt-2 pb-4">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Still Have Questions Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
                Still have questions?
              </h2>
              <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our support team is here to help you.
              </p>
              <motion.a
                href="/support"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
                <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              </motion.a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
