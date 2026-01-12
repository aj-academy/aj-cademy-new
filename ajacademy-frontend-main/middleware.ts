import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is an RSC request (contains _rsc parameter)
  const isRscRequest = request.nextUrl.searchParams.has('_rsc');
  
  // List of paths that are used in RSC requests but don't exist as actual routes
  const nonExistentRscRoutes = [
    '/faqs',
    '/support',
    '/profile',
  ];
  
  // For RSC requests to non-existent routes, redirect to the homepage
  if (isRscRequest) {
    const pathname = request.nextUrl.pathname;
    
    if (nonExistentRscRoutes.some(route => pathname.startsWith(route))) {
      // Return empty 200 response instead of 404 for React Server Components
      return new NextResponse(JSON.stringify({ data: null }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    }
  }
  
  // Continue normal request processing
  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/faqs/:path*',
    '/support/:path*',
    '/profile/:path*',
  ],
}; 