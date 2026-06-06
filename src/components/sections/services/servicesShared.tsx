'use client'

// src/components/sections/services/servicesShared.tsx
// Shared card, helpers, and copy — mirrors the original CharterServicesSection exactly.

import { m } from 'framer-motion'
import Image from 'next/image'
import { charterServiceRevealInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'
import type { CharterServiceCard as CharterServiceItem } from '@/data/services'

// ─── Rotation / tilt helpers ──────────────────────────────────────────────────

export function charterCardRotationDeg(index: number): number {
    return index % 2 === 0 ? 3 : -3
}

export function charterCardTiltClass(index: number): string {
    return index % 2 === 0 ? 'rotate-[3deg]' : '-rotate-[3deg]'
}

export function charterStackFinalY(index: number): number {
    return -10 * index
}

// ─── Stack measurement helpers (desktop) ──────────────────────────────────────

export type CharterStackMeasure = {
    stageHeight: number
    cardHeight: number
    belowViewportCenter: number
    enterFromViewportBottom: number
}

export function measureCharterStackContext(
    stage: HTMLElement,
    cards: NodeListOf<HTMLElement> | HTMLElement[],
): CharterStackMeasure {
    const stageRect = stage.getBoundingClientRect()
    const vh = window.innerHeight
    const stageCenterY = stageRect.top + stageRect.height / 2
    const belowViewportCenter = Math.max(vh - stageCenterY, Math.round(vh * 0.4))
    const sample = (cards[0] as HTMLElement | undefined)
        ?.querySelector<HTMLElement>('[data-service-card]')
    const cardHeight = sample?.offsetHeight ?? 210
    const enterFromViewportBottom = Math.round(belowViewportCenter + cardHeight + 80)
    return {
        stageHeight: stage.offsetHeight || Math.min(vh * 0.68, 760),
        cardHeight,
        belowViewportCenter,
        enterFromViewportBottom,
    }
}

export function charterStackHiddenStartY(
    index: number,
    metrics: CharterStackMeasure,
): number {
    if (index === 0) return charterStackFinalY(0)
    return metrics.enterFromViewportBottom + Math.max(0, index - 1) * 36
}

export function charterStackBgTravelPx(
    cardCount: number,
    metrics: CharterStackMeasure,
): number {
    if (cardCount < 1) return 320
    const lastStart = charterStackHiddenStartY(cardCount - 1, metrics)
    const lastFinal = charterStackFinalY(cardCount - 1)
    return Math.max(lastStart - lastFinal, 320)
}

// ─── Mobile reveal tween vars — same as original ──────────────────────────────

export const charterMobileRevealFrom = {
    autoAlpha: 0,
    y: 32,
    scale: 0.95,
    filter: 'blur(8px)',
} satisfies Record<string, unknown>

// ─── Copy strings ─────────────────────────────────────────────────────────────

export const SERVICES_BADGE_TEXT = 'Services'
export const SERVICES_HEADLINE = 'Premium Air Charter & Aviation Services'
export const SERVICES_BODY =
    'We provide exceptional helicopter charter services tailored to meet the needs of our diverse clientele, emphasizing flexibility, speed, and convenience'

// ─── CharterServiceCard — pixel-identical to original ─────────────────────────

export function CharterServiceCard({
    service,
    stack,
}: {
    service: CharterServiceItem
    stack?: boolean
}) {
    return (
        <article
            data-service-card
            className={cn(
                'group/card shrink-0',
                stack
                    ? 'w-full'
                    : 'w-[min(85vw,calc(100vw-2.5rem))] sm:w-[min(520px,calc(100vw-3rem))] md:w-[min(600px,90vw)] lg:w-[min(660px,92vw)]',
                'border-white/90 rounded-[22px] border-2 bg-white/30 p-2 shadow-[0_14px_44px_-18px_rgba(9,9,11,0.22)] backdrop-blur-sm',
                'h-auto min-h-[168px] xl:h-44.5 xl:min-h-44.5',
                stack ? 'xl:max-w-[728px]' : 'xl:max-w-181.75',
                !stack && 'xl:w-full',
            )}
        >
            <div className={charterServiceRevealInnerClassName()}>
                <div className={cn(
                    'relative flex shrink-0 items-center justify-center overflow-hidden',
                    'h-14 w-14 sm:h-16 sm:w-16',
                    'md:h-20 md:w-20 lg:h-[128px] lg:w-[128px]',
                )}>
                    <Image
                        src={service.image}
                        alt=""
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 80px, 128px"
                    />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center pr-1">
                    <h3 className={cn(
                        'text-brand-black [font-family:var(--font-satoshi)] font-semibold tracking-[-0.02em]',
                        'text-[15px] leading-snug sm:text-base sm:leading-snug',
                        'md:text-[17px] md:leading-[1.35] xl:text-[20px] xl:leading-[26px]',
                    )}>
                        {service.title}
                    </h3>
                    <p className={cn(
                        'text-brand-gray [font-family:var(--font-satoshi)] font-normal',
                        'text-[13px] leading-snug sm:text-sm sm:leading-relaxed',
                        'md:text-[15px] md:leading-relaxed xl:text-[20px] xl:leading-[26px]',
                    )}>
                        {service.summary}
                    </p>
                </div>
            </div>
        </article>
    )
}