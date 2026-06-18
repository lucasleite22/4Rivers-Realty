'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { digitFlip } from '@/lib/animations'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface Props {
  targetDate: string | Date
  label?: string
  onExpired?: () => void
  className?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Digit({ value, label }: { value: number; label: string }) {
  const display = pad(value)
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative bg-navy rounded-xl w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center overflow-hidden shadow-lg">
        {/* Flip line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/20 z-10" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            variants={digitFlip}
            initial="enter"
            animate="center"
            exit="exit"
            className="font-cormorant font-bold text-4xl sm:text-5xl text-white select-none"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="font-barlow text-xs font-semibold tracking-widest uppercase text-navy/60">
        {label}
      </span>
    </div>
  )
}

export default function CountdownTimer({
  targetDate,
  label = 'Launch in',
  onExpired,
  className = '',
}: Props) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(target))
  const [expired, setExpired] = useState(false)

  const tick = useCallback(() => {
    const next = calcTimeLeft(target)
    setTimeLeft(next)
    if (
      next.days === 0 &&
      next.hours === 0 &&
      next.minutes === 0 &&
      next.seconds === 0
    ) {
      setExpired(true)
      onExpired?.()
    }
  }, [target, onExpired])

  useEffect(() => {
    if (expired) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick, expired])

  if (expired) {
    return (
      <div className={`text-center font-cormorant text-3xl text-navy ${className}`}>
        This property is now live!
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {label && (
        <p className="font-barlow text-sm font-semibold tracking-[0.3em] uppercase text-brand-blue">
          {label}
        </p>
      )}
      <div className="flex items-start gap-3 sm:gap-5">
        <Digit value={timeLeft.days} label="Days" />
        <Separator />
        <Digit value={timeLeft.hours} label="Hours" />
        <Separator />
        <Digit value={timeLeft.minutes} label="Min" />
        <Separator />
        <Digit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  )
}

function Separator() {
  return (
    <span className="font-cormorant font-bold text-3xl text-navy/40 mt-4 select-none">
      :
    </span>
  )
}
