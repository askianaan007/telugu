'use client'

// src/components/sections/global/GlobalPresenceTablet.tsx
// ─────────────────────────────────────────────────────────
// Tablet (768px – 1023px): left copy + right cards side-by-side,
// cards fade in on scroll, no sticky pin, no spring parallax.

import { motion as m } from 'framer-motion'
import Image from 'next/image'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ActionButton } from '@/components/ui/ActionButton'
import { OFFICE_LOCATIONS } from '@/data/offices'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'
import { FLAG_STYLES, GlobalOfficeCard } from './globalPresenceShared'

const EASE = [0.22, 1, 0.36, 1] as const

export function GlobalPresenceTablet() {
    const reduceMotion = usePrefersReducedMotion()

    return (
        <Section
            id="global-presence"
            variant="default"
            paddingY="none"
            className="bg-brand-surface overflow-visible"
        >
            <div className="relative w-full">
                <div className="flex w-full flex-col pt-32 pb-24">
                    <Container className="max-w-base flex w-full flex-row items-start gap-10">
                        {/* Left copy — sticky while cards scroll */}
                        <m.aside
                            variants={staggerContainer(0.1, 0.06)}
                            initial={reduceMotion ? false : 'hidden'}
                            whileInView={reduceMotion ? undefined : 'visible'}
                            viewport={{ once: true, amount: 0.35 }}
                            className="sticky top-24 flex w-[42%] shrink-0 flex-col gap-5 self-start pt-2"
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
                                    className="h-auto w-full max-w-[300px] shrink-0" aria-hidden
                                />
                            </m.div>

                            <m.h2
                                variants={fadeInUp}
                                className="text-brand-black text-left [font-family:var(--font-halant)] text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance"
                            >
                                Our Global Presence
                            </m.h2>

                            <m.p
                                variants={fadeInUp}
                                className="text-brand-muted max-w-sm text-left [font-family:var(--font-geist)] text-[15px] leading-relaxed sm:text-base"
                            >
                                Telugu Airlines maintains a robust international footprint through
                                strategically located offices in major global cities.
                            </m.p>

                            <m.div variants={fadeInUp} className="mt-2 w-fit">
                                <ActionButton href="/#services" className="w-fit" />
                            </m.div>
                        </m.aside>

                        {/* Right cards */}
                        <div className="flex min-w-0 flex-1 flex-col gap-5 pb-16">
                            {OFFICE_LOCATIONS.map((office, i) => (
                                <m.div
                                    key={office.id}
                                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-8%' }}
                                    transition={{ duration: 0.55, ease: EASE, delay: i * 0.05 }}
                                >
                                    <GlobalOfficeCard office={office} />
                                </m.div>
                            ))}
                        </div>
                    </Container>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: FLAG_STYLES }} />
        </Section>
    )
}