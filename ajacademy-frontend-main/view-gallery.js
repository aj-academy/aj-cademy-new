// Node.js script to fetch and display gallery images
const fetch = require('node-fetch');
require('dotenv').config();

// Get API URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL + '/api' || 'http://localhost:5000/api';
console.log('Using API URL:', API_URL);

async function getGalleryImages() {
  const url = `${API_URL}/gallery`;
  
  try {
    console.log('Fetching gallery images from:', url);
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    
    const data = await response.text();
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      if (Array.isArray(jsonData)) {
        console.log(`Found ${jsonData.length} images in the gallery.`);
        jsonData.forEach((image, index) => {
          console.log(`\n--- Image ${index + 1} ---`);
          console.log(`Title: ${image.title}`);
          console.log(`Description: ${image.description}`);
          console.log(`Category: ${image.category}`);
          console.log(`Tags: ${image.tags ? image.tags.join(', ') : 'None'}`);
          console.log(`Photographer: ${image.photographer}`);
          console.log(`URL: ${image.url}`);
          console.log(`Google Drive Image: ${image.isGoogleDriveImage ? 'Yes' : 'No'}`);
          console.log(`Google Drive ID: ${image.googleDriveId || 'None'}`);
          console.log(`Image URL: ${image.imageUrl || 'None'}`);
          console.log(`Featured: ${image.featured ? 'Yes' : 'No'}`);
          console.log(`Created: ${image.createdAt}`);
        });
      } else {
        console.log('Unexpected response format:', JSON.stringify(jsonData, null, 2));
      }
    } catch (e) {
      // If not JSON, show as text
      console.log('Response data (text):', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getGalleryImages(); 