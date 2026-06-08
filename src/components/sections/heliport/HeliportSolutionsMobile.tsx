'use client'

// src/components/sections/heliport/HeliportSolutionsMobile.tsx
// ─────────────────────────────────────────────────────────────
// Fixes applied (same set as Desktop):
//  1. Removed `min-h-[200vh]` → pb-[100vh] on grid creates scroll distance without
//     the upfront layout allocation cost.
//  2. Removed `backdrop-blur-sm` from sticky header → solid bg, no per-frame compositing.
//  3. Removed `scale` from GSAP reveal → pure translateY + opacity, no layout thrash.
//  4. `overflow-clip` instead of `overflow-visible` on section.
//  5. `contain: layout style` on grid container.

import { useMemo, useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { HELIPORT_SOLUTIONS } from '@/data/heliportSolutions'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'
import {
    HeliportGradientDecorators,
    HeliportSectionHeader,
    HeliportSolutionCard,
} from './heliportShared'

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

            const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-heliport-card]'))
            if (cards.length === 0) return

            // FIX: no scale — translateY + opacity only
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
                'pt-[140px]',
            )}
        >
            <Container className="max-w-base z-section-content relative">
                {/* FIX: no backdrop-blur-sm, solid bg only */}
                <div
                    className="bg-brand-navy/95 sticky top-[108px] z-10 pt-6 pb-8"
                    style={{ willChange: 'transform' }}
                >
                    <HeliportSectionHeader reduceMotion={reduceMotion} />
                </div>

                {/* FIX: contain + pb replaces min-h-[200vh] */}
                <div
                    ref={gridRef}
                    className="relative z-20 pb-24"
                    data-heliport-region="sm"
                    style={{ contain: 'layout style' }}
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