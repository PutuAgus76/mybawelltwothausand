import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary CDN — untuk foto timeline dan konten
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Supabase Storage — fallback kalau ada foto di Supabase storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  // Aktifkan experimental features untuk performa lebih baik
  experimental: {
    // Optimasi package imports
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
