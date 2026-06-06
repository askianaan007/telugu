'use client'

// src/components/sections/heliport/HeliportSolutionsMobile.tsx
// ─────────────────────────────────────────────────────────────
// Mobile (< 768px): single column cards, GSAP scrub reveal,
// sticky header pinned below navbar, bottom gradient decorators.

import { motion as m } from 'framer-motion'
import { useMemo, useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { HELIPORT_SOLUTIONS } from '@/data/heliportSolutions'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'
import {
    HeliportGradientDecorators,
    HeliportSolutionCard,
} from './heliportShared'
import Image from 'next/image'

export function HeliportSolutionsMobile() {
    const sectionRef = useRef<HTMLElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const reduceMotion = usePrefersReducedMotion()

    const orderedMobile = useMemo(
        () => [...HELIPORT_SOLUTIONS].sort((a, b) => a.index - b.index),
        [],
    )

    useGSAP(
        () => {
            const root = gridRef.current
            if (!root || reduceMotion) return

            const cards = root.querySelectorAll<HTMLElement>('[data-heliport-card]')

            const ctx = gsap.context(() => {
                cards.forEach((card) => {
                    gsap.fromTo(
                        card,
                        { y: 48, scale: 0.96 },
                        {
                            y: 0,
                            scale: 1,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 88%',
                                end: 'top 42%',
                                scrub: 0.75,
                                invalidateOnRefresh: true,
                            },
                        },
                    )
                })
            }, root)

            return () => ctx.revert()
        },
        { scope: sectionRef, dependencies: [reduceMotion] },
    )

    return (
        <Section
            ref={sectionRef}
            variant="default"
            paddingY="none"
            className={cn(
                'bg-brand-navy! text-brand-white overflow-visible rounded-t-[50px]',
                'min-h-[200vh]',
                'pt-[140px]',
            )}
        >
            <Container className="max-w-base z-section-content relative">
                {/* Sticky header */}
                <div className="bg-brand-navy/95 sticky top-[108px] z-10 pt-6 pb-8 backdrop-blur-sm">
                    <m.header
                        variants={staggerContainer(0.1, 0.06)}
                        initial={reduceMotion ? false : 'hidden'}
                        whileInView={reduceMotion ? undefined : 'visible'}
                        viewport={{ once: false, amount: 0.35, margin: '0px 0px -8% 0px' }}
                        className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 text-center sm:gap-5"
                    >
                        <m.div variants={fadeInUp} className="flex flex-col items-center gap-2.5">
                            <span className="text-brand-white inline-flex items-center gap-2">
                                <Image
                                    src="/images/gold-asterisk.svg"
                                    width={14} height={14} alt=""
                                    className="h-[14px] w-[14px] shrink-0" aria-hidden
                                />
                                <span className="[font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase">
                                    Solution
                                </span>
                            </span>
                            <Image
                                src="/images/header-line-transparent.svg"
                                width={364} height={12} alt=""
                                className="h-auto w-full max-w-[180px] shrink-0" aria-hidden
                            />
                        </m.div>
                        <m.h2
                            variants={fadeInUp}
                            className={cn(
                                'text-brand-white [font-family:var(--font-halant)] font-normal tracking-[-0.02em] text-balance uppercase',
                                'text-[clamp(1.6rem,7vw,2.25rem)] leading-[1.08]',
                            )}
                        >
                            <span className="block">Comprehensive</span>
                            <span className="block">Heliport Solutions</span>
                        </m.h2>
                        <m.p
                            variants={fadeInUp}
                            className="max-w-[90vw] [font-family:var(--font-geist)] text-[14px] leading-relaxed font-normal text-white/80"
                        >
                            Telugu Airlines specializes in providing end-to-end heliport solutions,
                            encompassing everything from initial concept design to final execution
                            and certification processes.
                        </m.p>
                    </m.header>
                </div>

                {/* Single column cards */}
                <div
                    ref={gridRef}
                    className="relative z-20 pb-24"
                    data-heliport-region="sm"
                >
                    <div className="flex flex-col items-center gap-6 pt-8">
                        {orderedMobile.map((solution) => (
                            <HeliportSolutionCard
                                key={solution.index}
                                solution={solution}
                                enableScrollReveal
                            />
                        ))}
                    </div>
                </div>
            </Container>

            <HeliportGradientDecorators />
        </Section>
    )
}