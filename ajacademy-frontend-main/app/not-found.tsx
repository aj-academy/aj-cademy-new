import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">
        We couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link 
        href="/" 
        className="mt-6 px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
} 