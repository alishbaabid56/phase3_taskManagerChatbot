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
        hostname: 'https://alishba-abid-dev-todo-backend.hf.space/',  // jo bhi real backend domain hai, ya agar sab allowed to '**'
      },
      // Optional: testing ke liye wildcard (baad mein remove kar sakti ho)
      // { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;