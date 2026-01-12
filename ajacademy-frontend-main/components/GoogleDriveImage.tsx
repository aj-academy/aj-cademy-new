"use client"

import React, { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { extractGoogleDriveFileId, getGoogleDriveImageUrl } from '@/lib/utils'

interface GoogleDriveImageProps {
  url: string
  alt?: string
  className?: string
  aspectRatio?: "auto" | "square" | "video" | "portrait"
  width?: string
  height?: string
  isGoogleDriveImage?: boolean
}

const GoogleDriveImage = ({ 
  url: driveUrl, 
  alt = "Google Drive image (file/d/ID/view)", 
  className = "", 
  aspectRatio = "auto",
  width = "640",
  height = "480",
  isGoogleDriveImage = true
}: GoogleDriveImageProps) => {
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    if (!driveUrl) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    // Generate the direct image URL when the component mounts or URL changes
    try {
      // If it's already a complete Google Drive URL, extract the ID and convert to image URL
      if (driveUrl.includes('drive.google.com')) {
        const fileId = extractGoogleDriveFileId(driveUrl);
        setImageUrl(getGoogleDriveImageUrl(fileId));
      } 
      // If it's marked as a Google Drive image, convert the ID to a URL
      else if (isGoogleDriveImage) {
        // Get the file ID from the URL or use as is if it's already an ID
        const fileId = extractGoogleDriveFileId(driveUrl);
        if (fileId) {
          // Use direct view URL format for images
          setImageUrl(getGoogleDriveImageUrl(fileId));
        } else {
          setImageUrl(driveUrl);
        }
      }
      // If it's not a Google Drive image, use as-is
      else {
        setImageUrl(driveUrl);
      }
      
      setIsLoading(true);
      setIsError(false);
    } catch (error) {
      console.error('Error processing image URL:', error);
      setIsError(true);
      setIsLoading(false);
    }
  }, [driveUrl, isGoogleDriveImage])

  // Determine aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square": return "aspect-square"
      case "video": return "aspect-video" 
      case "portrait": return "aspect-[3/4]"
      default: return ""
    }
  }

  // Handle image load
  const handleImageLoaded = () => {
    setIsLoading(false)
  }

  // Handle image error
  const handleImageError = () => {
    setIsError(true)
    setIsLoading(false)
  }

  return (
    <div className={`relative ${getAspectRatioClass()} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
          <div className="animate-pulse flex flex-col items-center justify-center">
            <ImageIcon className="h-8 w-8 text-blue-300" />
            <div className="text-sm text-blue-500 mt-2">Loading content...</div>
          </div>
        </div>
      )}
      
      {!isError && imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          unoptimized={true}
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleImageLoaded}
          onError={handleImageError}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
          <div className="text-center p-4">
            <ImageIcon className="h-8 w-8 text-blue-300 mx-auto" />
            <div className="text-sm text-blue-500 mt-2">
              Content failed to load
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Check file ID or sharing permissions
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoogleDriveImage 