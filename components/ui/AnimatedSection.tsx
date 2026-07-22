'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { fadeInUp, staggerContainer, reducedMotionFade, reducedMotionStaggerContainer } from '@/lib/animations'

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
  const prefersReducedMotion = useReducedMotion()
  const childVariants = prefersReducedMotion ? reducedMotionFade : fadeInUp
  const appliedVariants = stagger
    ? prefersReducedMotion
      ? reducedMotionStaggerContainer
      : staggerContainer
    : prefersReducedMotion
      ? reducedMotionFade
      : variants

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
        ? // Each direct child gets the fadeInUp variant automatically (or a plain fade when motion is reduced)
          (Array.isArray(children) ? children : [children]).map((child, i) => (
            <motion.div key={i} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
