'use client'


import { useSyncExternalStore } from 'react'
import { CharterServicesDesktop } from './services/CharterServicesDesktop'
import { CharterServicesTablet } from './services/CharterServicesTablet'
import { CharterServicesMobile } from './services/CharterServicesMobile'

type ServicesTier = 'mobile' | 'tablet' | 'desktop'

function getServicesTier(): ServicesTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
    return 'mobile'
}

const servicesTierMqs =
    typeof window !== 'undefined'
        ? [
            window.matchMedia('(min-width: 768px)'),
            window.matchMedia('(min-width: 1024px)'),
        ]
        : []

const subscribeServicesTier = (cb: () => void) => {
    servicesTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => servicesTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const servicesTierSnapshot = (): ServicesTier =>
    typeof window !== 'undefined' ? getServicesTier() : 'desktop'
const servicesTierServerSnapshot = (): ServicesTier => 'desktop'

export function CharterServicesSection() {
    const tier = useSyncExternalStore(
        subscribeServicesTier,
        servicesTierSnapshot,
        servicesTierServerSnapshot,
    )

    if (tier === 'desktop') return <CharterServicesDesktop />
    if (tier === 'tablet') return <CharterServicesTablet />
    return <CharterServicesMobile />
}