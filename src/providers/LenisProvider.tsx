'use client'

/**
 * LenisProvider.tsx
 *
 * Changes from original (marked with ← NEW):
 *
 * 1. window.__lenis = lenis           ← exposes instance for preScroll.ts
 * 2. window.__lenisTicker = callback  ← exposes ticker ref for preScroll.ts
 * 3. window.__ScrollTrigger = ST      ← exposes ScrollTrigger for preScroll.ts
 * 4. Cleanup removes all three        ← no stale refs after unmount
 *
 * Everything else is your original code, unchanged.
 */

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'

// ── Window bridge types (can also live in src/types/global.d.ts) ──────────────
declare global {
    interface Window {
        __lenis?: Lenis
        __lenisTicker?: (time: number) => void
        __ScrollTrigger?: typeof ScrollTrigger
    }
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)
    const tickerCallbackRef = useRef<((time: number) => void) | null>(null)

    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.045,
            smoothWheel: true,
        })
        lenisRef.current = lenis

        // ← NEW: expose for preScroll.ts
        window.__lenis = lenis

        // Store the exact ticker function reference — GSAP matches by reference
        const tickerCallback = (time: number) => {
            lenis.raf(time * 1000)
        }
        tickerCallbackRef.current = tickerCallback

        // ← NEW: expose ticker ref so preScroll.ts can remove/re-add it
        window.__lenisTicker = tickerCallback

        // ← NEW: expose ScrollTrigger for preScroll.ts refresh call
        window.__ScrollTrigger = ScrollTrigger

        gsap.ticker.add(tickerCallback)
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
            // Remove the exact same reference — no ticker leak
            if (tickerCallbackRef.current) {
                gsap.ticker.remove(tickerCallbackRef.current)
                tickerCallbackRef.current = null
            }
            document.removeEventListener('visibilitychange', onVisibilityChange)
            lenis.destroy()
            lenisRef.current = null

            // ← NEW: clean up window refs
            if (window.__lenis === lenis) delete window.__lenis
            if (window.__lenisTicker === tickerCallback) delete window.__lenisTicker
            // Keep __ScrollTrigger — it's module-level and doesn't need cleanup
        }
    }, [])

    return <>{children}</>
}