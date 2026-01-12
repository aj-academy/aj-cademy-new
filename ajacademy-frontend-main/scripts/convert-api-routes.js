/**
 * This script converts API routes in the frontend to use the backend proxy 
 * instead of directly accessing MongoDB.
 * 
 * Usage: node scripts/convert-api-routes.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// API routes directory
const API_DIR = path.join(__dirname, '..', 'app', 'api');

// Routes that have already been converted
const convertedRoutes = new Set();

// Template for converted routes
const getRouteTemplate = (endpoint, relativePath) => `import { NextResponse } from 'next/server';
import { forwardToBackend } from '${relativePath}';

export async function GET(request) {
  return forwardToBackend(request, '${endpoint}');
}

export async function POST(request) {
  return forwardToBackend(request, '${endpoint}');
}

export async function PUT(request) {
  return forwardToBackend(request, '${endpoint}');
}

export async function DELETE(request) {
  return forwardToBackend(request, '${endpoint}');
}
`;

/**
 * Get the relative path to backend-proxy.ts based on the current file's depth
 */
function getRelativePath(file) {
  // Get the relative path from API_DIR to the file
  const relativePath = path.relative(API_DIR, file);
  
  // Calculate how many directories deep the file is
  const segments = relativePath.split(path.sep);
  segments.pop(); // Remove the filename
  
  // Create the relative path to the backend-proxy
  let backPath = '';
  for (let i = 0; i < segments.length; i++) {
    backPath += '../';
  }
  
  return backPath + 'backend-proxy';
}

/**
 * Recursively scan directories for API route files
 */
async function scanDirectory(dir, baseDir = API_DIR) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? scanDirectory(res, baseDir) : res;
  }));
  return Array.prototype.concat(...files);
}

/**
 * Check if a file needs to be converted
 */
async function needsConversion(file) {
  // Only process route.ts files
  if (!file.endsWith('route.ts')) {
    return false;
  }
  
  // Skip files that don't directly use MongoDB
  const content = await readFile(file, 'utf8');
  return content.includes('dbConnect') && !content.includes('forwardToBackend');
}

/**
 * Convert a route file to use the backend proxy
 */
async function convertRoute(file) {
  console.log(`Converting ${file}`);
  
  // Determine API endpoint from file path
  const relativePath = path.relative(API_DIR, file);
  const dir = path.dirname(relativePath);
  
  // Construct endpoint - ensure forward slashes for API paths
  let endpoint = `/api/${dir.replace(/\\/g, '/')}`;
  
  // Handle dynamic routes - replace [param] with ${param}
  endpoint = endpoint.replace(/\[([^\]]+)\]/g, (_, param) => `\${${param}}`);
  
  // Get the correct path to the backend-proxy
  const backendProxyPath = getRelativePath(file);
  
  // Create the new file content
  const newContent = getRouteTemplate(endpoint, backendProxyPath);
  
  // Write the new file
  await writeFile(file, newContent, 'utf8');
  
  convertedRoutes.add(file);
}

/**
 * Main function
 */
async function main() {
  console.log('Scanning API routes...');
  
  try {
    // Get all files in the API directory
    const files = await scanDirectory(API_DIR);
    
    // Filter for files that need conversion
    const filesToConvert = [];
    for (const file of files) {
      if (await needsConversion(file)) {
        filesToConvert.push(file);
      }
    }
    
    console.log(`Found ${filesToConvert.length} routes to convert`);
    
    // Convert each file
    for (const file of filesToConvert) {
      await convertRoute(file);
    }
    
    console.log('Conversion complete!');
    console.log(`Converted ${convertedRoutes.size} routes`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main(); 