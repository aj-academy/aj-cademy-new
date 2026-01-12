import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { notifyAuthStateChanged } from '@/lib/auth';

interface AuthOptions {
  // Which routes to skip authentication for
  skipRoutes?: string[];
  // Where to redirect on authentication failure
  loginPath?: string;
  // Custom token key in localStorage (default: 'token')
  tokenKey?: string;
  // Should toast be shown on auth failure
  showToasts?: boolean;
}

export function useAuth(options: AuthOptions = {}) {
  const {
    skipRoutes = [],
    loginPath = '/auth/sign-in',
    tokenKey = 'token',
    showToasts = true
  } = options;
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  // Use refs to track redirect state to avoid infinite loops
  const hasRedirected = useRef<boolean>(false);
  const authChecked = useRef<boolean>(false);
  const currentPath = useRef<string>('');
  
  // Check if the current path should skip authentication
  const shouldSkipAuth = useCallback((path: string) => {
    if (!path) return false;
    return skipRoutes.some(route => 
      path === route || 
      path.startsWith(`${route}/`) ||
      path.includes(route)
    );
  }, [skipRoutes]);
  
  // Check authentication status
  const checkAuth = useCallback(() => {
    console.log(`[useAuth] Checking authentication with token key: ${tokenKey}`);
    
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        console.log('[useAuth] Running on server side, skipping auth check');
        setIsLoading(false);
        return;
      }
      
      // Get token and user data
      const token = localStorage.getItem(tokenKey);
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');
      
      console.log(`[useAuth] Token exists: ${!!token}, UserID exists: ${!!userId}`);
      
      if (!token) {
        console.log('[useAuth] No token found, setting unauthenticated');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        authChecked.current = true;
        return;
      }
      
      // Create user object
      const userData = {
        id: userId || user?._id || '',
        name: userName || 'User',
        email: userEmail || '',
        role: userRole || 'user',
        token
      };

      // Store userId in localStorage for later use
      if (userData.id) {
        localStorage.setItem('userId', userData.id);
      }

      console.log('[useAuth] Setting authenticated with user:', { ...userData, token: '***' });
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      authChecked.current = true;
      
    } catch (error) {
      console.error('[useAuth] Error during auth check:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      authChecked.current = true;
    }
  }, [tokenKey]);
  
  // Handle authentication check
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get the current path
    currentPath.current = window.location.pathname;
    
    // Skip auth check for specified routes
    if (shouldSkipAuth(currentPath.current)) {
      console.log(`[useAuth] Skipping auth check for path: ${currentPath.current}`);
      setIsLoading(false);
      return;
    }
    
    // Only check auth if it hasn't been checked yet
    if (!authChecked.current) {
      checkAuth();
    }
    
    // Listen for auth state changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === tokenKey || event.key === 'authTimestamp') {
        console.log(`[useAuth] Storage changed for key: ${event.key}, running auth check`);
        authChecked.current = false;
        checkAuth();
      }
    };
    
    const handleAuthEvent = () => {
      console.log('[useAuth] Auth event received, running auth check');
      authChecked.current = false;
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthEvent);
    };
  }, [tokenKey, shouldSkipAuth, checkAuth]);
  
  // Handle redirects based on auth state - separate effect to avoid loop
  useEffect(() => {
    // Don't do anything during loading or if already redirected
    if (isLoading || hasRedirected.current || typeof window === 'undefined') return;
    
    const path = currentPath.current || window.location.pathname;
    
    // Skip for specified routes
    if (shouldSkipAuth(path)) return;
    
    // Handle unauthorized state
    if (!isAuthenticated && authChecked.current) {
      console.log(`[useAuth] Not authenticated, redirecting to ${loginPath}`);
      
      // Prevent multiple redirects
      hasRedirected.current = true;
      
      if (showToasts) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue"
        });
      }
      
      // Redirect with the current path as returnUrl
      const returnUrl = encodeURIComponent(path);
      router.push(`${loginPath}?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoading, loginPath, router, shouldSkipAuth, showToasts, toast]);
  
  // Reset redirect flag when path changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleRouteChange = () => {
        const newPath = window.location.pathname;
        if (newPath !== currentPath.current) {
          currentPath.current = newPath;
          hasRedirected.current = false;
          
          // For auth pages, reset authChecked flag
          if (shouldSkipAuth(newPath)) {
            authChecked.current = true;
          }
        }
      };
      
      // Check for path changes
      const interval = setInterval(handleRouteChange, 500);
      return () => clearInterval(interval);
    }
  }, [shouldSkipAuth]);
  
  // Handle logout
  const logout = useCallback(() => {
    console.log('[useAuth] Logging out');
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    setIsAuthenticated(false);
    setUser(null);
    
    if (showToasts) {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
    }
    
    // Notify other components about the auth state change
    notifyAuthStateChanged(false);
    
    // Reset flags and redirect
    authChecked.current = true;
    hasRedirected.current = true;
    router.push(loginPath);
  }, [loginPath, router, showToasts, toast, tokenKey]);
  
  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
    checkAuth
  };
} 