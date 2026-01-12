'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  gifUrl: string;
  onComplete?: () => void;
}

export function SplashScreen({ gifUrl, onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Play the video if it exists
    if (videoRef.current) {
      // Set up video to play only once
      videoRef.current.loop = false;
      videoRef.current.playsInline = true;
      videoRef.current.muted = true;
      
      const handleVideoEnd = () => {
        // Start fade out animation with zoom
        setIsAnimating(true);
        setIsVisible(false);
        
        // Allow time for the fade out animation to complete
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1000);
      };
      
      // Add ended event listener to trigger fade out when video completes
      videoRef.current.addEventListener('ended', handleVideoEnd);
      
      // Start playing the video
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
      
      // Cleanup function
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('ended', handleVideoEnd);
        }
      };
    }
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        scale: isAnimating ? 1.25 : 1
      }}
      transition={{ 
        duration: 1, 
        ease: "easeOut"
      }}
    >
      {/* Center the animation */}
      <div className="relative w-80 h-80 md:w-[32rem] md:h-[32rem] overflow-hidden">
        {gifUrl.endsWith('.mp4') ? (
          <video 
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted
            style={{ 
              transform: 'scale(1.25)', /* Zoom in by 25% */
              objectFit: 'contain'
            }}
          >
            <source src={gifUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div 
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${gifUrl})`,
              transform: 'scale(1.25)' /* Zoom in by 25% */
            }}
          />
        )}
      </div>
    </motion.div>
  );
} 