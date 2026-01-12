import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { GALLERY_CATEGORIES, type GalleryCategory } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a Google Drive file ID from various Google Drive URL formats
 * or returns the original input if it's already a file ID
 */
export function extractGoogleDriveFileId(input: string): string {
  // If empty, return empty
  if (!input || input.trim() === '') return '';
  
  // If it's already a file ID (25-33 alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{25,33}$/.test(input.trim())) {
    return input.trim();
  }
  
  // Extract from Google Drive URLs
  let fileId = '';
  
  // Format: https://drive.google.com/file/d/{fileId}/view?usp=sharing
  if (input.includes('drive.google.com/file/d/')) {
    const match = input.match(/\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  } 
  // Format: https://drive.google.com/open?id={fileId}
  else if (input.includes('drive.google.com/open?id=')) {
    const match = input.match(/id=([^&]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }
  
  return fileId || input; // Return extracted ID or original input
}

/**
 * Creates a Google Drive preview URL for use in iframes
 */
export function getGoogleDrivePreviewUrl(input: string): string {
  const fileId = extractGoogleDriveFileId(input);
  if (!fileId) return '';
  
  // If it's already a complete preview URL
  if (input.includes('/preview') && input.includes('drive.google.com/file/d/')) {
    return input;
  }
  
  // For direct file IDs, create a preview URL
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Creates a Google Drive direct image URL
 */
export function getGoogleDriveImageUrl(input: string): string {
  const fileId = extractGoogleDriveFileId(input);
  if (!fileId) return '';
  // Use the direct image link for embedding
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Creates a Google Drive download URL
 */
export function getGoogleDriveDownloadUrl(input: string): string {
  const fileId = extractGoogleDriveFileId(input);
  if (!fileId) return '';
  
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Checks if a string is a valid Google Drive file ID or URL
 */
export function isValidGoogleDriveInput(input: string | undefined | null): boolean {
  if (!input) return false;
  
  // File ID format
  if (/^[a-zA-Z0-9_-]{25,33}$/.test(input.trim())) {
    return true;
  }
  
  // URL format
  const googleDriveUrlRegex = /https:\/\/(drive\.google\.com\/(file\/d\/|open\?id=|uc\?|drive\/u\/\d+\/)|docs\.google\.com\/(document|spreadsheets|presentation)\/d\/)/i;
  return googleDriveUrlRegex.test(input);
}

// Function to escape apostrophes for React components
export const escapeApostrophe = (text: string): string => {
  return text.replace(/'/g, "\\'");
};

// Gallery category validation helper
export function validateGalleryCategory(category: string): GalleryCategory {
  // Check if the category is valid
  if (GALLERY_CATEGORIES.includes(category as GalleryCategory)) {
    return category as GalleryCategory;
  }
  
  // Try to match case-insensitively
  const matchingCategory = GALLERY_CATEGORIES.find(
    validCategory => validCategory.toLowerCase() === category.toLowerCase()
  );
  
  // Return the matched category or default to 'other'
  return matchingCategory || 'other';
}
