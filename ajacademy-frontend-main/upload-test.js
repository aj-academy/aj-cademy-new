// Node.js script to test gallery upload
const fetch = require('node-fetch');
require('dotenv').config();

// Get API URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL + '/api' || 'http://localhost:5000/api';
console.log('Using API URL:', API_URL);

async function uploadImage() {
  const url = `${API_URL}/gallery`;
  
  // Modified data format to match expected format from error messages
  const imageData = {
    title: "Test Image from Node.js (Final)",
    description: "Final test upload with correct field structure",
    category: "other", // Valid category
    tags: ["test", "node", "api-test"],
    url: "1WsMqgMcAklWKg_j8hpvXV6yExWpZHORT", // Google Drive ID in url field
    image: "1WsMqgMcAklWKg_j8hpvXV6yExWpZHORT", // Also include image field
    photographer: "Node.js Test",
    featured: false,
    isGoogleDriveImage: true,
    googleDriveId: "1WsMqgMcAklWKg_j8hpvXV6yExWpZHORT"
  };
  
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTEyMyIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJtYW5hZ2VfY291cnNlcyIsIm1hbmFnZV91c2VycyIsIm1hbmFnZV9jb250ZW50Il0sImlhdCI6MTc0NjM2MTIzMiwiZXhwIjoxNzQ2NDQ3NjMyfQ.BREsiyKdZCJeANhYLn-ZlOThApEzqJvsEMdxL97BFY0";
  
  try {
    console.log('Sending POST request to:', url);
    console.log('With data:', JSON.stringify(imageData, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(imageData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const data = await response.text();
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      console.log('Response data:', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      // If not JSON, show as text
      console.log('Response data (text):', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Let's also try to get a list of existing images to see what values are valid
async function getGalleryImages() {
  const url = `${API_URL}/gallery`;
  
  try {
    console.log('\nFetching existing gallery images...');
    const response = await fetch(url);
    
    console.log('GET Response status:', response.status);
    
    const data = await response.text();
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log('Sample image object structure:', JSON.stringify(jsonData[0], null, 2));
      } else {
        console.log('Gallery images:', JSON.stringify(jsonData, null, 2));
      }
    } catch (e) {
      // If not JSON, show as text
      console.log('Response data (text):', data);
    }
  } catch (error) {
    console.error('Error fetching gallery images:', error);
  }
}

// Run both functions
async function run() {
  await getGalleryImages(); // First get existing images to see structure
  await uploadImage(); // Then try to upload
}

run(); 