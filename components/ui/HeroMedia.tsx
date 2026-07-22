import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import HeroSlideshow from './HeroSlideshow'

interface Props {
  videoSrc: string
  posterSrc: string
  images?: string[]
  alt: string
}

/**
 * Renders a looping background video when the file exists in /public.
 * Otherwise falls back to a crossfade photo slideshow (or the static
 * poster if no image list is given) — so the hero works today and
 * upgrades automatically once a real video file is dropped in.
 */
export default function HeroMedia({ videoSrc, posterSrc, images, alt }: Props) {
  const videoExists = fs.existsSync(path.join(process.cwd(), 'public', videoSrc))

  if (!videoExists) {
    if (images && images.length > 0) {
      return <HeroSlideshow images={images} alt={alt} />
    }
    return (
      <Image
        src={posterSrc}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
    )
  }

  return (
    <>
      {/* Base layer: shows through when the video is hidden (prefers-reduced-motion) or still loading */}
      <Image
        src={posterSrc}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
      <video
        className="absolute inset-0 w-full h-full object-cover object-center hero-media"
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        aria-label={alt}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </>
  )
}
