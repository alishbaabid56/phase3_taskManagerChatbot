/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
    // Turbopack disable (Next 16 mein yeh flag kaam karta hai)
    turbopack: false,   // ← Yeh line add kar do
  },
  images: {
    // Warning fix karne ke liye domains ko remotePatterns mein convert kar do
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'your-backend-domain.com',  // ya jo bhi real domain hai
      },
      // Agar images kisi aur jagah se aa rahi hain to yahan add kar do, e.g.:
      // { protocol: 'https', hostname: '**' }  // wildcard for testing
    ],
  },
};

module.exports = nextConfig;