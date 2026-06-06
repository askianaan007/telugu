'use client'

// src/components/sections/global/GlobalPresenceDesktop.tsx
// ──────────────────────────────────────────────────────────
// Desktop (1024px+): IDENTICAL to original GlobalPresenceSection.
// Sticky left panel + scroll-track with spring-smoothed card Y parallax.

import { motion as m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ActionButton } from '@/components/ui/ActionButton'
import { OFFICE_LOCATIONS } from '@/data/offices'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'
import { FLAG_STYLES, GlobalOfficeCard } from './globalPresenceShared'

export function GlobalPresenceDesktop() {
    const scrollTrackRef = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()

    const { scrollYProgress } = useScroll({
        target: scrollTrackRef,
        offset: ['start start', 'end end'],
    })

    const rawCardsY = useTransform(scrollYProgress, [0, 1], ['4%', '-56%'])
    const cardsY = useSpring(rawCardsY, { stiffness: 90, damping: 18, mass: 0.6 })

    return (
        <Section
            id="global-presence"
            variant="default"
            paddingY="none"
            className="bg-brand-surface overflow-visible"
        >
            {/* Scroll driver: ~2× viewport */}
            <div ref={scrollTrackRef} className="relative w-full lg:min-h-[200vh]">
                {/* Sticky shell */}
                <div
                    className={cn(
                        'flex w-full flex-col pt-16 pb-4 sm:pt-32 sm:pb-24 md:pb-28 xl:pb-0',
                        'lg:sticky lg:top-0 lg:flex lg:h-dvh lg:max-h-dvh lg:min-h-0 lg:overflow-hidden lg:pt-28 lg:pb-40 xl:pb-0',
                    )}
                >
                    <Container className="max-w-base flex min-h-0 w-full flex-1 flex-col gap-12 lg:flex-row lg:items-start lg:gap-[90px]">
                        {/* Left: ~40% */}
                        <m.aside
                            variants={staggerContainer(0.1, 0.06)}
                            initial={reduceMotion ? false : 'hidden'}
                            whileInView={reduceMotion ? undefined : 'visible'}
                            viewport={{ once: false, amount: 0.35, margin: '0px 0px -8% 0px' }}
                            className="flex w-full shrink-0 flex-col gap-5 lg:w-[40%] lg:max-w-[min(100%,480px)] lg:self-start lg:pt-2"
                        >
                            <m.div variants={fadeInUp} className="flex flex-col items-start gap-2.5">
                                <span className="text-brand-black inline-flex items-center gap-2">
                                    <Image
                                        src="/images/black-asterisk.svg"
                                        width={14} height={14} alt=""
                                        className="h-[14px] w-[14px] shrink-0" aria-hidden
                                    />
                                    <span className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.2em] uppercase">
                                        Global Presence
                                    </span>
                                </span>
                                <Image
                                    src="/images/header-line-transparent-left.svg"
                                    width={364} height={12} alt=""
                                    className="h-auto w-full max-w-[364px] shrink-0" aria-hidden
                                />
                            </m.div>

                            <m.h2
                                variants={fadeInUp}
                                className="text-brand-black text-left [font-family:var(--font-halant)] text-[clamp(2rem,3vw+1.25rem,3.25rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance"
                            >
                                Our Global Presence
                            </m.h2>

                            <m.p
                                variants={fadeInUp}
                                className="text-brand-muted max-w-xl text-left [font-family:var(--font-geist)] text-base leading-relaxed sm:text-lg"
                            >
                                Telugu Airlines maintains a robust international footprint through
                                strategically located offices in major global cities.
                            </m.p>

                            <m.div variants={fadeInUp} className="mt-2 w-fit">
                                <ActionButton href="/#services" className="w-fit" />
                            </m.div>
                        </m.aside>

                        {/* Right: ~60% — spring-driven Y on desktop */}
                        <div className="relative w-full min-w-0 flex-1 sm:pb-4 md:pb-6 lg:min-h-0 lg:pb-24 xl:pb-4">
                            <m.div
                                className={cn(
                                    'flex w-full flex-col gap-5 sm:gap-6 md:gap-7',
                                    'pb-12 sm:pb-16 md:pb-20',
                                    'lg:gap-[26px] lg:pb-48 lg:will-change-transform xl:pb-56',
                                )}
                                style={reduceMotion ? undefined : { y: cardsY }}
                            >
                                {OFFICE_LOCATIONS.map((office) => (
                                    <GlobalOfficeCard key={office.id} office={office} />
                                ))}
                            </m.div>
                        </div>
                    </Container>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: FLAG_STYLES }} />
        </Section>
    )
}