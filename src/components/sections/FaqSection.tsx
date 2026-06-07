'use client'

import { useSyncExternalStore } from 'react'
import { FaqDesktop } from '@/components/sections/faq/FaqDesktop'
import { FaqTablet } from '@/components/sections/faq/FaqTablet'
import { FaqMobile } from '@/components/sections/faq/FaqMobile'

type FaqTier = 'mobile' | 'tablet' | 'desktop'

function getFaqTier(): FaqTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
    return 'mobile'
}

const faqTierMqs =
    typeof window !== 'undefined'
        ? [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')]
        : []

const subscribeFaqTier = (cb: () => void) => {
    faqTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => faqTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const faqTierSnapshot = (): FaqTier => typeof window !== 'undefined' ? getFaqTier() : 'desktop'
const faqTierServerSnapshot = (): FaqTier => 'desktop'

export function FaqSection() {
    const tier = useSyncExternalStore(subscribeFaqTier, faqTierSnapshot, faqTierServerSnapshot)
    if (tier === 'desktop') return <FaqDesktop />
    if (tier === 'tablet') return <FaqTablet />
    return <FaqMobile />
}