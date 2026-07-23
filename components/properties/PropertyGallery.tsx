'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Props {
  images: string[]
  title: string
  status: string
  statusLabel: string
  backLabel: string
  noPhotoLabel: string
}

export default function PropertyGallery({
  images,
  title,
  status,
  statusLabel,
  backLabel,
  noPhotoLabel,
}: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const mainImage = images[0] ?? null

  const goTo = (next: number) => {
    setLightboxIndex(((next % images.length) + images.length) % images.length)
  }

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') goTo(lightboxIndex - 1)
      if (e.key === 'ArrowRight') goTo(lightboxIndex + 1)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex])

  return (
    <section className="relative bg-off-white">
      <div className="relative h-[42vh] min-h-[340px] sm:h-[55vh] sm:min-h-[420px]">
        {mainImage ? (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`${title} photo 1`}
          >
            <Image
              src={mainImage}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </button>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/5">
            <p className="font-barlow text-navy/30 text-sm">{noPhotoLabel}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/60 via-transparent to-transparent pointer-events-none" />

        <Link
          href="/properties"
          className="absolute top-5 left-4 sm:left-6 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-dark-navy font-barlow text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </Link>

        <span className="absolute top-5 right-4 sm:right-6 bg-dark-navy text-white font-barlow text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full">
          {statusLabel}
        </span>
      </div>

      {images.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-2">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.slice(0, 8).map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md cursor-zoom-in"
                aria-label={`${title} photo ${i + 1}`}
              >
                <Image src={url} alt={`${title} photo ${i + 1}`} fill sizes="112px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
              className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={28} />
            </button>

            <div
              className="relative w-full h-full max-w-6xl max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex]}
                alt={`${title} photo ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goTo(lightboxIndex - 1)
                  }}
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goTo(lightboxIndex + 1)
                  }}
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={28} />
                </button>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 font-barlow text-white/80 text-sm">
                  {lightboxIndex + 1} / {images.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
