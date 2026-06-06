'use client'

// src/components/sections/GlobalPresenceSection.tsx
// ───────────────────────────────────────────────────
// Tier router — same pattern as all other sections.
// mobile  (< 768px)  → GlobalPresenceMobile  — stacked cards, simple fade
// tablet  (768–1023) → GlobalPresenceTablet  — side-by-side, sticky copy
// desktop (1024px+)  → GlobalPresenceDesktop — sticky + spring parallax (original)

import { useSyncExternalStore } from 'react'
import { GlobalPresenceDesktop } from './global/GlobalPresenceDesktop'
import { GlobalPresenceTablet }  from './global/GlobalPresenceTablet'
import { GlobalPresenceMobile }  from './global/GlobalPresenceMobile'

type GlobalTier = 'mobile' | 'tablet' | 'desktop'

function getGlobalTier(): GlobalTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches)  return 'tablet'
    return 'mobile'
}

const globalTierMqs =
    typeof window !== 'undefined'
        ? [
            window.matchMedia('(min-width: 768px)'),
            window.matchMedia('(min-width: 1024px)'),
        ]
        : []

const subscribeGlobalTier = (cb: () => void) => {
    globalTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => globalTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const globalTierSnapshot       = (): GlobalTier =>
    typeof window !== 'undefined' ? getGlobalTier() : 'desktop'
const globalTierServerSnapshot = (): GlobalTier => 'desktop'

export function GlobalPresenceSection() {
    const tier = useSyncExternalStore(
        subscribeGlobalTier,
        globalTierSnapshot,
        globalTierServerSnapshot,
    )

    if (tier === 'desktop') return <GlobalPresenceDesktop />
    if (tier === 'tablet')  return <GlobalPresenceTablet  />
    return                         <GlobalPresenceMobile  />
}