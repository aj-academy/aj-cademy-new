"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  avatar: string
  content: string
}

export function TestimonialCarousel() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Harish K.",
      role: "MBA Aspirant",
      company: "",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "The CAT coaching here is excellent. They focus on time management, short tricks, and personalized feedback. I never thought I could enjoy Quant this much!",
    },
    {
      id: 2,
      name: "Divya Lakshmi R.",
      role: "BBA",
      company: "",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "From resume building to mock interviews, AJ Academy prepared me for the real world. The sessions are interactive and focused on industry expectations.",
    },
    {
      id: 3,
      name: "Surya P.",
      role: "B.Com (CA)",
      company: "",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "The way accounting and business law were taught made the concepts crystal clear. AJ Academy bridges the gap between classroom knowledge and practical applications.",
    },
    {
      id: 4,
      name: "Meena Kumari S.",
      role: "MBA Marketing",
      company: "",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "I was struggling with data interpretation and business analytics. The faculty here simplified everything and made me confident to handle analytics during my internship.",
    },
    {
      id: 5,
      name: "Vignesh V.",
      role: "MBA Systems",
      company: "",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "The MS Excel advanced training was a game-changer. Pivot tables, dashboards, formulas – everything was taught clearly. I now use Excel daily in my internship!",
    },
    {
      id: 6,
      name: "Abinaya R.",
      role: "B.Com PA",
      company: "",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "The Tally & Excel combo course helped me get certified and confident in handling accounts practically. Highly recommended for commerce students!",
    },
    {
      id: 7,
      name: "Prakash M.",
      role: "MBA Finance",
      company: "",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "They taught financial modeling using Excel in a very structured way. Case-based sessions and assignments made it easy to understand real-world finance applications.",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const nextTestimonial = () => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  return (
    <div className="relative overflow-hidden py-12 px-4 md:px-0">
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900">What Our Students Say</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              onClick={nextTestimonial}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] md:h-[250px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 h-full flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
                      <Quote className="h-6 w-6 text-white" />
                    </div>
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-xl">
                        {testimonials[currentIndex].name.split(" ")[0][0]}
                        {testimonials[currentIndex].name.split(" ")[1]?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-blue-700 italic mb-6">{testimonials[currentIndex].content}</p>
                  <div>
                    <h3 className="font-bold text-blue-900">{testimonials[currentIndex].name}</h3>
                    <p className="text-sm text-blue-600">
                      {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full mx-1 ${index === currentIndex ? "bg-blue-600" : "bg-blue-200"}`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
