// next.config.js

const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const isDev = process.env.NODE_ENV === 'development'
const __impeccableLiveDev = isDev ? ' http://localhost:8400' : ''

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
    // Google Maps JS API + tiles; Leaflet tiles come from openstreetmap.org; WhatsApp link opens wa.me
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com" + __impeccableLiveDev,   // unsafe-eval needed by leaflet
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.openstreetmap.org https://*.hostinger.com https://4riversrealty.com https://www.4riversrealty.com https://images.unsplash.com https://ui-avatars.com https://*.public.blob.vercel-storage.com https://flagcdn.com https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://media.mlsgrid.com",
      "connect-src 'self' https://api.mlsgrid.com https://*.googleapis.com https://*.gstatic.com" + __impeccableLiveDev,
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://youtube.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const realriskHeaders = [
  ...securityHeaders.filter((h) => h.key !== 'Content-Security-Policy' && h.key !== 'X-Frame-Options'),
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://*.openstreetmap.org https://unpkg.com",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'self'",
    ].join('; '),
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // ativar apenas para deploy manual em VPS/Hostinger

  async headers() {
    return [
      { source: '/((?!realrisk/).*)', headers: securityHeaders },
      // RealRisk dashboard (static app in public/realrisk): embedded by
      // /admin/realrisk in an iframe, loads Leaflet/Supabase from unpkg and
      // talks to its Supabase project for likes/comments.
      { source: '/realrisk/:path*', headers: realriskHeaders },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.hostinger.com' },
      { protocol: 'https', hostname: '4riversrealty.com' },
      { protocol: 'https', hostname: 'www.4riversrealty.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'media.mlsgrid.com' },
    ],
    unoptimized: false,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = withNextIntl(nextConfig)
