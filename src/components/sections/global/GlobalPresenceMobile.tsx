'use client'

// src/components/sections/global/GlobalPresenceMobile.tsx
// ─────────────────────────────────────────────────────────
// Mobile (< 768px): stacked cards with simple whileInView fade,
// left panel copy above, no scroll-driven parallax.

import { motion as m } from 'framer-motion'
import Image from 'next/image'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ActionButton } from '@/components/ui/ActionButton'
import { OFFICE_LOCATIONS } from '@/data/offices'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'
import { GlobalOfficeCard } from './globalPresenceShared'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
} satisfies import('framer-motion').Variants

export function GlobalPresenceMobile() {
    const reduceMotion = usePrefersReducedMotion()

    return (
        <Section
            id="global-presence"
            variant="default"
            paddingY="none"
            className="bg-brand-surface overflow-visible"
        >
            <div className="relative w-full">
                <div className="flex w-full flex-col pt-16 pb-4">
                    <Container className="max-w-base flex w-full flex-col gap-8">
                        {/* Copy panel */}
                        <m.aside
                            variants={staggerContainer(0.1, 0.06)}
                            initial={reduceMotion ? false : 'hidden'}
                            whileInView={reduceMotion ? undefined : 'visible'}
                            viewport={{ once: true, amount: 0.3 }}
                            className="flex w-full flex-col gap-5"
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
                                    className="h-auto w-full max-w-[260px] shrink-0" aria-hidden
                                />
                            </m.div>

                            <m.h2
                                variants={fadeInUp}
                                className="text-brand-black text-left [font-family:var(--font-halant)] text-[clamp(2rem,8vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance"
                            >
                                Our Global Presence
                            </m.h2>

                            <m.p
                                variants={fadeInUp}
                                className="text-brand-muted max-w-xl text-left [font-family:var(--font-geist)] text-[15px] leading-relaxed"
                            >
                                Telugu Airlines maintains a robust international footprint through
                                strategically located offices in major global cities.
                            </m.p>

                            <m.div variants={fadeInUp} className="mt-1 w-fit">
                                <ActionButton href="/#services" className="w-fit" />
                            </m.div>
                        </m.aside>

                        {/* Cards — stacked, simple fade-in per card */}
                        <div className="flex flex-col gap-5 pb-12">
                            {OFFICE_LOCATIONS.map((office, i) => (
                                <m.div
                                    key={office.id}
                                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-8%' }}
                                    transition={{ duration: 0.55, ease: EASE, delay: i * 0.06 }}
                                >
                                    <GlobalOfficeCard office={office} />
                                </m.div>
                            ))}
                        </div>
                    </Container>
                </div>
            </div>
        </Section>
    )
}