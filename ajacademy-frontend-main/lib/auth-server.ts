import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { NextRequest } from 'next/server';

/**
 * Get the server-side authentication token from cookies
 */
export async function getServerToken(cookieStore?: ReadonlyRequestCookies): Promise<string | null> {
  const cookieJar = cookieStore || cookies();
  const token = cookieJar.get('token')?.value;
  
  return token || null;
}

/**
 * Get token from request headers or cookies
 */
export async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  // Try from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Then try from cookies
  const token = request.cookies.get('token')?.value;
  return token || null;
}

/**
 * Get server-side user role
 */
export async function getServerRole(cookieStore?: ReadonlyRequestCookies): Promise<string | null> {
  const cookieJar = cookieStore || cookies();
  const role = cookieJar.get('userRole')?.value;
  
  return role || null;
}

/**
 * Verify if the user is authenticated on the server
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = await getTokenFromRequest(request);
  return !!token;
}

/**
 * Helper to check a specific role
 */
export async function hasRole(request: NextRequest, requiredRole: string): Promise<boolean> {
  const token = await getTokenFromRequest(request);
  if (!token) return false;
  
  // Get role from cookie
  const role = request.cookies.get('userRole')?.value;
  return role === requiredRole;
} 