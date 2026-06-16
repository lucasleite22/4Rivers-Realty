import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Ruler, ArrowRight, Sparkles, Clock } from 'lucide-react'
import CountdownTimer from '@/components/CountdownTimer'

export const metadata: Metadata = {
  title: 'Lançamentos',
  description:
    'Confira os novos lançamentos da 4Rivers Realty — horse farms, ranchos e propriedades rurais exclusivas em Ocala e North Central Florida.',
  openGraph: {
    title: 'Lançamentos | 4Rivers Realty',
    description:
      'Novos lançamentos exclusivos: horse farms, ranchos e propriedades rurais em Ocala e North Central Florida.',
  },
}

const launches = [
  {
    badge: 'New Launch',
    name: 'Emerald Pines Estate',
    acres: 320,
    price: 3_400_000,
    type: 'Horse Farm',
    city: 'Ocala',
    county: 'Marion County',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80',
    description:
      'A stunning 320-acre equestrian estate featuring a 12-stall center-aisle barn, covered arena, 8 irrigated paddocks, and a fully renovated 4-bedroom main residence.',
    highlights: ['12-stall barn', 'Covered arena', '8 paddocks', '4BR residence'],
    slug: 'emerald-pines-estate',
    daysAgo: 2,
  },
  {
    badge: 'Just Listed',
    name: 'Blue Heron Ranch',
    acres: 195,
    price: 2_100_000,
    type: 'Ranch',
    city: 'Williston',
    county: 'Levy County',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    description:
      'Working cattle ranch with fenced and cross-fenced pastures, two ponds, a 3,200 sq ft ranch house, and outbuildings. Ideal for equestrian conversion.',
    highlights: ['195 acres fenced', '2 ponds', 'Ranch house', 'Multiple outbuildings'],
    slug: 'blue-heron-ranch',
    daysAgo: 5,
  },
  {
    badge: 'New Launch',
    name: 'Oak Canopy Farm',
    acres: 88,
    price: 1_250_000,
    type: 'Horse Farm',
    city: 'Reddick',
    county: 'Marion County',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=85',
    description:
      '88 picturesque acres under a canopy of live oaks. 6-stall barn, round pen, 4 paddocks, and a charming 3BR farmhouse surrounded by mature landscaping.',
    highlights: ['6-stall barn', 'Round pen', 'Live oak canopy', '3BR farmhouse'],
    slug: 'oak-canopy-farm',
    daysAgo: 7,
  },
  {
    badge: 'Coming Soon',
    name: 'Suwannee River Tract',
    acres: 540,
    price: null,
    type: 'Land',
    city: 'Branford',
    county: 'Suwannee County',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    description:
      'Rare 540-acre tract with over half a mile of Suwannee River frontage. Mixed timber and open pasture, multiple build sites, exceptional hunting and recreation.',
    highlights: ['River frontage', '540 acres', 'Timber + pasture', 'Multiple build sites'],
    slug: 'suwannee-river-tract',
    daysAgo: null,
  },
  {
    badge: 'Just Listed',
    name: 'Sunrise Meadow Farm',
    acres: 62,
    price: 875_000,
    type: 'Horse Farm',
    city: 'Anthony',
    county: 'Marion County',
    image: 'https://images.unsplash.com/photo-1553284965-5dd02352d7c8?w=800&q=80',
    description:
      'Turnkey 62-acre horse property with a 4-stall barn, lighted arena, wash rack, tack room, and a beautifully updated 3BR home. Move-in ready.',
    highlights: ['4-stall barn', 'Lighted arena', 'Wash rack', 'Updated 3BR home'],
    slug: 'sunrise-meadow-farm',
    daysAgo: 3,
  },
  {
    badge: 'Coming Soon',
    name: 'Withlacoochee Preserve',
    acres: 410,
    price: null,
    type: 'Ranch',
    city: 'Inverness',
    county: 'Citrus County',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80',
    description:
      'Pristine 410-acre preserve bordering the Withlacoochee State Forest. Excellent for cattle, equestrian use, or conservation investment.',
    highlights: ['State forest border', '410 acres', 'Cattle ready', 'Conservation eligible'],
    slug: 'withlacoochee-preserve',
    daysAgo: null,
  },
]

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function BadgeColor({ badge }: { badge: string }) {
  const styles: Record<string, string> = {
    'New Launch': 'bg-[#00aeef] text-white',
    'Just Listed': 'bg-green-500 text-white',
    'Coming Soon': 'bg-navy text-white',
  }
  return (
    <span className={`font-barlow text-xs font-bold px-3 py-1 rounded-full ${styles[badge] ?? 'bg-gray-500 text-white'}`}>
      {badge}
    </span>
  )
}

export default function LaunchesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-navy pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#33ccff]" />
                <p className="font-barlow text-[#33ccff] text-sm font-semibold tracking-[0.3em] uppercase">
                  Exclusivo
                </p>
              </div>
              <h1 className="font-cormorant font-bold text-5xl sm:text-6xl text-white">
                Nossos Lançamentos
              </h1>
              <p className="font-barlow text-white/70 text-lg mt-4 max-w-xl">
                As propriedades mais recentes e exclusivas do nosso portfólio — horse farms, ranchos e terras virgens em North Central Florida.
              </p>
            </div>
            <Link
              href="/properties"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-barlow font-semibold text-sm rounded-md hover:border-[#00aeef] hover:text-[#00aeef] transition-colors"
            >
              Ver todo o portfólio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Filters bar ── */}
      <section className="bg-white border-b border-gray-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-3 overflow-x-auto">
          {['All', 'Horse Farm', 'Ranch', 'Land', 'Coming Soon'].map((f) => (
            <button
              key={f}
              className={`flex-shrink-0 font-barlow text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                f === 'All'
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy border-gray-200 hover:border-navy'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* ── Countdown ── */}
      <section className="bg-navy/5 border-b border-navy/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-barlow text-sm font-semibold tracking-[0.3em] uppercase text-cyan-brand mb-1">
              Next Launch
            </p>
            <h2 className="font-cormorant font-bold text-3xl text-navy">
              Emerald Pines Estate
            </h2>
            <p className="font-barlow text-gray-500 text-sm mt-1">
              Official opening — July 1, 2026
            </p>
          </div>
          <CountdownTimer
            targetDate="2026-07-01T10:00:00"
            label=""
          />
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-16 bg-site-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {launches.map((prop) => (
              <article
                key={prop.slug}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group flex flex-col"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={prop.image}
                    alt={prop.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <BadgeColor badge={prop.badge} />
                  </div>
                  {prop.daysAgo !== null && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 text-white/90 text-xs font-barlow px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {prop.daysAgo === 0 ? 'Today' : `${prop.daysAgo}d ago`}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="font-barlow text-xs font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                      {prop.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-cormorant font-bold text-2xl text-navy leading-tight">
                      {prop.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-barlow text-sm">{prop.city} · {prop.county}</span>
                  </div>

                  <p className="font-barlow text-sm text-gray-500 leading-relaxed mb-5">
                    {prop.description}
                  </p>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {prop.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-1.5 font-barlow text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00aeef] flex-shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <Ruler className="w-3.5 h-3.5" />
                        <span className="font-barlow text-sm">{prop.acres} acres</span>
                      </div>
                      <span className="font-cormorant font-bold text-2xl text-navy">
                        {prop.price ? formatPrice(prop.price) : 'Price on Request'}
                      </span>
                    </div>
                    <Link
                      href={prop.price ? `/properties` : '/contact'}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-navy text-white font-barlow font-semibold text-sm rounded-lg hover:bg-[#00aeef] transition-colors"
                    >
                      {prop.price ? 'Details' : 'Notify Me'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 text-[#00aeef] mx-auto mb-6" />
          <h2 className="font-cormorant font-bold text-4xl text-white mb-5">
            Quer ser notificado dos próximos lançamentos?
          </h2>
          <p className="font-barlow text-white/70 text-lg mb-8">
            Cadastre-se e receba os novos lançamentos antes de irem ao mercado.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#00aeef] text-white font-barlow font-semibold rounded-md hover:bg-[#33ccff] transition-colors"
          >
            Receber Alertas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
