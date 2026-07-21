'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppCTA from './ui/WhatsAppCTA'

const SHELL_EXCLUDED = ['/admin', '/auth']

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = !SHELL_EXCLUDED.some((prefix) => pathname.startsWith(prefix))

  if (!isPublic) {
    return <>{children}</>
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppCTA
        phone={process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '14077895260'}
        message="Hi! I am interested in working with you."
      />
    </>
  )
}
