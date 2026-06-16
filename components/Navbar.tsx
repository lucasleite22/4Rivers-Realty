'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/properties', label: 'Properties' },
  { href: '/launches', label: 'Launches' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={transparent ? '/images/logo-horizontal-white.png' : '/images/logo-horizontal-blue.png'}
            alt="4Rivers Realty"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
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
                pathname === link.href
                  ? 'text-brand-blue'
                  : transparent
                  ? 'text-white'
                  : 'text-navy'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/contact"
            className={`ml-2 px-5 py-2.5 font-barlow font-semibold text-sm rounded-md transition-colors ${
              transparent
                ? 'bg-white/15 text-white border border-white/30 hover:bg-white hover:text-navy'
                : 'bg-navy text-white hover:bg-brand-blue'
            }`}
          >
            Get in Touch
          </Link>

          <Link
            href="/auth/login"
            className={`font-barlow text-xs font-medium tracking-wide transition-colors hover:text-brand-blue ${
              transparent ? 'text-white/50' : 'text-gray-400'
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-md transition-colors ${
            transparent ? 'text-white' : 'text-navy'
          }`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            Get in Touch
          </Link>
          <Link
            href="/auth/login"
            className="font-barlow text-xs text-gray-400 py-2 px-2 hover:text-brand-blue transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
