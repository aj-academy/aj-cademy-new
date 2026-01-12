'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-red-600">Critical Error</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-700">Something went seriously wrong</h2>
      <p className="mt-4 text-gray-600">
        We apologize for the inconvenience. Our team has been notified of this issue.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
        <Link 
          href="/" 
          className="px-6 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
} 