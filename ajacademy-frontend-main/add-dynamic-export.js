const fs = require('fs');
const path = require('path');

// Function to walk directory recursively and update files
function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file === 'route.ts' || file === 'route.js') {
      // Read file content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if it uses forwardToBackend and doesn't already have dynamic export
      if (content.includes('forwardToBackend') && !content.includes('export const dynamic')) {
        console.log(`Adding dynamic export to: ${filePath}`);
        
        // Find the position after the imports
        const importEndPos = content.lastIndexOf('import');
        const importEndLinePos = content.indexOf('\n', importEndPos);
        
        // Add the dynamic export after the imports
        content = content.slice(0, importEndLinePos + 1) + 
                 '\n// This export ensures the route is always rendered dynamically\n' +
                 '// and not statically optimized during build time\n' +
                 'export const dynamic = \'force-dynamic\';\n' + 
                 content.slice(importEndLinePos + 1);
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content);
      }
    }
  });
}

// Start from the api directory
const apiDir = path.join(__dirname, 'app', 'api');
console.log(`Updating API routes in: ${apiDir}`);
walk(apiDir);
console.log('Done updating API routes.'); 