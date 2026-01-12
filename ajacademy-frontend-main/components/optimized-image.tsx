"use client";

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width = 500,
  height = 300,
  className = "",
  fallbackSrc = "/placeholder.svg"
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  
  return (
    <Image
      src={error ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
    />
  );
} 