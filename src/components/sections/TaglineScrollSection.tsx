'use client'

// src/components/sections/TaglineScrollSection.tsx
// Router: mobile (< 640px) → static layout; sm+ → full GSAP scroll scrub.
// The full version handles all sm/md/lg/xl breakpoints internally.

import { useSyncExternalStore } from 'react'
import { TaglineScrollFull }   from './tagline/TaglineScrollFull'
import { TaglineScrollMobile } from './tagline/TaglineScrollMobile'

type TaglineTier = 'mobile' | 'full'

function getTaglineTier(): TaglineTier {
    return window.matchMedia('(min-width: 640px)').matches ? 'full' : 'mobile'
}

const taglineTierMq =
    typeof window !== 'undefined' ? [window.matchMedia('(min-width: 640px)')] : []

const subscribeTaglineTier = (cb: () => void) => {
    taglineTierMq.forEach((mq) => mq.addEventListener('change', cb))
    return () => taglineTierMq.forEach((mq) => mq.removeEventListener('change', cb))
}

const taglineTierSnapshot       = (): TaglineTier => typeof window !== 'undefined' ? getTaglineTier() : 'full'
const taglineTierServerSnapshot = (): TaglineTier => 'full'

export function TaglineScrollSection() {
    const tier = useSyncExternalStore(subscribeTaglineTier, taglineTierSnapshot, taglineTierServerSnapshot)
    return tier === 'full' ? <TaglineScrollFull /> : <TaglineScrollMobile />
}