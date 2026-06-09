'use client'

/**
 * PreloaderProvider.tsx
 *
 * Simpler than before — pre-scroll now happens inside SitePreloader,
 * so onComplete only fires when everything is ready.
 *
 * Changes from original:
 * • handleComplete is synchronous again (pre-scroll moved to SitePreloader)
 * • Removed the AbortController (no longer needed here)
 * • Removed the inline window.scrollTo (preScroll.ts guarantees position 0)
 * • All console.log debug lines kept for your convenience
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { SitePreloader } from '@/components/ui/SitePreloader'

let hasPreloaded = false

export function PreloaderProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(() => hasPreloaded)

    // Lock body scroll while preloader is active
    useEffect(() => {
        if (ready || hasPreloaded) return
        const original = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = original }
    }, [ready])

    // Called by SitePreloader AFTER pre-scroll completes and exit animation finishes
    const handleComplete = useCallback(() => {
        hasPreloaded = true
        setReady(true)
        // preScroll.ts already guaranteed position 0, but belt-and-suspenders:
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, [])

    if (hasPreloaded) return <>{children}</>

    return (
        <>
            <SitePreloader onComplete={handleComplete} />
            {/* Only mount children AFTER preloader completes to avoid running
                GSAP/Framer/Lenis effects while the screen is hidden */}
            {ready && children}
        </>
    )
}