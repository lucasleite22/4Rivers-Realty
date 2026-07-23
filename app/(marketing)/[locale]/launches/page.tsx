import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Ruler, ArrowRight, Sparkles, Clock } from 'lucide-react'
import prisma from '@/lib/prisma'
import CountdownTimer from '@/components/CountdownTimer'

export const dynamic = 'force-dynamic'

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

const TYPE_LABELS: Record<string, string> = {
  HORSE_FARM: 'Horse Farm',
  RANCH: 'Ranch',
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  LAND: 'Land',
}

async function getLaunches() {
  return prisma.property.findMany({
    where: { isLaunch: true, showOnPortal: true, status: 'ACTIVE' },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function daysAgo(date: Date) {
  const diff = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function BadgeColor({ badge }: { badge: string }) {
  const styles: Record<string, string> = {
    'New Launch': 'bg-brand-blue text-white',
    'Just Listed': 'bg-green-500 text-white',
    'Coming Soon': 'bg-navy text-white',
  }
  return (
    <span className={`font-barlow text-xs font-bold px-3 py-1 rounded-full ${styles[badge] ?? 'bg-gray-500 text-white'}`}>
      {badge}
    </span>
  )
}

export default async function LaunchesPage() {
  const launches = await getLaunches()

  const nextLaunch = launches
    .filter((p) => p.launchDate && p.launchDate.getTime() > Date.now())
    .sort((a, b) => a.launchDate!.getTime() - b.launchDate!.getTime())[0]

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-navy pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-light-blue" />
                <p className="font-barlow text-light-blue text-sm font-semibold tracking-[0.3em] uppercase">
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
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-barlow font-semibold text-sm rounded-md hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              Ver todo o portfólio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Countdown ── */}
      {nextLaunch && (
        <section className="bg-navy/5 border-b border-navy/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="font-barlow text-sm font-semibold tracking-[0.3em] uppercase text-brand-blue mb-1">
                Next Launch
              </p>
              <h2 className="font-cormorant font-bold text-3xl text-navy">
                {nextLaunch.title}
              </h2>
              <p className="font-barlow text-gray-500 text-sm mt-1">
                Official opening — {nextLaunch.launchDate!.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <CountdownTimer
              targetDate={nextLaunch.launchDate!.toISOString()}
              label=""
            />
          </div>
        </section>
      )}

      {/* ── Grid ── */}
      <section className="py-16 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {launches.length === 0 ? (
            <p className="font-barlow text-gray-500 text-center py-16">
              Nenhum lançamento disponível no momento. Volte em breve!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {launches.map((prop) => {
                const image = prop.images[0]?.url ?? null
                const badge = prop.launchBadge ?? 'New Launch'
                return (
                  <article
                    key={prop.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-60 overflow-hidden">
                      {image ? (
                        <Image
                          src={image}
                          alt={prop.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-navy/5">
                          <p className="font-barlow text-navy/30 text-sm">No photo available</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <BadgeColor badge={badge} />
                      </div>
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 text-white/90 text-xs font-barlow px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {daysAgo(prop.createdAt) === 0 ? 'Today' : `${daysAgo(prop.createdAt)}d ago`}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="font-barlow text-xs font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                          {TYPE_LABELS[prop.type] ?? prop.type}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-cormorant font-bold text-2xl text-navy leading-tight">
                          {prop.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-barlow text-sm">{prop.city} · {prop.county} County</span>
                      </div>

                      <p className="font-barlow text-sm text-gray-500 leading-relaxed mb-5 line-clamp-4">
                        {prop.description}
                      </p>

                      {/* Footer */}
                      <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Ruler className="w-3.5 h-3.5" />
                            <span className="font-barlow text-sm">{Number(prop.acreage)} acres</span>
                          </div>
                          <span className="font-cormorant font-bold text-2xl text-navy">
                            {formatPrice(Number(prop.priceUsd))}
                          </span>
                        </div>
                        <Link
                          href={`/properties/${prop.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-navy text-white font-barlow font-semibold text-sm rounded-lg hover:bg-brand-blue transition-colors"
                        >
                          Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 text-brand-blue mx-auto mb-6" />
          <h2 className="font-cormorant font-bold text-4xl text-white mb-5">
            Quer ser notificado dos próximos lançamentos?
          </h2>
          <p className="font-barlow text-white/70 text-lg mb-8">
            Cadastre-se e receba os novos lançamentos antes de irem ao mercado.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-blue text-white font-barlow font-semibold rounded-md hover:bg-light-blue transition-colors"
          >
            Receber Alertas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
