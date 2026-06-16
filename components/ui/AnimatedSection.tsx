'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/animations'

interface Props {
  children: React.ReactNode
  className?: string
  variants?: Variants
  stagger?: boolean
  delay?: number
  once?: boolean
}

/**
 * Wraps any section in a scroll-triggered fade-in.
 * Use `stagger` to animate direct children one by one.
 */
export default function AnimatedSection({
  children,
  className,
  variants = fadeInUp,
  stagger = false,
  delay = 0,
  once = true,
}: Props) {
  const appliedVariants = stagger ? staggerContainer : variants

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      variants={appliedVariants}
      transition={delay ? { delay } : undefined}
    >
      {stagger
        ? // Each direct child gets the fadeInUp variant automatically
          (Array.isArray(children) ? children : [children]).map((child, i) => (
            <motion.div key={i} variants={fadeInUp}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
