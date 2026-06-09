'use client'

// src/components/sections/about/AboutSectionMobile.tsx
// ─────────────────────────────────────────────────────
// Mobile (< 768px): static layout.
//
// Changes from current project:
// • Accepts registerHandoffCard + registerMosaicAnchor via AboutSectionProps
//   so context refs are populated even on mobile (no morph happens on mobile,
//   but the bridge needs valid refs for the handoff state machine).
// • Passes those refs into the image strip that contains reveal-06 (left strip).
// • Visual layout is unchanged from current project.

import { motion as m, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useAboutVisionHandoffOptional } from './AboutVisionHandoffContext'
import { cn } from '@/lib/utils'
import {
    ABOUT_PARAGRAPH,
    REVEAL_IMAGES,
    type AboutSectionProps,
} from './aboutShared'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
} satisfies import('framer-motion').Variants

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
} satisfies import('framer-motion').Variants

const t = (delay: number) => ({ duration: 0.55, ease: EASE, delay }) as const
const tNoY = (delay: number) => ({ duration: 0.65, ease: EASE, delay }) as const

const STRIP_LEFT = [REVEAL_IMAGES[0], REVEAL_IMAGES[1], REVEAL_IMAGES[2]]
const STRIP_RIGHT = [REVEAL_IMAGES[9], REVEAL_IMAGES[10], REVEAL_IMAGES[11]]
const GRID_IMAGES = [
    REVEAL_IMAGES[3],
    REVEAL_IMAGES[4],
    REVEAL_IMAGES[5],
    REVEAL_IMAGES[6],
]

const HANDOFF_IMAGE_SRC = '/images/about-us-reveal-06.png'

function MobileImageCard({
    image,
    delay,
    className,
    cardRef,
}: {
    image: (typeof REVEAL_IMAGES)[number]
    delay: number
    className?: string
    cardRef?: React.RefObject<HTMLDivElement | null>
}) {
    return (
        <m.div
            ref={cardRef}
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10%' }}
            transition={tNoY(delay)}
            className={cn(
                'relative aspect-square overflow-hidden rounded-[14px] border-2 border-white/80 bg-white',
                'shadow-[0_8px_24px_-8px_rgba(9,9,11,0.15)]',
                className,
            )}
        >
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 40vw" className="object-cover object-center" />
        </m.div>
    )
}

function MobileImageStrip({
    images,
}: {
    images: readonly (typeof REVEAL_IMAGES)[number][]
}) {
    return (
        <div className="flex flex-col gap-2">
            {images.map((img, i) => (
                <m.div
                    key={img.src}
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-8%' }}
                    transition={tNoY(i * 0.06)}
                    className="relative aspect-square w-[clamp(4rem,16vw,6.5rem)] overflow-hidden rounded-xl border-2 border-white/80 bg-white shadow-[0_6px_18px_-6px_rgba(9,9,11,0.14)]"
                >
                    <Image src={img.src} alt={img.alt} fill sizes="(max-width: 767px) 16vw" className="object-cover object-center" />
                </m.div>
            ))}
        </div>
    )
}

export function AboutSectionMobile({ sectionRef }: AboutSectionProps) {
    const RM = useReducedMotion()
    const handoffCtx = useAboutVisionHandoffOptional()

    // The handoff card on mobile is reveal-06 which appears in the grid.
    // Register it so the context state machine has a valid ref.
    const handoffCardInnerRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        if (!handoffCtx || !handoffCardInnerRef.current) return
        // Simulate the same registration check the desktop version does via
        // the data-about-parallax-col guard: on mobile there's no parallax col,
        // so we call the context directly if the element has non-zero size.
        const el = handoffCardInnerRef.current
        const { width, height } = el.getBoundingClientRect()
        if (width > 0 && height > 0) {
            handoffCtx.registerHandoffCard(el)
        }
        // Also register a mosaic anchor pointing at the same element
        handoffCtx.registerMosaicAnchor(el)
    }, [handoffCtx])

    return (
        <section
            id="about"
            ref={sectionRef as React.RefObject<HTMLElement>}
            className="relative w-full overflow-hidden bg-brand-surface"
        >
            <div className="h-8 sm:h-10" />

            <div className="mx-auto w-full max-w-[min(100%,600px)] px-4 sm:px-6">
                <m.div
                    variants={fadeUp} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: '-5%' }} transition={t(0)}
                    className="flex flex-col items-center gap-1.5"
                >
                    <span className="inline-flex items-center gap-2">
                        <Image src="/images/black-asterisk.svg" width={12} height={12} alt="" className="h-3 w-3 shrink-0" aria-hidden />
                        <span className="[font-family:var(--font-geist)] text-[12px] font-semibold tracking-[0.22em] uppercase text-brand-black">About Us</span>
                    </span>
                    <Image src="/images/header-line.svg" width={364} height={12} alt="" className="h-auto w-[min(160px,calc(100vw-3rem))]" aria-hidden />
                </m.div>

                <m.p
                    variants={fadeUp} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: '-5%' }} transition={t(0.08)}
                    className={cn(
                        'mt-5 text-center [font-family:var(--font-halant)] font-normal text-brand-black',
                        'text-[16px] leading-[1.65] tracking-[-0.015em]',
                        'sm:text-[18px] sm:leading-[1.7]',
                    )}
                >
                    {ABOUT_PARAGRAPH}
                </m.p>

                <m.div
                    variants={fadeIn} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: '-5%' }} transition={tNoY(0.14)}
                    className="mt-7 sm:mt-8 flex items-center justify-center gap-2.5 sm:gap-3"
                >
                    <MobileImageStrip images={STRIP_LEFT} />

                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1">
                        {GRID_IMAGES.map((img, i) => {
                            const isHandoff = img.src === HANDOFF_IMAGE_SRC
                            return (
                                <MobileImageCard
                                    key={img.src}
                                    image={img}
                                    delay={i * 0.05}
                                    cardRef={isHandoff ? handoffCardInnerRef : undefined}
                                />
                            )
                        })}
                    </div>

                    <MobileImageStrip images={STRIP_RIGHT} />
                </m.div>

                <m.div
                    variants={fadeUp} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: '-5%' }} transition={t(0.1)}
                    className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 border-t border-black/8 pt-6"
                >
                    {[
                        { value: '20k+', label: 'Happy Clients' },
                        { value: '150+', label: 'Flight Hours' },
                        { value: '12+', label: 'Years Experience' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                            <span className="[font-family:var(--font-halant)] text-[clamp(1.4rem,6vw,1.85rem)] font-normal leading-none tracking-[-0.03em] text-brand-black">
                                {stat.value}
                            </span>
                            <span className="[font-family:var(--font-geist)] text-[10px] font-medium uppercase tracking-[0.12em] text-brand-black/50 sm:text-[11px]">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </m.div>
            </div>

            <div className="h-10 sm:h-12" />
        </section>
    )
}