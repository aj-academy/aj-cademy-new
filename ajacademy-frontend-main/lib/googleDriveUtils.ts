/**
 * Extract a Google Drive file ID from various URL formats or return the ID if already clean
 * 
 * Handles the following formats:
 * - https://drive.google.com/file/d/{FILE_ID}/view
 * - https://drive.google.com/file/d/{FILE_ID}/preview
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://docs.google.com/document/d/{FILE_ID}/edit
 * - https://drive.google.com/uc?id={FILE_ID}
 * - {FILE_ID} (raw ID)
 * 
 * @param input The URL or ID string
 * @returns The extracted file ID or the original string if it appears to be just an ID
 */
export const extractGoogleDriveFileId = (input: string): string => {
  if (!input) return '';
  
  // Clean up the input
  const trimmed = input.trim();
  
  // Check for standard file URL pattern: /file/d/{ID}/view or /file/d/{ID}/preview
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }
  
  // Check for open URL pattern: /open?id={ID}
  const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (openMatch && openMatch[1]) {
    return openMatch[1];
  }
  
  // Check for docs URL pattern: /document/d/{ID}/
  const docsMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]{25,})/);
  if (docsMatch && docsMatch[1]) {
    return docsMatch[1];
  }
  
  // Check if it's already a clean ID (25+ alphanumeric chars with possible hyphens and underscores)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Final fallback: Just look for anything that resembles a Drive ID anywhere in the string
  const anyMatch = trimmed.match(/([a-zA-Z0-9_-]{25,})/);
  if (anyMatch && anyMatch[1]) {
    return anyMatch[1];
  }
  
  // Return original if no match found
  return trimmed;
};

/**
 * Formats the video duration in seconds to MM:SS format
 * 
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Creates a Google Drive preview embed URL
 * 
 * @param fileId Google Drive file ID
 * @returns The full embed URL
 */
export const getGoogleDriveEmbedUrl = (fileId: string): string => {
  const cleanId = extractGoogleDriveFileId(fileId);
  return `https://drive.google.com/file/d/${cleanId}/preview`;
};

/**
 * Calculate completion percentage based on watched seconds and total duration
 * 
 * @param watchedSeconds Seconds of the video watched
 * @param totalDuration Total duration of the video in seconds
 * @returns Percentage completed (0-100)
 */
export const calculateCompletionPercentage = (
  watchedSeconds: number,
  totalDuration: number
): number => {
  if (!totalDuration) return 0;
  return Math.min(Math.round((watchedSeconds / totalDuration) * 100), 100);
}; 