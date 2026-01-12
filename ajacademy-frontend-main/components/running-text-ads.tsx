"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface RunningTextAd {
  _id: string;
  text: string;
  linkUrl?: string;
  isActive?: boolean;
}

export function RunningTextAds() {
  const [ads, setAds] = useState<RunningTextAd[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Using static example ad instead of API call
  useEffect(() => {
    // Updated static data with new announcements
    const baseAds: RunningTextAd[] = [
      {
        _id: 'static-1',
        text: 'New Job Listings are available',
        linkUrl: '/job-portal',
        isActive: true
      },
      {
        _id: 'static-2',
        text: 'Checkout our New courses',
        linkUrl: '/courses',
        isActive: true
      },
      {
        _id: 'static-3',
        text: 'Checkout our work gallery',
        linkUrl: '/gallery',
        isActive: true
      }
    ];
    
    // Duplicate the ads array to create seamless loop
    const loopedAds = [...baseAds, ...baseAds];
    
    setAds(loopedAds);
    setLoading(false);
  }, []);
  
  if (loading || ads.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1 sm:py-1.5 relative overflow-hidden">
      <div className="container mx-auto flex items-center px-3 sm:px-4">
        <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-bounce flex-shrink-0" />
        <div className="overflow-hidden whitespace-nowrap text-xs sm:text-sm flex-grow">
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: "-50%" }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "linear",
            }}
            className="inline-block"
          >
            {ads.map((ad, index) => (
              <span key={`${ad._id}-${index}`} className="mr-8 sm:mr-16 inline-flex items-center">
                {ad.linkUrl ? (
                  <Link 
                    href={ad.linkUrl} 
                    className="hover:underline text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300 text-xs sm:text-sm"
                  >
                    {ad.text} <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1 inline" />
                  </Link>
                ) : (
                  <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] text-xs sm:text-sm">
                    {ad.text}
                  </span>
                )}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 