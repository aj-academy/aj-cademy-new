"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, CheckCircle, Send, MessageSquare, Clock, HeadphonesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitted(true)
        setFormData({ name: "", email: "", message: "" })
        toast({
          title: "Success!",
          description: "Your support request has been submitted successfully. We'll get back to you soon.",
          variant: "default",
        })
        setTimeout(() => {
          setSubmitted(false)
        }, 5000)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit support request. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      toast({
        title: "Error",
        description: "An error occurred while submitting your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
              <HeadphonesIcon className="h-3.5 w-3.5" />
              We're Here to Help
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Contact Support
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Have a question or need assistance? We're here to help you succeed.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-blue-100 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a href="mailto:ajacademy2819@gmail.com" className="text-blue-600 hover:text-blue-700">
                        ajacademy2819@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Phone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <a href="tel:+919361489738" className="text-blue-600 hover:text-blue-700">
                        +91 93614 89738
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                      <p className="text-gray-600">Chennai, India</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>We typically respond within 24 hours</span>
                    </div>
                    <div className="flex gap-4">
                      <motion.a
                        href="#"
                        className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Facebook className="h-5 w-5 text-blue-600" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Twitter className="h-5 w-5 text-blue-600" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Instagram className="h-5 w-5 text-blue-600" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Linkedin className="h-5 w-5 text-blue-600" />
                      </motion.a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Support Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-900">Send us a Message</CardTitle>
                  <p className="text-gray-600 mt-2">Fill out the form below and we'll get back to you as soon as possible.</p>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <motion.div
                      className="flex flex-col items-center justify-center py-16"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">Thank you!</h3>
                      <p className="text-lg text-blue-700 mb-1">Your message has been sent successfully.</p>
                      <p className="text-gray-600">We'll get back to you within 24 hours.</p>
                    </motion.div>
                  ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-semibold">Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-700 font-semibold">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help you?"
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          required
                        />
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="mr-2 h-5 w-5" />
                          {isLoading ? "Sending..." : "Send Message"}
                        </Button>
                      </motion.div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
