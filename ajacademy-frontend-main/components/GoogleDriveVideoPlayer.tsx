"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import axios from 'axios';

interface GoogleDriveVideoPlayerProps {
  googleDriveId: string;
  title: string;
  courseId: string;
  videoId: string;
  onProgress?: (seconds: number, completed: boolean) => void;
  initialProgress?: number;
  totalDuration?: number;
}

const GoogleDriveVideoPlayer: React.FC<GoogleDriveVideoPlayerProps> = ({
  googleDriveId,
  title,
  courseId,
  videoId,
  onProgress,
  initialProgress = 0,
  totalDuration = 0,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastReportedTime, setLastReportedTime] = useState(initialProgress);
  const [percentWatched, setPercentWatched] = useState<number>(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  // Create the embed URL from the Drive ID
  const embedUrl = `https://drive.google.com/file/d/${googleDriveId}/preview`;
  
  useEffect(() => {
    // Function to handle iframe load event
    const handleIframeLoad = () => {
      setIsLoading(false);
      
      // Start tracking progress
      if (onProgress) {
        // Start at the initial progress if available
        if (initialProgress > 0 && iframeRef.current) {
          // Unfortunately we can't directly control Google Drive's player
          // so we just track time spent on the video
        }
        
        // Mark wall clock start for smoother estimation
        startedAtRef.current = Date.now();

        // Set up progress reporting interval (every 2 seconds for smoother bar)
        progressInterval.current = setInterval(async () => {
          // Since we can't access Drive's player API, we estimate progress
          // based on time spent with the player loaded
          const elapsed = startedAtRef.current ? (Date.now() - startedAtRef.current) / 1000 : 0;
          const newTime = initialProgress + elapsed;
          setLastReportedTime(newTime);
          
          // Determine if video is complete (watched 90% or more)
          const isCompleted = totalDuration > 0 && newTime >= totalDuration * 0.9;
          // Update local visual percent
          if (totalDuration > 0) {
            const pct = Math.min(100, Math.round((newTime / totalDuration) * 100));
            setPercentWatched(pct);
          }
          
          // Report progress
          onProgress(newTime, isCompleted);

          // Persist progress to backend
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            await axios.post(`/api/courses/${courseId}/lessons/${videoId}/progress`, {
              watchedSeconds: newTime,
              completed: isCompleted
            }, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined
            });
          } catch {}
        }, 2000);
      }
    };
    
    // Set up load event listener
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
    }
    
    // Prevent context menu on the wrapper element (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    if (wrapperRef.current) {
      wrapperRef.current.addEventListener('contextmenu', handleContextMenu);
    }
    
    // Clean up
    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad);
      }
      
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener('contextmenu', handleContextMenu);
      }
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [googleDriveId, initialProgress, lastReportedTime, onProgress, totalDuration]);

  return (
    <Card 
      ref={wrapperRef} 
      className="relative overflow-hidden rounded-lg shadow-md w-full aspect-video bg-black"
    >
      {/* Hide Google Drive popout and overlays */}
      <style jsx global>{`
        iframe[src*="drive.google.com"] + div,
        .drive-viewer-popout-button,
        .ndfHFb-c4YZDc-Wrql6b,
        .ndfHFb-c4YZDc-Wrql6b-haAclf {
          display: none !important;
        }
      `}</style>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="space-y-2 w-full p-4">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-72" />
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        className="w-full h-full aspect-video"
        style={{
          border: 'none',
          position: isLoading ? 'absolute' : 'relative',
          zIndex: isLoading ? -1 : 1,
        }}
        sandbox="allow-same-origin allow-scripts"
      />
      
      {/* Overlay to prevent direct interaction with iframe */}
      <div 
        className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
        style={{ display: isLoading ? 'none' : 'block' }}
      />

      {/* Professional overlays */}
      {!isLoading && (
        <>
          {/* Top gradient title bar */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent text-white flex items-center justify-between">
            <div className="text-sm md:text-base font-medium truncate">{title}</div>
            <div className="text-[10px] md:text-xs opacity-80">Google Drive</div>
          </div>

          {/* Bottom progress and meta */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
            <div className="flex items-center justify-between text-xs md:text-sm mb-1">
              <span className="opacity-90">Progress</span>
              <span className="tabular-nums opacity-90">
                {formatTime(lastReportedTime)}
                {totalDuration > 0 && ` / ${formatTime(totalDuration)} (${percentWatched}%)`}
              </span>
            </div>
            <div className="w-full h-1.5 md:h-2 bg-white/20 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-[width] duration-500"
                style={{ width: `${Math.min(100, percentWatched)}%` }}
              />
            </div>
          </div>

          {/* Mask & intercept the top-right area where popout appears (extra safety) */}
          <div
            className="absolute top-0 right-0 w-24 h-16"
            style={{ cursor: 'default' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          />
        </>
      )}
    </Card>
  );
};

export default GoogleDriveVideoPlayer; 