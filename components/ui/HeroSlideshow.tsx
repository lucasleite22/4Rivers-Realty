'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Props {
  images: string[]
  alt: string
  intervalMs?: number
}

export default function HeroSlideshow({ images, alt, intervalMs = 6000 }: Props) {
  const [index, setIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (images.length <= 1 || prefersReducedMotion) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [images.length, intervalMs, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <Image
        src={images[0]}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
    )
  }

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={images[index]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="absolute inset-0"
      >
        <Image
          src={images[index]}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={index === 0}
        />
      </motion.div>
    </AnimatePresence>
  )
}
