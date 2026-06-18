'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ArrowRight, CheckCircle, AlertCircle, ClipboardList, Search, Phone, Globe, Upload, X, ImageIcon } from 'lucide-react'

const workflowSteps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Submit Your Property',
    description: 'Fill out the form below with your property details — location, size, type, and asking price. Takes under 3 minutes.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    icon: Search,
    step: '02',
    title: 'Admin Review',
    description: 'Our team reviews your submission and evaluates the property against current market conditions within 24 hours.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Phone,
    step: '03',
    title: 'Agent Contact',
    description: 'A dedicated 4Rivers agent reaches out to you to discuss pricing strategy, photography, and listing details.',
    color: 'text-navy',
    bg: 'bg-navy/5',
  },
  {
    icon: Globe,
    step: '04',
    title: 'Listed & Marketed',
    description: 'Your property goes live on our portal and is promoted directly to our network of qualified buyers.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

interface PreviewFile {
  file: File
  objectUrl: string
}

export default function ListPropertyPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    address: '',
    county: '',
    acreage: '',
    askingPrice: '',
    notes: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [previews, setPreviews] = useState<PreviewFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 8 - previews.length)

    const newPreviews = newFiles.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  function removePreview(idx: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].objectUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      if (form.email) fd.append('email', form.email)
      if (form.phone) fd.append('phone', form.phone)
      fd.append('address', form.address)
      if (form.county) fd.append('county', form.county)
      if (form.propertyType) fd.append('propertyType', form.propertyType)
      if (form.acreage) fd.append('acreage', form.acreage)
      if (form.askingPrice) fd.append('askingPrice', form.askingPrice)
      if (form.notes) fd.append('notes', form.notes)
      previews.forEach((p) => fd.append('images', p.file))

      const res = await fetch('/api/list-property', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('failed')

      setStatus('success')
      setForm({ name: '', email: '', phone: '', propertyType: '', address: '', county: '', acreage: '', askingPrice: '', notes: '' })
      previews.forEach((p) => URL.revokeObjectURL(p.objectUrl))
      setPreviews([])
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
            alt="Rural property"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-barlow text-cyan-400 text-sm font-semibold tracking-[0.3em] uppercase mb-4">
            Property Owners
          </p>
          <h1 className="font-cormorant font-bold text-5xl sm:text-6xl text-white leading-tight mb-5">
            List Your Property
            <br />
            <span className="text-brand-blue">with 4Rivers Realty</span>
          </h1>
          <p className="font-barlow text-white/70 text-lg max-w-2xl mx-auto">
            We connect horse farms, ranches, and rural properties with qualified buyers across North Central Florida. Submit your property and our team takes care of the rest.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              Simple Process
            </p>
            <h2 className="font-cormorant font-bold text-4xl text-navy">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 h-px bg-gray-200 z-0" style={{ width: 'calc(100% - 3rem)', left: '4rem' }} />
                )}
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.bg} mb-5`}>
                    <step.icon className={`w-7 h-7 ${step.color}`} />
                  </div>
                  <p className="font-barlow text-xs font-bold text-gray-300 tracking-widest mb-2">STEP {step.step}</p>
                  <h3 className="font-cormorant font-bold text-xl text-navy mb-2">{step.title}</h3>
                  <p className="font-barlow text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-off-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="font-cormorant font-bold text-3xl text-navy mb-2">
              Submit Your Property
            </h2>
            <p className="font-barlow text-gray-500 text-sm mb-8">
              Fill in the details below and a member of our team will contact you within 24 hours.
            </p>

            {status === 'success' && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-5 py-4 mb-8">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-barlow font-semibold text-sm">Submission received!</p>
                  <p className="font-barlow text-sm">Our team will review your property and reach out within 24 hours.</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-5 py-4 mb-8">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-barlow text-sm">Something went wrong. Please try again or call us directly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact */}
              <div>
                <p className="font-barlow text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">
                      Full Name <span className="text-brand-blue">*</span>
                    </label>
                    <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  </div>
                  <div>
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">Email <span className="text-brand-blue">*</span></label>
                    <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  </div>
                  <div>
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">Phone <span className="text-brand-blue">*</span></label>
                    <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      placeholder="(352) 000-0000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  </div>
                </div>
              </div>

              {/* Property details */}
              <div>
                <p className="font-barlow text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Property Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">Property Type <span className="text-brand-blue">*</span></label>
                    <select required value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20">
                      <option value="">Select type…</option>
                      {['Horse Farm', 'Ranch', 'Residential', 'Commercial', 'Land'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">County</label>
                    <input value={form.county} onChange={(e) => set('county', e.target.value)}
                      placeholder="e.g. Marion County"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">Property Address <span className="text-brand-blue">*</span></label>
                    <input required value={form.address} onChange={(e) => set('address', e.target.value)}
                      placeholder="Street address or parcel description"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  </div>
                  <div>
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">Total Acreage</label>
                    <input type="number" min="0" value={form.acreage} onChange={(e) => set('acreage', e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  </div>
                  <div>
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">Asking Price (USD)</label>
                    <input type="number" min="0" value={form.askingPrice} onChange={(e) => set('askingPrice', e.target.value)}
                      placeholder="e.g. 1500000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-barlow text-sm font-semibold text-navy block mb-1.5">Additional Details</label>
                    <textarea rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)}
                      placeholder="Describe the property — improvements, infrastructure, water, road access, timeline, etc."
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 font-barlow text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 resize-none" />
                  </div>
                </div>
              </div>

              {/* Photo upload */}
              <div>
                <p className="font-barlow text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Property Photos</p>
                <p className="font-barlow text-xs text-gray-400 mb-3">Up to 8 photos · JPG, PNG, WebP · Max 5 MB each</p>

                {/* Drop zone */}
                {previews.length < 8 && (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-blue/60 hover:bg-brand-blue/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                  >
                    <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                    <p className="font-barlow text-sm text-gray-400">
                      <span className="font-semibold text-brand-blue">Click to upload</span> or drag and drop
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </div>
                )}

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {previews.map((p, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={p.objectUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 font-barlow text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                    {previews.length < 8 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-brand-blue/60 transition-colors"
                      >
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-navy text-white font-barlow font-semibold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Submitting…' : (<>Submit Property <ArrowRight className="w-4 h-4" /></>)}
              </button>
              <p className="font-barlow text-xs text-gray-400 text-center">
                No obligation. Your information is kept confidential.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
