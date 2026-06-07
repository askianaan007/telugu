'use client'

// src/components/sections/tagline/TaglineScrollMobile.tsx
// Mobile (< 640px): static layout — video autoplay, taglines above, copy below.
// No GSAP, no window references in render — SSR safe.

import { useEffect, useRef, useState } from 'react'
import { motion as m } from 'framer-motion'
import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const OVERLAY_COPY = 'Where silence, space, and simplicity come together beautifully.'

export function TaglineScrollMobile() {
    const [pillH, setPillH] = useState(165)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const update = () => {
            const vw = window.innerWidth
            const pillW = Math.min(280, Math.max(200, vw - 32))
            setPillH((pillW / 280) * 165)
        }
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    return (
        <section
            ref={containerRef}
            data-tagline-scroll
            aria-label="Less chaos, more clarity"
            className="bg-brand-surface relative w-full h-svh overflow-hidden"
        >
            {/* Taglines — above the pill */}
            <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                className="pointer-events-none absolute inset-x-0 z-30 flex flex-col items-center gap-1 px-4 text-center top-[calc(50%-11rem)]"
            >
                <span className="text-brand-charcoal [font-family:var(--font-halant)] text-[clamp(1.25rem,5.5vw,1.375rem)] leading-tight font-normal tracking-[-0.04em]">
                    Less chaos
                </span>
                <span className="text-brand-charcoal [font-family:var(--font-halant)] text-[clamp(1.25rem,5.5vw,1.375rem)] leading-tight font-normal tracking-[-0.04em]">
                    More Clarity
                </span>
            </m.div>

            {/* Video pill card — centered */}
            <m.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
                className="absolute inset-0 z-2 flex items-center justify-center"
            >
                <div
                    className="relative overflow-hidden rounded-[24px] border border-black/8 p-2 w-[min(280px,calc(100vw-2rem))]"
                    style={{ height: `${pillH}px` }}
                >
                    <div className={cn(
                        faqAccordionInnerClassName(),
                        'relative h-full min-h-0! w-full gap-0! overflow-hidden px-0! py-0!',
                        'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]',
                    )}>
                        <video
                            src="/images/tagline-strip.mp4"
                            autoPlay muted loop playsInline
                            disablePictureInPicture
                            aria-hidden
                            className="relative z-1 h-full w-full object-cover object-center bg-brand-surface"
                        />
                        {/* Bottom gradient */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[52%]"
                            style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.55) 55%, rgba(9,9,11,0.88) 100%)' }}
                        />
                    </div>
                </div>
            </m.div>

            {/* Copy overlay — bottom */}
            <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
                className="pointer-events-none absolute right-4 left-4 z-30 flex items-stretch gap-2.5 text-left bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))]"
            >
                <span aria-hidden className="w-0.5 shrink-0 self-stretch bg-white" />
                <p className="min-w-0 flex-1 text-left [font-family:var(--font-halant)] font-normal tracking-[-0.04em] text-[15px] leading-[21px] text-white">
                    {OVERLAY_COPY}
                </p>
            </m.div>
        </section>
    )
}