'use client'

// src/components/sections/heliport/HeliportSolutionsTablet.tsx
// ─────────────────────────────────────────────────────────────
// Tablet (768px – 1023px): 2-column staggered layout, GSAP reveal,
// sticky header, bottom gradient decorators.

import { useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { heliportSolutionsByMdColumn } from '@/data/heliportSolutions'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'
import {
    HeliportGradientDecorators,
    HeliportSectionHeader,
    HeliportSolutionCard,
} from './heliportShared'

export function HeliportSolutionsTablet() {
    const sectionRef = useRef<HTMLElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const reduceMotion = usePrefersReducedMotion()

    useGSAP(
        () => {
            const root = gridRef.current
            if (!root || reduceMotion) return

            const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-heliport-card]'))
            if (cards.length === 0) return

            // Single batch set — one GSAP call for all cards
            gsap.set(cards, { y: 48, scale: 0.96 })

            // One IntersectionObserver replaces N active ScrollTrigger scrub instances.
            // Fires a one-shot animation per card on first intersection — zero per-frame
            // scrub work during scroll.
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return
                        const card = entry.target as HTMLElement
                        io.unobserve(card)
                        gsap.to(card, {
                            y: 0,
                            scale: 1,
                            duration: 0.65,
                            ease: 'power2.out',
                            overwrite: true,
                        })
                    })
                },
                { rootMargin: '0px 0px -12% 0px', threshold: 0 },
            )

            cards.forEach((card) => io.observe(card))

            return () => {
                io.disconnect()
                gsap.set(cards, { clearProps: 'y,scale' })
            }
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
                'pt-[160px]',
            )}
        >
            <Container className="max-w-base z-section-content relative">
                {/* Sticky header */}
                <div className="bg-brand-navy/95 sticky top-[120px] z-10 pt-6 pb-10 backdrop-blur-sm">
                    <HeliportSectionHeader reduceMotion={reduceMotion} />
                </div>

                {/* 2-column staggered grid */}
                <div
                    ref={gridRef}
                    className="relative z-20 pb-28"
                    data-heliport-region="md"
                >
                    <div className="mx-auto flex w-full flex-row justify-between pt-10">
                        {/* Col 1 — left, no top offset */}
                        <div className="flex w-[calc(50%-0.75rem)] max-w-[340px] shrink-0 flex-col gap-8">
                            {heliportSolutionsByMdColumn(1).map((solution) => (
                                <HeliportSolutionCard
                                    key={solution.index}
                                    solution={solution}
                                    enableScrollReveal
                                />
                            ))}
                        </div>
                        {/* Col 2 — right, offset down */}
                        <div className="flex w-[calc(50%-0.75rem)] max-w-[340px] shrink-0 flex-col gap-8 pt-32 md:gap-32 md:pt-60">
                            {heliportSolutionsByMdColumn(2).map((solution) => (
                                <HeliportSolutionCard
                                    key={solution.index}
                                    solution={solution}
                                    enableScrollReveal
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Container>

            <HeliportGradientDecorators />
        </Section>
    )
}