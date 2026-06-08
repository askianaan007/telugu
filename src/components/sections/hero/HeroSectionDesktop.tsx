'use client'

// src/components/sections/hero/HeroSectionDesktop.tsx

import {
    motion as m,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from 'framer-motion'
import Image from 'next/image'
import { Fragment, useEffect, useMemo, useRef } from 'react'

import { HeroSilkBackground } from '@/components/backgrounds/HeroSilkBackground'
import { AboutHelicopterRings } from '@/components/sections/about/AboutHelicopterRings'
import { ActionButton } from '@/components/ui/ActionButton'
import { TrustClientsBadge } from '@/components/ui/TrustClientsBadge'
import { easings, fadeInUp, staggerContainer } from '@/lib/animations'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import {
    cardBorderStyle,
    desktopBottomFade,
    HERO_MAIN_COLUMN_LAYOUT,
    HERO_PRIMARY_WORDS_LINE1,
    HERO_PRIMARY_WORDS_LINE2,
    HERO_WORD_MASK_CLASS,
} from './heroShared'
import type { HeroSectionProps } from '../HeroSection'


// ─── Cloud rail (desktop only) ─────────────────────────────────────────────────

function HeroBottomCloudRail({
    leftX, rightX, cloudY, cloudOpacity,
}: {
    leftX?: MotionValue<string>
    rightX?: MotionValue<string>
    cloudY?: MotionValue<string>
    cloudOpacity?: MotionValue<number>
}) {
    const driven = leftX != null
    const gpu = driven ? 'will-change-[transform,opacity]' : undefined

    return (
        <m.div
            aria-hidden
            style={cloudOpacity != null ? { opacity: cloudOpacity } : undefined}
            className={cn(
                'pointer-events-none absolute bottom-0 left-1/2 z-35',
                'h-[60%] max-w-none -translate-x-1/2',
                'w-[210%] xl:w-[190%] 2xl:w-[170%]',
                gpu,
            )}
        >
            <div className="relative z-0 flex h-full w-full">
                <m.div style={leftX != null ? { x: leftX } : undefined}
                    className={cn('relative h-full min-h-0 min-w-0 flex-1', gpu)}>
                    <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw"
                        className="object-contain object-left opacity-50" />
                </m.div>
                <m.div style={rightX != null ? { x: rightX } : undefined}
                    className={cn('relative h-full min-h-0 min-w-0 flex-1', gpu)}>
                    <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw"
                        className="scale-x-[-1] object-contain object-right opacity-50" />
                </m.div>
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
                <m.div style={cloudY != null ? { y: cloudY } : undefined}
                    className={cn('relative h-[92%] w-[32%] max-w-2xl min-w-45', gpu)}>
                    <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw"
                        className="object-contain object-bottom opacity-50" />
                </m.div>
            </div>
        </m.div>
    )
}


export function HeroSectionDesktop({
    aboutSectionRef,
    onHelicopterRef,
    onRingsRef,
}: HeroSectionProps) {
    const containerRef = useRef<HTMLElement>(null)
    const fixedHelicopterOpacityRef = useRef<HTMLDivElement>(null)
    const fixedRingsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        onHelicopterRef?.(fixedHelicopterOpacityRef.current)
        onRingsRef?.(fixedRingsRef.current)
    }, [onHelicopterRef, onRingsRef])

    const isBookingModalOpen = useUiStore((s) => s.isBookingModalOpen)
    const openBookingModal = useUiStore((s) => s.openBookingModal)
    const RM = useReducedMotion()

    // ── Scroll motion ──────────────────────────────────────────────────────────

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    })
    const smooth = useSpring(scrollYProgress, { stiffness: 130, damping: 30, mass: 0.3 })
    const lgScrollDrive = useTransform(smooth, [0, 0.07, 1], [0, 0, 1])

    const bgY = useTransform(smooth, [0, 1], ['0%', '18%'])
    const bgScale = useTransform(smooth, [0, 1], [1.08, 1.0])
    const circleY = useTransform(smooth, [0, 1], ['0%', '10%'])
    const circleScale = useTransform(smooth, [0, 1], [1.04, 1.0])

    const textY = useTransform(lgScrollDrive, [0, 1], ['0%', '22%'])
    const textOpacity = useTransform(smooth, [0, 0.32, 0.5, 0.66, 0.8], [1, 0.96, 0.5, 0.12, 0])
    const titleColor = useTransform(smooth, [0, 0.32, 0.5, 0.66], ['#1C1C1C', '#353533', '#7A7876', '#B5B3B1'])
    const bodyColor = useTransform(smooth, [0, 0.32, 0.5, 0.66], ['#3F3F3E', '#555350', '#8E8C89', '#B9B7B4'])
    const ctaOpacity = useTransform(smooth, [0, 0.22, 0.38, 0.52], [1, 0.78, 0.32, 0])
    const ctaPointer = useTransform(ctaOpacity, (v) => v < 0.05 ? 'none' : 'auto')

    const heliScale = useTransform(smooth, [0, 1], [1, 1.08])
    const heliRotate = useTransform(smooth, [0, 1], [0, -2.5])

    const ringsOpacity = useTransform(smooth, [0, 0.45, 0.85], [0, 0, 1.0])
    const ringsScale = useTransform(smooth, [0, 0.45, 0.85], [0.5, 0.5, 1.0])

    const cloudLeft = useTransform(smooth, [0, 0.03, 0.14, 0.9], ['0%', '0%', '-10%', '-38%'])
    const cloudRight = useTransform(smooth, [0, 0.03, 0.14, 0.9], ['0%', '0%', '10%', '38%'])
    const cloudY = useTransform(smooth, [0, 0.03, 0.2, 0.74], ['0%', '0%', '6%', '22%'])
    const cloudOpacity = useTransform(smooth, [0, 0.03, 0.52, 0.9], [1, 1, 1, 0])

    const { scrollYProgress: aboutProgress } = useScroll({
        target: aboutSectionRef,
        offset: ['start 30%', 'start -20%'],
    })
    const smoothAbout = useSpring(aboutProgress, { stiffness: 60, damping: 20, mass: 0.5 })
    const helicopterOpacity = useTransform(smoothAbout, [0, 0.6, 1], [1, 0.8, 0])
    const helicopterY = useTransform(smoothAbout, [0, 1], ['0vh', '10vh'])

    const fixedLayerStyle = useMemo(() => ({
        zIndex: 'var(--z-helicopter)' as string,
        opacity: aboutSectionRef ? helicopterOpacity : 1,
        y: aboutSectionRef ? helicopterY : 0,
    }), [aboutSectionRef, helicopterOpacity, helicopterY])

    return (
        <>
            {/* Fixed helicopter layer */}
            <m.div
                className={cn('pointer-events-none fixed inset-0', isBookingModalOpen && 'invisible')}
                style={fixedLayerStyle}
            >
                <div className={cn('relative mx-auto h-full', HERO_MAIN_COLUMN_LAYOUT)}>

                    {/*
                     * RINGS — absolute center of the fixed layer (unchanged from original).
                     * The rings component fills the full layer and self-centers.
                     */}
                    {!RM && (
                        <m.div
                            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center will-change-[opacity,transform]"
                            style={{ opacity: ringsOpacity, scale: ringsScale }}
                        >
                            <AboutHelicopterRings ref={fixedRingsRef} className="mx-auto" />
                        </m.div>
                    )}

                    {/*
                     * HELICOPTER — centered in the fixed layer (same as rings center).
                     * Uses absolute inset-0 + flex center so it always sits at the
                     * geometric center of the fixed layer, co-located with the rings.
                     * No vh, no breakpoint offsets.
                     */}
                    <div
                        ref={fixedHelicopterOpacityRef}
                        className="absolute inset-0 z-20 flex items-center justify-center"
                        style={{ paddingTop: '8%' }}
                    >
                        <m.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            style={RM ? undefined : { scale: heliScale, rotate: heliRotate }}
                            className="relative w-full max-w-7xl will-change-transform lg:w-[70%] xl:w-[65%] 2xl:w-full"
                        >
                            {/* Floating animation */}
                            <m.div
                                animate={RM ? false : { y: [0, -10, 0] }}
                                transition={{ duration: 6, ease: easings.inOut, repeat: Infinity }}
                                className="relative aspect-4/3 w-full"
                            >
                                <Image
                                    src="/images/hero-helicopter.png"
                                    alt="Telugu Airlines helicopter"
                                    fill priority
                                    sizes="(max-width: 1536px) 74vw, 80rem"
                                    className="object-contain object-bottom drop-shadow-[0_32px_48px_rgba(0,0,0,0.28)] select-none lg:object-[center_78%] xl:object-[center_80%]"
                                />
                            </m.div>

                            {/* Shadow blob */}
                            <div
                                aria-hidden
                                className="bg-brand-black/30 absolute -bottom-2 left-1/2 h-10 w-1/2 -translate-x-1/2 rounded-[50%] blur-2xl"
                            />
                        </m.div>
                    </div>

                    {/*
                     * CTA — pinned to bottom of the fixed viewport layer.
                     * Completely independent from helicopter positioning.
                     * Fades with scroll as before.
                     */}
                    <m.div
                        style={RM ? undefined : { opacity: ctaOpacity, pointerEvents: ctaPointer }}
                        className="pointer-events-auto absolute inset-x-0 z-40 flex justify-center px-6 bottom-[max(1.25rem,env(safe-area-inset-bottom))] xl:bottom-[max(1.75rem,env(safe-area-inset-bottom))]"
                    >
                        <ActionButton onClick={openBookingModal} label="Book The Flight" />
                    </m.div>
                </div>
            </m.div>

            {/* Main section */}
            <div className="relative">
                <section ref={containerRef} id="hero" className="bg-brand-surface relative isolate overflow-hidden">
                    {/* Ambient bg circles */}
                    <div aria-hidden className="pointer-events-none absolute top-[-25%] left-[-25%] z-0 size-[min(90vw,900px)] opacity-60">
                        <Image src="/images/home-hero-bg-circle.png" alt="" fill className="object-contain blur-[20px]" />
                    </div>
                    <div aria-hidden className="pointer-events-none absolute top-[-35%] right-[-35%] z-0 size-[min(90vw,900px)] opacity-60">
                        <Image src="/images/home-hero-bg-circle.png" alt="" fill className="object-contain blur-[20px]" />
                    </div>

                    <div className={cn('relative z-10 mt-4', HERO_MAIN_COLUMN_LAYOUT)}>
                        <div
                            className={cn(
                                'relative mx-auto w-full overflow-hidden',
                                'rounded-t-[40px] rounded-b-none border-x-8 border-t-8 border-b-0',
                                'h-auto aspect-1408/1114 max-h-230 min-h-[min(70svh,540px)]',
                                'xl:min-h-[min(68svh,520px)]',
                            )}
                            style={cardBorderStyle}
                        >
                            {/* Backgrounds */}
                            <div className="pointer-events-none absolute inset-0 isolate">
                                <m.div
                                    style={RM ? undefined : { y: bgY, scale: bgScale }}
                                    className="pointer-events-none absolute inset-0 z-5 rounded-t-[40px] rounded-b-none will-change-transform"
                                    aria-hidden
                                >
                                    <div className="absolute inset-0 h-full w-full">
                                        <HeroSilkBackground reduceMotion={RM} />
                                    </div>
                                </m.div>
                                <m.div
                                    aria-hidden
                                    style={RM ? undefined : { y: circleY, scale: circleScale }}
                                    className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-[8%] will-change-transform"
                                >
                                    <div className="relative size-[min(52vw,640px)] shrink-0 xl:size-[min(48vw,720px)]">
                                        <Image src="/images/home-hero-bg-circle.png" alt="" fill
                                            className="object-contain opacity-40 blur-[56px]" />
                                    </div>
                                </m.div>
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-x-0 bottom-0 z-30 lg:h-[55%] xl:h-[58%] 2xl:h-[60%]"
                                    style={{ background: desktopBottomFade }}
                                />
                            </div>

                            {/* Cloud rail */}
                            <HeroBottomCloudRail
                                leftX={RM ? undefined : cloudLeft}
                                rightX={RM ? undefined : cloudRight}
                                cloudY={RM ? undefined : cloudY}
                                cloudOpacity={RM ? undefined : cloudOpacity}
                            />

                            {/* Text — scroll driven */}
                            <div className="relative z-40 flex min-h-0 flex-col p-6">
                                <m.div
                                    style={RM ? undefined : { y: textY, opacity: textOpacity }}
                                    variants={staggerContainer(0.1, 0.06)}
                                    initial="hidden"
                                    animate="visible"
                                    className="relative z-30 mx-auto w-full max-w-7xl grid lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-2 items-start gap-x-12 gap-y-0 xl:gap-x-16 2xl:gap-x-20"
                                >
                                    <div className="flex flex-col gap-6 max-w-xl justify-start pt-16 xl:max-w-2xl xl:gap-3 xl:pt-14 2xl:max-w-136 2xl:pt-16">
                                        <m.div variants={fadeInUp} className="flex flex-row items-center gap-1 -ml-2">
                                            <div className="relative flex size-18 shrink-0 rotate-180 items-center justify-center xl:size-20">
                                                <Image src="/images/gradient-gold-circle.png" alt="" width={80} height={80}
                                                    className="size-18 rotate-180 object-contain xl:size-20" />
                                            </div>
                                            <div
                                                aria-hidden
                                                className="h-0.75 w-[min(16rem,calc(100%-5.5rem))] shrink-0 self-center rounded-[48px] xl:w-[min(18rem,calc(100%-6rem))]"
                                                style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0) 68.74%)' }}
                                            />
                                        </m.div>
                                        <m.div variants={fadeInUp} style={RM ? undefined : { color: titleColor }}>
                                            <h1
                                                aria-label="Elevating Aviation Excellence"
                                                className="[font-family:var(--font-halant)] font-normal text-current lg:text-[clamp(2.5rem,3.2vw,3.25rem)] lg:leading-[1.1] lg:tracking-[-0.039em] xl:text-[clamp(3.5rem,4.5vw,4.25rem)] xl:leading-[1.09] xl:tracking-[-0.041em] 2xl:text-[clamp(4rem,4.5vw,4.75rem)] 2xl:leading-[1.07] 2xl:tracking-[-0.043em]"
                                            >
                                                {HERO_PRIMARY_WORDS_LINE1.map((word, i) => (
                                                    <Fragment key={word}>
                                                        {i > 0 ? '\u00A0' : null}
                                                        <span aria-hidden className={HERO_WORD_MASK_CLASS}>
                                                            <span data-word-inner className="inline-block">{word}</span>
                                                        </span>
                                                    </Fragment>
                                                ))}
                                                <br aria-hidden="true" />
                                                {HERO_PRIMARY_WORDS_LINE2.map((word) => (
                                                    <span key={word} aria-hidden className={HERO_WORD_MASK_CLASS}>
                                                        <span data-word-inner className="inline-block">{word}</span>
                                                    </span>
                                                ))}
                                            </h1>
                                        </m.div>
                                    </div>

                                    <div className="flex flex-col items-end gap-6 pt-20 text-right xl:gap-7 xl:pt-22 2xl:pt-24">
                                        <m.div variants={fadeInUp} className="self-end">
                                            <TrustClientsBadge align="right" />
                                        </m.div>
                                        <m.h2
                                            variants={fadeInUp}
                                            style={RM ? undefined : { color: titleColor }}
                                            className="[font-family:var(--font-halant)] font-normal text-current lg:text-[32px]
xl:text-[52px] lg:leading-[1.12] lg:whitespace-nowrap xl:leading-[1.1] xl:tracking-[-0.035em] 2xl:text-[60px] 2xl:leading-[1.08] 2xl:tracking-[-0.03em]"
                                        >
                                            Across India &amp; Beyond
                                        </m.h2>
                                        <m.p
                                            variants={fadeInUp}
                                            style={RM ? undefined : { color: bodyColor }}
                                            className="[font-family:var(--font-geist)] font-normal text-current lg:ml-auto lg:max-w-md xl:max-w-md xl:text-[17px] xl:leading-6 2xl:text-[18px] 2xl:leading-6.5"
                                        >
                                            Telugu Airlines stands as a leading aviation enterprise
                                            in India, focusing on helicopter charter services &amp;
                                            the development of heliport infrastructure.
                                        </m.p>
                                    </div>
                                </m.div>
                            </div>
                        </div>
                    </div>

                    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-75 lg:h-[40%] xl:h-[50%]" />
                </section>
            </div>
        </>
    )
}