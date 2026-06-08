'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { SitePreloader } from '@/components/ui/SitePreloader'

export function PreloaderProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false)

    // Lock scroll while loading
    useEffect(() => {
        if (ready) return
        const original = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = original }
    }, [ready])

    const handleComplete = useCallback(() => {
        setReady(true)
        // Scroll to top cleanly once unlocked
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [])

    return (
        <>
            <SitePreloader onComplete={handleComplete} />
            {/* Page content fades in when ready */}
            <div
                style={{
                    opacity: ready ? 1 : 0,
                    transition: ready ? 'opacity 0.5s ease-out' : 'none',
                    visibility: ready ? 'visible' : 'hidden',
                }}
            >
                {children}
            </div>
        </>
    )
}