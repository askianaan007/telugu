'use client'

// src/components/sections/heliport/heliportShared.tsx
// ────────────────────────────────────────────────────
// Shared card component, surface helpers, copy — used by all tiers.

import React from 'react'
import Image from 'next/image'
import type { HeliportCardVariant, HeliportSolution } from '@/data/heliportSolutions'
import { cn } from '@/lib/utils'

// ─── Surface helpers ──────────────────────────────────────────────────────────

export function heliportCardSurface(variant: HeliportCardVariant) {
    switch (variant) {
        case 'bg1':
            return 'border border-white/12 bg-[radial-gradient(circle_8rem_at_0_0,rgba(255,255,255,0.07)_0%,transparent_60%),rgba(255,255,255,0.02)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_24px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl'
        case 'bg2':
            return 'border border-white/40 bg-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_24px_60px_-15px_rgba(9,9,11,0.15)] backdrop-blur-xl'
        case 'bg3':
            return 'border border-white/25 bg-linear-to-r from-brand-gold-start/85 via-brand-gold-mid/90 to-brand-gold-start/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_24px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl'
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
                'rounded-hero flex h-auto w-full max-w-[min(100%,326px)] flex-col items-start gap-5 px-[30px] py-[40px] md:max-w-none lg:w-[300px] lg:max-w-none xl:w-[326px]',
                enableScrollReveal && 'will-change-[transform]',
                heliportCardSurface(solution.variant),
            )}
        >
            <div className="relative h-20 w-[85px] shrink-0">
                <Image
                    src={solution.iconSrc}
                    alt=""
                    fill
                    sizes="85px"
                    className="object-contain object-left"
                />
            </div>
            <h3 className={cn(
                '[font-family:var(--font-halant)] text-[28px] leading-[30px] font-normal text-balance uppercase',
                heliportTitleClass(solution.variant),
            )}>
                {solution.title}
            </h3>
            <p className={cn(
                '[font-family:var(--font-geist)] text-[18px] leading-normal font-normal',
                heliportDescriptionClass(solution.variant),
            )}>
                {solution.description}
            </p>
        </article>
    )
}

// ─── Section header (shared across all tiers) ─────────────────────────────────

export function HeliportSectionHeader({ reduceMotion }: { reduceMotion: boolean }) {
    // Import lazily to keep this file framework-agnostic at type level
    const { motion: m } = require('framer-motion') as typeof import('framer-motion')
    const { fadeInUp, staggerContainer } = require('@/lib/animations/motion') as typeof import('@/lib/animations/motion')

    return (
        <m.header
            variants={staggerContainer(0.1, 0.06)}
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: false, amount: 0.35, margin: '0px 0px -8% 0px' }}
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