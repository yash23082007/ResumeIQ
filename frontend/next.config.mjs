import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_ORIGIN || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
  // Standalone output for Docker deployment
  output: 'standalone',
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
