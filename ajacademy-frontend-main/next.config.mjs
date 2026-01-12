/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.env.NODE_ENV === 'development' ? undefined : process.cwd(),
    clientModulesWrapper: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 5,
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
      }
    ];
  },
};

export default nextConfig;
