// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.hostinger.com' },
      { protocol: 'https', hostname: '4riversrealty.com' },
      { protocol: 'https', hostname: 'www.4riversrealty.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
