'use client'

import Lenis from 'lenis'
import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'

export const LenisContext = createContext<Lenis | null>(null)

const HEADER_OFFSET = -96

interface LenisProviderProps {
  children: ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({
      lerp: 0.07,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
    })

    setLenis(instance)

    gsap.ticker.lagSmoothing(0)
    const update = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(update)
    instance.on('scroll', ScrollTrigger.update)

    const onResize = () => {
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(() => {
        if (typeof (instance as any).resize === 'function') {
          (instance as any).resize()
        }
        ScrollTrigger.refresh(true)
      }, 160)
    }
    window.addEventListener('resize', onResize, { passive: true })

    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      const isCurrentPageHash =
        href.startsWith('#') ||
        (href.startsWith('/#') && window.location.pathname === '/')

      if (!isCurrentPageHash) return

      const hash = href.split('#')[1]
      if (!hash) return

      const target = document.getElementById(hash)
      if (!target) return

      e.preventDefault()
      instance.scrollTo(target, {
        offset: HEADER_OFFSET,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      window.history.pushState(null, '', `#${hash}`)
    }
    document.addEventListener('click', onAnchorClick)

    return () => {
      clearTimeout(resizeTimerRef.current)
      instance.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(update)
      document.removeEventListener('click', onAnchorClick)
      window.removeEventListener('resize', onResize)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}