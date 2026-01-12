import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from './auth-server';

/**
 * Forward a request to the backend API
 * @param request The incoming request
 * @param endpoint The API endpoint to forward to
 * @returns Response from the backend
 */
export async function forwardToBackend(request: NextRequest, endpoint: string): Promise<NextResponse> {
  try {
    // Get token from request
    const token = await getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Make sure the endpoint starts with /api
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    
    // Forward request to backend API
    const apiUrl = `${backendUrl}${apiEndpoint}`;
    
    console.log(`Forwarding request to: ${apiUrl}`);
    
    // Extract request body and headers
    let body: string | FormData | null = null;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };
    
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      
      if (contentType && contentType.includes('multipart/form-data')) {
        // Handle file uploads
        body = await request.formData();
      } else {
        // Handle JSON requests
        try {
          body = await request.text();
          if (body) {
            headers['Content-Type'] = 'application/json';
          }
        } catch (e) {
          console.error('Error getting request body:', e);
        }
      }
    }
    
    // Forward the request with the same method
    const response = await fetch(apiUrl, {
      method: request.method,
      headers,
      body: body || undefined
    });
    
    if (!response.ok) {
      // Forward the error status
      return NextResponse.json(
        { error: `Error from backend: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error forwarding request to ${endpoint}:`, error);
    return NextResponse.json(
      { error: "Failed to forward request to backend" },
      { status: 500 }
    );
  }
} 