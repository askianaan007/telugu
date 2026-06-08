'use client'

// src/components/sections/heliport/HeliportSolutionsTablet.tsx
// ─────────────────────────────────────────────────────────────
// Fixes applied (same set as Desktop + Mobile):
//  1. Removed `min-h-[200vh]` → scroll distance via padding on grid.
//  2. Removed `backdrop-blur-sm` from sticky header → solid bg.
//  3. Removed `scale` from GSAP reveals → translateY + opacity only.
//  4. `overflow-clip` instead of `overflow-visible`.
//  5. `contain: layout style` on grid container.

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

            // FIX: no scale
            gsap.set(cards, { y: 40, opacity: 0 })

            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return
                        const card = entry.target as HTMLElement
                        io.unobserve(card)
                        gsap.to(card, {
                            y: 0,
                            opacity: 1,
                            duration: 0.55,
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
                gsap.set(cards, { clearProps: 'y,opacity' })
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
                // FIX: overflow-clip, removed min-h-[200vh]
                'bg-brand-navy! text-brand-white overflow-clip rounded-t-[50px]',
                'pt-[160px]',
            )}
        >
            <Container className="max-w-base z-section-content relative">
                {/* FIX: no backdrop-blur-sm, solid bg */}
                <div
                    className="bg-brand-navy/95 sticky top-[120px] z-10 pt-6 pb-10"
                    style={{ willChange: 'transform' }}
                >
                    <HeliportSectionHeader reduceMotion={reduceMotion} />
                </div>

                {/* FIX: contain + pb-[100vh] replaces min-h-[200vh] */}
                <div
                    ref={gridRef}
                    className="relative z-20 pb-[100vh]"
                    data-heliport-region="md"
                    style={{ contain: 'layout style' }}
                >
                    <div className="mx-auto flex w-full flex-row justify-between pt-10">
                        <div className="flex w-[calc(50%-0.75rem)] max-w-[340px] shrink-0 flex-col gap-8">
                            {heliportSolutionsByMdColumn(1).map((solution) => (
                                <HeliportSolutionCard
                                    key={solution.index}
                                    solution={solution}
                                    enableScrollReveal
                                />
                            ))}
                        </div>
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