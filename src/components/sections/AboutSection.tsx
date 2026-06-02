'use client'

import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { Fragment, type CSSProperties, type RefObject, useEffect, useRef, useCallback } from 'react'

import { Section } from '@/components/layout/Section'
import { AboutHelicopterRings } from '@/components/sections/about/AboutHelicopterRings'
import {
    scheduleScrollTriggerRefresh,
    useAboutVisionHandoffOptional,
} from '@/components/sections/about/AboutVisionHandoffContext'
import {
    ABOUT_HANDOFF_CARD_ATTR,
    ABOUT_HANDOFF_IMAGE_ATTR,
    ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR,
    ABOUT_HANDOFF_PEER_ATTR,
    ABOUT_VISION_HANDOFF_IMAGE,
} from '@/lib/animations/aboutVisionHandoff'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'

const ABOUT_PARAGRAPH =
    'Our dedication to safety, reliability, and innovation is at the core of our operations, allowing us to deliver customized aviation solutions that cater to the diverse needs of corporate clients, government entities, and private individuals alike. By prioritizing these values, we ensure that our clients receive not only efficient transportation but also peace of mind during their aerial journeys.'

const REVEAL_IMAGES = [
    { src: '/images/about-us-reveal-01.png', alt: 'Telugu Airlines helicopter in flight', sizes: '(max-width: 639px) 120px, (max-width: 1023px) 160px, 200px' },
    { src: '/images/about-us-reveal-02.png', alt: 'Professional beside aircraft on the tarmac', sizes: '(max-width: 639px) 140px, (max-width: 1023px) 180px, (max-width: 1279px) 144px, 180px' },
    { src: '/images/about-us-reveal-03.png', alt: 'Helicopter on helipad under blue sky', sizes: '(max-width: 639px) 140px, (max-width: 1023px) 180px, (max-width: 1279px) 144px, 176px' },
    { src: '/images/about-us-reveal-04.png', alt: 'Helicopter in flight at dusk', sizes: '(max-width: 639px) 120px, (max-width: 1023px) 160px, 200px' },
    { src: '/images/about-us-reveal-05.png', alt: 'Helicopter charter on the runway', sizes: '(max-width: 639px) 140px, (max-width: 1023px) 180px, (max-width: 1279px) 144px, 180px' },
    { src: '/images/about-us-reveal-06.png', alt: 'Aerial view of helicopter in flight', sizes: '(max-width: 639px) 120px, (max-width: 1023px) 160px, 200px' },
    { src: '/images/about-us-reveal-07.png', alt: 'Aviation team beside a charter aircraft', sizes: '(max-width: 639px) 140px, (max-width: 1023px) 180px, (max-width: 1279px) 144px, 176px' },
    { src: '/images/about-us-reveal-08.png', alt: 'Helicopter landing at a private helipad', sizes: '(max-width: 639px) 120px, (max-width: 1023px) 160px, 200px' },
    { src: '/images/about-us-reveal-09.png', alt: 'Helicopter flying over open landscape', sizes: '(max-width: 639px) 140px, (max-width: 1023px) 180px, (max-width: 1279px) 144px, 180px' },
    { src: '/images/about-us-reveal-10.png', alt: 'Premium charter helicopter on the tarmac', sizes: '(max-width: 639px) 140px, (max-width: 1023px) 180px, (max-width: 1279px) 144px, 176px' },
    { src: '/images/about-us-reveal-11.png', alt: 'Helicopter in flight against a clear sky', sizes: '(max-width: 639px) 120px, (max-width: 1023px) 160px, 200px' },
    { src: '/images/about-us-reveal-12.png', alt: 'Charter helicopter ready for departure', sizes: '(max-width: 639px) 140px, (max-width: 1023px) 180px, (max-width: 1279px) 144px, 180px' },
] as const

type RevealImage = (typeof REVEAL_IMAGES)[number]
type MosaicStagger = 'outer' | 'inner'

type DesktopMosaicColumn = {
    key: string
    imageIndices: readonly [number, number, number]
    stagger: MosaicStagger
}

const DESKTOP_MOSAIC_COLUMNS = [
    { key: 'far-left', imageIndices: [0, 1, 2], stagger: 'outer' },
    { key: 'inner-left', imageIndices: [3, 4, 5], stagger: 'inner' },
    { key: 'inner-right', imageIndices: [6, 7, 8], stagger: 'inner' },
    { key: 'far-right', imageIndices: [9, 10, 11], stagger: 'outer' },
] as const satisfies readonly DesktopMosaicColumn[]

const DESKTOP_MOSAIC_SLOTS = DESKTOP_MOSAIC_COLUMNS.map((col) => col.imageIndices.map((i) => REVEAL_IMAGES[i]))
const MOBILE_LEFT_RAIL_SLOTS = [...DESKTOP_MOSAIC_SLOTS[0], ...DESKTOP_MOSAIC_SLOTS[1]]
const MOBILE_RIGHT_RAIL_SLOTS = [...DESKTOP_MOSAIC_SLOTS[2], ...DESKTOP_MOSAIC_SLOTS[3]]

const OUTER_COLUMN_PARALLAX_Y_RANGE_LG = [500, -500] as const
const INNER_COLUMN_PARALLAX_Y_RANGE_LG = [300, -300] as const
const COLUMN_PARALLAX_Y_RANGE_LG = [
    OUTER_COLUMN_PARALLAX_Y_RANGE_LG,
    INNER_COLUMN_PARALLAX_Y_RANGE_LG,
    INNER_COLUMN_PARALLAX_Y_RANGE_LG,
    OUTER_COLUMN_PARALLAX_Y_RANGE_LG,
] as const

const ABOUT_REVEAL_ORBIT_VARS = {
    '--about-card': 'clamp(3.25rem, 9vw, 8.5rem)',
    '--about-stack-gap': 'max(6rem, 24vh)',
    '--about-col-pad': 'max(0.5rem, 2vh)',
    '--about-stagger-outer': 'calc(-0.35 * var(--about-card))',
    '--about-stagger-inner': 'calc(0.5 * var(--about-card) + 0.5 * var(--about-stack-gap))',
} as CSSProperties

const MOSAIC_STAGGER_MARGIN_TOP: Record<MosaicStagger, string> = {
    outer: 'var(--about-stagger-outer)',
    inner: 'var(--about-stagger-inner)',
}

const CARD_SHARED_CLASS = cn(
    'pointer-events-none relative aspect-square w-(--about-card) shrink-0 overflow-visible',
    'rounded-[16px] border-2 border-[#090202]/8 p-1',
    'sm:rounded-[24px] sm:p-2 lg:rounded-[16px] lg:p-2 xl:rounded-[22px]',
    'bg-about-reveal-frame-outer/8 shadow-[0_14px_44px_-18px_rgba(9,9,11,0.22)]',
    'backdrop-blur-none md:backdrop-blur-md lg:backdrop-blur-xl',
)

function AboutRevealSquareCard({
    image, className, isHandoff = false, registerHandoffCard,
}: {
    image: RevealImage
    className?: string
    isHandoff?: boolean
    registerHandoffCard?: (el: HTMLDivElement | null) => void
}) {
    return (
        <div
            ref={isHandoff ? registerHandoffCard : undefined}
            {...(isHandoff ? { [ABOUT_HANDOFF_CARD_ATTR]: '' } : { [ABOUT_HANDOFF_PEER_ATTR]: '' })}
            className={cn(CARD_SHARED_CLASS, className)}
        >
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[14px] bg-linear-to-br from-transparent from-40% via-transparent via-55% to-[#090202]/8 sm:rounded-[24px] lg:rounded-[16px] xl:rounded-[22px]" />
            <div
                {...(isHandoff ? { [ABOUT_HANDOFF_IMAGE_ATTR]: '' } : {})}
                className="relative z-1 size-full overflow-hidden rounded-[14px] border-2 border-white bg-white lg:rounded-[16px] xl:rounded-[22px]"
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={image.sizes}
                    className={cn('object-cover', isHandoff ? 'object-[center_35%]' : 'object-center')}
                />
            </div>
        </div>
    )
}

function AboutRevealColumn({
    images, keyPrefix, registerHandoffCard, registerMosaicAnchor,
}: {
    images: readonly RevealImage[]
    keyPrefix: string
    registerHandoffCard?: (el: HTMLDivElement | null) => void
    registerMosaicAnchor?: (el: HTMLElement | null) => void
}) {
    return (
        <div className="flex flex-col items-center gap-(--about-stack-gap) py-(--about-col-pad)">
            {images.map((image) => {
                const isHandoff = image.src === ABOUT_VISION_HANDOFF_IMAGE
                if (isHandoff) {
                    return (
                        <div
                            key={`${keyPrefix}-${image.src}`}
                            ref={registerMosaicAnchor}
                            {...{ [ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR]: '' }}
                            className="relative aspect-square w-(--about-card) shrink-0"
                        >
                            <AboutRevealSquareCard image={image} isHandoff registerHandoffCard={registerHandoffCard} />
                        </div>
                    )
                }
                return (
                    <AboutRevealSquareCard key={`${keyPrefix}-${image.src}`} image={image} isHandoff={false} />
                )
            })}
        </div>
    )
}

type AboutIntroSectionProps = {
    fixedHelicopterOpacityRef?: RefObject<HTMLDivElement | null>
    fixedRingsRef?: RefObject<HTMLDivElement | null>
    sectionRef?: RefObject<HTMLElement | null>
}

const HANDOFF_BAND = 0.15
const MOBILE_LEFT_RAIL_PARALLAX_Y: readonly [number, number] = [80, 0]
const HANDOFF_EXIT_PHASE = HANDOFF_BAND * 0.45
const HANDOFF_HERO_SHRINK_DURATION = HANDOFF_BAND * 0.78
const ABOUT_PIN_SCRUB_SMOOTH = 1.15

function aboutParallaxHandoffExitY(columnIndex: number, endY: number): number {
    const isInnerCol = columnIndex === 1 || columnIndex === 2
    const delta = isInnerCol ? 96 : 64 + columnIndex * 16
    return endY - delta
}

function aboutHeroFadeAlpha(scrollProgress: number, exitProgress: number): number {
    const fadeStart = exitProgress * 0.72
    const fadeEnd = exitProgress * 0.92
    return gsap.utils.clamp(0, 1, gsap.utils.mapRange(fadeStart, fadeEnd, 1, 0, scrollProgress))
}

export function AboutIntroSection({ fixedHelicopterOpacityRef, fixedRingsRef, sectionRef }: AboutIntroSectionProps) {
    const pinRef = useRef<HTMLDivElement>(null)
    const prefersReducedMotion = useReducedMotion()
    const handoffCtx = useAboutVisionHandoffOptional()
    const registerHandoffCard = handoffCtx?.registerHandoffCard
    const registerMosaicAnchor = handoffCtx?.registerMosaicAnchor
    const handoffApiRef = useRef(handoffCtx)

    useEffect(() => { handoffApiRef.current = handoffCtx }, [handoffCtx])

    const clearAboutGsapState = useCallback((root: HTMLElement) => {
        const ringsLayer = fixedRingsRef?.current
        const badge = root.querySelector<HTMLElement>('[data-about-badge]')
        const copyInner = root.querySelector<HTMLElement>('[data-about-copy-inner]')
        const centerImage = root.querySelector<HTMLElement>('[data-about-center-image]')
        const overlay = root.querySelector<HTMLElement>('[data-about-overlay]')
        const handoffPeers = root.querySelectorAll<HTMLElement>(`[${ABOUT_HANDOFF_PEER_ATTR}]`)
        const handoffAnchor = root.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR}]`)
        const handoffCard = root.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_CARD_ATTR}]`)
        const parallaxColsDesktop = root.querySelectorAll<HTMLElement>('[data-about-parallax-col-desktop]')
        const parallaxColsMobile = root.querySelectorAll<HTMLElement>('[data-about-parallax-col-mobile]')

        if (ringsLayer) gsap.set(ringsLayer, { clearProps: 'opacity,transform' })
        if (badge) gsap.set(badge, { clearProps: 'opacity,transform,visibility' })
        if (copyInner) gsap.set(copyInner, { clearProps: 'opacity,transform,visibility' })
        if (centerImage) gsap.set(centerImage, { clearProps: 'opacity,transform,visibility,xPercent,yPercent,y,zIndex' })
        if (fixedHelicopterOpacityRef?.current) gsap.set(fixedHelicopterOpacityRef.current, { clearProps: 'opacity' })
        handoffPeers.forEach((el) => gsap.set(el, { clearProps: 'opacity,transform,visibility' }))
        if (handoffAnchor) gsap.set(handoffAnchor, { clearProps: 'opacity,visibility,transform,scale,zIndex,y' })
        if (handoffCard && handoffCard.style.position !== 'fixed') gsap.set(handoffCard, { clearProps: 'opacity,visibility,transform,scale,zIndex,y' })
        if (overlay) gsap.set(overlay, { clearProps: 'overflow' })
        parallaxColsDesktop.forEach((el) => gsap.set(el, { clearProps: 'transform,opacity,visibility' }))
        parallaxColsMobile.forEach((el) => gsap.set(el, { clearProps: 'transform,opacity,visibility' }))
    }, [fixedHelicopterOpacityRef, fixedRingsRef])

    useGSAP(
        () => {
            const root = pinRef.current
            if (!root) return

            const ringsLayer = fixedRingsRef?.current
            const centerImage = root.querySelector<HTMLElement>('[data-about-center-image]')
            const badge = root.querySelector<HTMLElement>('[data-about-badge]')
            const copyInner = root.querySelector<HTMLElement>('[data-about-copy-inner]')
            const overlay = root.querySelector<HTMLElement>('[data-about-overlay]')
            const handoffPeers = root.querySelectorAll<HTMLElement>(`[${ABOUT_HANDOFF_PEER_ATTR}]`)
            const handoffCard = root.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_CARD_ATTR}]`)
            const handoffAnchor = root.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR}]`)
            const parallaxColsDesktop = root.querySelectorAll<HTMLElement>('[data-about-parallax-col-desktop]')
            const parallaxColsMobile = root.querySelectorAll<HTMLElement>('[data-about-parallax-col-mobile]')

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                if (ringsLayer) gsap.set(ringsLayer, { opacity: 0 })
                if (fixedHelicopterOpacityRef?.current) gsap.set(fixedHelicopterOpacityRef.current, { opacity: 1, clearProps: 'opacity' })
                if (badge) gsap.set(badge, { opacity: 1, y: 0, clearProps: 'opacity,transform' })
                if (copyInner) gsap.set(copyInner, { clearProps: 'transform,opacity' })
                if (centerImage) gsap.set(centerImage, { opacity: 0, clearProps: 'opacity' })
                parallaxColsDesktop.forEach((el) => gsap.set(el, { y: 0, clearProps: 'transform' }))
                parallaxColsMobile.forEach((el) => gsap.set(el, { y: 0, clearProps: 'transform' }))
                return
            }

            if (!badge) return

            const pinScrollEnd = window.matchMedia('(min-width: 768px)').matches ? '+=240%' : '+=200%'
            const heroBottomFade = document.querySelector<HTMLElement>('[data-hero-bottom-fade]')
            let lastFadeAlpha = -1

            const readPinTimelineMeta = (pinTimeline: gsap.core.Timeline) => {
                const total = Math.max(pinTimeline.totalDuration(), 0.001)
                return {
                    exitProgress: (pinTimeline.labels.handoffExit ?? 1) / total,
                    captureProgress: ((pinTimeline.labels.handoffExit ?? 0) + HANDOFF_HERO_SHRINK_DURATION) / total,
                }
            }

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: root,
                    start: 'top 35px',
                    end: pinScrollEnd,
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
                    onRefresh(self) {
                        if (window.matchMedia('(min-width: 1024px)').matches) return
                        const sy = window.innerHeight * 0.5
                        if (self.progress < 0.05) {
                            parallaxColsMobile.forEach((col) => gsap.set(col, { y: sy, force3D: true }))
                        }
                    },
                },
            })

            if (ringsLayer) gsap.set(ringsLayer, { opacity: 1, scale: 1.0 })
            gsap.set(badge, { autoAlpha: 0, y: 55 })
            if (copyInner) gsap.set(copyInner, { autoAlpha: 0, y: 75 })
            if (fixedHelicopterOpacityRef?.current) gsap.set(fixedHelicopterOpacityRef.current, { opacity: 1, scale: 1 })
            if (centerImage) gsap.set(centerImage, { autoAlpha: 1, scale: 1.8, y: 180, transformOrigin: 'center center' })

            if (ringsLayer) tl.to(ringsLayer, { scale: 0.0, duration: 0.01, ease: 'power3.out' }, 0.12)
            if (fixedHelicopterOpacityRef?.current) tl.to(fixedHelicopterOpacityRef.current, { scale: 0.0, duration: 0.01, ease: 'power3.out' }, 0.12)

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
                if (handoffAnchor) tl.set(handoffAnchor, { transformOrigin: 'center center', zIndex: 61, force3D: true }, 'handoffExit')
                return () => { }
            })

            mm.add('(min-width: 1024px)', () => {
                const tweens: gsap.core.Animation[] = []
                for (let i = 0; i < parallaxColsDesktop.length && i < COLUMN_PARALLAX_Y_RANGE_LG.length; i++) {
                    const col = parallaxColsDesktop[i]
                    const [startY, endY] = COLUMN_PARALLAX_Y_RANGE_LG[i]
                    gsap.set(col, { y: startY, force3D: true })
                    tweens.push(tl.fromTo(col, { y: startY }, { y: endY, ease: 'none', duration: wordTimelineEnd, immediateRender: false }, 0))
                }
                return () => { tweens.forEach((t) => t.kill()) }
            })

            mm.add('(max-width: 1023px)', () => {
                const tweens: gsap.core.Animation[] = []
                const startYMobile = window.innerHeight * 0.5
                for (let i = 0; i < parallaxColsMobile.length; i++) {
                    const col = parallaxColsMobile[i]
                    const [startY, endY] = i === 0 ? MOBILE_LEFT_RAIL_PARALLAX_Y : ([startYMobile, -200] as const)
                    gsap.set(col, { y: startY, force3D: true })
                    tweens.push(tl.fromTo(col, { y: startY }, { y: endY, ease: 'none', duration: wordTimelineEnd, immediateRender: false }, 0))
                }
                return () => { tweens.forEach((t) => t.kill()) }
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
                clearAboutGsapState(root)
            }
        },
        {
            scope: pinRef,
            dependencies: [prefersReducedMotion, fixedHelicopterOpacityRef, fixedRingsRef, clearAboutGsapState],
        }
    )

    return (
        <div
            ref={sectionRef as React.RefObject<HTMLDivElement>}
            className="relative"
        >
            <Section
                id="about"
                variant="default"
                paddingY="none"
                style={{ isolation: 'auto', overflow: 'visible' }}
                className="bg-transparent text-brand-black overflow-visible relative"
            >
                <div ref={pinRef} className="relative z-[55] w-full">
                    <div data-about-stage className="relative min-h-svh w-full">
                        <div
                            data-about-overlay
                            className="pointer-events-none absolute inset-0 z-[60] flex min-h-svh items-center justify-center overflow-x-visible overflow-y-clip p-3 sm:p-5 md:p-6"
                        >
                            <div
                                data-about-orbit
                                style={ABOUT_REVEAL_ORBIT_VARS}
                                className={cn(
                                    'relative mx-auto flex w-full max-w-[min(1400px,calc(100vw-1.5rem))] flex-row items-start justify-center gap-2 overflow-visible sm:gap-3 md:gap-3 lg:items-center lg:gap-4',
                                    'max-lg:[--about-card:clamp(4.75rem,16vw,10.5rem)] max-lg:[--about-stack-gap:max(1.5rem,7vh)] max-lg:[--about-stagger-inner:calc(0.5*var(--about-card)+0.5*var(--about-stack-gap))]',
                                    'sm:max-lg:[--about-card:clamp(5.5rem,17.5vw,12.5rem)] sm:max-lg:[--about-stack-gap:max(1.625rem,7.5vh)]',
                                    'md:max-lg:[--about-card:clamp(6.25rem,18.5vw,13.75rem)] md:max-lg:[--about-stack-gap:max(1.75rem,8vh)]',
                                    'xl:[--about-stack-gap:max(6.75rem,25.5vh)]',
                                    'min-h-[min(50svh,400px)] sm:min-h-[min(54svh,440px)] md:min-h-[min(56svh,480px)] lg:min-h-[min(58svh,520px)] xl:min-h-[min(62svh,600px)]'
                                )}
                            >
                                <div data-about-parallax-col-mobile className="shrink-0 will-change-transform lg:hidden">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP.outer }}>
                                        <AboutRevealColumn images={MOBILE_LEFT_RAIL_SLOTS} keyPrefix="m-left" registerHandoffCard={registerHandoffCard} registerMosaicAnchor={registerMosaicAnchor} />
                                    </div>
                                </div>

                                <div data-about-parallax-col-desktop className="hidden shrink-0 will-change-transform lg:block">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[0].stagger] }}>
                                        <AboutRevealColumn images={DESKTOP_MOSAIC_SLOTS[0]} keyPrefix="col0" />
                                    </div>
                                </div>

                                <div data-about-parallax-col-desktop className="hidden shrink-0 will-change-transform lg:block">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[1].stagger] }}>
                                        <AboutRevealColumn images={DESKTOP_MOSAIC_SLOTS[1]} keyPrefix="col1" registerHandoffCard={registerHandoffCard} registerMosaicAnchor={registerMosaicAnchor} />
                                    </div>
                                </div>

                                <div
                                    data-about-copy
                                    className="pointer-events-auto relative z-[90] flex min-h-0 max-w-[min(896px,calc(100vw-1.25rem))] min-w-0 flex-1 shrink-0 flex-col items-center justify-center self-center px-1 sm:px-2 md:max-w-4xl md:px-2 gap-4 sm:gap-5"
                                >
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[100]">
                                        <div data-about-center-image className="pointer-events-auto relative z-50 will-change-transform">
                                            <div className={cn(
                                                'relative aspect-square w-(--about-card) shrink-0 overflow-visible',
                                                'rounded-[18px] border-2 border-[#090202]/8 p-1.5 sm:rounded-[24px] sm:p-2',
                                                'bg-about-reveal-frame-outer/8 shadow-[0_14px_44px_-18px_rgba(9,9,11,0.22)]',
                                                'backdrop-blur-none md:backdrop-blur-md lg:backdrop-blur-xl',
                                            )}>
                                                <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-linear-to-br from-transparent from-40% via-transparent via-55% to-[#090202]/8 sm:rounded-[22px]" />
                                                <div className="relative z-1 size-full overflow-hidden rounded-[16px] border-2 border-white bg-white sm:rounded-[22px]">
                                                    <Image src="/images/about-us-reveal-03.png" alt="Telugu Airlines helicopter in flight" fill sizes="(max-width: 639px) 180px, (max-width: 1023px) 240px, 300px" className="object-cover object-center" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div data-about-badge className="relative z-50 flex flex-col items-center gap-1.5 sm:gap-2">
                                        <span className="inline-flex items-center gap-2">
                                            <Image src="/images/black-asterisk.svg" width={14} height={14} alt="" className="h-[14px] w-[14px] shrink-0" aria-hidden />
                                            <span className="text-brand-black [font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase">About Us</span>
                                        </span>
                                        <Image src="/images/header-line.svg" width={364} height={12} alt="" className="h-auto w-[min(200px,calc(100vw-2.5rem))] max-w-full shrink-0 sm:w-[min(220px,calc(100vw-2rem))]" aria-hidden />
                                    </div>

                                    <div data-about-copy-inner className="w-full">
                                        <p className={cn(
                                            'mx-auto block w-full text-center',
                                            'max-w-[min(22rem,calc(100vw-1.5rem))] sm:max-w-[min(34rem,calc(100vw-2rem))] md:max-w-[min(40rem,calc(100vw-2.25rem))]',
                                            'text-[16px] leading-[26px] tracking-[-0.015em]',
                                            'sm:text-[18px] sm:leading-[28px] sm:tracking-[-0.018em]',
                                            'md:text-[20px] md:leading-[30px] md:tracking-[-0.02em]',
                                            'lg:max-w-[min(46rem,calc(100vw-2.75rem))] lg:text-[24px] lg:leading-[34px] lg:tracking-tight',
                                            'xl:max-w-[min(52rem,calc(100vw-4rem))] xl:text-[28px] xl:leading-[38px] xl:tracking-[-0.032em]',
                                            '2xl:text-[34px] 2xl:leading-[44px] 2xl:tracking-[-0.04em]',
                                            '[font-family:var(--font-halant)] font-normal will-change-[opacity]'
                                        )}>
                                            {ABOUT_PARAGRAPH}
                                        </p>
                                    </div>
                                </div>

                                <div data-about-parallax-col-desktop className="hidden shrink-0 will-change-transform lg:block">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[2].stagger] }}>
                                        <AboutRevealColumn images={DESKTOP_MOSAIC_SLOTS[2]} keyPrefix="col2" />
                                    </div>
                                </div>

                                <div data-about-parallax-col-desktop className="hidden shrink-0 will-change-transform lg:block">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP[DESKTOP_MOSAIC_COLUMNS[3].stagger] }}>
                                        <AboutRevealColumn images={DESKTOP_MOSAIC_SLOTS[3]} keyPrefix="col3" />
                                    </div>
                                </div>

                                <div data-about-parallax-col-mobile className="shrink-0 will-change-transform lg:hidden">
                                    <div style={{ marginTop: MOSAIC_STAGGER_MARGIN_TOP.outer }}>
                                        <AboutRevealColumn images={MOBILE_RIGHT_RAIL_SLOTS} keyPrefix="m-right" />
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