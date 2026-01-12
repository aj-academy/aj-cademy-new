/**
 * Application-wide constants
 */

export const GALLERY_CATEGORIES = [
  'other',
  'students',
  'campus',
  'events',
  'classroom',
  'faculty',
  'sports',
  'graduation',
  'workshops'
] as const;

export type GalleryCategory = typeof GALLERY_CATEGORIES[number];

// Add more constants as needed 