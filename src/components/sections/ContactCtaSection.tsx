'use client'

import { useSyncExternalStore } from 'react'
import { ContactDesktop } from '@/components/sections/contact/ContactDesktop'
import { ContactTablet }  from '@/components/sections/contact/ContactTablet'
import { ContactMobile }  from '@/components/sections/contact/ContactMobile'

type ContactTier = 'mobile' | 'tablet' | 'desktop'

function getContactTier(): ContactTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches)  return 'tablet'
    return 'mobile'
}

const contactTierMqs =
    typeof window !== 'undefined'
        ? [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')]
        : []

const subscribeContactTier = (cb: () => void) => {
    contactTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => contactTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const contactTierSnapshot       = (): ContactTier => typeof window !== 'undefined' ? getContactTier() : 'desktop'
const contactTierServerSnapshot = (): ContactTier => 'desktop'

export function ContactCtaSection() {
    const tier = useSyncExternalStore(subscribeContactTier, contactTierSnapshot, contactTierServerSnapshot)
    if (tier === 'desktop') return <ContactDesktop />
    if (tier === 'tablet')  return <ContactTablet  />
    return                         <ContactMobile  />
}