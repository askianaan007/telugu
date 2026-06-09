'use client'

// src/components/sections/services/CharterServicesDesktop.tsx
// ────────────────────────────────────────────────────────────
// Desktop (1024px+): GSAP scroll-pin with stacked card reveal + bg parallax.
//
// FIXED: card-0 smoothness issues
// ────────────────────────────────
// Root causes (all four addressed):
//
// 1. Transform conflict: JSX style={{ rotate }} uses CSS `rotate` property;
//    GSAP uses `transform: rotate()`. They fought for ownership of the matrix.
//    Fix: removed rotate from JSX style entirely. GSAP owns all transforms.
//
// 2. Card 0 excluded from timeline: only cards 1..N were in tl.to(), so
//    ScrollTrigger.refresh() couldn't reposition card 0 correctly.
//    Fix: card 0 is now a zero-travel tl.to() entry at t=0, giving GSAP full
//    ownership and making invalidateOnRefresh work for it too.
//
// 3. RAF race in revealStack: double-RAF + ScrollTrigger.refresh() inside
//    revealStack could run before layout was settled, snapping card 0.
//    Fix: revealStack no longer calls ScrollTrigger.refresh() itself.
//    Refresh is called once, after all positions are set, on a single rAF.
//
// 4. invalidateOnRefresh gap: card 0 had no timeline entry, so it never
//    got the invalidateOnRefresh recalculation benefit.
//    Fix: resolved by including card 0 in the timeline (see point 2).

import { motion as m } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { CHARTER_SERVICES } from '@/data/services'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'
import {
    CharterServiceCard,
    charterCardRotationDeg,
    charterCardTiltClass,
    charterStackBgTravelPx,
    charterStackFinalY,
    charterStackHiddenStartY,
    measureCharterStackContext,
    SERVICES_BADGE_TEXT,
    SERVICES_BODY,
    SERVICES_HEADLINE,
} from './servicesShared'

export function CharterServicesDesktop() {
    const reduceMotion = usePrefersReducedMotion()
    const scopeRef = useRef<HTMLDivElement>(null)
    const pinRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            const root = scopeRef.current
            const pinRoot = pinRef.current
            if (!root || !pinRoot || reduceMotion) return

            const bgFigure = root.querySelector<HTMLElement>('[data-charter-bg-figure]')
            const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
            if (mqReduce.matches) return

            const stage = pinRoot.querySelector<HTMLElement>('[data-charter-stack-stage]')
            const cards = pinRoot.querySelectorAll<HTMLElement>('[data-charter-stack-card]')
            if (!stage || !cards.length) return

            const n = cards.length
            let stackMetrics = measureCharterStackContext(stage, cards)
            let bgTravel = charterStackBgTravelPx(n, stackMetrics)

            const applyStackMetrics = () => {
                stackMetrics = measureCharterStackContext(stage, cards)
                bgTravel = charterStackBgTravelPx(n, stackMetrics)
                root.style.setProperty('--charter-stack-bg-travel', `${bgTravel}px`)
                return stackMetrics
            }

            applyStackMetrics()
            stage.removeAttribute('data-ready')
            gsap.set(stage, { autoAlpha: 0 })

            // ── FIX 1: clear CSS rotate before GSAP takes ownership ──────────
            // The JSX rendered rotate via style.rotate (CSS individual property).
            // We clear it here so GSAP's transform matrix is the sole owner.
            cards.forEach((card) => {
                card.style.rotate = ''
            })

            const setCardPositions = (metrics: typeof stackMetrics) => {
                cards.forEach((card, i) => {
                    gsap.set(card, {
                        xPercent: -50,
                        yPercent: -50,
                        x: 0,
                        // ── FIX 2: card 0 starts at its final position ────────
                        // charterStackHiddenStartY(0) already returns charterStackFinalY(0),
                        // so this is unchanged behaviour — but now GSAP fully owns it.
                        y: charterStackHiddenStartY(i, metrics),
                        // ── FIX 1 cont: rotation set via GSAP, not CSS ─────────
                        rotation: charterCardRotationDeg(i),
                        zIndex: 10 + i,
                        force3D: true,
                    })
                })
            }

            setCardPositions(stackMetrics)

            const scrollPct = 260 + Math.max(0, n - 1)

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: root,
                    start: 'top top',
                    end: `+=${scrollPct}%`,
                    pin: root,
                    pinSpacing: true,
                    anticipatePin: 1,
                    scrub: 0.88,
                    invalidateOnRefresh: true,
                },
            })

            if (bgFigure) {
                gsap.set(bgFigure, {
                    transformOrigin: '50% 52%',
                    force3D: true,
                    y: bgTravel * 0.1,
                    scale: 1,
                })
            }

            const INITIAL_HOLD = 0.14
            const segment = (0.9 - INITIAL_HOLD) / Math.max(1, n - 1)

            // ── FIX 2: include card 0 in the timeline ─────────────────────────
            // A zero-travel tl.to() at t=0 gives GSAP full ownership of card 0's
            // transform, so invalidateOnRefresh recalculates it correctly and
            // ScrollTrigger.refresh() repositions it the same way it does cards 1..N.
            tl.to(
                cards[0],
                {
                    y: () => charterStackFinalY(0),   // same as start — zero travel
                    duration: INITIAL_HOLD,
                    ease: 'none',
                    immediateRender: false,
                },
                0,
            )

            for (let i = 1; i < n; i++) {
                const startT = INITIAL_HOLD + (i - 1) * segment
                const progress = i / (n - 1)
                const bgY = gsap.utils.interpolate(
                    bgTravel * 0.15,
                    -bgTravel * 0.05,
                    progress
                )
                const bgScale = gsap.utils.interpolate(1, 1.055, progress)

                tl.to(
                    cards[i],
                    {
                        y: () => charterStackFinalY(i),
                        duration: segment * 0.95,
                        ease: 'none',
                        immediateRender: false,
                    },
                    startT,
                )

                if (bgFigure) {
                    tl.to(
                        bgFigure,
                        {
                            y: bgY,
                            scale: bgScale,
                            duration: segment * 0.95,
                            ease: 'none',
                            immediateRender: false,
                        },
                        startT,
                    )
                }
            }

            if (bgFigure && n === 1) {
                tl.to(bgFigure, { y: 0, scale: 1.03, duration: 0.35, ease: 'none' }, 0)
            }

            // ── FIX 3: revealStack no longer calls ScrollTrigger.refresh() ────
            // Previously: revealStack called both setCardPositions AND
            // ScrollTrigger.refresh(), which could cause card 0 to snap if layout
            // wasn't settled yet. Now revealStack only makes the stage visible.
            // A single coordinated refresh happens after all positions are stable.
            const revealStack = () => {
                const metrics = applyStackMetrics()
                setCardPositions(metrics)
                gsap.set(stage, { autoAlpha: 1 })
                stage.setAttribute('data-ready', '')
            }

            const refreshLayout = () => {
                const progress = tl.scrollTrigger?.progress ?? 0
                if (progress <= 0.001) {
                    setCardPositions(applyStackMetrics())
                } else {
                    applyStackMetrics()
                }
                ScrollTrigger.refresh()
            }

            window.addEventListener('resize', refreshLayout)

            // ── FIX 3 cont: single coordinated reveal + refresh ───────────────
            // Old: double-RAF → revealStack() → ScrollTrigger.refresh() inside it.
            // New: single RAF → setPositions → reveal → ScrollTrigger.refresh()
            // in the correct order, after one paint has occurred.
            const bgImg = bgFigure?.querySelector('img')
            const doReveal = () => {
                revealStack()
                // Refresh after reveal so ScrollTrigger recalculates with visible
                // layout. Card 0 is now in the timeline so it benefits too.
                ScrollTrigger.refresh()
            }

            if (bgImg instanceof HTMLImageElement && !bgImg.complete) {
                bgImg.addEventListener('load', () => requestAnimationFrame(doReveal), { once: true })
            } else {
                requestAnimationFrame(doReveal)
            }

            return () => {
                window.removeEventListener('resize', refreshLayout)
                root.style.removeProperty('--charter-stack-bg-travel')
                stage.removeAttribute('data-ready')
                gsap.set(stage, { clearProps: 'opacity,visibility' })
                // ── FIX 1 cont: clear all GSAP-owned transform props ──────────
                gsap.set(cards, { clearProps: 'transform,x,y,xPercent,yPercent,rotation,zIndex' })
                if (bgFigure) gsap.set(bgFigure, { clearProps: 'transform' })
                tl.scrollTrigger?.kill()
                tl.kill()
            }
        },
        { scope: scopeRef, dependencies: [reduceMotion] },
    )

    return (
        <Section
            id="services"
            paddingY="none"
            variant="default"
            className="overflow-visible! bg-transparent! p-0!"
        >
            <div ref={scopeRef} className="relative isolate min-h-svh w-full overflow-visible">
                {/* Background figure */}
                <div
                    aria-hidden
                    className="bg-brand-surface pointer-events-none absolute inset-0 z-0 min-h-svh overflow-hidden"
                >
                    <div
                        data-charter-bg-figure
                        className={cn(
                            'absolute inset-0 w-full origin-[50%_52%] will-change-transform',
                            'h-[110%]'
                        )}
                    >
                        <div
                            className={cn(
                                'absolute inset-0 left-1/2 w-screen max-w-none -translate-x-1/2',
                                'h-[110%]'
                            )}
                        >
                            <Image
                                src="/images/charter-services-bg.png"
                                alt=""
                                fill
                                priority
                                className="absolute inset-0 left-1/2 w-screen h-full max-w-none"
                            />
                            <div
                                aria-hidden
                                className="from-brand-surface via-brand-surface/72 pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b to-transparent"
                            />
                        </div>
                    </div>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 min-h-svh bg-linear-to-b from-transparent via-white/10 to-transparent"
                    />
                </div>

                {/* Pin root */}
                <div
                    ref={pinRef}
                    data-charter-pin-root
                    className={cn(
                        'relative z-10 flex w-full flex-col',
                        'pt-[max(3rem,calc(72px+env(safe-area-inset-top)))] pb-20',
                        'xl:justify-between xl:pt-[max(3.25rem,calc(76px+env(safe-area-inset-top)))] xl:pb-0',
                        '2xl:pb-16',
                        'min-h-svh',
                    )}
                >
                    <Container className="max-w-base relative z-10">
                        <m.div
                            variants={staggerContainer(0.12, 0.08)}
                            initial={reduceMotion ? false : 'hidden'}
                            whileInView={reduceMotion ? undefined : 'visible'}
                            viewport={{ once: true, amount: 0.42, margin: '0px 0px -12% 0px' }}
                            className={cn(
                                'grid gap-10 mb-36 lg:grid-cols-[minmax(0,1fr)_minmax(0,27.0625rem)] lg:items-end lg:gap-x-16 xl:gap-x-20',
                                'lg:-mt-12 lg:gap-8 xl:mt-10 xl:gap-x-20 2xl:-mt-8',
                            )}
                        >
                            <div className="flex max-w-3xl flex-col gap-3 lg:max-w-none">
                                <m.div variants={fadeInUp} className="flex flex-col gap-2.5">
                                    <span className="text-brand-black inline-flex items-center gap-2">
                                        <Image
                                            src="/images/black-asterisk.svg"
                                            width={14} height={14} alt=""
                                            className="h-3.5 w-3.5 shrink-0" aria-hidden
                                        />
                                        <span className="[font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase">
                                            {SERVICES_BADGE_TEXT}
                                        </span>
                                    </span>
                                    <Image
                                        src="/images/header-line-transparent-left-new.svg"
                                        width={364} height={8} alt=""
                                        className="h-auto w-full max-w-70 shrink-0" aria-hidden
                                    />
                                </m.div>
                                <m.h2
                                    variants={fadeInUp}
                                    className={cn(
                                        'text-brand-black [font-family:var(--font-halant)] font-normal text-balance',
                                        'text-[clamp(2rem,4vw+1rem,3.25rem)] leading-[1.08] tracking-[-0.03em]',
                                        'sm:text-[clamp(2.25rem,3.2vw+1.25rem,3.5rem)]',
                                    )}
                                >
                                    {SERVICES_HEADLINE}
                                </m.h2>
                            </div>

                            <m.p
                                variants={fadeInUp}
                                className={cn(
                                    'text-brand-gray [font-family:var(--font-geist)] font-normal',
                                    'max-w-108.25 pb-8 text-[18px] leading-5.75 lg:justify-self-end',
                                )}
                            >
                                {SERVICES_BODY}
                            </m.p>
                        </m.div>
                    </Container>

                    {/* Stacked cards */}
                    <div className="relative z-10 w-full overflow-visible lg:-mt-10 xl:-mt-12 xl:shrink-0 2xl:-mt-14">
                        {reduceMotion ? (
                            /* Reduced-motion: static stack */
                            <div className="relative mx-auto max-w-[min(660px,calc(100vw-3rem))] pb-28 lg:-mt-20 xl:-mt-24 xl:max-w-182 2xl:-mt-28">
                                <div className="relative mx-auto min-h-[min(52vh,520px)] w-full">
                                    {CHARTER_SERVICES.map((service, i) => (
                                        <div
                                            key={service.id}
                                            className="absolute top-1/2 left-1/2 w-full max-w-[min(660px,calc(100vw-3rem))] xl:max-w-182"
                                            style={{
                                                transform: `translate(-50%, calc(-50% + ${charterStackFinalY(i)}px)) rotate(${charterCardRotationDeg(i)}deg)`,
                                                zIndex: 10 + i,
                                            }}
                                        >
                                            <CharterServiceCard service={service} stack />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Animated stack */
                            <div className="relative mx-auto min-h-[min(76svh,720px)] w-full max-w-[min(720px,calc(100vw-2rem))] overflow-visible lg:mt-10 lg:min-h-[min(76svh,460px)] xl:-mt-12.5 xl:min-h-[min(76svh,460px)] xl:max-w-182 2xl:mt-[-320px]">
                                <div
                                    data-charter-stack-stage
                                    className="invisible relative h-full min-h-[inherit] w-full overflow-visible pt-0 pb-2 opacity-0 data-ready:visible data-ready:opacity-100 lg:translate-y-2 xl:-translate-y-10"
                                >
                                    {CHARTER_SERVICES.map((service, i) => (
                                        <div
                                            key={service.id}
                                            data-charter-stack-card
                                            className="absolute top-1/2 left-1/2 w-full max-w-[min(660px,calc(100vw-3rem))] will-change-transform xl:max-w-182"
                                            // ── FIX 1: rotate removed from JSX style ──────────────
                                            // Previously: style={{ rotate: `${deg}deg`, zIndex }}
                                            // The CSS `rotate` individual property conflicted with
                                            // GSAP's transform matrix. GSAP now sets rotation
                                            // exclusively via gsap.set(card, { rotation: deg }).
                                            style={{ zIndex: 10 + i }}
                                        >
                                            <CharterServiceCard service={service} stack />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    )
}