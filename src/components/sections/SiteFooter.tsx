'use client'

import { useSyncExternalStore } from 'react'
import { FooterDesktop } from '@/components/sections/footer/FooterDesktop'
import { FooterTablet } from '@/components/sections/footer/FooterTablet'
import { FooterMobile } from '@/components/sections/footer/FooterMobile'

type FooterTier = 'mobile' | 'tablet' | 'desktop'

function getFooterTier(): FooterTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
    return 'mobile'
}

const footerTierMqs =
    typeof window !== 'undefined'
        ? [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')]
        : []

const subscribeFooterTier = (cb: () => void) => {
    footerTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => footerTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const footerTierSnapshot = (): FooterTier => typeof window !== 'undefined' ? getFooterTier() : 'desktop'
const footerTierServerSnapshot = (): FooterTier => 'desktop'

export function SiteFooter() {
    const tier = useSyncExternalStore(subscribeFooterTier, footerTierSnapshot, footerTierServerSnapshot)
    if (tier === 'desktop') return <FooterDesktop />
    if (tier === 'tablet') return <FooterTablet />
    return <FooterMobile />
}