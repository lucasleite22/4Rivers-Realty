import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Star, Award, Handshake, Users } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import HeroMedia from '@/components/ui/HeroMedia'
import CircleFeature from '@/components/ui/CircleFeature'
import PropertyListRow from '@/components/properties/PropertyListRow'

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
  { value: '57', label: 'Closed Sales' },
  { value: '10+', label: 'Years Experience' },
  { value: '$15.5M', label: 'In Transactions' },
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

const circleFeatures = [
  {
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500&q=80',
    title: 'Explore Properties',
    description: 'Browse active horse farms, ranches, and rural land across Marion County.',
  },
  {
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80',
    title: 'Sell Your Land',
    description: 'Free valuation and a direct line to our network of qualified buyers.',
  },
  {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
    title: 'Work With Locals',
    description: '10+ years on this land — brokers who know every road and creek.',
  },
]

const whyCards = [
  {
    icon: <MapPin className="w-7 h-7" />,
    title: 'Local Expertise',
    description:
      '10+ years living and working in Marion County. We know every road, every creek, and every corner of North Central Florida.',
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

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        <HeroMedia
          videoSrc="/videos/hero-ranch.mp4"
          posterSrc="/images/hero-1199-cr542g.jpg"
          alt="Open pasture with mature oak trees at a Marion County, Florida property"
        />
        {/* Light bottom grade only — keeps the photo/video visible, the solid panel below carries legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/50 via-transparent to-transparent" />

        {/* Brand mark, top-left — establishes the brand before any copy is read */}
        <div className="absolute top-28 left-4 sm:left-6 lg:left-8 z-10 flex items-center gap-3 bg-dark-navy/50 backdrop-blur-sm rounded-full pl-3 pr-5 py-2">
          <Image
            src="/images/logo-icon.png"
            alt="4Rivers Realty"
            width={40}
            height={40}
            className="h-8 w-8 object-contain"
          />
          <div className="h-6 w-px bg-white/25" />
          <p className="font-barlow text-white/80 text-xs font-semibold tracking-[0.25em] uppercase">
            Est. North Central Florida
          </p>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
          {/* Compact, opaque panel — text stays legible while the image breathes around it */}
          <div className="max-w-2xl bg-dark-navy/85 backdrop-blur-sm rounded-2xl p-8 sm:p-10">
            <p className="font-barlow text-light-blue text-sm font-semibold tracking-[0.3em] uppercase mb-6">
              Ocala · North Central Florida
            </p>
            <h1 className="font-cormorant font-bold text-5xl sm:text-6xl md:text-7xl text-white leading-[0.95] mb-6">
              Land Built for
              <br />
              <span className="text-brand-blue">a Florida Life</span>
            </h1>
            <p className="font-barlow text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
              Horse farms, working ranches, and rural estates across Marion
              County — handled by brokers who were raised on this land.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/properties"
              className="px-8 py-4 bg-brand-blue text-dark-navy font-barlow font-semibold rounded-md hover:bg-light-blue transition-colors inline-flex items-center justify-center gap-2"
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
      </section>

      {/* ── Stats Bar — floats over the hero/content seam for depth ── */}
      <section className="relative bg-white pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection
            stagger
            className="relative -mt-12 sm:-mt-16 bg-white rounded-2xl shadow-2xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-10 sm:py-12"
          >
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

      {/* ── How We Help — circular photo motif ── */}
      <section className="pt-20 pb-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection stagger className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {circleFeatures.map((feature) => (
              <CircleFeature key={feature.title} {...feature} />
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              Featured Properties
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              A hand-picked selection of exclusive listings — estates and farms across Marion County and beyond.
            </p>
          </div>

          <AnimatedSection stagger>
            {featuredProperties.map((prop) => (
              <PropertyListRow
                key={prop.slug}
                name={prop.name}
                type={prop.type}
                city={prop.city}
                acres={prop.acres}
                price={formatPrice(prop.price)}
                image={prop.image}
                href="/properties"
              />
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
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              Why 4Rivers Realty
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              What sets us apart when it's time to buy or sell rural Florida land.
            </p>
          </div>

          <AnimatedSection
            stagger
            className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden bg-white divide-y divide-gray-200 sm:divide-y-0"
          >
            {whyCards.map((card, i) => (
              <div
                key={card.title}
                className={`flex gap-5 p-10 ${
                  i < whyCards.length - 2 ? 'sm:border-b sm:border-gray-200' : ''
                } ${i % 2 === 0 ? 'sm:border-r sm:border-gray-200' : ''}`}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-off-white text-brand-blue rounded-xl shrink-0">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-cormorant font-bold text-xl text-dark-navy mb-2">
                    {card.title}
                  </h3>
                  <p className="font-barlow text-sm text-gray-500 leading-relaxed">
                    {card.description}
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
            <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              Client Stories
            </p>
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              What Our Clients Say
            </h2>
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
