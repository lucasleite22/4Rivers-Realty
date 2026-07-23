import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowRight, MapPin, Star, Award, Handshake, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import AnimatedSection from '@/components/ui/AnimatedSection'
import HeroMedia from '@/components/ui/HeroMedia'
import CircleFeature from '@/components/ui/CircleFeature'
import PropertyListRow from '@/components/properties/PropertyListRow'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Horse Farms & Rural Properties in Ocala, FL',
  description:
    'Discover premium horse farms, ranches, and rural estates in Ocala and North Central Florida. 4Rivers Realty — your trusted equestrian real estate specialist.',
  openGraph: {
    title: 'Horse Farms & Rural Properties in Ocala, FL | 4Rivers Realty',
    description:
      'Discover premium horse farms, ranches, and rural estates in Ocala and North Central Florida.',
  },
}

// ── Data ─────────────────────────────────────────────────────────────────────
// Structural/proper-noun data only — display copy comes from message translations.

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { featured: true, showOnPortal: true },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
}

const circleFeatureImages = {
  explore: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500&q=80',
  sell: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80',
  locals: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
}

const whyIcons = {
  local: <MapPin className="w-7 h-7" />,
  specialist: <Award className="w-7 h-7" />,
  support: <Handshake className="w-7 h-7" />,
  network: <Users className="w-7 h-7" />,
}

const testimonials = [
  {
    quote:
      'We found our dream horse farm thanks to 4Rivers! Jales was incredibly knowledgeable and patient throughout the entire process.',
    name: 'John & Mary S.',
    city: 'Ocala',
    avatar: 'JM',
  },
]

// ── Components ───────────────────────────────────────────────────────────────

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-brand-blue text-brand-blue" />
      ))}
    </div>
  )
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

// ── Page ─────────────────────────────────────────────────────────────────────

const statKeys = ['closedSales', 'yearsExperience', 'inTransactions', 'rated'] as const
const statValues: Record<(typeof statKeys)[number], string> = {
  closedSales: '57',
  yearsExperience: '10+',
  inTransactions: '$15.5M',
  rated: '5-Star',
}

const circleFeatureKeys = ['explore', 'sell', 'locals'] as const
const whyCardKeys = ['local', 'specialist', 'support', 'network'] as const

export default async function HomePage() {
  const t = await getTranslations('home')
  const tTypes = await getTranslations('propertyTypes')
  const featuredProperties = await getFeaturedProperties()

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        <HeroMedia
          videoSrc="/videos/hero-ranch.mp4"
          posterSrc="/images/hero-1199-cr542g.jpg"
          images={[
            '/images/hero/hero-slide-1.jpg',
            '/images/hero/hero-slide-2.jpg',
            '/images/hero/hero-slide-3.jpg',
            '/images/hero/hero-slide-4.jpg',
            '/images/hero/hero-slide-5.jpg',
          ]}
          alt="Open pasture with mature oak trees at a Marion County, Florida property"
        />
        {/* Light bottom grade only — keeps the photo/video visible, the solid panel below carries legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/50 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
          {/* Compact, opaque panel — text stays legible while the image breathes around it */}
          <div className="max-w-2xl bg-dark-navy/85 backdrop-blur-sm rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/images/logo-icon.png"
                alt="4Rivers Realty"
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
              />
              <div className="h-5 w-px bg-white/25" />
              <p className="font-barlow text-light-blue text-sm font-semibold tracking-[0.3em] uppercase">
                {t('hero.eyebrow')}
              </p>
            </div>
            <h1 className="font-cormorant font-bold text-5xl sm:text-6xl md:text-7xl text-white leading-[0.95] mb-6">
              {t('hero.titleLine1')}
              <br />
              <span className="text-brand-blue">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="font-barlow text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/properties"
              className="px-8 py-4 bg-brand-blue text-dark-navy font-barlow font-semibold rounded-md hover:bg-light-blue transition-colors inline-flex items-center justify-center gap-2"
            >
              {t('hero.ctaProperties')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white/60 text-white font-barlow font-semibold rounded-md hover:bg-white hover:text-navy transition-colors inline-flex items-center justify-center"
            >
              {t('hero.ctaContact')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar — floats over the hero/content seam for depth ── */}
      <section className="relative bg-white pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection
            stagger
            className="relative -mt-12 sm:-mt-16 bg-white rounded-2xl shadow-2xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-10 sm:py-12"
          >
            {statKeys.map((key) => (
              <div key={key} className="text-center">
                <div className="w-8 h-0.5 bg-brand-blue mx-auto mb-4" />
                <p className="font-cormorant font-bold text-4xl text-dark-navy">
                  {statValues[key]}
                </p>
                <p className="font-barlow text-sm text-gray-400 mt-1 tracking-wide">
                  {t(`stats.${key}`)}
                </p>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── How We Help — circular photo motif ── */}
      <section className="pt-20 pb-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection stagger className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {circleFeatureKeys.map((key) => (
              <CircleFeature
                key={key}
                image={circleFeatureImages[key]}
                title={t(`circleFeatures.${key}.title`)}
                description={t(`circleFeatures.${key}.description`)}
              />
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              {t('featured.title')}
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              {t('featured.subtitle')}
            </p>
          </div>

          <AnimatedSection stagger>
            {featuredProperties.map((property) => (
              <PropertyListRow
                key={property.id}
                name={property.title}
                type={tTypes(property.type as 'HORSE_FARM' | 'RANCH' | 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND')}
                city={property.city}
                acres={Number(property.acreage)}
                price={formatPrice(Number(property.priceUsd))}
                image={property.images[0]?.url ?? '/images/hero-1199-cr542g.jpg'}
                href={`/properties/${property.id}`}
              />
            ))}
          </AnimatedSection>

          <AnimatedSection className="text-center mt-14" delay={0.3}>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-navy text-navy font-barlow font-semibold rounded-md hover:bg-navy hover:text-white transition-colors"
            >
              {t('featured.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Why 4Rivers ── */}
      <section className="py-28 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              {t('why.title')}
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              {t('why.subtitle')}
            </p>
          </div>

          <AnimatedSection
            stagger
            className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden bg-white divide-y divide-gray-200 sm:divide-y-0"
          >
            {whyCardKeys.map((key, i) => (
              <div
                key={key}
                className={`flex gap-5 p-10 ${
                  i < whyCardKeys.length - 2 ? 'sm:border-b sm:border-gray-200' : ''
                } ${i % 2 === 0 ? 'sm:border-r sm:border-gray-200' : ''}`}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-off-white text-brand-blue rounded-xl shrink-0">
                  {whyIcons[key]}
                </div>
                <div>
                  <h3 className="font-cormorant font-bold text-xl text-dark-navy mb-2">
                    {t(`why.cards.${key}.title`)}
                  </h3>
                  <p className="font-barlow text-sm text-gray-500 leading-relaxed">
                    {t(`why.cards.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              {t('testimonials.title')}
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>

          {/* Featured testimonial — large circular photo beside the quote */}
          <AnimatedSection className="bg-off-white rounded-2xl p-8 sm:p-12 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-center">
              <Image
                src={`https://ui-avatars.com/api/?name=${testimonials[0].avatar}&background=252859&color=ffffff&size=160&bold=true`}
                alt={testimonials[0].name}
                width={140}
                height={140}
                className="rounded-full mx-auto sm:mx-0 shadow-lg border-4 border-white"
              />
              <div>
                <StarRating />
                <blockquote className="font-cormorant text-2xl sm:text-3xl text-dark-navy/90 mt-4 leading-relaxed italic">
                  "{testimonials[0].quote}"
                </blockquote>
                <p className="font-barlow font-semibold text-dark-navy text-sm mt-5">
                  {testimonials[0].name}
                  <span className="text-gray-400 font-normal"> · {testimonials[0].city}, FL</span>
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── List Your Property ── */}
      <section className="py-28 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/institutional/photo-propriedade-4.jpeg"
                alt="Rural property for sale in Florida"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-dark-navy/25" />
              <div className="absolute bottom-6 left-6 bg-white rounded-xl px-5 py-4 shadow-lg">
                <p className="font-cormorant font-bold text-2xl text-dark-navy">{t('listProperty.freeLabel')}</p>
                <p className="font-barlow text-sm text-gray-500">{t('listProperty.freeSubtitle')}</p>
              </div>
            </div>
            <div>
              <h2 className="font-cormorant font-bold text-5xl text-dark-navy leading-tight mb-6">
                {t('listProperty.titleLine1')}
                <br />{t('listProperty.titleLine2')}
              </h2>
              <p className="font-barlow text-gray-600 text-lg leading-relaxed mb-8">
                {t('listProperty.subtitle')}
              </p>
              <ul className="space-y-3 mb-10">
                {(['valuation', 'photography', 'network', 'negotiation'] as const).map((key) => (
                  <li key={key} className="flex items-center gap-3 font-barlow text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                    {t(`listProperty.bullets.${key}`)}
                  </li>
                ))}
              </ul>
              <Link
                href="/list-property"
                className="inline-flex items-center gap-2 px-8 py-4 bg-dark-navy text-white font-barlow font-semibold rounded-md hover:bg-brand-blue transition-colors"
              >
                {t('listProperty.cta')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-dark-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-barlow text-light-blue text-sm font-semibold tracking-[0.3em] uppercase mb-6">
            {t('cta.eyebrow')}
          </p>
          <h2 className="font-cormorant font-bold text-5xl text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="font-barlow text-white/60 text-lg mb-10 leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-blue text-dark-navy font-barlow font-semibold rounded-md hover:bg-light-blue transition-colors text-lg"
          >
            {t('cta.button')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
