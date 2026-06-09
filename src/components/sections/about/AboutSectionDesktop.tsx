'use client'

// src/components/sections/about/AboutSectionDesktop.tsx
// ─────────────────────────────────────────────────────
// Desktop (1024px+): full 4-column GSAP scroll-pin with parallax columns.
//
// Changes from current project:
// • Imports useAboutVisionHandoffOptional + scheduleScrollTriggerRefresh
// • Passes registerHandoffCard + registerMosaicAnchor into AboutRevealColumn (col1 only)
// • Adds HANDOFF_BAND, handoffExit label, hero bottom fade, onLeave/onEnterBack callbacks
// • Adds handoff peer opacity fade during exit band
// • Stores pin ST reference in handoff context via registerAboutPinScrollTrigger
// • Cleanup calls restoreHandoffToAbout + setAboutPinHandoffSuppressed(false)

import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useCallback, useEffect, useRef } from 'react'
import { Section } from '@/components/layout/Section'
import {
    scheduleScrollTriggerRefresh,
    useAboutVisionHandoffOptional,
} from './AboutVisionHandoffContext'
import {
    ABOUT_HANDOFF_CARD_ATTR,
    ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR,
    ABOUT_HANDOFF_PEER_ATTR,
} from '@/lib/animations/aboutVisionHandoff'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'
import { AboutRevealColumn } from './AboutRevealCard'
import {
    ABOUT_PARAGRAPH,
    ABOUT_PIN_SCRUB_SMOOTH,
    ABOUT_REVEAL_ORBIT_VARS,
    COLUMN_PARALLAX_Y_RANGE,
    DESKTOP_MOSAIC_COLUMNS,
    DESKTOP_MOSAIC_SLOTS,
    MOSAIC_STAGGER_MARGIN_TOP,
    type AboutSectionProps,
} from './aboutShared'

// Duration of the handoff exit band as a fraction of the total timeline (0–1).
// Must match the old project exactly.
const HANDOFF_BAND = 0.15
const HANDOFF_HERO_SHRINK_DURATION = HANDOFF_BAND * 0.78

function aboutHeroFadeAlpha(scrollProgress: number, exitProgress: number): number {
    const fadeStart = exitProgress * 0.72
    const fadeEnd = exitProgress * 0.92
    return gsap.utils.clamp(0, 1, gsap.utils.mapRange(fadeStart, fadeEnd, 1, 0, scrollProgress))
}

export function AboutSectionDesktop({
    fixedHelicopterOpacityRef,
    fixedRingsRef,
    sectionRef,
}: AboutSectionProps) {
    const pinRef = useRef<HTMLDivElement>(null)
    const prefersReducedMotion = useReducedMotion()
    const handoffCtx = useAboutVisionHandoffOptional()
    const registerHandoffCard = handoffCtx?.registerHandoffCard
    const registerMosaicAnchor = handoffCtx?.registerMosaicAnchor
    const handoffApiRef = useRef(handoffCtx)

    useEffect(() => {
        handoffApiRef.current = handoffCtx
    }, [handoffCtx])

    const clearState = useCallback(
        (root: HTMLElement) => {
            const ringsLayer = fixedRingsRef?.current
            const badge = root.querySelector<HTMLElement>('[data-about-badge]')
            const copyInner = root.querySelector<HTMLElement>('[data-about-copy-inner]')
            const centerImage = root.querySelector<HTMLElement>('[data-about-center-image]')
            const desktopCols = root.querySelectorAll<HTMLElement>('[data-about-parallax-col-desktop]')
            const handoffCard = root.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_CARD_ATTR}]`)
            const handoffAnchor = root.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR}]`)
            const handoffPeers = root.querySelectorAll<HTMLElement>(`[${ABOUT_HANDOFF_PEER_ATTR}]`)
            const overlay = root.querySelector<HTMLElement>('[data-about-overlay]')

            if (ringsLayer) gsap.set(ringsLayer, { clearProps: 'clipPath,opacity,transform' })
            if (badge) gsap.set(badge, { clearProps: 'opacity,transform,visibility' })
            if (copyInner) gsap.set(copyInner, { clearProps: 'opacity,transform,visibility' })
            if (centerImage) gsap.set(centerImage, { clearProps: 'opacity,transform,visibility,xPercent,yPercent,y,zIndex' })
            if (fixedHelicopterOpacityRef?.current) gsap.set(fixedHelicopterOpacityRef.current, { clearProps: 'clipPath,opacity' })
            desktopCols.forEach((el) => gsap.set(el, { clearProps: 'transform,opacity,visibility' }))
            handoffPeers.forEach((el) => gsap.set(el, { clearProps: 'opacity,transform,visibility' }))
            if (handoffAnchor) gsap.set(handoffAnchor, { clearProps: 'opacity,visibility,transform,scale,zIndex,y' })
            if (handoffCard && handoffCard.style.position !== 'fixed') {
                gsap.set(handoffCard, { clearProps: 'opacity,visibility,transform,scale,zIndex,y' })
            }
            if (overlay) gsap.set(overlay, { clearProps: 'overflow' })
        },
        [fixedHelicopterOpacityRef, fixedRingsRef],
    )

    useGSAP(
        () => {
            const root = pinRef.current
            if (!root) return

            const ringsLayer = fixedRingsRef?.current
            const badge = root.querySelector<HTMLElement>('[data-about-badge]')
            const copyInner = root.querySelector<HTMLElement>('[data-about-copy-inner]')
            const centerImage = root.querySelector<HTMLElement>('[data-about-center-image]')
            const desktopCols = root.querySelectorAll<HTMLElement>('[data-about-parallax-col-desktop]')
            const overlay = root.querySelector<HTMLElement>('[data-about-overlay]')
            const handoffAnchor = root.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR}]`)
            const heroBottomFade = document.querySelector<HTMLElement>('[data-hero-bottom-fade]')

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                if (ringsLayer) gsap.set(ringsLayer, { clipPath: 'inset(0 0 100% 0)' })
                if (fixedHelicopterOpacityRef?.current) gsap.set(fixedHelicopterOpacityRef.current, { clipPath: 'inset(0 0 100% 0)' })
                if (badge) gsap.set(badge, { opacity: 1, y: 0, clearProps: 'opacity,transform' })
                if (copyInner) gsap.set(copyInner, { clearProps: 'transform,opacity' })
                if (centerImage) gsap.set(centerImage, { opacity: 0, clearProps: 'opacity' })
                desktopCols.forEach((el) => gsap.set(el, { y: 0, clearProps: 'transform' }))
                return
            }

            if (!badge) return

            let lastFadeAlpha = -1

            const readPinTimelineMeta = (pinTimeline: gsap.core.Timeline) => {
                const total = Math.max(pinTimeline.totalDuration(), 0.001)
                return {
                    exitProgress: (pinTimeline.labels.handoffExit ?? 1) / total,
                }
            }

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: root,
                    start: 'top 35px',
                    end: '+=240%',
                    pin: true,
                    scrub: ABOUT_PIN_SCRUB_SMOOTH,
                    invalidateOnRefresh: true,
                    fastScrollEnd: true,
                    anticipatePin: 1,
                    onUpdate(self) {
                        const pinTimeline = self.animation as gsap.core.Timeline | undefined
                        if (!pinTimeline || !heroBottomFade) return
                        const { exitProgress } = readPinTimelineMeta(pinTimeline)
                        const alpha = aboutHeroFadeAlpha(self.progress, exitProgress)
                        if (Math.abs(alpha - lastFadeAlpha) > 0.004) {
                            lastFadeAlpha = alpha
                            gsap.set(heroBottomFade, { autoAlpha: alpha })
                        }
                    },
                    onLeave(self) {
                        if (self.direction === 1) {
                            if (heroBottomFade) gsap.set(heroBottomFade, { autoAlpha: 0 })
                            handoffApiRef.current?.captureHandoffStartRect?.()
                        } else if (heroBottomFade) {
                            gsap.set(heroBottomFade, { autoAlpha: 1 })
                        }
                        if (!handoffApiRef.current?.isBridgeHandoffActive?.()) scheduleScrollTriggerRefresh()
                    },
                    onEnterBack(self) {
                        const pinTimeline = self.animation as gsap.core.Timeline | undefined
                        if (heroBottomFade && pinTimeline) {
                            const { exitProgress } = readPinTimelineMeta(pinTimeline)
                            gsap.set(heroBottomFade, { autoAlpha: aboutHeroFadeAlpha(self.progress, exitProgress) })
                        }
                        if (!handoffApiRef.current?.isBridgeHandoffActive?.()) scheduleScrollTriggerRefresh()
                    },
                },
            })

            if (ringsLayer) gsap.set(ringsLayer, { clipPath: 'inset(0 0 0% 0)' })
            if (fixedHelicopterOpacityRef?.current) gsap.set(fixedHelicopterOpacityRef.current, { clipPath: 'inset(0 0 0% 0)' })
            gsap.set(badge, { autoAlpha: 0, y: 55 })
            if (copyInner) gsap.set(copyInner, { autoAlpha: 0, y: 75 })
            if (centerImage) gsap.set(centerImage, { autoAlpha: 1, scale: 1.8, y: 180, transformOrigin: 'center center' })

            if (ringsLayer) tl.to(ringsLayer, { clipPath: 'inset(0 0 100% 0)', duration: 0.12, ease: 'power2.in' }, 0)
            if (fixedHelicopterOpacityRef?.current) tl.to(fixedHelicopterOpacityRef.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.12, ease: 'power2.in' }, 0)

            if (centerImage) {
                tl.fromTo(centerImage, { autoAlpha: 1, scale: 1.8, y: 180 }, { autoAlpha: 1, scale: 1.0, y: 0, duration: 0.12, ease: 'none', immediateRender: false }, 0)
                tl.to(centerImage, { y: -800, duration: 0.53, ease: 'none' }, 0.12)
            }

            tl.fromTo(badge, { autoAlpha: 0, y: 55 }, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out', immediateRender: false }, 0.10)
            if (copyInner) tl.fromTo(copyInner, { autoAlpha: 0, y: 75 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out', immediateRender: false }, 0.12)

            const wordTimelineEnd = 0.65
            const handoffExitAt = wordTimelineEnd + 0.06
            tl.addLabel('handoffExit', handoffExitAt)
            tl.to({}, { duration: HANDOFF_BAND }, 'handoffExit')

            const mm = gsap.matchMedia()

            mm.add('(min-width: 768px)', () => {
                if (overlay) tl.set(overlay, { overflow: 'visible' }, 'handoffExit')
                if (handoffAnchor) {
                    tl.set(handoffAnchor, { transformOrigin: 'center center', zIndex: 61, force3D: true }, 'handoffExit')
                }
                return () => { }
            })

            mm.add('(min-width: 1024px)', () => {
                const tweens: gsap.core.Animation[] = []
                desktopCols.forEach((col, i) => {
                    if (i >= COLUMN_PARALLAX_Y_RANGE.length) return
                    const [startY, endY] = COLUMN_PARALLAX_Y_RANGE[i]
                    gsap.set(col, { y: startY, force3D: true })
                    tweens.push(tl.fromTo(col, { y: startY }, { y: endY, ease: 'none', duration: wordTimelineEnd, immediateRender: false }, 0))
                })
                return () => tweens.forEach((t) => t.kill())
            })

            const pinSt = tl.scrollTrigger
            if (pinSt) handoffApiRef.current?.registerAboutPinScrollTrigger(pinSt)

            return () => {
                handoffApiRef.current?.registerAboutPinScrollTrigger(null)
                handoffApiRef.current?.setAboutPinHandoffSuppressed(false)
                handoffApiRef.current?.restoreHandoffToAbout?.()
                mm.revert()
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
                className="bg-transparent text-brand-black overflow-visible relative"
            >
                <div ref={pinRef} className="relative z-55 w-full">
                    <div data-about-stage className="relative min-h-svh w-full">
                        <div
                            data-about-overlay
                            className="pointer-events-none absolute inset-0 z-60 flex min-h-svh items-center justify-center overflow-x-visible overflow-y-clip p-3 sm:p-5 md:p-6"
                        >
                            <div
                                data-about-orbit
                                style={ABOUT_REVEAL_ORBIT_VARS}
                                className={cn(
                                    'relative mx-auto flex w-full max-w-[min(1400px,calc(100vw-1.5rem))] flex-row items-center justify-between gap-4 overflow-visible',
                                    'xl:[--about-stack-gap:max(6.75rem,25.5vh)]',
                                    'min-h-[min(58svh,520px)] xl:min-h-[min(62svh,600px)]',
                                )}
                            >
                                {/* Left pair: col0 + col1 */}
                                <div className="flex shrink-0 flex-row items-center gap-2 xl:gap-3">
                                    <div data-about-parallax-col-desktop className="shrink-0 will-change-transform">
                                        <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[0].stagger] }}>
                                            <AboutRevealColumn images={DESKTOP_MOSAIC_SLOTS[0]} keyPrefix="col0" />
                                        </div>
                                    </div>
                                    {/* col1 contains reveal-06 — the handoff card */}
                                    <div data-about-parallax-col-desktop className="shrink-0 will-change-transform">
                                        <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[1].stagger] }}>
                                            <AboutRevealColumn
                                                images={DESKTOP_MOSAIC_SLOTS[1]}
                                                keyPrefix="col1"
                                                registerHandoffCard={registerHandoffCard}
                                                registerMosaicAnchor={registerMosaicAnchor}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Centre copy */}
                                <div
                                    data-about-copy
                                    className="pointer-events-auto absolute inset-0 z-90 flex min-h-0 w-full flex-col items-center justify-center self-center px-4 gap-4 sm:gap-5"
                                >
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-100">
                                        <div data-about-center-image className="pointer-events-auto relative z-50 will-change-transform">
                                            <div className={cn(
                                                'relative aspect-square w-(--about-card) shrink-0 overflow-visible',
                                                'rounded-[18px] border-2 border-[#090202]/8 p-1.5 sm:rounded-3xl sm:p-2',
                                                'shadow-[0_14px_44px_-18px_rgba(9,9,11,0.22)]',
                                                'backdrop-blur-none md:backdrop-blur-md lg:backdrop-blur-xl',
                                            )}>
                                                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-transparent from-40% via-transparent via-55% to-[#090202]/8 sm:rounded-[22px]" />
                                                <div className="relative z-1 size-full overflow-hidden rounded-2xl border-2 border-white bg-white sm:rounded-[22px]">
                                                    <Image src="/images/about-us-reveal-03.png" alt="Telugu Airlines helicopter in flight" fill
                                                        sizes="(max-width: 639px) 180px, (max-width: 1023px) 240px, 300px" className="object-cover object-center" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div data-about-badge className="relative z-50 flex flex-col items-center gap-1.5 sm:gap-2">
                                        <span className="inline-flex items-center gap-2">
                                            <Image src="/images/black-asterisk.svg" width={14} height={14} alt="" className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                            <span className="text-brand-black [font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase">About Us</span>
                                        </span>
                                        <Image src="/images/header-line.svg" width={364} height={12} alt=""
                                            className="h-auto w-[min(200px,calc(100vw-2.5rem))] max-w-full shrink-0 sm:w-[min(220px,calc(100vw-2rem))]" aria-hidden />
                                    </div>

                                    <div data-about-copy-inner className="w-full">
                                        <p className={cn(
                                            'mx-auto block w-full text-center',
                                            'max-w-[min(22rem,calc(100vw-1.5rem))] sm:max-w-[min(34rem,calc(100vw-2rem))] md:max-w-[min(40rem,calc(100vw-2.25rem))]',
                                            'text-[16px] leading-6.5 tracking-[-0.015em]',
                                            'sm:text-[18px] sm:leading-7 sm:tracking-[-0.018em]',
                                            'md:text-[20px] md:leading-7.5 md:tracking-[-0.02em]',
                                            'lg:max-w-[min(46rem,calc(100vw-2.75rem))] lg:text-[24px] lg:leading-8.5 lg:tracking-tight',
                                            'xl:max-w-[min(52rem,calc(100vw-4rem))] xl:text-[28px] xl:leading-9.5 xl:tracking-[-0.032em]',
                                            '2xl:text-[34px] 2xl:leading-11 2xl:tracking-[-0.04em]',
                                            '[font-family:var(--font-halant)] font-normal will-change-[opacity]',
                                        )}>
                                            {ABOUT_PARAGRAPH}
                                        </p>
                                    </div>
                                </div>

                                {/* Right pair: col2 + col3 */}
                                <div className="flex shrink-0 flex-row items-center gap-2 xl:gap-3">
                                    <div data-about-parallax-col-desktop className="shrink-0 will-change-transform">
                                        <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[2].stagger] }}>
                                            <AboutRevealColumn images={DESKTOP_MOSAIC_SLOTS[2]} keyPrefix="col2" />
                                        </div>
                                    </div>
                                    <div data-about-parallax-col-desktop className="shrink-0 will-change-transform">
                                        <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[3].stagger] }}>
                                            <AboutRevealColumn images={DESKTOP_MOSAIC_SLOTS[3]} keyPrefix="col3" />
                                        </div>
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