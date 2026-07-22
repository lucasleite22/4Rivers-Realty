import type { Metadata } from 'next'
import { Cormorant_Garamond, Barlow } from 'next/font/google'
import '../globals.css'

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
  title: '4Rivers Realty',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PlatformRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${barlow.variable}`}>
      <body className="font-barlow bg-off-white text-dark-navy antialiased">
        {children}
      </body>
    </html>
  )
}
