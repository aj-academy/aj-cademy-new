import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Secret key for JWT (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'aj-academy-default-secret-key-replace-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Interface for JWT payloads
export interface JwtPayload {
  id: string;
  email: string;
  role?: string;
  [key: string]: any;
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JwtPayload): string {
  try {
    const options: SignOptions = { 
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    };
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);
    return decoded as JwtPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Verify admin authentication from request headers
 */
export function verifyAdminAuth(req: NextRequest): { authorized: boolean; adminId?: string } {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    console.log('[verifyAdminAuth] Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[verifyAdminAuth] No Bearer token found');
      return { authorized: false };
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    console.log('[verifyAdminAuth] Token extracted:', token ? token.substring(0, 20) + '...' : 'none');
    
    // Special case for mock token (for demo purposes only)
    if (token && token.split('.').length === 3) {
      try {
        // For our mock token, we'll just decode the middle part
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        console.log('[verifyAdminAuth] Decoded payload:', decodedPayload);
        
        if (decodedPayload.role === 'admin') {
          console.log('[verifyAdminAuth] Admin authenticated successfully');
          return { authorized: true, adminId: decodedPayload.id };
        }
      } catch (e) {
        console.error('[verifyAdminAuth] Error decoding mock token:', e);
      }
    }
    
    // Regular JWT verification
    const decoded = verifyToken(token);
    console.log('[verifyAdminAuth] JWT verification result:', decoded);
    
    if (!decoded || decoded.role !== 'admin') {
      console.log('[verifyAdminAuth] Invalid or non-admin token');
      return { authorized: false };
    }

    console.log('[verifyAdminAuth] Admin authenticated successfully');
    return { authorized: true, adminId: decoded.id };
  } catch (error) {
    console.error('[verifyAdminAuth] Admin auth verification error:', error);
    return { authorized: false };
  }
}

/**
 * Get the token from localStorage (client-side)
 */
export function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Get the current user from the token in localStorage (client-side)
 */
export function getClientUser(): JwtPayload | null {
  const token = getClientToken();
  if (!token) return null;
  
  try {
    return verifyToken(token);
  } catch (error) {
    console.error('Failed to get client user:', error);
    return null;
  }
}

/**
 * Check if the current user has a specific role
 */
export function hasRole(role: string): boolean {
  const user = getClientUser();
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if the current user is a student
 */
export function isStudent(): boolean {
  return hasRole('student');
}

/**
 * Check if the current user is a job seeker
 */
export function isJobSeeker(): boolean {
  return hasRole('jobseeker');
}

/**
 * Check if the current user is a recruiter
 */
export function isRecruiter(): boolean {
  return hasRole('recruiter') || hasRole('hr'); // Support legacy 'hr' role
}

/**
 * Check if the current user is an admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Set token in localStorage (client-side)
 */
export function setClientToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/**
 * Clear token from localStorage (client-side)
 */
export function clearClientToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

/**
 * Auth utility functions for synchronizing authentication state across components
 */

// Custom event for auth state changes
export const AUTH_STATE_CHANGED_EVENT = 'authStateChanged';

/**
 * Notifies all parts of the application about auth state changes
 * @param isAuthenticated The new authentication state
 * @param user Optional user data to include with the event
 */
export function notifyAuthStateChanged(isAuthenticated: boolean, user?: any): void {
  if (typeof window === 'undefined') return;
  
  console.log('[auth] Dispatching auth state changed event:', isAuthenticated);
  
  // Use CustomEvent to notify all parts of the application
  const event = new CustomEvent(AUTH_STATE_CHANGED_EVENT, { 
    detail: { 
      isAuthenticated,
      user,
      timestamp: Date.now() 
    } 
  });
  
  // Update timestamp in localStorage to notify other tabs/windows
  localStorage.setItem('authTimestamp', Date.now().toString());
  
  // Dispatch event
  window.dispatchEvent(event);
}

/**
 * Set up a listener for auth state changes
 * @param callback Function to call when auth state changes
 * @returns Cleanup function to remove the listener
 */
export function listenToAuthChanges(callback: (isAuthenticated: boolean, user?: any) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleAuthEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent?.detail) {
      callback(customEvent.detail.isAuthenticated, customEvent.detail.user);
    }
  };
  
  window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthEvent);
  
  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthEvent);
  };
} 