import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, MapPin, Home, Trees, Building2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import PropertyMap from '@/components/map/PropertyMap'
import PropertyInterestForm from '@/components/properties/PropertyInterestForm'
import type { PropertyWithImages } from '@/types/properties'

interface Props {
  params: { id: string }
}

function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

async function getProperty(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty(params.id)
  if (!property) return { title: 'Property Not Found | 4Rivers Realty' }
  return {
    title: `${property.title} | 4Rivers Realty`,
    description: property.description.slice(0, 160),
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty(params.id)
  if (!property) notFound()

  const t = await getTranslations('propertyDetail')
  const tTypes = await getTranslations('propertyTypes')
  const tStatus = await getTranslations('propertyStatus')

  const images = property.images.length
    ? property.images.map((img) => img.url)
    : []
  const mainImage = images[0] ?? null
  const hasCoords = property.latitude != null && property.longitude != null
  const videoEmbedUrl = getYouTubeEmbedUrl(property.videoUrl)

  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(property.priceUsd))

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* ── Gallery ── */}
      <section className="relative bg-off-white">
        <div className="relative h-[42vh] min-h-[340px] sm:h-[55vh] sm:min-h-[420px]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={property.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-navy/5">
              <p className="font-barlow text-navy/30 text-sm">{t('noPhoto')}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/60 via-transparent to-transparent" />

          <Link
            href="/properties"
            className="absolute top-5 left-4 sm:left-6 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-dark-navy font-barlow text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('back')}
          </Link>

          <span className="absolute top-5 right-4 sm:right-6 bg-dark-navy text-white font-barlow text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full">
            {tStatus(property.status as 'ACTIVE' | 'SOLD' | 'UNDER_CONTRACT')}
          </span>
        </div>

        {images.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-2">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.slice(0, 8).map((url, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md"
                >
                  <Image src={url} alt={`${property.title} photo ${i + 1}`} fill sizes="112px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Content ── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: details */}
            <div className="lg:col-span-2">
              <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-2">
                {tTypes(property.type as 'HORSE_FARM' | 'RANCH' | 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND')}
              </p>
              <h1 className="font-cormorant font-bold text-4xl sm:text-5xl text-dark-navy leading-tight mb-3">
                {property.title}
              </h1>
              <p className="flex items-center gap-2 font-barlow text-gray-500 mb-6">
                <MapPin className="w-4 h-4 text-brand-blue" />
                {property.address}, {property.city}, {property.county} {t('countySuffix')}
              </p>

              <p className="font-cormorant font-bold text-3xl text-dark-navy mb-8">
                {price}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                <div className="bg-off-white rounded-xl p-4 text-center">
                  <Trees className="w-5 h-5 text-brand-blue mx-auto mb-2" />
                  <p className="font-cormorant font-bold text-xl text-dark-navy">{Number(property.acreage)}</p>
                  <p className="font-barlow text-xs text-gray-500">{t('acres')}</p>
                </div>
                {property.stables != null && (
                  <div className="bg-off-white rounded-xl p-4 text-center">
                    <Home className="w-5 h-5 text-brand-blue mx-auto mb-2" />
                    <p className="font-cormorant font-bold text-xl text-dark-navy">{property.stables}</p>
                    <p className="font-barlow text-xs text-gray-500">{t('stables')}</p>
                  </div>
                )}
                {property.arenas != null && (
                  <div className="bg-off-white rounded-xl p-4 text-center">
                    <Building2 className="w-5 h-5 text-brand-blue mx-auto mb-2" />
                    <p className="font-cormorant font-bold text-xl text-dark-navy">{property.arenas}</p>
                    <p className="font-barlow text-xs text-gray-500">{t('arenas')}</p>
                  </div>
                )}
                {property.pastures != null && (
                  <div className="bg-off-white rounded-xl p-4 text-center">
                    <Trees className="w-5 h-5 text-brand-blue mx-auto mb-2" />
                    <p className="font-cormorant font-bold text-xl text-dark-navy">{property.pastures}</p>
                    <p className="font-barlow text-xs text-gray-500">{t('pastures')}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-cormorant font-bold text-2xl text-dark-navy mb-4">
                  {t('about')}
                </h2>
                <p className="font-barlow text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Video */}
              {videoEmbedUrl && (
                <div className="mt-10">
                  <h2 className="font-cormorant font-bold text-2xl text-dark-navy mb-4">
                    {t('video')}
                  </h2>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={videoEmbedUrl}
                      title={`${property.title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Map */}
              {hasCoords && (
                <div className="mt-10">
                  <h2 className="font-cormorant font-bold text-2xl text-dark-navy mb-4">
                    {t('location')}
                  </h2>
                  <PropertyMap
                    properties={[property as unknown as PropertyWithImages]}
                    height="h-[360px]"
                    center={[property.latitude as number, property.longitude as number]}
                    zoom={13}
                  />
                </div>
              )}
            </div>

            {/* Right: interest form */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <PropertyInterestForm propertyTitle={property.title} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
