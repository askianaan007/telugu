'use client'

import { motion as m, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import Image from 'next/image'
import { Fragment, useRef, useSyncExternalStore, useEffect, useMemo } from 'react'
import { HeroSilkBackground } from '@/components/backgrounds/HeroSilkBackground'
import { AboutHelicopterRings } from '@/components/sections/about/AboutHelicopterRings'
import { ActionButton } from '@/components/ui/ActionButton'
import { TrustClientsBadge } from '@/components/ui/TrustClientsBadge'
import { easings, fadeInUp, staggerContainer } from '@/lib/animations'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

type HeroTier = 'xs' | 'sm' | 'md' | 'lg'

function getHeroTier(): HeroTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'lg'
    if (window.matchMedia('(min-width: 768px)').matches) return 'md'
    if (window.matchMedia('(min-width: 640px)').matches) return 'sm'
    return 'xs'
}

const heroTierMqs =
    typeof window !== 'undefined'
        ? [
            window.matchMedia('(min-width: 640px)'),
            window.matchMedia('(min-width: 768px)'),
            window.matchMedia('(min-width: 1024px)'),
        ]
        : []

const subscribeHeroTier = (cb: () => void) => {
    heroTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => heroTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}
const heroTierSnapshot = () => typeof window !== 'undefined' ? getHeroTier() : 'lg'
const heroTierServerSnapshot = (): HeroTier => 'lg'

const HERO_PRIMARY_WORDS_LINE1 = ['Elevating', 'Aviation'] as const
const HERO_PRIMARY_WORDS_LINE2 = ['Excellence'] as const
const heroWordMaskClass = 'relative -m-[0.15em] inline-block overflow-hidden p-[0.15em] align-top'
const HERO_MAIN_COLUMN_LAYOUT = 'mx-auto w-full px-4 sm:px-5 md:px-6'

interface HeroBottomCloudRailProps {
    className?: string
    leftX?: MotionValue<string>
    rightX?: MotionValue<string>
    cloudY?: MotionValue<string>
    cloudOpacity?: MotionValue<number>
}

function HeroBottomCloudRail({ className, leftX, rightX, cloudY, cloudOpacity }: HeroBottomCloudRailProps) {
    const driven = leftX != null
    const gpuClass = driven ? 'will-change-[transform,opacity]' : undefined

    return (
        <m.div
            aria-hidden
            style={cloudOpacity != null ? { opacity: cloudOpacity } : undefined}
            className={cn(
                'pointer-events-none absolute bottom-[2rem] left-1/2 h-[44%] w-[170%] max-w-none -translate-x-1/2 translate-y-2',
                'sm:translate-y-3 md:bottom-[0rem] lg:bottom-[0rem] xl:bottom-[6rem] 2xl:bottom-[0rem]',
                'lg:h-[52%] lg:w-[185%]',
                gpuClass, className,
            )}
        >
            <div className="relative z-0 flex h-full w-full">
                <m.div style={leftX != null ? { x: leftX } : undefined} className={cn('relative h-full min-h-0 min-w-0 flex-1', gpuClass)}>
                    <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw" className="object-contain object-left opacity-50" />
                </m.div>
                <m.div style={rightX != null ? { x: rightX } : undefined} className={cn('relative h-full min-h-0 min-w-0 flex-1', gpuClass)}>
                    <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw" className="scale-x-[-1] object-contain object-right opacity-50" />
                </m.div>
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
                <m.div
                    style={cloudY != null ? { y: cloudY } : undefined}
                    className={cn('relative h-[88%] w-[42%] max-w-2xl min-w-45 sm:h-[90%] sm:w-[38%] lg:h-[92%] lg:w-[32%]', gpuClass)}
                >
                    <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw" className="object-contain object-bottom opacity-50" />
                </m.div>
            </div>
        </m.div>
    )
}

function HeroPrimaryHeadline({ reduceMotion }: { reduceMotion: boolean | null }) {
    return (
        <h1
            aria-label="Elevating Aviation Excellence"
            className={cn(
                '[font-family:var(--font-halant)] font-normal text-current',
                'text-[clamp(2.4rem,9vw,2.9rem)] leading-[1.07] tracking-[-0.035em]',
                'sm:text-[clamp(2.6rem,7vw,3rem)] sm:leading-[1.08] sm:tracking-[-0.037em]',
                'md:text-[clamp(2.8rem,5.5vw,3.2rem)] md:leading-[1.08]',
                'lg:text-[clamp(3rem,4.2vw,3.75rem)] lg:leading-[1.1] lg:tracking-[-0.039em]',
                'xl:text-[clamp(3.5rem,4.5vw,4.25rem)] xl:leading-[1.09] xl:tracking-[-0.041em]',
                '2xl:text-[clamp(4rem,4.5vw,4.75rem)] 2xl:leading-[1.07] 2xl:tracking-[-0.043em]',
            )}
        >
            {HERO_PRIMARY_WORDS_LINE1.map((word, i) => (
                <Fragment key={word}>
                    {i > 0 ? '\u00A0' : null}
                    <span aria-hidden className={heroWordMaskClass}>
                        <span data-word-inner className="inline-block">{word}</span>
                    </span>
                </Fragment>
            ))}
            <br aria-hidden="true" />
            {HERO_PRIMARY_WORDS_LINE2.map((word) => (
                <span key={word} aria-hidden className={heroWordMaskClass}>
                    <span data-word-inner className="inline-block">{word}</span>
                </span>
            ))}
        </h1>
    )
}

function HeroBookNowButton() {
    const openBookingModal = useUiStore((s) => s.openBookingModal)
    return <ActionButton onClick={openBookingModal} label="Book The Flight" />
}

const cardBorderStyle = {
    borderColor: 'transparent',
    backgroundImage: 'linear-gradient(#f0f1f2, #f0f1f2), linear-gradient(180deg, #ffffff 0%, #f0f1f2 100%)',
    backgroundOrigin: 'padding-box, border-box',
    backgroundClip: 'padding-box, border-box',
} as const

export function HeroSection({
    aboutSectionRef,
    onHelicopterRef,
    onRingsRef,
}: {
    aboutSectionRef?: React.RefObject<HTMLElement | null>
    onHelicopterRef?: (el: HTMLDivElement | null) => void
    onRingsRef?: (el: HTMLDivElement | null) => void
} = {}) {
    const containerRef = useRef<HTMLElement>(null)
    const fixedHelicopterOpacityRef = useRef<HTMLDivElement>(null)
    const fixedRingsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        onHelicopterRef?.(fixedHelicopterOpacityRef.current)
        onRingsRef?.(fixedRingsRef.current)
    }, [onHelicopterRef, onRingsRef])

    const isBookingModalOpen = useUiStore((s) => s.isBookingModalOpen)
    const RM = useReducedMotion()
    const tier = useSyncExternalStore(subscribeHeroTier, heroTierSnapshot, heroTierServerSnapshot)
    const isLg = tier === 'lg'

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    })

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.35 })
    const textScrollSpring = useSpring(scrollYProgress, { stiffness: 260, damping: 36, mass: 0.2 })
    const lgScrollDrive = useTransform(smoothProgress, [0, 0.07, 1], [0, 0, 1])

    const bgY = useTransform(smoothProgress, [0, 1], ['0%', '18%'])
    const bgScale = useTransform(smoothProgress, [0, 1], [1.08, 1.0])
    const circleY = useTransform(smoothProgress, [0, 1], ['0%', '10%'])
    const circleScale = useTransform(smoothProgress, [0, 1], [1.04, 1.0])

    const textYLg = useTransform(lgScrollDrive, [0, 1], ['0%', '22%'])
    const textOpacityLg = useTransform(textScrollSpring, [0, 0.32, 0.5, 0.66, 0.8], [1, 0.96, 0.5, 0.12, 0])
    const heroTitleColorLg = useTransform(textScrollSpring, [0, 0.32, 0.5, 0.66], ['#1C1C1C', '#353533', '#7A7876', '#B5B3B1'])
    const heroBodyColorLg = useTransform(textScrollSpring, [0, 0.32, 0.5, 0.66], ['#3F3F3E', '#555350', '#8E8C89', '#B9B7B4'])
    const bookFlightOpacityLg = useTransform(textScrollSpring, [0, 0.22, 0.38, 0.52], [1, 0.78, 0.32, 0])
    const bookFlightPointerEventsLg = useTransform(bookFlightOpacityLg, (v) => (v < 0.05 ? 'none' : 'auto'))

    const heliLift = useTransform(smoothProgress, [0, 0.55, 1], ['38vh', '22vh', '22vh'])
    const heliScale = useTransform(smoothProgress, [0, 1], [1, 1.08])
    const heliRotate = useTransform(smoothProgress, [0, 1], [0, -2.5])
    const ringsOpacity = useTransform(smoothProgress, [0, 0.45, 0.85], [0, 0, 1.0])
    const ringsScale = useTransform(smoothProgress, [0, 0.45, 0.85], [0.5, 0.5, 1.0])

    const cloudLeftXLg = useTransform(smoothProgress, [0, 0.03, 0.14, 0.9], ['0%', '0%', '-10%', '-38%'])
    const cloudRightXLg = useTransform(smoothProgress, [0, 0.03, 0.14, 0.9], ['0%', '0%', '10%', '38%'])
    const cloudYLg = useTransform(smoothProgress, [0, 0.03, 0.2, 0.74], ['0%', '0%', '6%', '22%'])
    const cloudOpacityLg = useTransform(smoothProgress, [0, 0.03, 0.52, 0.9], [1, 1, 1, 0])

    const { scrollYProgress: aboutScrollProgress } = useScroll({
        target: aboutSectionRef,
        offset: ['start 30%', 'start -20%'],
    })
    const smoothAboutProgress = useSpring(aboutScrollProgress, { stiffness: 60, damping: 20, mass: 0.5 })
    const helicopterOpacity = useTransform(smoothAboutProgress, [0, 0.6, 1], [1, 0.8, 0])
    const helicopterY = useTransform(smoothAboutProgress, [0, 1], ['0vh', '10vh'])

    const fixedLayerStyle = useMemo(() => ({
        zIndex: 'var(--z-helicopter)' as string,
        opacity: aboutSectionRef ? helicopterOpacity : 1,
        y: aboutSectionRef ? helicopterY : 0,
    }), [aboutSectionRef, helicopterOpacity, helicopterY])

    return (
        <>
            {isLg && (
                <m.div
                    className={cn('pointer-events-none fixed inset-0', isBookingModalOpen && 'invisible')}
                    style={fixedLayerStyle}
                >
                    <div className={cn('relative mx-auto h-full', HERO_MAIN_COLUMN_LAYOUT)}>
                        {!RM && (
                            <m.div
                                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center will-change-[opacity,transform]"
                                style={{ opacity: ringsOpacity, scale: ringsScale }}
                            >
                                <AboutHelicopterRings ref={fixedRingsRef} className="mx-auto" />
                            </m.div>
                        )}

                        <div
                            ref={fixedHelicopterOpacityRef}
                            className="relative isolate z-20 h-full min-h-[min(65svh,720px)] overflow-visible"
                        >
                            <m.div
                                className="absolute inset-0 z-30 hidden items-center justify-center lg:flex"
                                style={RM ? undefined : { y: heliLift }}
                            >
                                <div className="flex w-full max-w-full flex-col items-center justify-center lg:-translate-y-[min(5vh,3.5rem)] xl:-translate-y-[min(15vh,15rem)] 2xl:-translate-y-[min(15vh,15rem)]">
                                    <div className="relative flex w-[min(92vw,42rem)] max-w-5xl flex-col items-center justify-end gap-0 opacity-90 lg:w-[96%] lg:max-w-7xl xl:w-[min(99vw,90rem)] 2xl:w-[min(99vw,88rem)]">
                                        <m.div
                                            initial="hidden"
                                            animate="visible"
                                            variants={fadeInUp}
                                            style={RM ? undefined : { scale: heliScale, rotate: heliRotate }}
                                            className="relative z-10 aspect-4/3 w-full shrink-0 lg:max-h-[min(80vh,780px)] lg:w-[160%] lg:-translate-y-22 xl:max-h-[min(78vh,780px)] xl:w-[140%] xl:-translate-y-15 2xl:max-h-[min(82vh,860px)] 2xl:w-[150%] 2xl:-translate-y-24"
                                        >
                                            <m.div
                                                animate={RM ? false : { y: [0, -10, 0] }}
                                                transition={{ duration: 6, ease: easings.inOut, repeat: Infinity }}
                                                className="relative h-full w-full"
                                            >
                                                <Image
                                                    src="/images/hero-helicopter.png"
                                                    alt="Telugu Airlines helicopter"
                                                    fill
                                                    priority
                                                    sizes="(max-width: 1536px) 74vw, 80rem"
                                                    className="object-contain object-bottom drop-shadow-[0_32px_48px_rgba(0,0,0,0.28)] select-none lg:object-[center_78%] xl:object-[center_80%]"
                                                />
                                            </m.div>
                                        </m.div>
                                        <div aria-hidden className="bg-brand-black/30 absolute -bottom-2 left-1/2 h-10 w-1/2 -translate-x-1/2 rounded-[50%] blur-2xl" />
                                    </div>
                                </div>
                            </m.div>

                            <m.div
                                style={RM ? undefined : { opacity: bookFlightOpacityLg, pointerEvents: bookFlightPointerEventsLg }}
                                className="pointer-events-auto absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 hidden justify-center px-6 lg:flex xl:bottom-[max(1.75rem,env(safe-area-inset-bottom))]"
                            >
                                <HeroBookNowButton />
                            </m.div>
                        </div>
                    </div>
                </m.div>
            )}

            <div className="relative">
                <section ref={containerRef} id="hero" className="bg-brand-surface relative isolate overflow-hidden">
                    <div aria-hidden className="pointer-events-none absolute top-[-25%] left-[-25%] z-0 size-[min(90vw,900px)] opacity-60">
                        <Image src="/images/home-hero-bg-circle.png" alt="" fill className="object-contain blur-[20px]" />
                    </div>
                    <div aria-hidden className="pointer-events-none absolute top-[-35%] right-[-35%] z-0 size-[min(90vw,900px)] opacity-60">
                        <Image src="/images/home-hero-bg-circle.png" alt="" fill className="object-contain blur-[20px]" />
                    </div>

                    <div className={cn('relative z-10 mt-3 sm:mt-4', HERO_MAIN_COLUMN_LAYOUT)}>
                        <div
                            className={cn(
                                'relative mx-auto w-full overflow-hidden',
                                'rounded-t-[28px] rounded-b-none border-x-[5px] border-t-[5px] border-b-0',
                                'sm:rounded-t-[34px] sm:border-x-[6px] sm:border-t-[6px]',
                                'lg:rounded-t-[40px] lg:border-x-8 lg:border-t-8',
                                'min-h-[min(91svh,680px)] sm:min-h-[min(90svh,700px)] md:min-h-[min(90svh,780px)]',
                                'lg:aspect-1408/1114 lg:max-h-230 lg:min-h-[min(70svh,540px)]',
                                'xl:min-h-[min(68svh,520px)]',
                            )}
                            style={cardBorderStyle}
                        >
                            <div className="pointer-events-none absolute inset-0 isolate">
                                <div
                                    aria-hidden
                                    className="absolute inset-0 z-5 lg:hidden"
                                    style={{ background: 'linear-gradient(168deg, #3d7eb5 0%, #4d8ec4 18%, #5B9FD4 38%, #74b2df 58%, #a4cfee 78%, #d8edf8 100%)' }}
                                />
                                <m.div
                                    style={RM ? undefined : { y: bgY, scale: bgScale }}
                                    className="pointer-events-none absolute inset-0 z-5 hidden rounded-t-[40px] rounded-b-none will-change-transform lg:block"
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
                                    <div className="relative size-[min(80vw,420px)] shrink-0 sm:size-[min(70vw,480px)] md:size-[min(62vw,520px)] lg:size-[min(52vw,640px)] xl:size-[min(48vw,720px)]">
                                        <Image src="/images/home-hero-bg-circle.png" alt="" fill className="object-contain opacity-30 blur-[48px] lg:opacity-40 lg:blur-[56px]" />
                                    </div>
                                </m.div>
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[45%] sm:h-[48%] md:h-[50%] lg:h-[55%] xl:h-[58%] 2xl:h-[60%]"
                                    style={{ background: 'linear-gradient(to top, #f0f1f2 0%, #f0f1f2 18%, rgba(240,241,242,0.95) 40%, rgba(240,241,242,0.6) 65%, transparent 100%)' }}
                                />
                            </div>

                            <HeroBottomCloudRail
                                className="z-55"
                                leftX={RM || !isLg ? undefined : cloudLeftXLg}
                                rightX={RM || !isLg ? undefined : cloudRightXLg}
                                cloudY={RM || !isLg ? undefined : cloudYLg}
                                cloudOpacity={RM || !isLg ? undefined : cloudOpacityLg}
                            />

                            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[28%] z-36 hidden lg:flex justify-center">
                                <div className="w-[60%] max-w-225">
                                    <Image src="/images/hero-heli-pad.png" alt="" width={800} height={160} className="w-full object-contain opacity-90" />
                                </div>
                            </div>

                            <div className="relative z-40 flex min-h-0 flex-col p-4 pb-7 sm:p-5 sm:pb-8 md:p-6 md:pb-10">
                                <m.div
                                    style={RM || !isLg ? undefined : { y: textYLg, opacity: textOpacityLg }}
                                    variants={staggerContainer(0.1, 0.06)}
                                    initial="hidden"
                                    animate="visible"
                                    className={cn(
                                        'relative z-30 mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5 md:gap-5',
                                        'lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 lg:gap-y-0',
                                        'xl:gap-x-16 2xl:gap-x-20',
                                    )}
                                >
                                    <div className={cn(
                                        'flex flex-col gap-4 pt-20 sm:pt-22 md:pt-24',
                                        'lg:max-w-xl lg:justify-start lg:gap-6 lg:pt-16',
                                        'xl:max-w-2xl xl:gap-3 xl:pt-14 2xl:max-w-136 2xl:pt-16',
                                    )}>
                                        <m.div variants={fadeInUp} className="flex flex-row items-center gap-1 -ml-1 lg:-ml-2">
                                            <div className="relative flex size-11 shrink-0 rotate-180 items-center justify-center sm:size-12 lg:size-18 xl:size-20">
                                                <Image src="/images/gradient-gold-circle.png" alt="" width={80} height={80} className="size-11 rotate-180 object-contain sm:size-12 lg:size-18 xl:size-20" />
                                            </div>
                                            <div
                                                aria-hidden
                                                className="h-0.75 w-[min(11rem,calc(100%-3rem))] shrink-0 self-center rounded-[48px] sm:w-[min(12rem,calc(100%-3.5rem))] lg:w-[min(16rem,calc(100%-5.5rem))] xl:w-[min(18rem,calc(100%-6rem))]"
                                                style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0) 68.74%)' }}
                                            />
                                        </m.div>
                                        <m.div variants={fadeInUp} style={RM || !isLg ? undefined : { color: heroTitleColorLg }}>
                                            <HeroPrimaryHeadline reduceMotion={RM} />
                                        </m.div>
                                        <m.div variants={fadeInUp} className="mt-1 lg:hidden">
                                            <HeroBookNowButton />
                                        </m.div>
                                    </div>

                                    <div className={cn(
                                        'flex flex-col gap-3 sm:gap-4',
                                        'lg:items-end lg:gap-6 lg:pt-20 lg:text-right',
                                        'xl:gap-7 xl:pt-22 2xl:pt-24',
                                    )}>
                                        <m.div variants={fadeInUp} className="lg:self-end">
                                            <TrustClientsBadge align="right" />
                                        </m.div>
                                        <m.h2
                                            variants={fadeInUp}
                                            style={RM || !isLg ? undefined : { color: heroTitleColorLg }}
                                            className={cn(
                                                '[font-family:var(--font-halant)] font-normal text-current',
                                                'text-[clamp(1.5rem,6vw,2rem)] leading-[1.1] tracking-[-0.04em]',
                                                'sm:text-[clamp(1.6rem,4.5vw,2.1rem)]',
                                                'md:text-[clamp(1.5rem,3.25vw,2rem)] md:leading-[1.12] md:tracking-[-0.035em]',
                                                'lg:max-w-none lg:text-[40px] lg:leading-[1.12] lg:whitespace-nowrap',
                                                'xl:text-[52px] xl:leading-[1.1] xl:tracking-[-0.035em]',
                                                '2xl:text-[60px] 2xl:leading-[1.08] 2xl:tracking-[-0.03em]',
                                            )}
                                        >
                                            Across India &amp; Beyond
                                        </m.h2>
                                        <m.p
                                            variants={fadeInUp}
                                            style={RM || !isLg ? undefined : { color: heroBodyColorLg }}
                                            className={cn(
                                                '[font-family:var(--font-geist)] font-normal text-current',
                                                'max-w-[min(28rem,calc(100vw-2rem))] text-[14px] leading-5',
                                                'sm:text-[15px] sm:leading-5.25',
                                                'md:max-w-104 md:text-[15px]',
                                                'lg:ml-auto lg:max-w-107',
                                                'xl:max-w-md xl:text-[17px] xl:leading-6',
                                                '2xl:text-[18px] 2xl:leading-6.5',
                                            )}
                                        >
                                            Telugu Airlines stands as a leading aviation enterprise in India, focusing on
                                            helicopter charter services &amp; the development of heliport infrastructure.
                                        </m.p>
                                    </div>
                                </m.div>
                            </div>
                        </div>
                    </div>

                    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-75 h-[10%] lg:h-[40%] xl:h-[50%]" />
                </section>
            </div>
        </>
    )
}