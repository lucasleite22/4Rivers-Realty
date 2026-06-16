import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Ruler, Star, Award, Handshake, Users } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

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

const stats = [
  { value: '150+', label: 'Properties Sold' },
  { value: '20+', label: 'Years Experience' },
  { value: '$2B+', label: 'In Transactions' },
  { value: '5-Star', label: 'Rated' },
]

const featuredProperties = [
  {
    name: 'Windmill Ranch',
    acres: 485,
    price: 4_200_000,
    type: 'Horse Farm',
    city: 'Ocala',
    image:
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80',
    slug: 'windmill-ranch',
  },
  {
    name: 'Silver Creek Farm',
    acres: 120,
    price: 1_850_000,
    type: 'Ranch',
    city: 'Reddick',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    slug: 'silver-creek-farm',
  },
  {
    name: 'Cypress Meadows',
    acres: 78,
    price: 975_000,
    type: 'Land',
    city: 'Chiefland',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    slug: 'cypress-meadows',
  },
]

const whyCards = [
  {
    icon: <MapPin className="w-7 h-7" />,
    title: 'Local Expertise',
    description:
      '20+ years living and working in Marion County. We know every road, every creek, and every corner of North Central Florida.',
  },
  {
    icon: <Award className="w-7 h-7" />,
    title: 'Horse Farm Specialists',
    description:
      'Deep knowledge of equestrian infrastructure — paddocks, barns, arenas, water systems, and zoning requirements.',
  },
  {
    icon: <Handshake className="w-7 h-7" />,
    title: 'Full-Service Support',
    description:
      'From your first search to the closing table and beyond, we guide every step with care and professionalism.',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Trusted Network',
    description:
      'Connected to the best inspectors, attorneys, lenders, and equine professionals in the region.',
  },
]

const testimonials = [
  {
    quote:
      "The best real estate experience I've had in Florida. They found us the perfect horse farm in under three months. Absolutely seamless from start to finish.",
    name: 'James R.',
    city: 'Ocala',
    avatar: 'JR',
  },
  {
    quote:
      'Found our dream horse farm thanks to 4Rivers. Their local knowledge is unmatched — they knew about properties before they even hit the market.',
    name: 'Sarah M.',
    city: 'Gainesville',
    avatar: 'SM',
  },
  {
    quote:
      'Professional, knowledgeable, and truly passionate about equestrian properties. They made a complex transaction feel simple.',
    name: 'Robert T.',
    city: 'Ocala',
    avatar: 'RT',
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

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&q=85"
          alt="Horse farm at sunrise in Ocala, Florida"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-dark-navy/75" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-barlow text-light-blue text-sm font-semibold tracking-[0.3em] uppercase mb-6">
            Ocala · North Central Florida
          </p>
          <h1 className="font-cormorant font-bold text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-6">
            Find Your Perfect Piece
            <br />
            <span className="text-brand-blue">of Florida</span>
          </h1>
          <p className="font-barlow text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium horse farms, ranches, and rural properties in Ocala and
            North Central Florida
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="px-8 py-4 bg-navy text-white font-barlow font-semibold rounded-md hover:bg-brand-blue transition-colors inline-flex items-center justify-center gap-2"
            >
              View Properties <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white/60 text-white font-barlow font-semibold rounded-md hover:bg-white hover:text-navy transition-colors inline-flex items-center justify-center"
            >
              Schedule a Consultation
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
          <div className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatedSection stagger className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-8 h-0.5 bg-brand-blue mx-auto mb-4" />
                <p className="font-cormorant font-bold text-4xl text-dark-navy">
                  {stat.value}
                </p>
                <p className="font-barlow text-sm text-gray-400 mt-1 tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              Exclusive Listings
            </p>
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              Featured Properties
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              Handpicked estates and farms across Marion County and beyond
            </p>
          </div>

          <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((prop) => (
              <article
                key={prop.slug}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100"
              >
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={prop.image}
                    alt={prop.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-dark-navy text-white font-barlow text-xs font-semibold px-3 py-1 rounded-full">
                    {prop.type}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-cormorant font-bold text-2xl text-dark-navy">
                    {prop.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-400 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-barlow text-sm">{prop.city}, FL</span>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm font-barlow text-gray-500">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-brand-blue" />
                      {prop.acres} acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
                    <span className="font-cormorant font-bold text-2xl text-dark-navy">
                      {formatPrice(prop.price)}
                    </span>
                    <Link
                      href="/properties"
                      className="font-barlow text-sm font-semibold text-brand-blue hover:text-navy transition-colors flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </AnimatedSection>

          <AnimatedSection className="text-center mt-14" delay={0.3}>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-navy text-navy font-barlow font-semibold rounded-md hover:bg-navy hover:text-white transition-colors"
            >
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Why 4Rivers ── */}
      <section className="py-28 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              Our Difference
            </p>
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              Why 4Rivers Realty
            </h2>
          </div>

          <AnimatedSection stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyCards.map((card) => (
              <div
                key={card.title}
                className="text-center p-8 rounded-xl bg-white border border-gray-100 hover:border-brand-blue/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-off-white text-brand-blue rounded-xl mb-5 group-hover:bg-navy group-hover:text-white transition-all duration-300">
                  {card.icon}
                </div>
                <h3 className="font-cormorant font-bold text-xl text-dark-navy mb-3">
                  {card.title}
                </h3>
                <p className="font-barlow text-sm text-gray-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              Client Stories
            </p>
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              What Our Clients Say
            </h2>
          </div>

          <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-off-white p-8 rounded-xl border border-gray-100"
              >
                <StarRating />
                <blockquote className="font-cormorant text-xl text-dark-navy/90 mt-5 leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${t.avatar}&background=252859&color=ffffff&size=48&bold=true`}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-barlow font-semibold text-dark-navy text-sm">
                      {t.name}
                    </p>
                    <p className="font-barlow text-xs text-gray-400">
                      {t.city}, FL
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── List Your Property ── */}
      <section className="py-28 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1543674892-7d64d45df18b?w=800&q=85"
                alt="Rural property for sale in Florida"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-dark-navy/25" />
              <div className="absolute bottom-6 left-6 bg-white rounded-xl px-5 py-4 shadow-lg">
                <p className="font-cormorant font-bold text-2xl text-dark-navy">Free</p>
                <p className="font-barlow text-sm text-gray-500">Property evaluation</p>
              </div>
            </div>
            <div>
              <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-4">
                Property Owners
              </p>
              <h2 className="font-cormorant font-bold text-5xl text-dark-navy leading-tight mb-6">
                Want to Sell
                <br />Your Property?
              </h2>
              <p className="font-barlow text-gray-600 text-lg leading-relaxed mb-8">
                We have an active network of qualified buyers looking for horse farms, ranches, and rural land across North Central Florida. List your property with 4Rivers and reach the right audience — fast.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  'Free market valuation with no obligation',
                  'Professional photography and listing',
                  'Direct access to our buyer network',
                  'Experienced negotiation and closing support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-barlow text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/list-property"
                className="inline-flex items-center gap-2 px-8 py-4 bg-dark-navy text-white font-barlow font-semibold rounded-md hover:bg-brand-blue transition-colors"
              >
                List My Property <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-dark-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-barlow text-light-blue text-sm font-semibold tracking-[0.3em] uppercase mb-6">
            Start Your Journey
          </p>
          <h2 className="font-cormorant font-bold text-5xl text-white mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="font-barlow text-white/60 text-lg mb-10 leading-relaxed">
            Whether you're looking for a working horse farm, a peaceful ranch
            retreat, or raw land to build your vision — we're here to guide you
            every step of the way.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-blue text-dark-navy font-barlow font-semibold rounded-md hover:bg-light-blue transition-colors text-lg"
          >
            Get in Touch <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
