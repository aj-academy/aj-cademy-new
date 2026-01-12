/**
 * This file handles forwarding API requests from the Next.js API routes to the Express backend.
 * It allows for a gradual migration from Next.js API routes to the Express backend.
 */

import { NextResponse } from 'next/server';

export { NextResponse };

// Get the appropriate backend URL based on environment
const getBackendUrl = () => {
  // Check if we're running in local production test mode (prod script)
  const isLocalProdTest = process.env.NODE_ENV === 'production' && 
    typeof window === 'undefined' && 
    process.env.NEXT_PUBLIC_BACKEND_URL && 
    !process.env.VERCEL;
    
  if (isLocalProdTest) {
    console.log('Backend proxy: Running in local production test mode');
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // In development, use the env variable
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // In production, use the production URL from env
  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

// Use the function to get the URL when the module loads
const BACKEND_URL = getBackendUrl();
console.log(`Backend proxy using URL: ${BACKEND_URL} (NODE_ENV: ${process.env.NODE_ENV})`);

// Throw an error if the backend URL is not set
if (!BACKEND_URL) {
  console.error('Backend proxy: NEXT_PUBLIC_BACKEND_URL environment variable is not set');
  throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable is not set');
}

export async function forwardToBackend(request: Request, path: string) {
  try {
    // Preserve query parameters from the original request
    const originalUrl = new URL(request.url);
    const backendUrl = new URL(path, BACKEND_URL);
    
    // Copy query parameters from original request to backend URL
    for (const [key, value] of originalUrl.searchParams.entries()) {
      backendUrl.searchParams.set(key, value);
    }
    
    console.log(`Backend proxy: Forwarding ${request.method} request to: ${backendUrl.toString()}`);
    console.log(`Backend proxy: Original query params:`, Object.fromEntries(originalUrl.searchParams.entries()));
    
    // Create new headers from the original request
    const headers = new Headers();
    
    // Copy all headers from the original request
    for (const [key, value] of Array.from(request.headers.entries())) {
      // Skip headers that cause issues with fetch API
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'host' && 
          lowerKey !== 'expect' && 
          lowerKey !== 'connection' &&
          lowerKey !== 'x-forwarded-for' &&
          lowerKey !== 'x-forwarded-host' &&
          lowerKey !== 'x-forwarded-port' &&
          lowerKey !== 'x-forwarded-proto') {
        headers.set(key, value);
      }
    }
    
    // Add required headers for cross-origin and content negotiation
    headers.set('Accept', 'application/json');
    
    // Only set Content-Type if not already set
    if (!headers.has('content-type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    // IMPORTANT: Ensure authorization header is preserved
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      console.log('Backend proxy: Authorization header present, forwarding to backend');
      headers.set('Authorization', authHeader);
    } else {
      console.log('Backend proxy: No Authorization header in request');
      
      // For testing locally in production mode, you might add a default test token here
      // headers.set('Authorization', 'Bearer test-token-for-local-dev');
    }
    
    // Check for cookies that might contain authentication tokens
    const cookies = request.headers.get('cookie');
    if (cookies) {
      headers.set('Cookie', cookies);
    }
    
    // Log the request headers
    const headersObj = Object.fromEntries(headers.entries());
    // Don't log the actual auth token value for security
    if (headersObj.authorization) {
      headersObj.authorization = 'Bearer [REDACTED]';
    }
    console.log('Backend proxy: Request headers:', headersObj);
    
    // Process request body
    let requestBody;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        // Check if the body is in JSON format
        const contentType = request.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const bodyText = await request.text();
          console.log('Backend proxy: JSON request body:', bodyText);
          requestBody = bodyText;
        } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          const obj = Object.fromEntries(formData.entries());
          console.log('Backend proxy: Form request body:', obj);
          requestBody = JSON.stringify(obj);
          headers.set('Content-Type', 'application/json');
        } else {
          // For non-JSON content, just pass the body as is
          const arrayBuffer = await request.arrayBuffer();
          requestBody = arrayBuffer;
          console.log('Backend proxy: Binary request body length:', arrayBuffer.byteLength);
        }
      } catch (error) {
        console.error('Error processing request body:', error);
        // If we can't process the body, continue without it
      }
    }
    
    // Implement request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Forward the request to the backend
      console.log(`Backend proxy: Sending ${request.method} request to ${backendUrl.toString()}`);
      const response = await fetch(backendUrl.toString(), {
        method: request.method,
        headers,
        body: requestBody,
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Log response details
      console.log('Backend proxy: Response status:', response.status);
      
      // If we're running locally in prod mode but connecting to a remote backend
      // and getting errors, offer a simulated response for testing
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL &&
          typeof window === 'undefined' && 
          (response.status >= 500 || response.status === 0)) {
        
        console.warn('Backend proxy: Error response from production API, providing simulated response for local testing');
        
        // Check what endpoint we're trying to access and provide appropriate mock data
        if (path.includes('/jobseeker/profile')) {
          return NextResponse.json({
            success: true,
            message: "Mock profile for local testing",
            data: {
              _id: "mock-id-12345",
              firstName: "Test",
              lastName: "User",
              email: "test@example.com",
              profile: {
                experience: "2 years",
                skills: ["JavaScript", "React", "Node.js"]
              }
            }
          }, { status: 200 });
        }
        
        if (path.includes('/running-text')) {
          return NextResponse.json([
            { _id: "mock1", text: "Mock running text 1 for local testing", isActive: true },
            { _id: "mock2", text: "Mock running text 2 for local testing", isActive: true }
          ], { status: 200 });
        }
      }
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.error(`Backend proxy: Authentication error (${response.status}) when accessing ${path}`);
        
        // Try to get more details about the error
        try {
          const errorData = await response.json();
          console.error('Backend proxy: Auth error details:', errorData);
          
          return NextResponse.json(
            { 
              success: false,
              error: errorData.error || 'Authentication failed. Please log in again.',
              details: errorData.details || errorData.message || ''
            },
            { status: response.status }
          );
        } catch (parseError) {
          // If we can't parse the error response as JSON
          console.error('Backend proxy: Failed to parse auth error response:', parseError);
          return NextResponse.json(
            { success: false, error: 'Authentication failed. Please log in again.' },
            { status: response.status }
          );
        }
      }

      // Get the content type from the response
      const contentType = response.headers.get('content-type');
      console.log('Backend proxy: Response content type:', contentType);
      
      // Create response headers
      const responseHeaders = new Headers();
      
      // Copy important headers from the backend response
      for (const [key, value] of Array.from(response.headers.entries())) {
        if (['content-type', 'set-cookie', 'authorization'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      }
      
      // Handle different response types
      if (contentType?.includes('application/json')) {
        try {
          const responseText = await response.text();
          console.log('Backend proxy: Response body text:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
          
          // Try to parse as JSON
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            console.error('Response text that failed to parse:', responseText);
            
            // Check if response is empty or whitespace
            if (!responseText.trim()) {
              console.error('Empty response received from server');
              return NextResponse.json(
                { success: false, error: 'Empty response received from server' },
                { status: 500 }
              );
            }
            
            // Try to fix common JSON parsing errors
            let fixedText = responseText;
            
            // Sometimes responses might have extra characters at the beginning or end
            // Try to find JSON-like content between { and }
            const jsonMatch = responseText.match(/{(.|\n)*}/);
            if (jsonMatch) {
              fixedText = jsonMatch[0];
              console.log('Backend proxy: Attempting to parse extracted JSON content');
              try {
                data = JSON.parse(fixedText);
                // If parsing succeeds with fixed text
                return NextResponse.json(data, { 
                  status: response.status,
                  headers: responseHeaders
                });
              } catch (e) {
                console.error('Still failed to parse extracted JSON content');
              }
            }
            
            return NextResponse.json(
              { 
                success: false, 
                error: 'Invalid JSON response from server',
                rawResponse: responseText.length > 500 
                  ? `${responseText.substring(0, 500)}... (truncated)` 
                  : responseText
              },
              { status: 500 }
            );
          }
          
          return NextResponse.json(data, { 
            status: response.status,
            headers: responseHeaders
          });
        } catch (error) {
          console.error('Error handling JSON response:', error);
          return NextResponse.json(
            { success: false, error: 'Error processing server response' },
            { status: 500 }
          );
        }
      } else {
        // For non-JSON responses, create a response object that contains content type information
        const text = await response.text();
        console.log('Backend proxy: Non-JSON response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
        
        // Create a response with the original content type preserved
        const newResponse = new NextResponse(text, {
          status: response.status,
          headers: responseHeaders
        });
        
        // Ensure content type header is preserved
        if (contentType) {
          newResponse.headers.set('content-type', contentType);
        }
        
        return newResponse;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error connecting to backend:', fetchError);
      
      // If we're running locally in prod mode and can't connect to the remote backend,
      // provide mock data for testing
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL && typeof window === 'undefined') {
        console.warn('Backend proxy: Cannot connect to production API, providing mock data for local testing');
        
        // Check what endpoint we're trying to access and provide appropriate mock data
        if (path.includes('/jobseeker/profile')) {
          return NextResponse.json({
            success: true,
            message: "Mock profile for local testing (connection failed)",
            data: {
              _id: "mock-id-12345",
              firstName: "Test",
              lastName: "User",
              email: "test@example.com",
              profile: {
                experience: "2 years",
                skills: ["JavaScript", "React", "Node.js"]
              }
            }
          }, { status: 200 });
        }
        
        if (path.includes('/running-text')) {
          return NextResponse.json([
            { _id: "mock1", text: "Mock running text 1 for local testing (connection failed)", isActive: true },
            { _id: "mock2", text: "Mock running text 2 for local testing (connection failed)", isActive: true }
          ], { status: 200 });
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to backend', 
          details: fetchError instanceof Error ? fetchError.message : 'Connection error' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in backend proxy:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to forward request to backend', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 