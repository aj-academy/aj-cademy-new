"use client";

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, ChevronRight, Users, Briefcase, Award, CheckCircle, Star, Image as ImageIcon, CircleCheckBig, Code2, ExternalLink, CalendarClock, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import GoogleDriveImage from "@/components/GoogleDriveImage"
import { SplashScreen } from "@/components/splash-screen"
import { extractGoogleDriveFileId } from "@/lib/utils"
import clsx from "clsx";

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TestimonialCarousel } from "@/components/testimonial-carousel"
import { api } from "@/lib/api-client"
import type { Project } from "@/lib/types"

// Gallery image type
interface GalleryImage {
  _id: string
  title: string
  description: string
  category: string
  tags: string[]
  url: string
  photographer: string
  featured?: boolean
  createdAt?: string
  updatedAt?: string
  image?: string
  googleDriveId?: string
  imageUrl?: string
}

// Helper to chunk array into rows of 8
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// Helper to chunk array into 3 rows as evenly as possible
function chunkIntoThree<T>(arr: T[]): T[][] {
  const result: T[][] = [[], [], []];
  arr.forEach((item, idx) => {
    result[idx % 3].push(item);
  });
  return result;
}

// Helper to repeat images until at least minCount
function repeatToLength<T>(arr: T[], minCount: number): T[] {
  if (arr.length === 0) return [];
  const result = [];
  while (result.length < minCount) {
    result.push(...arr);
  }
  return result.slice(0, minCount);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSplash, setShowSplash] = useState(true)

  // Dynamically get all college images from the public/colleges folder via API
  const [collegeImages, setCollegeImages] = useState<string[]>([]);
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Handle the completion of the splash screen
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const { clientX, clientY } = e
      const rect = heroRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      heroRef.current.style.setProperty("--mouse-x", `${x}px`)
      heroRef.current.style.setProperty("--mouse-y", `${y}px`)
    }

    const heroElement = heroRef.current
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  useEffect(() => {
    fetch("/api/colleges")
      .then(res => res.json())
      .then(setCollegeImages);
  }, []);

  // Fetch gallery images
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery?page=1&limit=8&t=${new Date().getTime()}`)
        const result = await response.json()
        
        if (result && Array.isArray(result.items)) {
          // Transform the data to match our GalleryImage interface
          const transformedImages = result.items.map((item: any) => ({
            _id: item._id,
            title: item.title,
            description: item.description || '',
            category: item.category || 'other',
            tags: item.tags || [],
            url: /^[a-zA-Z0-9_-]{25,33}$/.test(item.url) ? item.url : (item.imageUrl || item.image || ''),
            photographer: item.photographer || 'Unknown',
            featured: item.featured || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            image: item.image,
            googleDriveId: item.googleDriveId,
            imageUrl: item.imageUrl
          }))
          setGalleryImages(transformedImages)
          setError(null)
        } else {
          console.error('Invalid response format:', result)
          setGalleryImages([])
          setError('Invalid response format from server')
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error)
        setGalleryImages([])
        setError('Failed to connect to server')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGalleryImages()
  }, [])

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.projects.listPublic();
        const r: any = res;
        const list = Array.isArray(r?.data?.data)
          ? r.data.data
          : Array.isArray(r?.data)
          ? r.data
          : Array.isArray(r)
          ? r
          : [];
        // Get latest 6 projects
        setProjects((list as Project[]).slice(0, 6));
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Featured courses data
  // Not used currently, but keeping for later
  /*
  const featuredCourses = [
    {
      title: "Web Development Masterclass",
      description: "Learn modern web development with React, Node.js, and more.",
      instructor: "Sarah Johnson",
      rating: 4.9,
      reviews: 240,
      duration: 42,
      price: 49.99,
      originalPrice: 99.99,
      tag: "Bestseller",
      image: "/placeholder.svg?height=200&width=400",
      category: "Web Development",
      level: "Beginner",
    },
    {
      title: "Data Science Fundamentals",
      description: "Master data analysis, visualization, and machine learning basics.",
      instructor: "Michael Chen",
      rating: 4.8,
      reviews: 180,
      duration: 38,
      price: 59.99,
      originalPrice: 119.99,
      tag: "New",
      image: "/placeholder.svg?height=200&width=400",
      category: "Data Science",
      level: "Intermediate",
    },
    {
      title: "UX/UI Design Principles",
      description: "Create beautiful, user-friendly interfaces that convert.",
      instructor: "Emma Davis",
      rating: 4.7,
      reviews: 210,
      duration: 32,
      price: 39.99,
      originalPrice: 79.99,
      tag: "Popular",
      image: "/placeholder.svg?height=200&width=400",
      category: "Design",
      level: "Beginner",
    },
  ];
  */

  return (
    <>
      {showSplash && (
        <SplashScreen 
          gifUrl="/AJ_splash_2sec.mp4" 
          onComplete={handleSplashComplete} 
        />
      )}
      
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative w-full py-12 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-white to-blue-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(37, 99, 235, 0.1) 0%, transparent 60%)",
          }}
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

          <div className="container relative mx-auto px-4 md:px-6 mb-0">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Badge className="mb-4 bg-blue-600 hover:bg-blue-700 text-white">The Future of Learning</Badge>
                  </motion.div>
                  <motion.h1
                    className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-blue-900"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Elevate Your Skills with{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      AJ Academy
                    </span>
                  </motion.h1>
                  <motion.p
                    className="max-w-[600px] text-blue-700 md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Access expert-led courses, connect with mentors, and discover job opportunities all in one place.
                  </motion.p>
                </div>
                <motion.div
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-600/20"
                    asChild
                  >
                    <Link href="/courses">
                      Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    asChild
                  >
                    <Link href="/auth/sign-up">
                      Join Our Family
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-4 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100"></div>
                    ))}
                  </div>
                  <div className="text-blue-700 text-sm">
                    Join <span className="font-bold text-blue-900">26,000+</span> students already learning
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative w-full max-w-[600px] aspect-video rounded-xl overflow-hidden shadow-2xl shadow-blue-600/20 border border-blue-200 backdrop-blur-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                    alt="Students learning"
                    fill
                    className="object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Colleges Section */}
        <section className="w-full py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm uppercase tracking-wider text-blue-600">Trusted by Colleges/Universities</p>
              <div className="flex flex-col gap-6 w-full">
                {chunkIntoThree(collegeImages).map((row, rowIdx) => {
                  // Repeat images so each row has at least 16 images (for seamless scroll)
                  const displayRow = repeatToLength(row, 16);
                  return (
                    <div key={rowIdx} className="overflow-hidden w-full">
                      <div
                        className={`marquee-row ${rowIdx === 1 ? 'marquee-right' : 'marquee-left'}`}
                        style={{
                          animationDuration: `${20 + rowIdx * 2}s`,
                          animationTimingFunction: "linear",
                          animationIterationCount: "infinite",
                          animationName: rowIdx === 1 ? "marqueeRight" : "marqueeLeft"
                        }}
                      >
                        {displayRow.map((file, i) => (
                          <div key={i} className="h-12 w-auto flex items-center">
                            <Image
                              src={`/colleges/${file}`}
                              alt={file.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "") + " Logo"}
                              height={48}
                              width={120}
                              className="object-contain max-h-12 w-auto"
                              style={{ maxWidth: 160 }}
                              priority={i === 0 && rowIdx === 0}
                            />
                          </div>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {displayRow.map((file, i) => (
                          <div key={"dup-" + i} className="h-12 w-auto flex items-center">
                            <Image
                              src={`/colleges/${file}`}
                              alt={file.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "") + " Logo"}
                              height={48}
                              width={120}
                              className="object-contain max-h-12 w-auto"
                              style={{ maxWidth: 160 }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-70"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl -z-10"></div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Why Choose AJ Academy
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold tracking-tighter sm:text-5xl lg:text-6xl text-blue-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Everything you need to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  succeed
                </span>
              </motion.h2>
              <motion.p 
                className="max-w-[900px] text-blue-700/90 md:text-lg lg:text-xl leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Our platform combines learning, mentorship, and career opportunities in one seamless experience.
              </motion.p>
            </motion.div>

            <motion.div 
              className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.2
                  }
                }
              }}
            >
              {[
                {
                  icon: <BookOpen className="h-7 w-7 text-white" />,
                  title: "Expert-Led Courses",
                  description: "Learn from industry professionals with real-world experience. Our courses are designed to provide practical skills that employers value.",
                  features: [
                    "courses across various disciplines",
                    "Hands-on projects and assignments",
                    "Regular content updates"
                  ],
                  gradient: "from-blue-600 to-blue-700",
                  hoverGradient: "from-blue-500 to-blue-600"
                },
                {
                  icon: <Users className="h-7 w-7 text-white" />,
                  title: "1-on-1 Mentorship",
                  description: "Connect with experienced mentors who provide personalized guidance and feedback to accelerate your learning journey.",
                  features: [
                    "Personalized learning paths",
                    "Regular feedback sessions",
                    "Career guidance and advice"
                  ],
                  gradient: "from-indigo-600 to-indigo-700",
                  hoverGradient: "from-indigo-500 to-indigo-600"
                },
                {
                  icon: <Briefcase className="h-7 w-7 text-white" />,
                  title: "Job Opportunities",
                  description: "Access our exclusive job portal with opportunities from partner companies looking to hire skilled professionals.",
                  features: [
                    "Exclusive job listings",
                    "Resume and interview preparation",
                    "Direct connections with employers"
                  ],
                  gradient: "from-purple-600 to-purple-700",
                  hoverGradient: "from-purple-500 to-purple-600"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { 
                      opacity: 0,
                      y: 30,
                      scale: 0.95
                    },
                    visible: { 
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        delay: index * 0.1
                      }
                    }
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="h-full"
                >
                  <div className="relative h-full rounded-2xl border border-blue-100/50 bg-white/80 backdrop-blur-sm shadow-lg shadow-blue-100/50 overflow-hidden group hover:shadow-2xl hover:shadow-blue-200/60 hover:border-blue-300 transition-all duration-500 cursor-pointer">
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    {/* Animated border gradient */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}></div>
                    
                    <div className="relative p-8">
                      {/* Icon with enhanced animation */}
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-xl shadow-blue-600/30 group-hover:shadow-2xl group-hover:shadow-blue-600/40 transition-all duration-500`}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -5, 5, -5, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {feature.icon}
                        </motion.div>
                      </motion.div>
                      
                      {/* Title */}
                      <h3 className="font-bold tracking-tight text-2xl text-blue-900 mb-4 group-hover:text-blue-800 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-blue-700/80 leading-relaxed mb-6 text-[15px] group-hover:text-blue-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                      
                      {/* Features list with enhanced styling */}
                      <ul className="space-y-3">
                        {feature.features.map((item, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start text-blue-700/90 group-hover:text-blue-800 transition-colors duration-300"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) + (i * 0.05) }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                              className="mt-0.5 mr-3 flex-shrink-0"
                            >
                              <CircleCheckBig className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                            </motion.div>
                            <span className="text-sm leading-relaxed">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      {/* Decorative bottom accent */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-70"></div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-blue-900">
                What Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Students Say
                </span>
              </h2>
              <p className="max-w-[900px] text-blue-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from our community about their learning journey and success stories
              </p>
            </motion.div>

            <TestimonialCarousel />
          </div>
        </section>

        {/* Gallery Section */}
        <section className="w-full py-20 md:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-70"></div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Gallery</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-blue-900">
                Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Moments
                </span>
              </h2>
              <p className="max-w-[900px] text-blue-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A glimpse into the vibrant learning environment at AJ Academy
              </p>
            </motion.div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="text-blue-700 mt-4">Loading gallery...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="max-w-md mx-auto">
                  <p className="text-red-500 mb-2">Error Loading Gallery</p>
                  <p className="text-blue-700">{error}</p>
                </div>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-20 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="max-w-md mx-auto">
                  <p className="text-blue-700">No images found in the gallery.</p>
                </div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2
                    }
                  }
                }}
              >
                {galleryImages.slice(0, 8).map((image) => {
                  const fileId = extractGoogleDriveFileId(image.url || image.image || image.googleDriveId || image.imageUrl || "");
                  let imageUrl = image.imageUrl || image.url || image.image || image.googleDriveId || "";
                  let isGoogleDrive = false;
                  if (/^[a-zA-Z0-9_-]{25,}$/.test(fileId)) {
                    imageUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                    isGoogleDrive = true;
                  } else if (imageUrl.includes('drive.google.com/file/d/')) {
                    isGoogleDrive = true;
                  }
                  return (
                    <motion.div
                      key={image._id}
                      variants={{
                        hidden: { 
                          opacity: 0,
                          scale: 0.8,
                          y: 20
                        },
                        visible: { 
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                          }
                        }
                      }}
                      className="group relative aspect-square overflow-hidden rounded-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                      {isGoogleDrive ? (
                        <iframe
                          src={imageUrl}
                          title={image.title}
                          width="100%"
                          height="100%"
                          style={{ border: 0, borderRadius: '12px', minHeight: '200px', background: '#f8fafc' }}
                          allow="autoplay"
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt={image.title}
                          className="object-cover w-full h-full"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`${
                              image.category === "campus"
                                ? "bg-emerald-600"
                                : image.category === "students"
                                ? "bg-amber-600"
                                : image.category === "events"
                                ? "bg-purple-600"
                                : "bg-blue-600"
                            }`}
                          >
                            {image.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold mt-2">{image.title}</h3>
                        <p className="text-sm text-white/80">{image.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            <motion.div
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                asChild
              >
                <Link href="/gallery">
                  View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Student Projects Showcase Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white via-indigo-50/30 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-70"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 right-20 w-80 h-80 bg-indigo-100/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10"></div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Student Showcase
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold tracking-tighter sm:text-5xl lg:text-6xl text-blue-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                What Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Students Build
                </span>
              </motion.h2>
              <motion.p 
                className="max-w-[900px] text-blue-700/90 md:text-lg lg:text-xl leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Showcase your projects, share your code, and inspire others. Build your portfolio and get recognized for your work.
              </motion.p>
            </motion.div>

            {projectsLoading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="text-blue-700 mt-4">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <motion.div 
                className="text-center py-20 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="max-w-md mx-auto">
                  <Code2 className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">No projects yet</h3>
                  <p className="text-blue-700 mb-6">Be the first to showcase your project!</p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    asChild
                  >
                    <Link href="/projects">
                      Showcase Your Project <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2
                      }
                    }
                  }}
                >
                  {projects.map((project, index) => {
                    const formatDate = (iso?: string): string => {
                      if (!iso) return "";
                      try {
                        return new Date(iso).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                      } catch {
                        return "";
                      }
                    };

                    const toExternal = (url?: string): string => {
                      if (!url) return "#";
                      const trimmed = url.trim();
                      if (/^https?:\/\//i.test(trimmed)) return trimmed;
                      return `https://${trimmed}`;
                    };

                    return (
                      <motion.div
                        key={project._id}
                        variants={{
                          hidden: { 
                            opacity: 0,
                            y: 30,
                            scale: 0.95
                          },
                          visible: { 
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              type: "spring",
                              stiffness: 100,
                              damping: 15
                            }
                          }
                        }}
                        whileHover={{ 
                          y: -8,
                          transition: { duration: 0.3 }
                        }}
                        className="h-full"
                      >
                        <div className="relative h-full rounded-2xl border border-indigo-100/50 bg-white/90 backdrop-blur-sm shadow-lg shadow-indigo-100/50 overflow-hidden group hover:shadow-2xl hover:shadow-indigo-200/60 hover:border-indigo-300 transition-all duration-500 cursor-pointer">
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                          
                          {/* Top accent bar */}
                          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                          
                          <div className="p-6">
                            {/* Icon and Title */}
                            <div className="flex items-start gap-4 mb-4">
                              <motion.div 
                                className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:shadow-xl group-hover:shadow-indigo-600/40 transition-all duration-500 flex-shrink-0"
                                whileHover={{ 
                                  scale: 1.1,
                                  rotate: [0, -5, 5, -5, 0],
                                  transition: { duration: 0.5 }
                                }}
                              >
                                <Code2 className="h-7 w-7 text-white" />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-blue-900 mb-1 group-hover:text-indigo-800 transition-colors duration-300 line-clamp-2">
                                  {project.projectName}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-blue-600/70">
                                  <CalendarClock className="h-3.5 w-3.5" />
                                  <span>{formatDate(project.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-blue-700/80 text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-blue-700 transition-colors duration-300">
                              {project.description}
                            </p>

                            {/* Technologies */}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies.slice(0, 4).map((tech, i) => (
                                  <motion.span
                                    key={i}
                                    className="px-2.5 py-1 text-xs rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-800 border border-indigo-200/50 shadow-sm"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {tech}
                                  </motion.span>
                                ))}
                                {project.technologies.length > 4 && (
                                  <span className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    +{project.technologies.length - 4}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2 pt-4 border-t border-indigo-100">
                              <motion.a
                                href={toExternal(project.githubUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 px-3 py-2 text-sm shadow-sm transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4" />
                                GitHub
                              </motion.a>
                              {project.readmeUrl && (
                                <motion.a
                                  href={toExternal(project.readmeUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-white text-purple-700 hover:bg-purple-50 px-3 py-2 text-sm shadow-sm transition-colors"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  README
                                </motion.a>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/30"
                    asChild
                  >
                    <Link href="/projects">
                      View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                    asChild
                  >
                    <Link href="/auth/sign-up">
                      Showcase Your Project
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-20 md:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-70"></div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Our Impact</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-blue-900">
                Trusted by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Thousands
                </span>
              </h2>
              <p className="max-w-[900px] text-blue-700 md:text-lg lg:text-xl leading-relaxed">
                Join a thriving community of learners achieving their goals every day
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 justify-center"
              initial="hidden"
              animate="show"
              variants={container}
            >
              <motion.div variants={item} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-blue-900">26,000+</h3>
                <p className="text-blue-700">Active Students</p>
              </motion.div>
              <motion.div variants={item} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-blue-900">4.8</h3>
                <p className="text-blue-700">Average Rating</p>
              </motion.div>
              <motion.div variants={item} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-blue-900">98%</h3>
                <p className="text-blue-700">Completion Rate</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-white text-blue-900 hover:bg-blue-50">Get Started Today</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                Ready to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                  Transform
                </span>{" "}
                Your Career?
              </h2>
              <p className="max-w-[900px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students already learning on AJ Academy and take the next step in your career journey.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-blue-50 border-0 shadow-lg shadow-blue-900/20"
                  asChild
                >
                  <Link href="/auth/sign-up">
                    Sign Up For Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-200 text-white hover:bg-blue-800 hover:text-white"
                  asChild
                >
                  <Link href="/courses">
                    Browse Courses
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <style jsx global>{`
.marquee-row {
  display: flex;
  gap: 3rem;
  min-width: max-content;
}
@keyframes marqueeLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes marqueeRight {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
.marquee-left {
  animation: marqueeLeft 20s linear infinite;
}
.marquee-right {
  animation: marqueeRight 20s linear infinite;
}
`}</style>
    </>
  )
}
