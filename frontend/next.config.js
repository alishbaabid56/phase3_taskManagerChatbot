/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'alishba-abid-dev-todo-backend.hf.space',  // correct format
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*', // frontend fetch path
        destination: 'https://alishba-abid-dev-todo-backend.hf.space/api/:path*', // backend URL
      },
    ];
  },
};

module.exports = nextConfig;
