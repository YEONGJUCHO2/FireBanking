'use client'

import { type ReactNode, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/cn'

gsap.registerPlugin(useGSAP)

export function AnimatedScreen({ children, className }: { children: ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      gsap.from(scope.current, {
        autoAlpha: 0,
        y: 18,
        duration: 0.7,
        ease: 'power3.out',
      })

      const staggerItems = gsap.utils.toArray('[data-motion="stagger"]')
      if (staggerItems.length > 0) {
        gsap.from(staggerItems, {
          autoAlpha: 0,
          y: 18,
          scale: 0.98,
          duration: 0.68,
          ease: 'power3.out',
          stagger: 0.055,
          delay: 0.12,
        })
      }
    },
    { scope },
  )

  return (
    <div ref={scope} className={cn('min-h-full', className)}>
      {children}
    </div>
  )
}
