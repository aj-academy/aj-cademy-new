"use client";

import { GalleryImage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { isValidGoogleDriveInput } from '@/lib/utils';
import GoogleDriveImage from '@/components/GoogleDriveImage';
import Image from 'next/image';
import { useState } from 'react';

interface GalleryGridProps {
  images: GalleryImage[];
  isLoading?: boolean;
}

export default function GalleryGrid({ images, isLoading = false }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No images found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => {
        // Check if the image is explicitly marked as a Google Drive image by the API
        // If not marked, perform a secondary check on the URL format
        const isGDriveImage = image.isGoogleDriveImage || 
                             (typeof image.isGoogleDriveImage === 'undefined' && 
                              isValidGoogleDriveInput(image.url));
        
        // Use the ID directly for GoogleDriveImage component
        const imageSourceUrl = image.googleDriveId || image.url;
        
        return (
          <Card key={image._id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              {isGDriveImage ? (
                <GoogleDriveImage
                  url={imageSourceUrl}
                  alt={image.title}
                  aspectRatio="video"
                  isGoogleDriveImage={true}
                />
              ) : (
                <Image
                  src={image.imageUrl || image.url || '/images/placeholder.jpg'}
                  alt={image.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{image.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {image.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {image.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 