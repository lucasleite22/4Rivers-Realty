'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const LOCALE_META: Record<string, { countryCode: string; label: string; name: string }> = {
  en: { countryCode: 'us', label: 'EN', name: 'English' },
  'pt-br': { countryCode: 'br', label: 'PT', name: 'Português' },
}

function FlagIcon({ countryCode, alt }: { countryCode: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt={alt}
      width={20}
      height={15}
      className="rounded-[2px] object-cover shadow-sm ring-1 ring-black/10"
    />
  )
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const current = LOCALE_META[locale]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleSelect(loc: string) {
    setOpen(false)
    router.replace(pathname, { locale: loc })
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-barlow font-medium text-navy border border-gray-200 hover:border-gray-300 hover:bg-off-white transition-colors"
      >
        <FlagIcon countryCode={current.countryCode} alt={current.name} />
        <span>{current.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 min-w-[9rem] bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50"
        >
          {routing.locales.map((loc) => {
            const meta = LOCALE_META[loc]
            const active = loc === locale
            return (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(loc)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-barlow transition-colors ${
                  active ? 'bg-navy/5 text-navy font-semibold' : 'text-gray-600 hover:bg-off-white hover:text-navy'
                }`}
              >
                <FlagIcon countryCode={meta.countryCode} alt={meta.name} />
                <span>{meta.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
