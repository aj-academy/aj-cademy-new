'use client';

import { useEffect } from 'react';

export default function ClarityAnalytics() {
  useEffect(() => {
    // Skip Clarity in development mode or if project ID is not set
    if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
      return;
    }

    const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    // Add Clarity tracking code
    (function(c: any, l: Document, a: string, r: string, i: string, t: any, y: any) {
      c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      if (t) {
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
      }
      y = l.getElementsByTagName(r)[0];
      if (y && y.parentNode && t) {
        y.parentNode.insertBefore(t, y);
      }
    })(window, document, "clarity", "script", clarityProjectId, undefined, undefined);
  }, []);

  // This component doesn't render anything
  return null;
} 