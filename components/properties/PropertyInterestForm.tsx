'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  propertyTitle: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function PropertyInterestForm({ propertyTitle }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const t = useTranslations('propertyInterestForm')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          propertyInterest: propertyTitle,
          notes: form.message,
          origin: 'WEBSITE',
          type: 'BUYER',
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-off-white rounded-2xl p-6 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="font-barlow text-sm text-dark-navy">
          {t('success')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-off-white rounded-2xl p-6 space-y-4">
      <h3 className="font-cormorant font-bold text-2xl text-dark-navy">
        {t('title')}
      </h3>
      <div>
        <label className="font-barlow text-dark-navy text-sm font-medium block mb-1.5">{t('name')}</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 font-barlow text-dark-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      </div>
      <div>
        <label className="font-barlow text-dark-navy text-sm font-medium block mb-1.5">{t('email')}</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 font-barlow text-dark-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      </div>
      <div>
        <label className="font-barlow text-dark-navy text-sm font-medium block mb-1.5">{t('phone')}</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 font-barlow text-dark-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      </div>
      <div>
        <label className="font-barlow text-dark-navy text-sm font-medium block mb-1.5">{t('message')}</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder={t('messagePlaceholder', { propertyTitle })}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 font-barlow text-dark-navy focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue resize-none"
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="font-barlow text-sm">{t('error')}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-dark-navy text-white font-barlow font-semibold py-3 rounded-lg hover:bg-brand-blue disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? t('sending') : t('submit')}
      </button>
    </form>
  )
}
