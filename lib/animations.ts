import type { Variants } from 'framer-motion'

// ── Fade variants ─────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

// ── Scale variants ────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ── Stagger container ─────────────────────────────────────────
// Wrap children with this to animate them one by one
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

// ── Card hover ────────────────────────────────────────────────
export const cardHover = {
  rest: { scale: 1, y: 0, transition: { duration: 0.2 } },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } },
}

// ── Pulse (for badges / CTAs) ─────────────────────────────────
export const pulse: Variants = {
  animate: {
    scale: [1, 1.08, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ── Slide in from bottom (modals / drawers) ───────────────────
export const slideUp: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 28, stiffness: 300 } },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
}

// ── Number counter (countdown digits) ────────────────────────
export const digitFlip: Variants = {
  enter: { y: -20, opacity: 0 },
  center: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}
