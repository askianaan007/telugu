'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from '@/lib/animations/gsap'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)
    // Store ticker callback ref so we can remove the EXACT same function reference
    const tickerCallbackRef = useRef<((time: number) => void) | null>(null)

    useEffect(() => {
        const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
        lenisRef.current = lenis

        // Store the exact function reference — GSAP matches by reference, not by value
        tickerCallbackRef.current = (time: number) => {
            lenis.raf(time * 1000)
        }
        gsap.ticker.add(tickerCallbackRef.current)
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
            // Remove the exact same reference that was added — no more leak
            if (tickerCallbackRef.current) {
                gsap.ticker.remove(tickerCallbackRef.current)
                tickerCallbackRef.current = null
            }
            document.removeEventListener('visibilitychange', onVisibilityChange)
            lenis.destroy()
            lenisRef.current = null
        }
    }, [])

    return <>{children}</>
}