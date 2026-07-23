'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Navbar() {
  const t = useTranslations('nav')
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/properties', label: t('properties') },
    { href: '/launches', label: t('launches') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ]

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-horizontal-blue.png"
            alt="4Rivers Realty"
            width={220}
            height={64}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-barlow font-medium text-sm tracking-wide transition-colors hover:text-brand-blue ${
                pathname === link.href ? 'text-brand-blue' : 'text-navy'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/contact"
            className="ml-2 px-5 py-2.5 font-barlow font-semibold text-sm rounded-md transition-colors bg-navy text-white hover:bg-brand-blue"
          >
            {t('contact')}
          </Link>

          <a
            href="/auth/login"
            className="font-barlow text-xs font-medium tracking-wide transition-colors hover:text-brand-blue text-gray-400"
          >
            Admin
          </a>

          <LanguageSwitcher />
        </div>

        {/* Mobile hamburger + language */}
        <div className="md:hidden flex items-center gap-1">
          <LanguageSwitcher />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md transition-colors text-navy"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-barlow font-medium py-3 px-2 rounded-md transition-colors hover:bg-off-white hover:text-brand-blue ${
                pathname === link.href ? 'text-brand-blue' : 'text-navy'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-2 px-5 py-3 bg-navy text-white font-barlow font-semibold text-sm rounded-md text-center hover:bg-brand-blue transition-colors"
          >
            {t('contact')}
          </Link>
          <a
            href="/auth/login"
            className="font-barlow text-xs text-gray-400 py-2 px-2 hover:text-brand-blue transition-colors"
          >
            Admin
          </a>
        </div>
      </div>
    </header>
  )
}
