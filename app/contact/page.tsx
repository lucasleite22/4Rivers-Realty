'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, LayoutDashboard } from 'lucide-react'

const interestOptions = [
  { value: '', label: 'Select a property type...' },
  { value: 'Horse Farm', label: 'Horse Farm' },
  { value: 'Ranch', label: 'Ranch' },
  { value: 'Land', label: 'Land' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Other', label: 'Other' },
]

type FormState = {
  name: string
  email: string
  phone: string
  interest: string
  message: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  })
  const [status, setStatus] = useState<Status>('idle')

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
          propertyInterest: form.interest,
          notes: form.message,
          origin: 'WEBSITE',
          type: 'BUYER',
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      setStatus('success')
      setForm({ name: '', email: '', phone: '', interest: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-14">
          <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-2">
            Get in Touch
          </p>
          <h1 className="font-cormorant font-bold text-5xl text-dark-navy">
            Contact Us
          </h1>
          <p className="font-barlow text-gray-500 text-lg mt-3 max-w-xl">
            Whether you have a specific property in mind or are just starting
            your search, our team is ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
          {/* ── Left: Info + Map + Admin button ── */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-cormorant font-bold text-2xl text-dark-navy mb-6">
                Contact Information
              </h2>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-off-white rounded-lg flex items-center justify-center text-brand-blue">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-barlow font-semibold text-dark-navy text-sm">Address</p>
                    <p className="font-barlow text-gray-500 text-sm mt-0.5 leading-relaxed">
                      Ocala, FL 34470<br />Marion County, Florida
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-off-white rounded-lg flex items-center justify-center text-brand-blue">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-barlow font-semibold text-dark-navy text-sm">Phone</p>
                    <a href="tel:+13525550100" className="font-barlow text-gray-500 text-sm mt-0.5 hover:text-brand-blue transition-colors">
                      (352) 555-0100
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-off-white rounded-lg flex items-center justify-center text-brand-blue">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-barlow font-semibold text-dark-navy text-sm">Email</p>
                    <a href="mailto:info@4riversrealty.com" className="font-barlow text-gray-500 text-sm mt-0.5 hover:text-brand-blue transition-colors">
                      info@4riversrealty.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-off-white rounded-lg flex items-center justify-center text-brand-blue">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-barlow font-semibold text-dark-navy text-sm">Office Hours</p>
                    <p className="font-barlow text-gray-500 text-sm mt-0.5 leading-relaxed">
                      Mon–Fri: 8:00am – 6:00pm<br />
                      Saturday: 9:00am – 4:00pm<br />
                      Sunday: By appointment
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <iframe
                title="4Rivers Realty — Ocala, FL"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55498.28520832027!2d-82.16069!3d29.18733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e834a19b3f9853%3A0x2b0f4b1dedd7ae2e!2sOcala%2C%20FL%2034470!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Admin access */}
            <div className="bg-off-white border border-gray-100 rounded-xl p-5">
              <p className="font-barlow text-xs text-gray-400 mb-3 uppercase tracking-widest font-semibold">
                Agent Access
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-5 py-3 bg-navy text-white font-barlow font-semibold text-sm rounded-lg hover:bg-brand-blue transition-colors w-full justify-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                Access Admin Panel
              </Link>
              <p className="font-barlow text-xs text-gray-400 text-center mt-2">
                Restricted to licensed agents
              </p>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="font-cormorant font-bold text-3xl text-dark-navy mb-2">
                Send Us a Message
              </h2>
              <p className="font-barlow text-gray-500 text-sm mb-8">
                We typically respond within 24 hours on business days.
              </p>

              {status === 'success' && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-5 py-4 mb-8">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-barlow text-sm font-medium">
                    Message sent! We'll be in touch within 24 hours.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-5 py-4 mb-8">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-barlow text-sm font-medium">
                    Something went wrong. Please try again or call us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="font-barlow text-sm font-semibold text-dark-navy block mb-2">
                      Full Name <span className="text-brand-blue" aria-hidden="true">*</span>
                      <span className="sr-only">(required)</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-dark-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="font-barlow text-sm font-semibold text-dark-navy block mb-2">
                      Email Address <span className="text-brand-blue" aria-hidden="true">*</span>
                      <span className="sr-only">(required)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-dark-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-phone" className="font-barlow text-sm font-semibold text-dark-navy block mb-2">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(352) 000-0000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-dark-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-interest" className="font-barlow text-sm font-semibold text-dark-navy block mb-2">
                      I'm Interested In
                    </label>
                    <select
                      id="contact-interest"
                      name="interest"
                      value={form.interest}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-dark-navy focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors bg-white"
                    >
                      {interestOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="font-barlow text-sm font-semibold text-dark-navy block mb-2">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about the property you're looking for — size, location, budget, or any other details..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-dark-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-navy text-white font-barlow font-semibold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>

                <p className="font-barlow text-xs text-gray-400 text-center">
                  Your information is kept private and never shared with third parties.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
