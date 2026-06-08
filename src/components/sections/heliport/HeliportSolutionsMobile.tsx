'use client'

// src/components/sections/heliport/HeliportSolutionsMobile.tsx
// ─────────────────────────────────────────────────────────────
// Mobile (<768px): single column cards, GSAP reveal,
// sticky header pinned below navbar, bottom gradient decorators.

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

    // useMemo with stable empty-dep array — array is created once, never re-sorted
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

            // Set initial state in a single batch call
            gsap.set(cards, { y: 48, scale: 0.96 })

            // Single IntersectionObserver replaces N active ScrollTrigger scrub instances.
            // Each card animates in once when it enters the viewport — no per-frame
            // scrub computation on all visible cards simultaneously.
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
                'pt-[140px]',
            )}
        >
            <Container className="max-w-base z-section-content relative">
                {/* Sticky header */}
                <div className="bg-brand-navy/95 sticky top-[108px] z-10 pt-6 pb-8 backdrop-blur-sm">
                    <HeliportSectionHeader reduceMotion={reduceMotion} />
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