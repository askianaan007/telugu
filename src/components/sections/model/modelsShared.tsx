'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'
import { ActionButton } from '@/components/ui/ActionButton'
import { OUR_MODELS } from '@/data/ourModels'

export const OUR_MODELS_CLOUD_PARALLAX = [
    {
        yFrom: 0,
        yTo: 22,
        xFrom: 0,
        xTo: 0,
        scaleFrom: 1,
        scaleTo: 1.06,
    },
    {
        yFrom: 0,
        yTo: 30,
        xFrom: 0,
        xTo: 0,
        scaleFrom: 1,
        scaleTo: 1.08,
    },
]

export const OUR_MODELS_MOBILE_CARD_REVEAL_FROM: gsap.TweenVars = {
    autoAlpha: 0,
    y: 32,
    scale: 0.95,
    filter: 'blur(8px)',
}

export function OurModelsFixedBackdrop({ ambientMotion }: { ambientMotion: boolean }) {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            data-ourmodels-fixed-scene
        >
            <div
                data-ourmodels-backdrop-dim
                className={cn(
                    'absolute inset-0 will-change-[opacity,filter]',
                    'max-lg:opacity-100 max-lg:blur-none',
                    'lg:opacity-[0.22] lg:blur-sm',
                )}
            >
                <div
                    data-ourmodels-cloud
                    className={cn(
                        'absolute inset-x-0 bottom-0 z-3',
                        'h-full w-full',
                        'will-change-transform',
                    )}
                >
                    <Image
                        src="/images/models_bottom_cloud.png"
                        alt=""
                        fill
                        priority
                        className="object-contain object-bottom translate-y-18"
                    />
                </div>

                {/* Helipad ring — sits just above clouds */}
                <div
                    data-ourmodels-cloud
                    className={cn(
                        'absolute left-[30%] top-[60%]',
                        '-translate-x-1/2',
                        'w-[clamp(600px,45vw,900px)]',
                        'z-2'
                    )}
                >
                    <Image
                        src="/images/hero-heli-pad.png"
                        alt=""
                        width={1000}
                        height={160}
                        className="w-full h-auto object-contain"
                    />
                </div>


            </div>
        </div>
    )
}

function StatRow({ stat, side, className }: { stat: { value: string; label: string }; side: 'left' | 'right'; className?: string }) {
    const lineBg = side === 'left'
        ? 'linear-gradient(to right, #121F2F, rgba(255,255,255,0))'
        : 'linear-gradient(to left, #121F2F, rgba(255,255,255,0))'
    return (
        <div className={cn('flex max-w-full items-center gap-2 sm:gap-3', side === 'right' && 'flex-row-reverse', className)}>
            <div className="flex shrink-0 flex-row items-baseline gap-1.5">
                <span className="[font-family:var(--font-halant)] text-[clamp(2rem,4.2vw,4.375rem)] leading-none tracking-[-0.04em] text-[#121F2F] xl:text-[70px]">
                    {stat.value}
                </span>
                <span className="[font-family:var(--font-geist)] text-base leading-normal text-[#3F3F3E] lg:text-xl">
                    {stat.label}
                </span>
            </div>
            <div className="h-px min-w-6 flex-1 sm:min-w-8 md:min-w-20 lg:min-w-32 xl:min-w-40"
                style={{ maxWidth: '15rem', background: lineBg }} />
        </div>
    )
}

export function ModelProgressBadge({ stepIndex, total }: { stepIndex: number; total: number }) {
    const safe = Math.min(total - 1, Math.max(0, stepIndex))
    const arcDeg = 360 / total
    return (
        <div
            data-progress-badge
            className="relative box-border h-[72px] w-[72px] shrink-0 rounded-full border border-[#D9D9D9] xl:h-[100px] xl:w-[100px]"
            style={{
                // --ring-deg is set directly by GSAP on scroll, avoiding React re-renders
                ['--ring-deg' as string]: '0deg',
            }}
            aria-hidden
        >
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `radial-gradient(circle at center, #F0F1F2 40%, transparent 90%), conic-gradient(from var(--ring-deg, 0deg), #7EB8EA 0deg, #B6D1F3 ${arcDeg}deg, transparent ${arcDeg}deg, transparent 360deg)`,
                }}
            />
            <div className="absolute inset-[6px] flex items-center justify-center rounded-full border border-[#C9C9C9] bg-[rgba(240,241,242,0.2)] xl:inset-[10px]">
                <span className="[font-family:var(--font-halant)] text-xl leading-normal text-[#121F2F] tabular-nums xl:text-[30px]">
                    {safe + 1}/{total}
                </span>
            </div>
        </div>
    )
}

export function OurModelsBookCta({ className }: { className?: string }) {
    const openBookingModal = useUiStore((s) => s.openBookingModal)
    return (
        <div className={cn('flex justify-center', className)}>
            <ActionButton onClick={openBookingModal} label="Book the flight" noShadow />
        </div>
    )
}

type ModelDetailBodyProps = {
    model: (typeof OUR_MODELS)[number]
    stepIndex: number
    imagePriority?: boolean
    showCta?: boolean
    hideCenterImage?: boolean
}

export function ModelDetailBody({ model, stepIndex, imagePriority, showCta = false, hideCenterImage = false }: ModelDetailBodyProps) {
    return (
        <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-3 lg:gap-2">
            <div className={cn(
                'grid w-full shrink-0 grid-cols-1 gap-4',
                'md:max-lg:grid md:max-lg:grid-cols-[1fr_auto] md:max-lg:gap-6',
                'lg:grid-cols-[minmax(0,1.35fr)_auto] lg:items-start lg:gap-6',
            )}>
                <div className="flex min-w-0 flex-col gap-2 text-left lg:max-w-[min(100%,36rem)] lg:min-w-[min(100%,22rem)] lg:flex-1 lg:gap-1.5">
                    <h3
                        data-detail-title
                        className="text-brand-charcoal [font-family:var(--font-halant)] text-[clamp(2.25rem,4vw,5rem)] leading-[0.95] tracking-[-0.04em] lg:text-[clamp(1.75rem,3.2vw,3.25rem)] lg:whitespace-nowrap xl:text-[80px] xl:leading-none will-change-[transform,opacity]"
                    >
                        {model.name}
                    </h3>
                    <p className="max-w-[min(100%,20rem)] [font-family:var(--font-geist)] text-base leading-snug text-[#3F3F3E] sm:max-w-md md:max-w-lg lg:max-w-[min(100%,32rem)] lg:text-sm">
                        {model.tagline}
                    </p>
                </div>
                <div className={cn(
                    'flex flex-col items-stretch gap-3',
                    'max-lg:flex-row max-lg:items-start max-lg:justify-between max-lg:gap-4',
                    'lg:flex-row lg:items-start lg:justify-end lg:gap-8',
                )}>
                    <ModelProgressBadge stepIndex={stepIndex} total={OUR_MODELS.length} />
                    <p className="max-w-95 self-start text-left [font-family:var(--font-geist)] text-base leading-snug text-[#3F3F3E] max-lg:text-left lg:max-w-[min(100%,20rem)] lg:self-end lg:text-right lg:text-sm">
                        {model.shortDescription}
                    </p>
                </div>
            </div>

            <div
                data-detail-hero
                className={cn(
                    'relative z-30 mx-auto flex min-h-0 w-full max-w-[min(100%,600px)] flex-1 flex-col items-center justify-center overflow-hidden',
                    'max-lg:max-h-[min(48vh,22rem)] max-lg:min-h-[clamp(11rem,36vw,16rem)] max-lg:flex-none',
                    'lg:max-h-[min(40svh,420px)] lg:max-w-[min(100%,840px)] xl:max-h-[min(50svh,560px)] xl:max-w-[min(100%,1080px)]',
                    hideCenterImage && 'lg:hidden',
                )}
            >
                <div className="relative aspect-4/3 h-full max-h-full min-h-0 w-full origin-center scale-[1.04] max-lg:max-h-full lg:scale-[1.08] xl:scale-[1.5]">
                    <Image
                        src={model.overviewImageSrc}
                        alt={model.name}
                        fill
                        sizes="(max-width: 1024px) 90vw, (max-width: 1536px) 1080px, 600px"
                        className="object-contain object-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)] select-none"
                        priority={imagePriority}
                    />
                </div>
            </div>

            <div className={cn(
                'relative z-31 mt-auto w-full shrink-0',
                showCta
                    ? cn('grid gap-5', 'max-lg:grid-cols-2 max-lg:gap-x-6 max-lg:gap-y-5', 'md:max-lg:gap-x-8 md:max-lg:gap-y-6')
                    : cn(
                        'grid gap-5',
                        'max-lg:grid-cols-2 max-lg:gap-x-6 max-lg:gap-y-5',
                        'md:max-lg:gap-x-8 md:max-lg:gap-y-6',
                        'lg:grid-cols-2 lg:items-start lg:gap-x-10',
                        hideCenterImage ? 'lg:mt-4 lg:translate-y-0' : 'lg:-mt-8 lg:-translate-y-14 xl:-mt-10 xl:-translate-y-18 2xl:-translate-y-20',
                    ),
            )}>
                <div className="flex flex-col gap-3 max-lg:col-start-1 sm:gap-5 lg:items-start lg:gap-3">
                    <StatRow stat={model.seats} side="left" />
                    <StatRow stat={model.kts} side="left" className="pl-6 sm:pl-8 lg:pl-12 xl:pl-16" />
                </div>
                {showCta ? (
                    <div className="flex max-lg:col-span-2 max-lg:justify-center">
                        <OurModelsBookCta />
                    </div>
                ) : null}
                <div className="flex flex-col gap-3 max-lg:col-start-2 max-lg:items-end sm:gap-5 lg:col-start-2 lg:items-end lg:gap-3">
                    <StatRow stat={model.ft} side="right" />
                    <StatRow stat={model.nm} side="right" className="pr-6 sm:pr-8 lg:pr-12 xl:pr-16" />
                </div>
            </div>
        </div>
    )
}

export function OurModelsMobileStack({ showOnLarge }: { showOnLarge: boolean }) {
    return (
        <div className={cn('flex flex-col gap-14 pt-20 sm:gap-16 sm:py-12', !showOnLarge && 'lg:hidden')}>
            <div className="flex flex-col items-center gap-3 text-center">
                <h2 className="text-brand-charcoal [font-family:var(--font-halant)] text-[clamp(2.5rem,8vw,4rem)] leading-none tracking-[-0.04em]">
                    Our Models
                </h2>
                <p className="max-w-md [font-family:var(--font-geist)] text-base text-[#3F3F3E]">
                    Premium rotorcraft tailored for charter, executive travel, and specialised operations.
                </p>
            </div>
            {OUR_MODELS.map((model, index) => (
                <article
                    key={model.id}
                    data-ourmodels-mobile-card
                    className={cn(
                        'relative z-10 flex flex-col gap-6 overflow-hidden rounded-2xl max-lg:min-h-0',
                        'border-brand-charcoal/10 border bg-white/50 px-4 py-6 shadow-sm backdrop-blur-sm sm:px-6',
                        'will-change-[transform,opacity]',
                    )}
                >
                    <ModelDetailBody
                        model={model}
                        stepIndex={index}
                        imagePriority={index === 0}
                        showCta={false}
                    />
                </article>
            ))}
        </div>
    )
}