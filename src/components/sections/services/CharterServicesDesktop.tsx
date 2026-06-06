'use client'

// src/components/sections/services/CharterServicesDesktop.tsx
// ────────────────────────────────────────────────────────────
// Desktop (1024px+): GSAP scroll-pin with stacked card reveal + bg parallax.
// Logic is IDENTICAL to the original CharterServicesSection lg branch.

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

            const setCardPositions = (metrics: typeof stackMetrics) => {
                cards.forEach((card, i) => {
                    gsap.set(card, {
                        xPercent: -50,
                        yPercent: -50,
                        x: 0,
                        y: charterStackHiddenStartY(i, metrics),
                        rotation: charterCardRotationDeg(i),
                        zIndex: 10 + i,
                        force3D: true,
                    })
                })
            }

            setCardPositions(stackMetrics)

            const scrollPct = 260 + Math.max(0, n - 1) * 34

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
                    y: bgTravel * 0.25,
                    scale: 1,
                })
            }

            const INITIAL_HOLD = 0.14
            const segment = (0.9 - INITIAL_HOLD) / Math.max(1, n - 1)

            for (let i = 1; i < n; i++) {
                const startT = INITIAL_HOLD + (i - 1) * segment
                const progress = i / (n - 1)
                const bgY = gsap.utils.interpolate(bgTravel * 0.52, -bgTravel * 0.24, progress)
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

            const revealStack = () => {
                const metrics = applyStackMetrics()
                setCardPositions(metrics)
                ScrollTrigger.refresh(true)
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
                ScrollTrigger.refresh(true)
            }

            window.addEventListener('resize', refreshLayout)
            const bgImg = bgFigure?.querySelector('img')
            if (bgImg instanceof HTMLImageElement && !bgImg.complete) {
                bgImg.addEventListener('load', revealStack, { once: true })
            }
            requestAnimationFrame(() => requestAnimationFrame(revealStack))

            return () => {
                window.removeEventListener('resize', refreshLayout)
                root.style.removeProperty('--charter-stack-bg-travel')
                stage.removeAttribute('data-ready')
                gsap.set(stage, { clearProps: 'opacity,visibility' })
                gsap.set(cards, { clearProps: 'transform,zIndex' })
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
                                className={cn(
                                    'size-full min-w-full object-contain object-[center_5%]',
                                    'min-h-svh lg:min-h-[calc(100svh+var(--charter-stack-bg-travel,0))]',
                                )}
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
                            <div className="relative mx-auto min-h-[min(76svh,720px)] w-full max-w-[min(720px,calc(100vw-2rem))] overflow-visible lg:-mt-20 lg:min-h-[min(76svh,460px)] xl:-mt-24 xl:min-h-[min(76svh,460px)] xl:max-w-182 2xl:-mt-28">
                                <div
                                    data-charter-stack-stage
                                    className="invisible relative h-full min-h-[inherit] w-full overflow-visible pt-0 pb-2 opacity-0 data-ready:visible data-ready:opacity-100 lg:translate-y-2 xl:-translate-y-10"
                                >
                                    {CHARTER_SERVICES.map((service, i) => (
                                        <div
                                            key={service.id}
                                            data-charter-stack-card
                                            className="absolute top-1/2 left-1/2 w-full max-w-[min(660px,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 will-change-transform xl:max-w-182"
                                            style={{
                                                rotate: `${charterCardRotationDeg(i)}deg`,
                                                zIndex: 10 + i,
                                            }}
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