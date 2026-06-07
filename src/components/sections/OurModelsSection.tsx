'use client'

import { useSyncExternalStore } from 'react'
import { OurModelsDesktop } from './model/OurModelsDesktop'
import { OurModelsTablet } from './model/OurModelsTablet'
import { OurModelsMobile } from './model/OurModelsMobile'

type ModelsTier = 'mobile' | 'tablet' | 'desktop'

function getModelsTier(): ModelsTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
    return 'mobile'
}

const modelsTierMqs =
    typeof window !== 'undefined'
        ? [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')]
        : []

const subscribeModelsTier = (cb: () => void) => {
    modelsTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => modelsTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const modelsTierSnapshot = (): ModelsTier => typeof window !== 'undefined' ? getModelsTier() : 'desktop'
const modelsTierServerSnapshot = (): ModelsTier => 'desktop'

export function OurModelsSection() {
    const tier = useSyncExternalStore(subscribeModelsTier, modelsTierSnapshot, modelsTierServerSnapshot)
    if (tier === 'desktop') return <OurModelsDesktop />
    if (tier === 'tablet') return <OurModelsTablet />
    return <OurModelsMobile />
}