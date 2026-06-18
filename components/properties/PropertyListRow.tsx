import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Ruler } from 'lucide-react'

interface Props {
  name: string
  type: string
  city: string
  acres: number
  price: string
  image: string
  href: string
}

/** Horizontal listing row — photo + icon specs + CTA, used for the homepage showcase. */
export default function PropertyListRow({ name, type, city, acres, price, image, href }: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col sm:flex-row items-center gap-6 sm:gap-8 py-8 border-t border-gray-100 first:border-t-0"
    >
      <div className="relative w-full sm:w-64 h-48 sm:h-40 flex-shrink-0 rounded-xl overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 256px"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <span className="absolute top-3 left-3 bg-dark-navy text-white font-barlow text-xs font-semibold px-3 py-1 rounded-full">
          {type}
        </span>
      </div>

      <div className="flex-1 w-full">
        <h3 className="font-cormorant font-bold text-2xl text-dark-navy group-hover:text-brand-blue transition-colors">
          {name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 font-barlow text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-blue" /> {city}, FL
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-brand-blue" /> {acres} acres
          </span>
        </div>
        <p className="font-cormorant font-bold text-2xl text-dark-navy mt-4">{price}</p>
      </div>

      <div className="flex-shrink-0 self-stretch sm:self-center">
        <span className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-dark-navy font-barlow font-semibold text-sm rounded-md group-hover:bg-light-blue transition-colors whitespace-nowrap">
          View Listing <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}
