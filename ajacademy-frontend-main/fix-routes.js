/**
 * Script to convert all API routes to use the backend proxy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directory for our API routes
const apiDir = path.join(__dirname, 'app', 'api');

// Template for the route file
const routeTemplate = (relativePath, endpoint, hasIdParam) => {
  let params = '';
  let extractId = '';

  if (hasIdParam) {
    params = `, { params }: Params`;
    extractId = `\n  const { id } = params;`;
  }

  return `import { NextResponse } from 'next/server';
import { forwardToBackend } from '${relativePath}backend-proxy';

${hasIdParam ? `interface Params {
  params: {
    id: string;
  }
}\n` : ''}
export async function GET(request: Request${params}) {${extractId}
  return forwardToBackend(request, \`${endpoint}\`);
}

export async function POST(request: Request${params}) {${extractId}
  return forwardToBackend(request, \`${endpoint}\`);
}

export async function PUT(request: Request${params}) {${extractId}
  return forwardToBackend(request, \`${endpoint}\`);
}

export async function DELETE(request: Request${params}) {${extractId}
  return forwardToBackend(request, \`${endpoint}\`);
}
`;
};

// Walk through directories recursively
function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat && stat.isDirectory()) {
      // Recurse into subdirectory
      results = results.concat(walkDir(fullPath));
    } else if (file === 'route.ts') {
      // Found a route file
      results.push(fullPath);
    }
  });
  
  return results;
}

// Process each route file
function processRouteFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  // Get relative path from route file to api directory
  const relativePath = path.dirname(filePath).replace(apiDir, '');
  
  // Calculate import path (number of ../ needed)
  const depth = relativePath.split(path.sep).filter(Boolean).length;
  const importPath = '../'.repeat(depth);
  
  // Determine API endpoint
  let endpoint = `/api${relativePath.replace(/\\/g, '/')}`;
  
  // Check if this is a dynamic route with [id] parameter
  const hasIdParam = relativePath.includes('[id]');
  
  // Replace [id] with ${id} in the endpoint
  if (hasIdParam) {
    endpoint = endpoint.replace(/\[id\]/g, '${id}');
  }
  
  // Generate the new route file content
  const newContent = routeTemplate(importPath, endpoint, hasIdParam);
  
  // Write the new content
  fs.writeFileSync(filePath, newContent);
  console.log(`Updated ${filePath}`);
}

// Main function
function main() {
  console.log('Starting conversion of API routes...');
  
  try {
    // Find all route files
    const routeFiles = walkDir(apiDir);
    console.log(`Found ${routeFiles.length} route files`);
    
    // Process each file
    routeFiles.forEach(processRouteFile);
    
    console.log('Conversion complete! Building project...');
    
    // Try to build the project
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('Build successful!');
    } catch (error) {
      console.error('Build failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

// Run the script
main(); 