/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return [
      // Rewrite all HR API requests to the backend server
      {
        source: '/api/hr/:path*',
        destination: `${backendUrl}/api/hr/:path*`,
      },
      // Add other API rewrite rules as needed
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/api/admin/:path*`,
      },
      // Student API routes
      {
        source: '/api/student/:path*',
        destination: `${backendUrl}/api/student/:path*`,
      },
      // Project API routes
      {
        source: '/api/projects',
        destination: `${backendUrl}/api/projects`,
      },
      {
        source: '/api/projects/:path*',
        destination: `${backendUrl}/api/projects/:path*`,
      },
      // Certificates API routes
      {
        source: '/api/certificates/:path*',
        destination: `${backendUrl}/api/certificates/:path*`,
      },
      // Jobseeker API routes
      {
        source: '/api/jobseeker/:path*',
        destination: `${backendUrl}/api/jobseeker/:path*`,
      }
    ];
  },
}

module.exports = nextConfig 