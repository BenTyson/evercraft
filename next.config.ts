import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: '/orders',
        destination: '/account/orders',
        permanent: true,
      },
      {
        source: '/orders/:id',
        destination: '/account/orders/:id',
        permanent: true,
      },
      {
        source: '/favorites',
        destination: '/account/favorites',
        permanent: true,
      },
      {
        source: '/messages',
        destination: '/account/messages',
        permanent: true,
      },
      {
        source: '/messages/:userId',
        destination: '/account/messages/:userId',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
