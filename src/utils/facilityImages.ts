/**
 * Facility Images Configuration
 * 
 * This file manages the image sources for all facilities.
 * Using custom images from /public/images/locations/
 */

export const facilityImages = {
  // University Playground
  'university-playground': '/images/locations/university-playground.jpg',
  
  // Main Auditorium
  'auditorium': '/images/locations/auditorium.jpg',
  
  // Indoor Stadium
  'indoor-stadium': '/images/locations/indoor-stadium.jpg',
  
  // Mini Auditorium
  'mini-auditorium': '/images/locations/mini-auditorium.jpg',
  
  // Student Center - NEW FACILITY
  'student-center': '/images/locations/student-center.jpg',
};

// Hero Section Background Image
export const heroBackgroundImage = '/images/locations/default.jpg';

// University Logo
export const universityLogo = '/images/locations/logo.png';

/**
 * Get image source for facility
 * @param facilityId - The ID of the facility
 * @returns Image URL
 */
export function getFacilityImage(facilityId: string): string {
  return facilityImages[facilityId as keyof typeof facilityImages] || '/images/locations/default.jpg';
}

/**
 * Get hero background image
 * @returns Hero background image URL
 */
export function getHeroBackgroundImage(): string {
  return heroBackgroundImage;
}

/**
 * Get university logo
 * @returns University logo URL
 */
export function getUniversityLogo(): string {
  return universityLogo;
}