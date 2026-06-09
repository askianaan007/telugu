'use client'

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

            gsap.set(cards, { y: 40, opacity: 0, willChange: 'transform, opacity' })

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
                            onComplete: () => gsap.set(card, { willChange: 'auto' }),
                        })
                    })
                },
                { rootMargin: '0px 0px -12% 0px', threshold: 0 },
            )

            cards.forEach((card) => io.observe(card))

            return () => {
                io.disconnect()
                gsap.set(cards, { clearProps: 'y,opacity,willChange' })
            }
        },
        { scope: sectionRef, dependencies: [reduceMotion] },
    )

    return (
        <Section
            ref={sectionRef}
            variant="default"
            paddingY="none"
            // overflow-clip! overrides Section base's overflow-hidden.
            // overflow-hidden creates a scroll container → sticky scopes to a non-scrollable
            // ancestor → sticky header jitters. overflow-clip clips without scroll-container.
            className="bg-brand-navy overflow-clip! rounded-t-[50px]"
        >
            <Container className="max-w-base z-section-content relative">
                {/* will-change removed — see Desktop for rationale */}
                <div className="bg-brand-navy/95 sticky top-[108px] z-10 pt-6 pb-8">
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