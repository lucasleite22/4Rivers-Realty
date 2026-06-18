import type { Metadata } from 'next'
import { Cormorant_Garamond, Barlow } from 'next/font/google'
import './globals.css'
import PublicShell from '@/components/PublicShell'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://4riversrealty.com'),
  title: {
    default: '4Rivers Realty | Horse Farms & Rural Properties in Ocala, FL',
    template: '%s | 4Rivers Realty',
  },
  description:
    'Premium horse farms, ranches, and rural estates in Ocala and North Central Florida. Specialists in Marion County equestrian properties.',
  keywords: [
    'horse farms Ocala FL',
    'rural properties Marion County',
    'equestrian real estate Florida',
    'ranches for sale Ocala',
    '4Rivers Realty',
  ],
  icons: {
    icon: '/images/logo-icon.png',
    shortcut: '/images/logo-icon.png',
    apple: '/images/logo-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://4riversrealty.com',
    siteName: '4Rivers Realty',
    title: '4Rivers Realty | Horse Farms & Rural Properties in Ocala, FL',
    description:
      'Premium horse farms, ranches, and rural estates in Ocala and North Central Florida.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: '4Rivers Realty — Horse Farms in Ocala, FL',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '4Rivers Realty | Horse Farms & Rural Properties in Ocala, FL',
    description:
      'Premium horse farms, ranches, and rural estates in Ocala and North Central Florida.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${barlow.variable}`}>
      <body className="font-barlow bg-off-white text-dark-navy antialiased">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  )
}
