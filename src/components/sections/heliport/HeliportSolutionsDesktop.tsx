'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { heliportSolutionsByColumn } from '@/data/heliportSolutions'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'
import { HeliportGradientDecorators, HeliportSolutionCard } from './heliportShared'

export function HeliportSolutionsDesktop() {
    const sectionRef = useRef<HTMLElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const reduceMotion = usePrefersReducedMotion()

    useGSAP(
        () => {
            const root = gridRef.current
            if (!root || reduceMotion) return

            const cards = Array.from(
                root.querySelectorAll<HTMLElement>('[data-heliport-region="lg"] [data-heliport-card]'),
            )
            if (cards.length === 0) return

            // Set initial state for all cards at once — single GSAP call
            gsap.set(cards, { y: 48, scale: 0.96 })

            // One IntersectionObserver-based approach: batch reveals instead of
            // one ScrollTrigger per card (was creating N separate ST instances)
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return
                        const card = entry.target as HTMLElement
                        io.unobserve(card)

                        // Use a single short scrubbed tween per card triggered on first
                        // intersection — avoids N constantly-active ScrollTriggers during scroll
                        gsap.to(card, {
                            y: 0,
                            scale: 1,
                            duration: 0.65,
                            ease: 'power2.out',
                            overwrite: true,
                        })
                    })
                },
                // Trigger when card top is 88% down the viewport
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
                'pt-[180px]',
            )}
        >
            <Container className="max-w-base z-section-content relative">
                {/* Sticky header — plain header, no framer-motion (avoids LazyMotion conflict) */}
                <div className="bg-brand-navy/95 sticky top-[132px] z-10 pt-6 pb-80 backdrop-blur-sm">
                    <header className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 text-center sm:gap-5">
                        <div className="flex flex-col items-center gap-2.5">
                            <span className="text-brand-white inline-flex items-center gap-2">
                                <Image src="/images/gold-asterisk.svg" width={14} height={14} alt="" className="h-[14px] w-[14px] shrink-0" aria-hidden />
                                <span className="[font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase">
                                    Solution
                                </span>
                            </span>
                            <Image src="/images/header-line-transparent.svg" width={364} height={12} alt="" className="h-auto w-full max-w-[220px] shrink-0" aria-hidden />
                        </div>
                        <h2 className={cn(
                            'text-brand-white [font-family:var(--font-halant)] font-normal tracking-[-0.02em] text-balance uppercase',
                            'text-[clamp(1.75rem,3.5vw+1rem,2.75rem)] leading-[1.08] sm:text-[clamp(2rem,3vw+1.1rem,3.25rem)]',
                        )}>
                            <span className="block">Comprehensive</span>
                            <span className="block">Heliport Solutions</span>
                        </h2>
                        <p className="max-w-[711px] [font-family:var(--font-geist)] text-[16px] leading-relaxed font-normal text-white/80 sm:text-[18px]">
                            Telugu Airlines specializes in providing end-to-end heliport solutions,
                            encompassing everything from initial concept design to final execution
                            and certification processes.
                        </p>
                    </header>
                </div>

                {/* 3-column staggered grid — identical to original */}
                <div ref={gridRef} className="relative z-20 pb-32">
                    <div data-heliport-region="lg" className="mx-auto flex w-full flex-row justify-between">
                        <div className="flex w-[300px] shrink-0 flex-col gap-8 pt-0 lg:gap-60 xl:w-[326px]">
                            {heliportSolutionsByColumn(1).map((solution) => (
                                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
                            ))}
                        </div>
                        <div className="flex w-[300px] shrink-0 flex-col gap-8 pt-28 lg:gap-60 lg:pt-[500px] xl:w-[326px]">
                            {heliportSolutionsByColumn(2).map((solution) => (
                                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
                            ))}
                        </div>
                        <div className="flex w-[300px] shrink-0 flex-col gap-8 pt-14 lg:gap-60 lg:pt-[200px] xl:w-[326px]">
                            {heliportSolutionsByColumn(3).map((solution) => (
                                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
                            ))}
                        </div>
                    </div>
                </div>
            </Container>

            <HeliportGradientDecorators />
        </Section>
    )
}