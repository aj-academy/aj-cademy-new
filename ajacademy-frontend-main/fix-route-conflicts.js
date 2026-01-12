const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const routeTemplate = `import { NextResponse } from 'next/server';
import { forwardToBackend } from '{relativePath}backend-proxy';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}\`);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}\`);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}\`);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}\`);
}`;

// For nested route parameters, like [param1]/[param2]
const nestedRouteTemplate = `import { NextResponse } from 'next/server';
import { forwardToBackend } from '{relativePath}backend-proxy';

export async function GET(request: Request, { params }: { params: { id: string; status: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}/\${params.status}\`);
}

export async function POST(request: Request, { params }: { params: { id: string; status: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}/\${params.status}\`);
}

export async function PUT(request: Request, { params }: { params: { id: string; status: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}/\${params.status}\`);
}

export async function DELETE(request: Request, { params }: { params: { id: string; status: string } }) {
  return forwardToBackend(request, \`{apiPath}/\${params.id}/\${params.status}\`);
}`;

// Check for conflict markers
function hasConflicts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('<<<<<<< HEAD');
}

// Calculate relative path to backend-proxy
function getRelativePath(filePath) {
  // Count how many levels deep from app/api
  const parts = filePath.split(path.sep);
  const apiIndex = parts.indexOf('api');
  if (apiIndex === -1) return './';
  
  const levelsDeep = parts.length - apiIndex - 2; // -2 for 'api' and the file itself
  return '../'.repeat(levelsDeep);
}

// Calculate API path
function getApiPath(filePath) {
  // Extract the api path, e.g., /api/students, /api/jobs, etc.
  const parts = filePath.split(path.sep);
  const apiIndex = parts.indexOf('api');
  if (apiIndex === -1) return '/api';
  
  // Build path up to the [id] part
  const apiParts = [];
  for (let i = apiIndex; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!part.includes('[')) {
      apiParts.push(part);
    }
  }
  
  return '/' + apiParts.join('/');
}

// Determine if route has nested parameters
function hasNestedParams(filePath) {
  const parts = filePath.split(path.sep);
  let foundBracket = false;
  
  for (const part of parts) {
    if (part.includes('[')) {
      if (foundBracket) {
        return true; // Found a second bracket parameter
      }
      foundBracket = true;
    }
  }
  
  return false;
}

// Determine the parameter names for nested routes
function getNestedParamNames(filePath) {
  const parts = filePath.split(path.sep);
  const params = [];
  
  for (const part of parts) {
    if (part.includes('[') && part.includes(']')) {
      const paramName = part.replace('[', '').replace(']', '');
      params.push(paramName);
    }
  }
  
  return params;
}

// Fix a route file
function fixRouteFile(filePath) {
  try {
    const relativePath = getRelativePath(filePath);
    const apiPath = getApiPath(filePath);
    
    console.log(`Fixing ${filePath}`);
    console.log(`  relativePath: ${relativePath}`);
    console.log(`  apiPath: ${apiPath}`);
    
    let template;
    
    if (hasNestedParams(filePath)) {
      template = nestedRouteTemplate;
      const params = getNestedParamNames(filePath);
      
      if (params.length >= 2) {
        // Customize the template for the specific parameter names
        template = template
          .replace(/id: string; status: string/g, `${params[0]}: string; ${params[1]}: string`)
          .replace(/params.id\/\${params.status/g, `params.${params[0]}/\${params.${params[1]}`);
      }
    } else {
      template = routeTemplate;
    }
    
    const updatedContent = template
      .replace(/{relativePath}/g, relativePath)
      .replace(/{apiPath}/g, apiPath);
    
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Find all route files with conflicts
glob('app/api/**/*route.ts').then(files => {  
  // Filter for files with conflicts and [id] routes
  const conflictedRoutes = files.filter(file => {
    return file.includes('[') && hasConflicts(file);
  });
  
  console.log(`Found ${conflictedRoutes.length} conflicted route files`);
  
  // Fix each file
  conflictedRoutes.forEach(fixRouteFile);
  
  console.log('Done fixing route conflicts');
}).catch(err => {
  console.error('Error finding files:', err);
}); 