const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to recursively delete a directory
function deleteFolderRecursive(pathToDelete) {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach((file) => {
      const curPath = path.join(pathToDelete, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recurse
        deleteFolderRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToDelete);
    console.log(`Deleted directory: ${pathToDelete}`);
  }
}

// Ensure CSS files are properly copied to the output directory
function ensureCssFiles() {
  console.log('📝 Ensuring CSS files are properly included...');
  // The .next/static/css directory should exist after build
  const cssDir = path.join(__dirname, '.next', 'static', 'css');
  
  if (fs.existsSync(cssDir)) {
    console.log('✅ CSS directory exists: ', cssDir);
  } else {
    console.warn('⚠️ CSS directory not found: ', cssDir);
  }
}

// Main build function
async function build() {
  try {
    console.log('🧹 Cleaning previous build artifacts...');
    
    // Delete .next folder
    const nextDir = path.join(__dirname, '.next');
    deleteFolderRecursive(nextDir);
    
    console.log('🚀 Starting build process...');
    
    // Run the Next.js build
    execSync('next build', { stdio: 'inherit' });
    
    // Ensure CSS files are properly included
    ensureCssFiles();
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Execute build
build(); 