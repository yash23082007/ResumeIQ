/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Standalone output for Docker deployment
  output: 'standalone',
};

export default nextConfig;
