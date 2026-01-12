import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../../backend-proxy';

export async function GET(request: Request) {
  return forwardToBackend(request, `/api/auth/jobseeker/login`);
}

export async function POST(request: Request) {
  try {
    // Extract JSON body data
    const data = await request.json().catch(() => ({}));
    
    // Create headers object without duplicating content-type 
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      // Skip content-type header as we'll add it explicitly
      if (key.toLowerCase() !== 'content-type') {
        headers.set(key, value);
      }
    }
    // Set content-type header once
    headers.set('Content-Type', 'application/json');
    
    // Create a new request with proper headers
    const newRequest = new Request(request.url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    
    // Forward the request to the backend
    return forwardToBackend(newRequest, '/api/auth/jobseeker/login');
  } catch (error) {
    console.error('Error in jobseeker login route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error processing login request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return forwardToBackend(request, `/api/auth/jobseeker/login`);
}

export async function DELETE(request: Request) {
  return forwardToBackend(request, `/api/auth/jobseeker/login`);
}
