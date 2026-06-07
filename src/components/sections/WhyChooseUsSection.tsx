'use client'

// src/components/sections/WhyChooseUsSection.tsx
// Tier router — mobile / tablet / desktop.

import { useSyncExternalStore } from 'react'
import { WhyChooseDesktop } from './why_choose/WhyChooseDesktop'
import { WhyChooseTablet } from './why_choose/WhyChooseTablet'
import { WhyChooseMobile } from './why_choose/WhyChooseMobile'

type WhyTier = 'mobile' | 'tablet' | 'desktop'

function getWhyTier(): WhyTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
    return 'mobile'
}

const whyTierMqs =
    typeof window !== 'undefined'
        ? [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')]
        : []

const subscribeWhyTier = (cb: () => void) => {
    whyTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => whyTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const whyTierSnapshot = (): WhyTier => typeof window !== 'undefined' ? getWhyTier() : 'desktop'
const whyTierServerSnapshot = (): WhyTier => 'desktop'

export function WhyChooseUsSection() {
    const tier = useSyncExternalStore(subscribeWhyTier, whyTierSnapshot, whyTierServerSnapshot)
    if (tier === 'desktop') return <WhyChooseDesktop />
    if (tier === 'tablet') return <WhyChooseTablet />
    return <WhyChooseMobile />
}