'use client'

// src/components/sections/services/CharterServicesMobile.tsx
// ───────────────────────────────────────────────────────────
// Mobile (< 768px): vertical stack of cards with simple scroll-triggered
// fade-in via GSAP. No pin, no parallax bg — performant on small screens.

import { motion as m } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { CHARTER_SERVICES } from '@/data/services'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'
import {
    CharterServiceCard,
    charterCardTiltClass,
    charterMobileRevealFrom,
    SERVICES_BADGE_TEXT,
    SERVICES_BODY,
    SERVICES_HEADLINE,
} from './servicesShared'

export function CharterServicesMobile() {
    const reduceMotion = usePrefersReducedMotion()
    const scopeRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            const root = scopeRef.current
            if (!root || reduceMotion) return

            const bgFigure = root.querySelector<HTMLElement>('[data-charter-bg-figure]')
            const mobileCards = root.querySelectorAll<HTMLElement>('[data-charter-mobile-card]')
            const tweens: gsap.core.Tween[] = []

            gsap.set(mobileCards, charterMobileRevealFrom)

            mobileCards.forEach((card) => {
                tweens.push(
                    gsap.to(card, {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        duration: 0.72,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 78%',
                            toggleActions: 'play none none none',
                            invalidateOnRefresh: true,
                        },
                    }),
                )
            })

            if (bgFigure) {
                gsap.set(bgFigure, { transformOrigin: '50% 22%', force3D: true })
                tweens.push(
                    gsap.fromTo(
                        bgFigure,
                        { y: 20, scale: 1 },
                        {
                            y: -44,
                            scale: 1.045,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: root,
                                start: 'top bottom',
                                end: 'bottom top',
                                scrub: 1.05,
                                invalidateOnRefresh: true,
                            },
                        },
                    ),
                )
            }

            return () => {
                tweens.forEach((t) => t.kill())
                gsap.set(mobileCards, { clearProps: 'opacity,visibility,transform,filter' })
                if (bgFigure) gsap.set(bgFigure, { clearProps: 'transform' })
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
                <div
                    aria-hidden
                    className="bg-brand-surface pointer-events-none absolute inset-0 z-0 min-h-svh overflow-hidden"
                >
                    <div
                        data-charter-bg-figure
                        className="absolute inset-0 w-full origin-[50%_22%] will-change-transform min-h-svh"
                    >
                        <div className="absolute inset-0 left-1/2 w-screen max-w-none -translate-x-1/2 min-h-svh">
                            <Image
                                src="/images/charter-services-bg.png"
                                alt=""
                                fill
                                priority
                                className="size-full min-w-full object-cover object-[center_85%] sm:object-[center_35%] min-h-svh"
                                sizes="100vw"
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

                {/* Content */}
                <div className="relative z-10 flex w-full flex-col pt-[max(5.5rem,calc(110px+env(safe-area-inset-top)))] pb-24">
                    <Container className="max-w-base relative z-10">
                        <m.div
                            variants={staggerContainer(0.12, 0.08)}
                            initial={reduceMotion ? false : 'hidden'}
                            whileInView={reduceMotion ? undefined : 'visible'}
                            viewport={{ once: true, amount: 0.3 }}
                            className="flex flex-col gap-10 mb-12"
                        >
                            <div className="flex max-w-3xl flex-col gap-3">
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
                                        className="h-auto w-full max-w-50 shrink-0" aria-hidden
                                    />
                                </m.div>

                                <m.h2
                                    variants={fadeInUp}
                                    className={cn(
                                        'text-brand-black [font-family:var(--font-halant)] font-normal text-balance',
                                        'text-[clamp(1.85rem,8vw,2.5rem)] leading-[1.08] tracking-[-0.03em]',
                                    )}
                                >
                                    {SERVICES_HEADLINE}
                                </m.h2>

                                <m.p
                                    variants={fadeInUp}
                                    className="text-brand-gray [font-family:var(--font-geist)] font-normal text-[15px] leading-[1.6] mt-1"
                                >
                                    {SERVICES_BODY}
                                </m.p>
                            </div>
                        </m.div>
                    </Container>

                    {/* Cards — vertical stack with tilt */}
                    <div className="flex flex-col items-center gap-6 px-4 pb-16">
                        {CHARTER_SERVICES.map((service, i) => (
                            <div
                                key={service.id}
                                data-charter-mobile-card
                                className="w-full max-w-[min(480px,calc(100vw-2rem))] will-change-transform"
                            >
                                <div className={charterCardTiltClass(i)}>
                                    <CharterServiceCard service={service} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    )
}