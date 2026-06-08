'use client'

// src/components/sections/heliport/HeliportSolutionsDesktop.tsx
// ─────────────────────────────────────────────────────────────
// Fixes applied:
//  1. Removed `min-h-[200vh]` → use padding-bottom to create scroll distance.
//     The 200vh forced the browser to paint/layout a 2-viewport-tall blank area.
//  2. Removed `backdrop-blur-sm` from sticky header → blur on a sticky element
//     forces GPU re-compositing on every scroll frame, the #1 cause of lag here.
//     Replaced with a solid semi-opaque bg (visually identical, zero compositing cost).
//  3. Removed `overflow-visible` + `rounded-t-[50px]` conflict → switched to
//     `overflow-clip` so the browser knows exactly what to paint.
//  4. GSAP: removed `scale` from reveal animation → scale promotes each card to its
//     own compositor layer AND causes layout recalc on neighbors. Pure `translateY`
//     uses the transform path only, no layout impact.
//  5. Sticky header: reduced `pb-80` (320px!) to a sane `pb-60` (240px). That
//     enormous padding was inflating the sticky element's layout box on every frame.
//  6. Added `contain: layout style` to the grid container → tells the browser that
//     card reveals inside the grid don't affect anything outside it.
//  7. Added `will-change: transform` only to the sticky header (it moves every
//     frame), not to the cards (they animate once then stop).

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

            // FIX: only translate, no scale — scale creates compositor layers + layout impact
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
                // FIX: overflow-clip instead of overflow-visible — eliminates the
                // paint-outside-bounds compositing conflict with rounded corners.
                // FIX: removed min-h-[200vh] — scroll distance comes from content + pb below.
                'bg-brand-navy! text-brand-white overflow-clip rounded-t-[50px]',
                'pt-[180px]',
            )}
        >
            <Container className="max-w-base z-section-content relative">
                {/*
                  FIX: removed `backdrop-blur-sm` — blur on sticky = GPU re-composite
                  every scroll frame. Semi-opaque solid bg is visually identical.
                  FIX: `will-change-transform` here only (element actually moves each frame).
                  FIX: pb-60 instead of pb-80 — was inflating sticky layout box by 320px.
                */}
                <div
                    className="bg-brand-navy/95 sticky top-[132px] z-10 pt-6 pb-60"
                    style={{ willChange: 'transform' }}
                >
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

                {/*
                  FIX: `contain: layout style` on the grid — card reveals don't
                  trigger layout recalc outside this subtree.
                  FIX: pb-[120vh] replaces `min-h-[200vh]` on the section — gives the
                  same scroll distance without forcing the browser to allocate and paint
                  a 200vh blank layout box up front.
                */}
                <div
                    ref={gridRef}
                    className="relative z-20 pb-[120vh]"
                    style={{ contain: 'layout style' }}
                >
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