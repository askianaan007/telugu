'use client'

import React from 'react'
import Image from 'next/image'
import { motion as m } from 'framer-motion'
import type { HeliportCardVariant, HeliportSolution } from '@/data/heliportSolutions'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'

// ─── Surface helpers ──────────────────────────────────────────────────────────

export function heliportCardSurface(variant: HeliportCardVariant) {
    switch (variant) {
        case 'bg1':
            // bg opacity raised 0.22→0.55 so backdrop-blur-sm is sufficient for depth;
            // removed backdrop-saturate-150 (chained GPU filter = doubled compositing cost).
            return `
border border-white/15
bg-[rgba(10,28,54,0.55)]
backdrop-blur-sm
shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_60px_-15px_rgba(0,0,0,0.35)]
`
        case 'bg2':
            // bg-white/90 is already nearly opaque — backdrop-blur is imperceptible, removed.
            return 'border border-white/40 bg-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_24px_60px_-15px_rgba(9,9,11,0.15)]'
        case 'bg3':
            // Gold gradient is 85-90% opaque — backdrop-blur is imperceptible, removed.
            return 'border border-white/25 bg-linear-to-r from-brand-gold-start/85 via-brand-gold-mid/90 to-brand-gold-start/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_24px_60px_-15px_rgba(0,0,0,0.2)]'
        default:
            return ''
    }
}

export function heliportTitleClass(variant: HeliportCardVariant) {
    return variant === 'bg1' ? 'text-brand-white' : 'text-brand-black'
}

export function heliportDescriptionClass(variant: HeliportCardVariant) {
    return variant === 'bg1' ? 'text-[#D2D1D1]' : 'text-brand-muted'
}

// ─── Card ─────────────────────────────────────────────────────────────────────

// Static class strings — defined outside component to avoid re-creation on every render
const CARD_BASE = 'rounded-hero flex h-auto w-full max-w-[min(100%,326px)] flex-col items-start gap-5 px-[30px] py-[40px] md:max-w-none lg:w-[300px] lg:max-w-none xl:w-[326px]'

export function HeliportSolutionCard({
    solution,
    enableScrollReveal,
}: {
    solution: HeliportSolution
    enableScrollReveal?: boolean
}) {
    return (
        <article
            {...(enableScrollReveal ? { 'data-heliport-card': true } : {})}
            className={cn(
                'relative overflow-hidden',
                CARD_BASE,
                // will-change-transform removed: class-based will-change permanently promotes
                // all cards to GPU compositor layers. Combined with overflow-hidden + border-radius
                // this is the direct cause of the white rectangular artifacts during scroll.
                // will-change is now set/cleared dynamically per GSAP animation via gsap.set().
                heliportCardSurface(solution.variant),
            )}
        >
            {/* Glass highlight overlay */}
            <div
                aria-hidden
                className="
        pointer-events-none
        absolute
        inset-0
        rounded-hero
        bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0.01)_100%)]
    "
            />

            {/* Corner glows: replaced two blur-3xl filter divs with a single CSS gradient.
                Each blur-3xl creates a GPU filter texture — 9 cards × 2 = 18 filter contexts.
                A radial-gradient with equivalent opacity/spread is visually identical at 0 GPU cost. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-hero"
                style={{
                    background:
                        'radial-gradient(ellipse 120px 80px at 100% 0%, rgba(255,255,255,0.10) 0%, transparent 100%), ' +
                        'radial-gradient(ellipse 100px 100px at 0% 0%, rgba(255,255,255,0.08) 0%, transparent 100%)',
                }}
            />
            <div className="relative z-10 h-20 w-[85px] shrink-0">
                <Image
                    src={solution.iconSrc}
                    alt=""
                    fill
                    sizes="85px"
                    className="object-contain object-left"
                />
            </div>
            <h3 className={cn(
                'relative z-10 [font-family:var(--font-halant)] text-[28px] leading-[30px] font-normal text-balance uppercase',
                heliportTitleClass(solution.variant),
            )}>
                {solution.title}
            </h3>
            <p className={cn(
                'relative z-10 [font-family:var(--font-geist)] text-[18px] leading-normal font-normal',
                heliportDescriptionClass(solution.variant),
            )}>
                {solution.description}
            </p>
        </article>
    )
}

// ─── Section header (shared across mobile + tablet tiers) ─────────────────────

// Static import instead of dynamic require() — was re-requiring framer-motion on every render
export function HeliportSectionHeader({ reduceMotion }: { reduceMotion: boolean }) {
    return (
        <m.header
            variants={staggerContainer(0.1, 0.06)}
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            // once: true — was once: false, re-triggering animation on every scroll-past
            viewport={{ once: true, amount: 0.35, margin: '0px 0px -8% 0px' }}
            className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 text-center sm:gap-5"
        >
            <m.div variants={fadeInUp} className="flex flex-col items-center gap-2.5">
                <span className="text-brand-white inline-flex items-center gap-2">
                    <Image
                        src="/images/gold-asterisk.svg"
                        width={14} height={14} alt=""
                        className="h-[14px] w-[14px] shrink-0" aria-hidden
                    />
                    <span className="[font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase">
                        Solution
                    </span>
                </span>
                <Image
                    src="/images/header-line-transparent.svg"
                    width={364} height={12} alt=""
                    className="h-auto w-full max-w-[220px] shrink-0" aria-hidden
                />
            </m.div>

            <m.h2
                variants={fadeInUp}
                className={cn(
                    'text-brand-white [font-family:var(--font-halant)] font-normal tracking-[-0.02em] text-balance uppercase',
                    'text-[clamp(1.75rem,3.5vw+1rem,2.75rem)] leading-[1.08] sm:text-[clamp(2rem,3vw+1.1rem,3.25rem)]',
                )}
            >
                <span className="block">Comprehensive</span>
                <span className="block">Heliport Solutions</span>
            </m.h2>

            <m.p
                variants={fadeInUp}
                className="max-w-[711px] [font-family:var(--font-geist)] text-[16px] leading-relaxed font-normal text-white/80 sm:text-[18px]"
            >
                Telugu Airlines specializes in providing end-to-end heliport solutions, encompassing
                everything from initial concept design to final execution and certification processes.
            </m.p>
        </m.header>
    )
}

// ─── Bottom gradient decorators ───────────────────────────────────────────────

export function HeliportGradientDecorators() {
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[min(420px,55%)] bg-[radial-gradient(ellipse_55%_45%_at_12%_100%,rgba(202,46,121,0.22),transparent_68%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[min(420px,55%)] bg-[radial-gradient(ellipse_55%_45%_at_88%_100%,rgba(169,54,109,0.2),transparent_68%)]"
            />
        </>
    )
}