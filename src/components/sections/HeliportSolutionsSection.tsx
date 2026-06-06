'use client'

// src/components/sections/HeliportSolutionsSection.tsx
// ──────────────────────────────────────────────────────
// Tier router — same pattern as HeroSection / AboutSection / ServicesSection.
// mobile  (< 768px)  → HeliportSolutionsMobile  — single col, simple reveal
// tablet  (768–1023) → HeliportSolutionsTablet  — 2-col staggered
// desktop (1024px+)  → HeliportSolutionsDesktop — 3-col staggered, exact original

import { useSyncExternalStore } from 'react'
import { HeliportSolutionsDesktop } from './heliport/HeliportSolutionsDesktop'
import { HeliportSolutionsTablet }  from './heliport/HeliportSolutionsTablet'
import { HeliportSolutionsMobile }  from './heliport/HeliportSolutionsMobile'

type HeliportTier = 'mobile' | 'tablet' | 'desktop'

function getHeliportTier(): HeliportTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches)  return 'tablet'
    return 'mobile'
}

const heliportTierMqs =
    typeof window !== 'undefined'
        ? [
            window.matchMedia('(min-width: 768px)'),
            window.matchMedia('(min-width: 1024px)'),
        ]
        : []

const subscribeHeliportTier = (cb: () => void) => {
    heliportTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => heliportTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const heliportTierSnapshot       = (): HeliportTier =>
    typeof window !== 'undefined' ? getHeliportTier() : 'desktop'
const heliportTierServerSnapshot = (): HeliportTier => 'desktop'

export function HeliportSolutionsSection() {
    const tier = useSyncExternalStore(
        subscribeHeliportTier,
        heliportTierSnapshot,
        heliportTierServerSnapshot,
    )

    if (tier === 'desktop') return <HeliportSolutionsDesktop />
    if (tier === 'tablet')  return <HeliportSolutionsTablet  />
    return                         <HeliportSolutionsMobile  />
}