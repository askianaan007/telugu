'use client'
import { motion as m, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { Fragment } from 'react'
import { HeroSilkBackground } from '@/components/backgrounds/HeroSilkBackground'
import { ActionButton } from '@/components/ui/ActionButton'
import { TrustClientsBadge } from '@/components/ui/TrustClientsBadge'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import {
    cardBorderStyle,
    EASE_SMOOTH,
    HERO_MAIN_COLUMN_LAYOUT,
    HERO_PRIMARY_WORDS_LINE1,
    HERO_PRIMARY_WORDS_LINE2,
    desktopBottomFade,
    HERO_WORD_MASK_CLASS,
    mobileFadeIn,
    mobileFadeInNoY,
    mTrans,
    mTransNoY,
} from './heroShared'
import type { HeroSectionProps } from '../HeroSection'

export function HeroSectionMobile(_props: HeroSectionProps) {
    const RM = useReducedMotion()
    const openBookingModal = useUiStore((s) => s.openBookingModal)

    return (
        <>
            <div className="relative">
                <section id="hero" className="bg-brand-surface relative isolate overflow-hidden">
                    <div className={cn('relative z-10 mt-2.5', HERO_MAIN_COLUMN_LAYOUT)}>
                        <div
                            className={cn(
                                'relative mx-auto w-full overflow-hidden',
                                'rounded-t-[40px] rounded-b-none border-x-8 border-t-8 border-b-0',
                                'h-[calc(100svh-2.5rem-4px)]',
                            )}
                            style={cardBorderStyle}
                        >
                            <div
                                aria-hidden
                                className="absolute inset-0 z-5"
                            >
                                <HeroSilkBackground reduceMotion={RM} />
                            </div>

                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center"
                            >
                                <div className="relative size-[min(100vw,520px)]">
                                    <Image
                                        src="/images/home-hero-bg-circle.png"
                                        alt=""
                                        fill
                                        className="object-contain opacity-40 blur-[56px]"
                                    />
                                </div>
                            </div>

                            {/* Bottom fade */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
                                style={{ height: '32%', background: desktopBottomFade }}
                            />

                            {/* Helipad */}
                            <m.div
                                aria-hidden
                                initial={RM ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7, delay: 0.4, ease: EASE_SMOOTH }}
                                className="hero-short-device-pad pointer-events-none absolute inset-x-0 z-32 flex justify-center"
                                style={{ bottom: '15%' }}
                            >
                                <div className="relative w-[280%] max-w-none">
                                    <Image
                                        src="/images/hero-heli-pad.png"
                                        alt=""
                                        width={800}
                                        height={160}
                                        className="w-full object-contain opacity-80"
                                    />
                                </div>
                            </m.div>

                            {/* Helicopter */}
                            <m.div
                                aria-hidden
                                initial={RM ? false : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.25, ease: EASE_SMOOTH }}
                                className="hero-short-device-heli pointer-events-none absolute inset-x-0 z-33 flex justify-center"
                                style={{ bottom: '13%' }}
                            >
                                <div className="relative h-105 sm:h-[60vh] w-[260%] max-w-none">
                                    <Image
                                        src="/images/hero-helicopter.png"
                                        alt="Telugu Airlines helicopter"
                                        fill
                                        priority
                                        sizes="260vw"
                                        className="object-contain object-bottom drop-shadow-[0_20px_36px_rgba(0,0,0,0.20)] select-none"
                                    />
                                </div>
                            </m.div>

                            {/* Cloud rail */}
                            <div
                                aria-hidden
                                className="hero-short-device-clouds pointer-events-none absolute -bottom-12 left-1/2 z-35 h-[44%] w-[170%] max-w-none -translate-x-1/2"
                            >
                                <div className="relative z-0 flex h-full w-full">
                                    <div className="relative h-full min-h-0 min-w-0 flex-1">
                                        <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw"
                                            className="object-contain object-left opacity-50" />
                                    </div>
                                    <div className="relative h-full min-h-0 min-w-0 flex-1">
                                        <Image src="/images/hero-cloud.png" alt="" fill sizes="90vw"
                                            className="scale-x-[-1] object-contain object-right opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Text content */}
                            <div className="relative z-40 flex min-h-0 flex-col p-3.5">

                                <div className="hero-short-device flex items-center justify-between pt-16"><m.div
                                    variants={mobileFadeIn}
                                    initial="hidden"
                                    animate="visible"
                                    transition={mTrans(0.05)}
                                    className="flex flex-row items-center gap-1 -ml-0.5"
                                >
                                    <div className="relative flex size-11 shrink-0 rotate-180 items-center justify-center">
                                        <Image
                                            src="/images/gradient-gold-circle.png"
                                            alt=""
                                            width={80}
                                            height={80}
                                            className="size-11 rotate-180 object-contain"
                                        />
                                    </div>

                                    <div
                                        aria-hidden
                                        className="h-0.5 w-24 shrink-0 rounded-[48px]"
                                        style={{
                                            background:
                                                'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0) 68.74%)',
                                        }}
                                    />
                                </m.div>

                                    <m.div
                                        className="hero-badge-wrapper"
                                        variants={mobileFadeInNoY}
                                        initial="hidden"
                                        animate="visible"
                                        transition={mTransNoY(0.08)}
                                    >
                                        <TrustClientsBadge align="right" />
                                    </m.div>
                                </div>

                                {/* H1 */}
                                <m.div
                                    variants={mobileFadeIn}
                                    initial="hidden"
                                    animate="visible"
                                    transition={mTrans(0.13)}
                                    className="hero-short-device-title hero-h1-mobile mt-12"

                                >
                                    <h1
                                        aria-label="Elevating Aviation Excellence"
                                        className="[font-family:var(--font-halant)] font-normal text-brand-black text-[clamp(8rem,13vw,3.75rem)] leading-[1.05] tracking-[-0.035em]"
                                    >
                                        {HERO_PRIMARY_WORDS_LINE1.map((word, i) => (
                                            <Fragment key={word}>
                                                {i > 0 ? '\u00A0' : null}
                                                <span aria-hidden className={HERO_WORD_MASK_CLASS}>
                                                    <span className="inline-block">{word}</span>
                                                </span>
                                            </Fragment>
                                        ))}
                                        <br aria-hidden="true" />
                                        {HERO_PRIMARY_WORDS_LINE2.map((word) => (
                                            <span key={word} aria-hidden className={HERO_WORD_MASK_CLASS}>
                                                <span className="inline-block">{word}</span>
                                            </span>
                                        ))}
                                    </h1>
                                </m.div>

                                {/* H2 */}
                                <m.h2
                                    variants={mobileFadeIn}
                                    initial="hidden"
                                    animate="visible"
                                    transition={mTrans(0.19)}
                                    className="hero-h2-mobile [font-family:var(--font-halant)] font-normal text-brand-black text-[clamp(1.75rem,7vw,2.1rem)] leading-[1.1] tracking-[-0.03em] mt-1.5"
                                >
                                    Across India &amp; Beyond
                                </m.h2>

                                {/* Body */}
                                <m.p
                                    variants={mobileFadeIn}
                                    initial="hidden"
                                    animate="visible"
                                    transition={mTrans(0.25)}
                                    className="hero-body-mobile [font-family:var(--font-geist)] font-normal text-brand-black/80 mt-3 max-w-[94%] text-[15px] leading-[1.6]"
                                >
                                    Telugu Airlines stands as a leading aviation enterprise in
                                    India, focusing on helicopter charter services &amp; the
                                    development of heliport infrastructure.
                                </m.p>
                            </div>
                        </div>
                    </div>
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-75 h-[10%]" />
                </section>
            </div>

            {/* Fixed CTA */}
            <m.div
                variants={mobileFadeInNoY}
                initial="hidden"
                animate="visible"
                transition={mTransNoY(0.4)}
                className="pointer-events-none fixed inset-x-0 z-60 flex justify-center"
                style={{ bottom: 'max(3rem, env(safe-area-inset-bottom))' }}
            >
                <div className="pointer-events-auto">
                    <ActionButton onClick={openBookingModal} label="Book The Flight" />
                </div>
            </m.div>
        </>
    )
}