'use client'

// src/components/sections/global/globalPresenceShared.tsx
// ─────────────────────────────────────────────────────────
// Shared card, flag styles, section copy — used by all tiers.

import React from 'react'
import Image from 'next/image'
import { OFFICE_LOCATIONS } from '@/data/offices'
import { globalPresenceRevealInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

// ─── Flag CSS vars — injected once per tier ───────────────────────────────────

export const FLAG_STYLES = `
.office-card-flag-container {
  --flag-tx: -20px;
  --flag-ty: 10px;
  --flag-scale: 0.85;
}
@media (min-width: 480px) {
  .office-card-flag-container {
    --flag-tx: -30px;
    --flag-ty: 15px;
    --flag-scale: 0.9;
  }
}
@media (min-width: 640px) {
  .office-card-flag-container {
    --flag-tx: -50px;
    --flag-ty: 20px;
    --flag-scale: 1.0;
  }
}
@media (min-width: 768px) {
  .office-card-flag-container {
    --flag-tx: -70px;
    --flag-ty: 30px;
    --flag-scale: 1.1;
  }
}
@media (min-width: 1024px) {
  .office-card-flag-container {
    --flag-tx: -120px;
    --flag-ty: 45px;
    --flag-scale: 0.85;
  }
}
@media (min-width: 1280px) {
  .office-card-flag-container {
    --flag-tx: -140px;
    --flag-ty: 70px;
    --flag-scale: 1.0;
  }
}
`

// ─── Office card ──────────────────────────────────────────────────────────────

export function GlobalOfficeCard({
    office,
}: {
    office: (typeof OFFICE_LOCATIONS)[number]
}) {
    return (
        <article
            id={`presence-${office.id}`}
            data-office-card
            className={cn(
                'w-full shrink-0 overflow-hidden rounded-[24px] border border-black/8 p-2',
                'xl:w-[650px] xl:max-w-[650px]',
            )}
        >
            <div
                className={cn(
                    globalPresenceRevealInnerClassName(),
                    'rounded-[16px] border-4 border-white bg-transparent',
                    'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]',
                )}
            >
                <Image
                    src="/images/gradient-bg-card.svg"
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 650px, 100vw"
                    className="pointer-events-none absolute inset-0 z-0 rounded-[16px] object-cover object-top-left"
                    aria-hidden
                />
                {/* Text col — wider on mobile so flag doesn't overlap text */}
                <div className="relative z-10 flex w-[68%] min-w-0 shrink-0 flex-col gap-2 self-start pr-3 pb-4 text-left sm:w-[62%] sm:pr-4 sm:pb-5 md:w-[60%] md:pr-5 md:pb-6">
                    <h3 className="text-brand-black [font-family:var(--font-halant)] text-[clamp(1.1rem,4vw,2rem)] leading-tight font-medium tracking-[-0.02em]">
                        {office.cardHeading}
                    </h3>
                    {office.cardSubtitle ? (
                        <p className="text-brand-navy [font-family:var(--font-geist)] text-xs font-semibold sm:text-sm">
                            {office.cardSubtitle}
                        </p>
                    ) : null}
                    <p className="text-brand-muted [font-family:var(--font-geist)] text-[13px] leading-relaxed font-normal sm:text-sm md:text-base">
                        {office.description}
                    </p>
                </div>
                {/* Flag — narrower on mobile so it doesn't bleed over text */}
                <div
                    aria-hidden
                    className="office-card-flag-container pointer-events-none absolute inset-y-0 right-0 z-0 w-[36%] sm:w-[40%] md:w-[44%] lg:w-[46%] xl:w-[56%]"
                >
                    <Image
                        src={office.flagSvg}
                        alt=""
                        width={504}
                        height={638}
                        sizes="(min-width: 1280px) 260px, (min-width: 1024px) 40vw, (min-width: 768px) 38vw, 36vw"
                        style={{
                            clipPath: 'polygon(10.5% 0%, 100% 0%, 100% 100%, 10.5% 100%)',
                            transformOrigin: 'bottom right',
                        }}
                        className="absolute right-0 bottom-0 h-full w-auto max-w-none object-contain drop-shadow-[0_18px_36px_-12px_rgba(9,9,11,0.35)] min-h-[120px] sm:min-h-[160px] md:min-h-[250px] lg:min-h-[220px] xl:min-h-[280px]"
                    />
                </div>
            </div>
        </article>
    )
}

// ─── Left panel copy (shared across tiers) ────────────────────────────────────

export function GlobalPresenceLeftPanel() {
    // Dynamically required to avoid SSR issues with framer-motion
    const { motion: m } = require('framer-motion') as typeof import('framer-motion')
    const { fadeInUp, staggerContainer } = require('@/lib/animations/motion') as typeof import('@/lib/animations/motion')
    const { ActionButton } = require('@/components/ui/ActionButton') as typeof import('@/components/ui/ActionButton')

    return (
        <m.aside
            variants={staggerContainer(0.1, 0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.35, margin: '0px 0px -8% 0px' }}
            className="flex w-full shrink-0 flex-col gap-5 lg:w-[40%] lg:max-w-[min(100%,480px)] lg:self-start lg:pt-2"
        >
            <m.div variants={fadeInUp} className="flex flex-col items-start gap-2.5">
                <span className="text-brand-black inline-flex items-center gap-2">
                    <Image
                        src="/images/black-asterisk.svg"
                        width={14} height={14} alt=""
                        className="h-[14px] w-[14px] shrink-0" aria-hidden
                    />
                    <span className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.2em] uppercase">
                        Global Presence
                    </span>
                </span>
                <Image
                    src="/images/header-line-transparent-left.svg"
                    width={364} height={12} alt=""
                    className="h-auto w-full max-w-[364px] shrink-0" aria-hidden
                />
            </m.div>

            <m.h2
                variants={fadeInUp}
                className="text-brand-black text-left [font-family:var(--font-halant)] text-[clamp(2rem,3vw+1.25rem,3.25rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance"
            >
                Our Global Presence
            </m.h2>

            <m.p
                variants={fadeInUp}
                className="text-brand-muted max-w-xl text-left [font-family:var(--font-geist)] text-base leading-relaxed sm:text-lg"
            >
                Telugu Airlines maintains a robust international footprint through strategically
                located offices in major global cities.
            </m.p>

            <m.div variants={fadeInUp} className="mt-2 w-fit">
                <ActionButton href="/#services" className="w-fit" />
            </m.div>
        </m.aside>
    )
}