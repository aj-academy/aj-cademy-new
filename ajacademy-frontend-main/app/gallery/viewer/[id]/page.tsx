"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Share, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import GoogleDriveImage from "@/components/GoogleDriveImage"
import { getGoogleDriveDownloadUrl, extractGoogleDriveFileId } from "@/lib/utils"
import { ApiResponse } from '@/lib/types'
import { fetchAPI } from '@/lib/api-client'

interface ImageData {
  _id?: string
  id?: string | number
  title: string
  description: string
  category: string
  tags: string[]
  url: string
  photographer: string
  featured?: boolean
  imageUrl?: string
  image?: string
  googleDriveId?: string
}

export default function GalleryImageViewer({ params }: { params: { id: string } }) {
  const [image, setImage] = useState<ImageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response: ApiResponse<any> = await fetchAPI(`/gallery/${params.id}`)
        
        if (response.error) {
          setError(response.error)
          setIsLoading(false)
          return
        }
        
        setImage(response.data)
      } catch (err) {
        console.error('Error fetching image:', err)
        setError('Failed to load image. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchImage()
  }, [params.id])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-blue-600"
            onClick={() => router.push('/gallery')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-red-600 mb-2">Error</h2>
            <p className="text-gray-700">{error}</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/gallery')}
            >
              Return to Gallery
            </Button>
          </div>
        ) : image ? (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Image */}
            <div className="h-[70vh] bg-blue-50 flex items-center justify-center">
              {(() => {
                const rawUrl = image.imageUrl || image.url || image.image || image.googleDriveId || "";
                let imageUrl = rawUrl;
                let isGoogleDrive = false;
                if (/^[a-zA-Z0-9_-]{25,}$/.test(rawUrl)) {
                  imageUrl = `https://drive.google.com/file/d/${rawUrl}/preview`;
                  isGoogleDrive = true;
                } else if (rawUrl.includes('drive.google.com/file/d/')) {
                  imageUrl = rawUrl;
                  isGoogleDrive = true;
                }
                if (isGoogleDrive) {
                  return (
                    <iframe
                      src={imageUrl}
                      width="100%"
                      height="100%"
                      allow="autoplay"
                      sandbox="allow-scripts allow-same-origin"
                      style={{ border: 'none', borderRadius: '12px', background: '#f8fafc', minHeight: '60vh' }}
                      title={image.title}
                      className="hide-gdrive-popout"
                    />
                  );
                } else {
                  return (
                    <img
                      src={imageUrl}
                      alt={image.title}
                      style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', background: '#f8fafc' }}
                    />
                  );
                }
              })()}
            </div>
            
            {/* Image details */}
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">{image.title}</h1>
                  {image.photographer && (
                    <p className="text-blue-700 mt-1">Photographer: {image.photographer}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={getGoogleDriveDownloadUrl(image.url)} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-700">{image.description}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {image.category}
                </span>
                
                {image.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
                
                {image.featured && (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-700">No image found</p>
          </div>
        )}
      </div>
    </div>
  )
} 