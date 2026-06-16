'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span
            className={`font-cormorant font-bold text-2xl tracking-wide transition-colors ${
              scrolled || !isHome ? 'text-navy' : 'text-white'
            }`}
          >
            4Rivers
          </span>
          <span
            className={`font-barlow text-xs font-semibold tracking-[0.2em] uppercase transition-colors ${
              scrolled || !isHome ? 'text-[#00aeef]' : 'text-[#33ccff]'
            }`}
          >
            Realty
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-barlow font-medium text-sm tracking-wide transition-colors hover:text-[#00aeef] ${
                pathname === link.href
                  ? 'text-[#00aeef]'
                  : scrolled || !isHome
                  ? 'text-navy'
                  : 'text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/contact"
            className="ml-2 px-5 py-2.5 bg-[#00aeef] text-white font-barlow font-semibold text-sm rounded-md hover:bg-[#33ccff] transition-colors"
          >
            Get in Touch
          </Link>

          <Link
            href="/auth/login"
            className={`font-barlow text-xs font-medium tracking-wide transition-colors hover:text-[#00aeef] ${
              scrolled || !isHome ? 'text-gray-400' : 'text-white/50'
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-md transition-colors ${
            scrolled || !isHome ? 'text-navy' : 'text-white'
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
              className={`font-barlow font-medium py-3 px-2 rounded-md transition-colors hover:bg-site-bg hover:text-[#00aeef] ${
                pathname === link.href ? 'text-[#00aeef]' : 'text-navy'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-2 px-5 py-3 bg-[#00aeef] text-white font-barlow font-semibold text-sm rounded-md text-center hover:bg-[#33ccff] transition-colors"
          >
            Get in Touch
          </Link>
          <Link
            href="/auth/login"
            className="font-barlow text-xs text-gray-400 py-2 px-2 hover:text-[#00aeef] transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
