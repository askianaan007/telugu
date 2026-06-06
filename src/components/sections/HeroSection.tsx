'use client'

import { useSyncExternalStore } from 'react'
import { HeroSectionDesktop } from '@/components/sections/hero/HeroSectionDesktop'
import { HeroSectionTablet } from '@/components/sections/hero/HeroSectionTablet'
import { HeroSectionMobile } from '@/components/sections/hero/HeroSectionMobile'

type HeroTier = 'mobile' | 'tablet' | 'desktop'

function getHeroTier(): HeroTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
    return 'mobile'
}

const heroTierMqs =
    typeof window !== 'undefined'
        ? [
            window.matchMedia('(min-width: 768px)'),
            window.matchMedia('(min-width: 1024px)'),
        ]
        : []

const subscribeHeroTier = (cb: () => void) => {
    heroTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => heroTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}
const heroTierSnapshot = (): HeroTier =>
    typeof window !== 'undefined' ? getHeroTier() : 'desktop'
const heroTierServerSnapshot = (): HeroTier => 'desktop'

export type HeroSectionProps = {
    aboutSectionRef?: React.RefObject<HTMLElement | null>
    onHelicopterRef?: (el: HTMLDivElement | null) => void
    onRingsRef?: (el: HTMLDivElement | null) => void
}

export function HeroSection(props: HeroSectionProps) {
    const tier = useSyncExternalStore(
        subscribeHeroTier,
        heroTierSnapshot,
        heroTierServerSnapshot,
    )

    if (tier === 'desktop') return <HeroSectionDesktop {...props} />
    if (tier === 'tablet') return <HeroSectionTablet  {...props} />
    return <HeroSectionMobile  {...props} />
}