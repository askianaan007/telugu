'use client'

// src/components/sections/about/AboutSectionTablet.tsx
// ─────────────────────────────────────────────────────
// Tablet (768px – 1023px): GSAP scroll-pin with two mobile image rails
// flanking a centred text block. Simpler than desktop — 2 cols not 4.

import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { type CSSProperties, useCallback, useRef } from 'react'
import { Section } from '@/components/layout/Section'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'
import { AboutRevealColumn } from './AboutRevealCard'
import {
    ABOUT_PARAGRAPH,
    ABOUT_PIN_SCRUB_SMOOTH,
    ABOUT_REVEAL_ORBIT_VARS,
    DESKTOP_MOSAIC_COLUMNS,
    MOBILE_LEFT_PARALLAX_Y,
    MOBILE_LEFT_RAIL_SLOTS,
    MOBILE_RIGHT_RAIL_SLOTS,
    MOSAIC_STAGGER_MARGIN_TOP,
    type AboutSectionProps,
} from './aboutShared'

const TABLET_ORBIT_VARS: CSSProperties = {
    ...ABOUT_REVEAL_ORBIT_VARS,
    '--about-card': 'clamp(5.5rem,17.5vw,12.5rem)',
    '--about-stack-gap': 'max(1.625rem,7.5vh)',
    '--about-stagger-inner': 'calc(0.5 * var(--about-card) + 0.5 * var(--about-stack-gap))',
} as CSSProperties

export function AboutSectionTablet({
    fixedHelicopterOpacityRef,
    fixedRingsRef,
    sectionRef,
}: AboutSectionProps) {
    const pinRef = useRef<HTMLDivElement>(null)
    const prefersReducedMotion = useReducedMotion()

    const clearState = useCallback(
        (root: HTMLElement) => {
            const els = [
                fixedRingsRef?.current,
                root.querySelector<HTMLElement>('[data-about-badge]'),
                root.querySelector<HTMLElement>('[data-about-copy-inner]'),
                root.querySelector<HTMLElement>('[data-about-center-image]'),
                fixedHelicopterOpacityRef?.current,
            ]
            root.querySelectorAll<HTMLElement>('[data-about-parallax-col-mobile]').forEach((el) =>
                gsap.set(el, { clearProps: 'transform,opacity,visibility' })
            )
            els.forEach((el) => el && gsap.set(el, { clearProps: 'opacity,transform,visibility' }))
        },
        [fixedHelicopterOpacityRef, fixedRingsRef],
    )

    useGSAP(
        () => {
            const root = pinRef.current
            if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

            const badge = root.querySelector<HTMLElement>('[data-about-badge]')
            const copyInner = root.querySelector<HTMLElement>('[data-about-copy-inner]')
            const centerImage = root.querySelector<HTMLElement>('[data-about-center-image]')
            const mobileCols = root.querySelectorAll<HTMLElement>('[data-about-parallax-col-mobile]')

            if (!badge) return

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: root,
                    start: 'top 35px',
                    end: '+=200%',
                    pin: true,
                    scrub: ABOUT_PIN_SCRUB_SMOOTH,
                    invalidateOnRefresh: true,
                    fastScrollEnd: true,
                    anticipatePin: 1,
                    onRefresh(self) {
                        if (self.progress < 0.05) {
                            mobileCols.forEach((col) =>
                                gsap.set(col, { y: window.innerHeight * 0.45, force3D: true })
                            )
                        }
                    },
                },
            })

            gsap.set(badge, { autoAlpha: 0, y: 48 })
            if (copyInner) gsap.set(copyInner, { autoAlpha: 0, y: 60 })
            if (centerImage) gsap.set(centerImage, { autoAlpha: 1, scale: 1.7, y: 160, transformOrigin: 'center center' })
            if (fixedHelicopterOpacityRef?.current) gsap.set(fixedHelicopterOpacityRef.current, { opacity: 1 })
            if (fixedRingsRef?.current) gsap.set(fixedRingsRef.current, { opacity: 1 })

            if (fixedRingsRef?.current) tl.to(fixedRingsRef.current, { scale: 0, duration: 0.01 }, 0.1)
            if (fixedHelicopterOpacityRef?.current) tl.to(fixedHelicopterOpacityRef.current, { scale: 0, duration: 0.01 }, 0.1)

            if (centerImage) {
                tl.fromTo(centerImage, { autoAlpha: 1, scale: 1.7, y: 160 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.12, ease: 'none' }, 0)
                tl.to(centerImage, { y: -700, duration: 0.5, ease: 'none' }, 0.12)
            }

            tl.fromTo(badge, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out' }, 0.1)
            if (copyInner) tl.fromTo(copyInner, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.12)

            const startYMobile = window.innerHeight * 0.45
            mobileCols.forEach((col, i) => {
                const [startY, endY] = i === 0 ? MOBILE_LEFT_PARALLAX_Y : [startYMobile, -180]
                gsap.set(col, { y: startY, force3D: true })
                tl.fromTo(col, { y: startY }, { y: endY, ease: 'none', duration: 0.65 }, 0)
            })

            return () => {
                tl.scrollTrigger?.kill()
                tl.kill()
                clearState(root)
            }
        },
        {
            scope: pinRef,
            dependencies: [prefersReducedMotion, clearState],
        },
    )

    return (
        <div ref={sectionRef as React.RefObject<HTMLDivElement>} className="relative">
            <Section
                id="about"
                variant="default"
                paddingY="none"
                style={{ isolation: 'auto', overflow: 'visible' }}
                className="bg-transparent text-brand-black overflow-visible"
            >
                <div ref={pinRef} className="relative z-55 w-full">
                    <div className="relative min-h-svh w-full">
                        <div className="pointer-events-none absolute inset-0 z-60 flex min-h-svh items-center justify-center overflow-x-visible overflow-y-clip p-4 sm:p-5">
                            <div
                                style={TABLET_ORBIT_VARS}
                                className="relative mx-auto flex w-full max-w-[min(900px,calc(100vw-1.5rem))] flex-row items-start justify-center gap-3 overflow-visible min-h-[min(54svh,440px)]"
                            >
                                {/* Left rail */}
                                <div data-about-parallax-col-mobile className="shrink-0 will-change-transform">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP.outer }}>
                                        <AboutRevealColumn images={MOBILE_LEFT_RAIL_SLOTS} keyPrefix="t-left" />
                                    </div>
                                </div>

                                {/* Centre copy */}
                                <div className="pointer-events-auto relative z-90 flex min-h-0 min-w-0 flex-1 shrink-0 flex-col items-center justify-center self-center gap-4 px-1 sm:px-2">
                                    {/* Floating center image (GSAP animated) */}
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-100">
                                        <div data-about-center-image className="pointer-events-auto relative z-50 will-change-transform">
                                            <div className="relative aspect-square w-(--about-card) shrink-0 overflow-visible rounded-[18px] border-2 border-[#090202]/8 p-1.5 shadow-[0_14px_44px_-18px_rgba(9,9,11,0.22)] backdrop-blur-md">
                                                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-transparent from-40% to-[#090202]/8" />
                                                <div className="relative z-1 size-full overflow-hidden rounded-2xl border-2 border-white bg-white">
                                                    <Image
                                                        src="/images/about-us-reveal-03.png"
                                                        alt="Telugu Airlines helicopter in flight"
                                                        fill
                                                        sizes="(max-width: 1023px) 200px"
                                                        className="object-cover object-center"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge */}
                                    <div data-about-badge className="relative z-50 flex flex-col items-center gap-1.5">
                                        <span className="inline-flex items-center gap-2">
                                            <Image src="/images/black-asterisk.svg" width={13} height={13} alt="" className="h-3 w-3 shrink-0" aria-hidden />
                                            <span className="text-brand-black [font-family:var(--font-geist)] text-[13px] font-semibold tracking-[0.2em] uppercase">About Us</span>
                                        </span>
                                        <Image src="/images/header-line.svg" width={364} height={12} alt=""
                                            className="h-auto w-[min(180px,calc(100vw-2rem))]" aria-hidden />
                                    </div>

                                    {/* Body */}
                                    <div data-about-copy-inner className="w-full">
                                        <p className={cn(
                                            'mx-auto block w-full text-center [font-family:var(--font-halant)] font-normal',
                                            'max-w-[min(28rem,calc(100vw-2rem))]',
                                            'text-[16px] leading-[1.65] tracking-[-0.015em]',
                                            'sm:text-[18px] sm:leading-[1.7]',
                                        )}>
                                            {ABOUT_PARAGRAPH}
                                        </p>
                                    </div>
                                </div>

                                {/* Right rail */}
                                <div data-about-parallax-col-mobile className="shrink-0 will-change-transform">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP.outer }}>
                                        <AboutRevealColumn images={MOBILE_RIGHT_RAIL_SLOTS} keyPrefix="t-right" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    )
}