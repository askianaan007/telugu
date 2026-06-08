'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { SitePreloader } from '@/components/ui/SitePreloader'

let hasPreloaded = false

if (typeof window !== 'undefined') {
    console.log('[PreloaderProvider] Module loaded — hasPreloaded:', hasPreloaded)
}

export function PreloaderProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(() => hasPreloaded)

    useEffect(() => {
        console.log('[PreloaderProvider] mounted — hasPreloaded:', hasPreloaded, '— ready:', ready)
        return () => {
            console.log('[PreloaderProvider] unmounted')
        }
    }, [])

    useEffect(() => {
        if (ready || hasPreloaded) return
        const original = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = original }
    }, [ready])

    const handleComplete = useCallback(() => {
        console.log('[PreloaderProvider] handleComplete called — setting hasPreloaded=true')
        hasPreloaded = true
        setReady(true)
        // Scroll to top cleanly once unlocked
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [])

    if (hasPreloaded) {
        return <>{children}</>
    }

    return (
        <>
            <SitePreloader onComplete={handleComplete} />
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