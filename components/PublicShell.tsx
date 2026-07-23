'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Navbar from './Navbar'
import WhatsAppCTA from './ui/WhatsAppCTA'

const SHELL_EXCLUDED = ['/admin', '/auth']

export default function PublicShell({
  children,
  footer,
}: {
  children: React.ReactNode
  footer: React.ReactNode
}) {
  const t = useTranslations('whatsapp')
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
      {footer}
      <WhatsAppCTA
        phone={process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '14077895260'}
        message={t('shellMessage')}
      />
    </>
  )
}
