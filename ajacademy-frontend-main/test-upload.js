// Test script to upload an image to the gallery using admin token
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTEyMyIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJtYW5hZ2VfY291cnNlcyIsIm1hbmFnZV91c2VycyIsIm1hbmFnZV9jb250ZW50Il0sImlhdCI6MTc0NjM2MTIzMiwiZXhwIjoxNzQ2NDQ3NjMyfQ.BREsiyKdZCJeANhYLn-ZlOThApEzqJvsEMdxL97BFY0";

// Sample image data to upload
const imageData = {
  title: "Test Image from Admin Token",
  description: "This is a test image uploaded using the admin token for testing purposes",
  category: "campus",
  tags: ["test", "admin", "token-test"],
  url: "1WsMqgMcAklWKg_j8hpvXV6yExWpZHORT", // Google Drive ID
  photographer: "Admin Test User",
  featured: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Function to test image upload
async function testGalleryUpload() {
  console.log("Starting gallery image upload test...");
  
  try {
    // Make the POST request to the gallery API
    const response = await fetch('/api/gallery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(imageData)
    });
    
    const result = await response.json();
    
    // Log the result
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('Image upload successful!');
      console.log('Image ID:', result.data?._id || result.data?.id);
    } else {
      console.error('Upload failed:', result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error during image upload test:', error);
  }
}

// Run the test
testGalleryUpload(); 