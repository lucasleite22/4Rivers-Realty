import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield, Lightbulb, Heart, MapPin, Mail, Phone, BadgeCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Founded in Ocala, Florida, 4Rivers Realty has been the trusted name in horse farms, ranches, and rural properties in North Central Florida for over 20 years.',
  openGraph: {
    title: 'About 4Rivers Realty | Ocala, FL',
    description:
      'Founded in Ocala, Florida, 4Rivers Realty has been the trusted name in horse farms and rural properties for over 20 years.',
  },
}

const team = [
  {
    name: 'Talles Batista Menezes',
    role: 'Realtor',
    photo: '/images/team/talles-batista.jpg',
    email: 'Tallesbatistarealtor@gmail.com',
    phone: '(321) 200-9620',
    license: 'FL License #3631988',
    specialties: ['Rural Properties', 'Ranches & Farms', 'Land Development'],
    bio: 'Talles Batista é corretor de imóveis na Flórida e fundador do Ganhando na América, especializado em propriedades rurais, ranchos e investimentos imobiliários nos Estados Unidos.',
  },
  {
    name: 'Bela Biet',
    role: 'Real Estate Agent',
    photo: '/images/team/bela-biet.jpg',
    email: 'bela4rivers@gmail.com',
    phone: '(407) 415-2007',
    license: 'FL License SL3635783',
    specialties: [
      'Investment Properties',
      'Acreage & Land Opportunities',
      'Luxury Homes',
      'Ranch & Equestrian Properties',
      'Farmhouses & Country Living',
    ],
    bio: "Born in Brazil and raised in the United States, I've spent over 10 years in real estate, and what I enjoy most is helping people navigate the process with confidence. Today, with 4 Rivers Realty, I specialize in rural Florida properties — from land and ranches to farmhouses — and bring experience in land transactions, tax deed auction opportunities, and making sure every detail and document is handled with care. Whether you're buying your first piece of land, searching for an investment opportunity, or transitioning from city living to the country, I'm here to guide you every step of the way.",
  },
  {
    name: 'Rose Biet',
    role: 'Real Estate Agent',
    photo: '/images/team/rose-biet.jpg',
    email: 'rose4rivers@gmail.com',
    phone: '(321) 234-1726',
    license: 'FL License SL3295740',
    specialties: [
      'Residential Real Estate',
      'First-Time Home Buyers',
      'Investment Properties',
      'Acreage & Land Opportunities',
      'Ranch & Equestrian Properties',
      'Farmhouses & Country Living',
    ],
    bio: 'As a FL licensed real estate professional since 2014, I am dedicated to helping clients make a smooth transition to country living throughout Central Florida. With experience in buying and selling residential properties, including knowledge of tax deed auction opportunities. I provide personalized guidance to explore the best opportunities for your lifestyle and long-term goals. My commitment is to make every step of your real estate journey seamless, informed, and rewarding.',
  },
]

const values = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Integridade',
    description: 'Somos honestos com todas as nossas transações.',
  },
  {
    icon: <MapPin className="w-8 h-8" />,
    title: 'Expertise Local',
    description: 'Somos bem ativos nas nossas áreas locais.',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Compromisso',
    description: 'Só fechamos quando o cliente está 100% satisfeito.',
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Transparência',
    description: 'Somos bem transparentes e comunicativos com nossos clientes.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[72vh] min-h-[560px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1553284965-5dd02352d7c8?w=1600&q=85"
          alt="Horses grazing on a Florida pasture"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-dark-navy/70" />
        <div className="relative z-10 flex flex-col items-center text-center px-4 gap-7">
          {/* Logo em destaque */}
          <Image
            src="/images/logo-horizontal-white.png"
            alt="4Rivers Realty"
            width={380}
            height={112}
            className="h-24 sm:h-28 w-auto object-contain"
            priority
          />

          {/* Separador decorativo */}
          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-brand-blue" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
            <div className="h-px w-16 bg-brand-blue" />
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-cormorant font-bold text-4xl sm:text-5xl text-white tracking-wide">
              Our Story
            </h1>
            <p className="font-barlow text-white/55 text-sm tracking-[0.35em] uppercase mt-3">
              Rooted in Florida · Passionate About Land
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-4">
                Who We Are
              </p>
              <h2 className="font-cormorant font-bold text-5xl text-dark-navy leading-tight mb-6">
                Rooted in Florida,
                <br />
                Passionate About Land
              </h2>
              <div className="space-y-5 font-barlow text-gray-600 leading-relaxed">
                <p>
                  Founded in Ocala, Florida, 4Rivers Realty was built on a simple
                  belief: finding the right rural property should be an experience,
                  not just a transaction. With deep roots in North Central Florida's
                  equestrian community, we specialize in horse farms, ranches, and
                  rural estates that match your vision of the perfect lifestyle.
                </p>
                <p>
                  Our name reflects the four rivers that define our region — the
                  Withlacoochee, the Ocklawaha, the Santa Fe, and the Suwannee —
                  waterways that have shaped this land for centuries and continue
                  to make North Central Florida one of the most sought-after rural
                  destinations in the country.
                </p>
                <p>
                  With over 10 years of experience, 57 closed sales, and $15.5M
                  in total transaction volume, our commitment remains the same:
                  local knowledge, honest guidance, and results you can count on.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-dark-navy text-white font-barlow font-semibold rounded-md hover:bg-brand-blue transition-colors"
              >
                Talk to Our Team <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=85"
                alt="Rural horse farm property in North Central Florida"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-6 left-6 bg-white rounded-xl p-5 shadow-lg max-w-[200px]">
                <p className="font-cormorant font-bold text-3xl text-dark-navy">10+</p>
                <p className="font-barlow text-sm text-gray-500 mt-1">
                  Years serving North Central Florida
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-28 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              Meet the <span className="text-brand-blue">Team</span>
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              Each member of our team brings specialized knowledge and a genuine
              love for Florida land.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-gray-200 md:divide-y-0 md:divide-x border border-gray-200 rounded-2xl overflow-hidden bg-white">
            {team.map((member) => (
              <div key={member.name}>
                <div className="relative h-96 bg-navy">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-[center_15%]"
                  />
                </div>
                <div className="p-7">
                  <h3 className="font-cormorant font-bold text-2xl text-dark-navy">
                    {member.name}
                  </h3>
                  <p className="font-barlow text-sm font-semibold text-brand-blue mt-1 tracking-wide">
                    {member.role}
                  </p>
                  <p className="font-barlow text-sm text-gray-500 mt-4 leading-relaxed">
                    {member.bio}
                  </p>

                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 font-barlow text-sm text-gray-600 hover:text-brand-blue transition-colors"
                    >
                      <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                      {member.email}
                    </a>
                    <a
                      href={`tel:${member.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-2 font-barlow text-sm text-gray-600 hover:text-brand-blue transition-colors"
                    >
                      <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                      {member.phone}
                    </a>
                    <div className="flex items-center gap-2 font-barlow text-sm text-gray-600">
                      <BadgeCheck className="w-4 h-4 text-brand-blue shrink-0" />
                      {member.license}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.specialties.map((s) => (
                      <span
                        key={s}
                        className="font-barlow text-xs text-dark-navy bg-off-white border border-gray-200 rounded-full px-3 py-1"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-28 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
              <h3 className="font-cormorant font-bold text-3xl text-dark-navy mb-4">
                Our Mission
              </h3>
              <p className="font-barlow text-gray-600 leading-relaxed">
                Our mission is to bring families who want to leave the rush of
                the city and bring them to the tranquility of ranch life.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
              <h3 className="font-cormorant font-bold text-3xl text-dark-navy mb-4">
                Our Vision
              </h3>
              <p className="font-barlow text-gray-600 leading-relaxed">
                Our vision is to be the go-to real estate company for Brazilians
                looking to move to the United States and live outside the city.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-8 mb-16 flex-wrap">
            <h2 className="font-cormorant font-bold text-5xl text-dark-navy">
              What We Stand For
            </h2>
            <p className="font-barlow text-gray-500 text-lg max-w-sm">
              Four principles guide every property, every client, every deal.
            </p>
          </div>

          <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {values.map((v) => (
              <div
                key={v.title}
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-start sm:items-center gap-x-8 gap-y-3 py-9"
              >
                <div className="flex items-center gap-4 sm:w-56">
                  <div className="flex items-center justify-center w-12 h-12 bg-navy text-brand-blue rounded-xl shrink-0">
                    {v.icon}
                  </div>
                  <h3 className="font-cormorant font-bold text-2xl text-dark-navy">
                    {v.title}
                  </h3>
                </div>
                <p className="font-barlow text-sm text-gray-500 leading-relaxed max-w-xl">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-dark-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-cormorant font-bold text-4xl text-white mb-5">
            Let's Find Your Property Together
          </h2>
          <p className="font-barlow text-white/60 text-lg mb-8">
            Reach out to our team and start the conversation today.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-blue text-dark-navy font-barlow font-semibold rounded-md hover:bg-light-blue transition-colors"
          >
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
