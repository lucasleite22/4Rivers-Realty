'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const LOCALE_META: Record<string, { flag: string; label: string }> = {
  en: { flag: '🇺🇸', label: 'EN' },
  'pt-br': { flag: '🇧🇷', label: 'PT' },
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {routing.locales.map((loc) => {
        const meta = LOCALE_META[loc]
        const active = loc === locale
        return (
          <button
            key={loc}
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-label={`Switch to ${meta.label}`}
            aria-current={active}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-barlow font-medium transition-colors ${
              active ? 'bg-navy/5 text-navy' : 'text-gray-400 hover:text-navy'
            }`}
          >
            <span className="text-base leading-none">{meta.flag}</span>
            <span>{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
