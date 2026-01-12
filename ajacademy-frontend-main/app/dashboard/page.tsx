"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Building,
  Calendar,
  Users,
  UserCheck,
  Trash2,
  Edit,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import GoogleDriveImage from "@/components/GoogleDriveImage"
import type { GalleryImage } from "@/lib/types"
import { api } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10
  const [newImage, setNewImage] = useState<Omit<GalleryImage, "_id" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    category: "campus",
    tags: [],
    url: "",
    photographer: "",
    featured: false
  })
  const [newTag, setNewTag] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Check user role on load and redirect students
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole === 'student') {
      // Students should use the student dashboard instead
      router.push('/student/dashboard')
    }
  }, [router])

  // Update fetchGalleryImages to expect the correct paginated response shape
  const fetchGalleryImages = async (pageToFetch = page) => {
    try {
      const response = await api.gallery.getAll(pageToFetch, limit)
      if (response.error) {
        throw new Error(response.error)
      }
      const paginated = response.data as { items: GalleryImage[]; total: number; page: number; limit: number; totalPages: number };
      if (paginated && Array.isArray(paginated.items)) {
        setGalleryImages(paginated.items)
        setTotalPages(paginated.totalPages || 1)
        setTotal(paginated.total || 0)
      } else {
        setGalleryImages([])
        setTotalPages(1)
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error)
      setGalleryImages([])
      setTotalPages(1)
      setTotal(0)
      toast({
        title: "Error",
        description: "Network or server error occurred",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    // Prevent unnecessary HR stats API call for students
    if (userRole === 'student') {
      router.push('/student/dashboard');
      return; // Don’t fetch HR stats for students
    }
    // Only fetch HR stats for HR or admin
    if (userRole === 'hr' || userRole === 'admin') {
      const fetchData = async () => {
        try {
          const response = await api.hr.getDashboardStats();
          if (response.error) {
            console.error("Error fetching dashboard data:", response.error);
            setError(response.error);
            setIsLoading(false);
            return;
          }
          if (response.data) {
            setError(null);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setError(error instanceof Error ? error.message : "Failed to fetch dashboard data");
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [router]);

  useEffect(() => {
    fetchGalleryImages(page)
  }, [page, limit])

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.gallery.create(newImage)
      if (response.error) {
        throw new Error(response.error)
      }
      setNewImage({
        title: "",
        description: "",
        category: "campus",
        tags: [],
        url: "",
        photographer: "",
        featured: false
      })
      setNewTag("")
      await fetchGalleryImages()
      toast({
        title: "Success",
        description: "Image added to gallery successfully"
      })
    } catch (error) {
      console.error("Error adding gallery image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add image",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await api.gallery.delete(id)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchGalleryImages()
      toast({
        title: "Success",
        description: "Image deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting gallery image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    setIsLoading(true)
    try {
      const response = await api.gallery.update(editingId, newImage)
      if (response.error) {
        throw new Error(response.error)
      }
      setNewImage({
        title: "",
        description: "",
        category: "campus",
        tags: [],
        url: "",
        photographer: "",
        featured: false
      })
      setEditingId(null)
      await fetchGalleryImages()
      toast({
        title: "Success",
        description: "Image updated successfully"
      })
    } catch (error) {
      console.error("Error updating gallery image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update image",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (id: string) => {
    setEditingId(id)
    const image = galleryImages.find(img => img._id === id)
    if (image) {
      setNewImage({
        title: image.title,
        description: image.description,
        category: image.category,
        tags: image.tags,
        url: image.url,
        photographer: image.photographer,
        featured: image.featured || false
      })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !newImage.tags.includes(newTag.trim())) {
      setNewImage(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewImage(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-blue-900">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container py-12 px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-2 bg-blue-600 hover:bg-blue-700 text-white">Dashboard</Badge>
          <h1 className="text-3xl font-bold text-blue-900">Welcome back, User!</h1>
          <p className="text-blue-700">Here&apos;s what&apos;s happening with your career journey</p>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-blue-900">Job Applications</CardTitle>
                <CardDescription className="text-blue-700">Your active applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-blue-900">5</div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm">
                  <span className="text-blue-600">2 new opportunities this week</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-blue-900">Interviews</CardTitle>
                <CardDescription className="text-blue-700">Your scheduled interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-blue-900">2</div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm">
                  <span className="text-blue-600">Next interview on Thursday</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-blue-900">Sessions</CardTitle>
                <CardDescription className="text-blue-700">Upcoming mentor sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-blue-900">2</div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm">
                  <span className="text-blue-600">Next session in 2 days</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
              <CardHeader>
                <CardTitle className="text-blue-900">Upcoming Sessions</CardTitle>
                <CardDescription className="text-blue-700">Your scheduled mentor sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      mentor: "Sarah Johnson",
                      title: "Frontend Development Q&A",
                      date: "Tomorrow, 3:00 PM",
                    },
                    {
                      mentor: "Michael Chen",
                      title: "Data Science Project Review",
                      date: "Friday, 2:00 PM",
                    },
                  ].map((session, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-4 p-3 rounded-lg bg-blue-50 border border-blue-100"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900">{session.title}</p>
                        <p className="text-xs text-blue-700">with {session.mentor}</p>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3 text-blue-600" />
                          <p className="text-xs text-blue-700">{session.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                >
                  Schedule New Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
              <CardHeader>
                <CardTitle className="text-blue-900">Job Application Status</CardTitle>
                <CardDescription className="text-blue-700">Track your application progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      company: "Tech Solutions Inc.",
                      position: "Frontend Developer",
                      status: "Interview Scheduled",
                      progress: 60,
                    },
                    {
                      company: "Digital Innovations",
                      position: "UX/UI Designer",
                      status: "Application Submitted",
                      progress: 20,
                    },
                    {
                      company: "Data Analytics Co.",
                      position: "Data Scientist",
                      status: "Application Reviewed",
                      progress: 40,
                    },
                  ].map((job, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">{job.position}</p>
                          <p className="text-xs text-blue-700">{job.company}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">{job.status}</Badge>
                      </div>
                      <Progress
                        value={job.progress}
                        className="h-2 bg-blue-100"
                        indicatorClassName="bg-gradient-to-r from-blue-600 to-indigo-600"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                >
                  View All Applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {editingId ? 'Edit Image' : 'Add New Image'}
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {editingId ? 'Update image details' : 'Add a new image to the gallery'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingId ? handleUpdateImage : handleAddImage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newImage.title}
                      onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newImage.description}
                      onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newImage.category}
                      onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="campus">Campus</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Image URL</Label>
                    <Input
                      id="url"
                      value={newImage.url}
                      onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photographer">Photographer</Label>
                    <Input
                      id="photographer"
                      value={newImage.photographer}
                      onChange={(e) => setNewImage(prev => ({ ...prev, photographer: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                      />
                      <Button type="button" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newImage.tags.map((tag, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-700">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newImage.featured}
                      onChange={(e) => setNewImage(prev => ({ ...prev, featured: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="featured">Featured Image</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingId ? 'Save Changes' : 'Add Image'}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null)
                          setNewImage({
                            title: "",
                            description: "",
                            category: "campus",
                            tags: [],
                            url: "",
                            photographer: "",
                            featured: false
                          })
                          setNewTag("")
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-blue-900">Gallery Images</CardTitle>
                <CardDescription className="text-blue-700">Manage your gallery images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {galleryImages.length === 0 ? (
                    <div className="text-center py-8 text-blue-700">
                      No images added to the gallery yet. Add your first image above.
                    </div>
                  ) : (
                    <>
                      {galleryImages.map((image) => (
                        <div
                          key={image._id}
                          className="border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/4">
                              <div className="aspect-video bg-blue-50 rounded flex items-center justify-center overflow-hidden">
                                <GoogleDriveImage
                                  url={image.url}
                                  alt={image.title}
                                  aspectRatio="video"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold text-blue-900">{image.title}</h3>
                                  <p className="text-sm text-blue-700">{image.description}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge className="bg-blue-100 text-blue-700">{image.category}</Badge>
                                    {image.featured && (
                                      <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>
                                    )}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {image.tags.map((tag, index) => (
                                      <Badge key={index} className="bg-gray-100 text-gray-700">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditClick(image._id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteImage(image._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Pagination Controls */}
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500 bg-blue-800/80 text-blue-900 hover:bg-blue-700 hover:text-white text-xs sm:text-sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                          <Button
                            key={pg}
                            variant={pg === page ? "default" : "outline"}
                            size="sm"
                            className={`text-xs sm:text-sm ${pg === page ? 'bg-indigo-600 text-white' : 'bg-blue-800/80 text-blue-900 hover:bg-blue-700 hover:text-white'}`}
                            onClick={() => setPage(pg)}
                            disabled={pg === page}
                          >
                            {pg}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500 bg-blue-800/80 text-blue-900 hover:bg-blue-700 hover:text-white text-xs sm:text-sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                      <div className="text-center text-blue-400 text-xs mt-2">Page {page} of {totalPages} ({total} images)</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
