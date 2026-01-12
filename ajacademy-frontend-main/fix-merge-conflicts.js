const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all files with conflict markers
const findConflictedFiles = () => {
  return new Promise((resolve, reject) => {
    glob('**/*', { ignore: ['node_modules/**', 'fix-merge-conflicts.js'] }, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Filter files to only include those with conflict markers
      const conflictedFiles = files.filter(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('<<<<<<< HEAD') || 
                 content.includes('=======') || 
                 content.includes('>>>>>>>');
        } catch (error) {
          console.error(`Error reading file ${file}:`, error.message);
          return false;
        }
      });

      resolve(conflictedFiles);
    });
  });
};

// Fix a conflicted file by taking the content from the branch
const fixConflictedFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if this is a binary file or doesn't seem to have conflicts
    if (!content.includes('<<<<<<< HEAD')) {
      console.log(`Skipping file ${filePath} - no conflicts found`);
      return;
    }

    console.log(`Fixing conflicts in ${filePath}...`);
    
    // Replace all conflict sections with the content from incoming branch
    const sections = [];
    let currentPos = 0;
    
    while (true) {
      const startMarker = content.indexOf('<<<<<<< HEAD', currentPos);
      if (startMarker === -1) break;
      
      sections.push(content.substring(currentPos, startMarker));
      
      const divider = content.indexOf('=======', startMarker);
      if (divider === -1) break;
      
      const endMarker = content.indexOf('>>>>>>>', divider);
      if (endMarker === -1) break;
      
      // Extract the content from the incoming branch (between ======= and >>>>>>>)
      const incomingContent = content.substring(divider + 7, endMarker);
      sections.push(incomingContent);
      
      // Move past the end marker
      const nextLine = content.indexOf('\n', endMarker);
      currentPos = nextLine !== -1 ? nextLine + 1 : content.length;
    }
    
    if (currentPos < content.length) {
      sections.push(content.substring(currentPos));
    }
    
    // Write fixed content
    const fixedContent = sections.join('');
    fs.writeFileSync(filePath, fixedContent);
    
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`Error fixing file ${filePath}:`, error.message);
  }
};

// Main function
async function main() {
  try {
    const conflictedFiles = await findConflictedFiles();
    console.log(`Found ${conflictedFiles.length} files with conflicts`);
    
    for (const file of conflictedFiles) {
      fixConflictedFile(file);
    }
    
    console.log('Conflicts resolution complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 