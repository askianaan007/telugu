'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { CharterServiceCard as CharterServiceItem } from '@/data/services'

// ─── Rotation / tilt helpers ──────────────────────────────────────────────────

export function charterCardRotationDeg(index: number): number {
    return index % 2 === 0 ? 2.5 : -2.5
}

export function charterCardTiltClass(index: number): string {
    return index % 2 === 0 ? 'rotate-[2.5deg]' : '-rotate-[2.5deg]'
}

export function charterStackFinalY(index: number): number {
    return -12 * index
}

// ─── Stack measurement helpers ────────────────────────────────────────────────

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
    const cardHeight = sample?.offsetHeight ?? 220
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

// ─── Mobile reveal tween vars ─────────────────────────────────────────────────

export const charterMobileRevealFrom = {
    autoAlpha: 0,
    y: 32,
    scale: 0.95,
    filter: 'blur(8px)',
} satisfies Record<string, unknown>

// ─── Copy strings ─────────────────────────────────────────────────────────────

export const SERVICES_BADGE_TEXT = 'Services'
export const SERVICES_HEADLINE   = 'Premium Air Charter & Aviation Services'
export const SERVICES_BODY       =
    'We provide exceptional helicopter charter services tailored to meet the needs of our diverse clientele, emphasizing flexibility, speed, and convenience'

// ─── Premium CharterServiceCard ───────────────────────────────────────────────

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
                'group/card relative shrink-0 overflow-hidden',
                stack
                    ? 'w-full'
                    : 'w-[min(85vw,calc(100vw-2.5rem))] sm:w-[min(520px,calc(100vw-3rem))] md:w-[min(600px,90vw)] lg:w-[min(660px,92vw)]',
                // outer frame — double border with glass
                'rounded-[26px] p-[3px]',
                'bg-gradient-to-br from-white/80 via-white/40 to-white/20',
                'shadow-[0_8px_32px_-8px_rgba(9,9,11,0.18),0_2px_8px_-2px_rgba(9,9,11,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]',
                stack ? 'xl:max-w-[860px]' : 'xl:max-w-181.75',
                !stack && 'xl:w-full',
            )}
        >
            {/* Inner surface */}
            <div className={cn(
                'relative flex h-full w-full items-center gap-5 rounded-[23px] px-5 py-5',
                'bg-white/60 backdrop-blur-xl',
                'sm:gap-6 sm:px-6 sm:py-6',
                'lg:gap-7 lg:px-7 lg:py-7',
                'min-h-[180px] xl:min-h-[210px]',
            )}>
                {/* Subtle top-left radial glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(202,139,55,0.25) 0%, transparent 70%)' }}
                />

                {/* Icon container — frosted square */}
                <div className={cn(
                    'relative shrink-0 overflow-hidden rounded-[18px]',
                    'h-[72px] w-[72px]',
                    'sm:h-20 sm:w-20',
                    'lg:h-[108px] lg:w-[108px]',
                    'xl:h-[120px] xl:w-[120px]',
                    'bg-gradient-to-br from-white/90 to-white/50',
                    'shadow-[0_4px_16px_-4px_rgba(9,9,11,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]',
                    'border border-white/60',
                )}>
                    {/* Gold shimmer ring */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[18px]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(202,139,55,0.18) 0%, transparent 50%, rgba(249,230,126,0.1) 100%)',
                        }}
                    />
                    <div className="relative h-full w-full p-2.5 lg:p-3 xl:p-3.5">
                        <Image
                            src={service.image}
                            alt=""
                            fill
                            className="object-contain object-center p-2 lg:p-2.5"
                            sizes="(max-width: 640px) 72px, (max-width: 768px) 80px, (max-width: 1024px) 108px, 120px"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:gap-2">
                    {/* Gold accent line */}
                    <div
                        className="h-[2px] w-8 rounded-full lg:w-10"
                        style={{ background: 'linear-gradient(90deg, #ca8b37, #f9e67e)' }}
                    />
                    <h3 className={cn(
                        'text-brand-black [font-family:var(--font-halant)] font-normal tracking-[-0.02em]',
                        'text-[18px] leading-[1.2]',
                        'sm:text-[20px]',
                        'lg:text-[24px] lg:leading-[1.15]',
                        'xl:text-[26px]',
                    )}>
                        {service.title}
                    </h3>
                    <p className={cn(
                        'text-brand-gray [font-family:var(--font-geist)] font-normal leading-relaxed',
                        'text-[13px]',
                        'sm:text-[14px]',
                        'lg:text-[15px]',
                        'xl:text-[16px] xl:leading-[1.6]',
                        'max-w-[480px]',
                    )}>
                        {service.summary}
                    </p>
                </div>

                {/* Right arrow badge */}
                <div className={cn(
                    'shrink-0 self-center',
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    'bg-brand-navy/8 border border-brand-navy/10',
                    'lg:h-10 lg:w-10',
                )}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="#121f2f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                    </svg>
                </div>

                {/* Bottom-right corner gold shimmer */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(202,139,55,0.4) 0%, transparent 70%)' }}
                />
            </div>
        </article>
    )
}