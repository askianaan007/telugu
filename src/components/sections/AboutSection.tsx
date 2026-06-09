'use client'

// src/components/sections/AboutSection.tsx
// ─────────────────────────────────────────
// Tier router — unchanged from current project.
// All handoff props flow through AboutSectionProps which already includes
// fixedHelicopterOpacityRef and fixedRingsRef. The handoff context is consumed
// directly inside each tier component via useAboutVisionHandoffOptional().

import { useSyncExternalStore } from 'react'
import { AboutSectionDesktop } from './about/AboutSectionDesktop'
import { AboutSectionTablet } from './about/AboutSectionTablet'
import { AboutSectionMobile } from './about/AboutSectionMobile'
import type { AboutSectionProps } from './about/aboutShared'

type AboutTier = 'mobile' | 'tablet' | 'desktop'

function getAboutTier(): AboutTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
    return 'mobile'
}

const aboutTierMqs =
    typeof window !== 'undefined'
        ? [
            window.matchMedia('(min-width: 768px)'),
            window.matchMedia('(min-width: 1024px)'),
        ]
        : []

const subscribeAboutTier = (cb: () => void) => {
    aboutTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => aboutTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}
const aboutTierSnapshot = (): AboutTier => typeof window !== 'undefined' ? getAboutTier() : 'desktop'
const aboutTierServerSnapshot = (): AboutTier => 'desktop'

export type { AboutSectionProps }

export function AboutIntroSection(props: AboutSectionProps) {
    const tier = useSyncExternalStore(
        subscribeAboutTier,
        aboutTierSnapshot,
        aboutTierServerSnapshot,
    )

    if (tier === 'desktop') return <AboutSectionDesktop {...props} />
    if (tier === 'tablet') return <AboutSectionTablet  {...props} />
    return <AboutSectionMobile {...props} />
}