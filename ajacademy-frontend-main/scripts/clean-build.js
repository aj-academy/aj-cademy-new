/**
 * Clean Build Script
 * 
 * This script runs the Next.js build process with
 * error handling and reporting.
 */

const { execSync } = require('child_process');

// Main function
async function main() {
  console.log('🚀 Starting optimized build process');
  
  try {
    // Run the actual build command
    console.log('🏗️ Running Next.js build...');
    execSync('next build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
    
  } catch (error) {
    console.error('❌ Error during build:', error);
    process.exit(1);
  }
}

// Run the script
main(); 