// next.config.js

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    // Leaflet tiles come from openstreetmap.org; WhatsApp link opens wa.me
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // unsafe-eval needed by leaflet
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.openstreetmap.org https://*.hostinger.com https://4riversrealty.com https://www.4riversrealty.com https://images.unsplash.com https://ui-avatars.com",
      "connect-src 'self' https://simplyrets.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // ativar apenas para deploy manual em VPS/Hostinger

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.hostinger.com' },
      { protocol: 'https', hostname: '4riversrealty.com' },
      { protocol: 'https', hostname: 'www.4riversrealty.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
    unoptimized: false,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
