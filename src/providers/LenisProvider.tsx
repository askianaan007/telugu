'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from '@/lib/animations/gsap'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
        lenisRef.current = lenis

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000)
        })
        gsap.ticker.lagSmoothing(0)

        const onVisibilityChange = () => {
            if (document.hidden) {
                lenis.stop()
            } else {
                lenis.start()
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            gsap.ticker.remove((time) => lenis.raf(time * 1000))
            document.removeEventListener('visibilitychange', onVisibilityChange)
            lenis.destroy()
            lenisRef.current = null
        }
    }, [])

    return <>{children}</>
}