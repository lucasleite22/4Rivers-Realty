import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield, Lightbulb, Heart } from 'lucide-react'

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
    name: 'Lucas Leite',
    role: 'Founder & Principal Broker',
    initials: 'LL',
    bio: 'Born and raised in Ocala, Lucas founded 4Rivers Realty with one mission: to connect people with the land that suits their lifestyle. A licensed broker with 20+ years of experience, he brings unmatched local knowledge and genuine passion to every transaction.',
  },
  {
    name: 'Lindoso',
    role: 'Senior Agent',
    initials: 'LN',
    bio: 'With a background in equestrian management and over a decade in real estate, Lindoso is the go-to specialist for buyers seeking working horse farms and competition-ready facilities across Marion and Alachua counties.',
  },
  {
    name: 'Luan',
    role: 'Property Specialist',
    initials: 'LU',
    bio: 'Luan focuses on raw land acquisitions, ranch properties, and development opportunities throughout Levy and Citrus counties. His thorough due diligence and market analysis help buyers make confident, well-informed decisions.',
  },
]

const values = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Integrity',
    description:
      'We believe every client deserves honest advice, even when it means telling them what they don't want to hear. Our reputation was built on transparency, and we protect it with every transaction.',
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Expertise',
    description:
      'Rural real estate demands a different kind of knowledge — water rights, agricultural zoning, equestrian infrastructure, soil quality. Our team brings deep, specialized expertise to every listing and every search.',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Dedication',
    description:
      'We don't just sell properties. We get to know your goals, your timeline, and your vision. From the first call to the final signature, we're fully committed to making your experience exceptional.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[60vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1553284965-5dd02352d7c8?w=1600&q=85"
          alt="Horses grazing on a Florida pasture"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-navy/65" />
        <div className="relative z-10 text-center px-4">
          <p className="font-barlow text-[#33ccff] text-sm font-semibold tracking-[0.3em] uppercase mb-4">
            Our Story
          </p>
          <h1 className="font-cormorant font-bold text-5xl sm:text-6xl text-white">
            About 4Rivers Realty
          </h1>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-barlow text-[#00aeef] text-sm font-semibold tracking-[0.3em] uppercase mb-4">
                Who We Are
              </p>
              <h2 className="font-cormorant font-bold text-5xl text-navy leading-tight mb-6">
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
                  Over two decades and $2 billion in transactions later, our
                  commitment remains the same: local knowledge, honest guidance,
                  and results you can count on.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-navy text-white font-barlow font-semibold rounded-md hover:bg-[#00aeef] transition-colors"
              >
                Talk to Our Team <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=85"
                alt="Rural horse farm property in North Central Florida"
                fill
                className="object-cover"
              />
              {/* Accent card */}
              <div className="absolute bottom-6 left-6 bg-white rounded-xl p-5 shadow-lg max-w-[200px]">
                <p className="font-cormorant font-bold text-3xl text-navy">20+</p>
                <p className="font-barlow text-sm text-gray-500 mt-1">
                  Years serving North Central Florida
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-24 bg-site-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-barlow text-[#00aeef] text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              The People Behind 4Rivers
            </p>
            <h2 className="font-cormorant font-bold text-5xl text-navy">
              Meet Our Team
            </h2>
            <p className="font-barlow text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              Each member of our team brings specialized knowledge and a genuine
              love for Florida land.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-navy flex items-center justify-center">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${member.initials}&background=174079&color=ffffff&size=120&bold=true&font-size=0.4`}
                    alt={member.name}
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-white/20"
                  />
                </div>
                <div className="p-7">
                  <h3 className="font-cormorant font-bold text-2xl text-navy">
                    {member.name}
                  </h3>
                  <p className="font-barlow text-sm font-semibold text-[#00aeef] mt-1 tracking-wide">
                    {member.role}
                  </p>
                  <p className="font-barlow text-sm text-gray-500 mt-4 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-barlow text-[#00aeef] text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              What We Stand For
            </p>
            <h2 className="font-cormorant font-bold text-5xl text-navy">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((v) => (
              <div
                key={v.title}
                className="text-center px-8 py-10 rounded-2xl bg-site-bg hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-navy text-[#00aeef] rounded-2xl mb-6">
                  {v.icon}
                </div>
                <h3 className="font-cormorant font-bold text-2xl text-navy mb-4">
                  {v.title}
                </h3>
                <p className="font-barlow text-sm text-gray-500 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-cormorant font-bold text-4xl text-white mb-5">
            Let's Find Your Property Together
          </h2>
          <p className="font-barlow text-white/70 text-lg mb-8">
            Reach out to our team and start the conversation today.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#00aeef] text-white font-barlow font-semibold rounded-md hover:bg-[#33ccff] transition-colors"
          >
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
