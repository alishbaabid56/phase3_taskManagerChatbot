/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  images: {
    domains: ['localhost', 'your-backend-domain.com'], // Add your image domains here
  },
};

module.exports = nextConfig;