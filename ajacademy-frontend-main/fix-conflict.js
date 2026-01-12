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

// Main function
function fixConflict() {
  try {
    console.log('🔍 Finding conflicting route directories...');
    
    // Path to the conflicting directory
    const conflictDir = path.join(__dirname, 'app', 'api', 'courses', '[courseId]');
    
    if (fs.existsSync(conflictDir)) {
      console.log(`Found conflicting directory: ${conflictDir}`);
      deleteFolderRecursive(conflictDir);
      console.log('✅ Successfully removed conflicting directory');
    } else {
      console.log('No conflicting directory found at:', conflictDir);
    }
    
  } catch (error) {
    console.error('❌ Error fixing conflict:', error);
  }
}

// Execute
fixConflict(); 