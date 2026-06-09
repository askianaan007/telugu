'use client'

import { m } from 'framer-motion'
import Image from 'next/image'
import { useMemo, useRef, useState, useLayoutEffect, useEffect, type RefObject } from 'react'
import {
    MISSION_BULLETS, VISION_MISSION_IMAGES, VISION_PARAGRAPHS,
    type VisionParagraph,
} from '@/data/visionMission'
import {
    VISION_HANDOFF_MOUNT_ATTR, VISION_HANDOFF_TARGET_ATTR,
} from '@/lib/animations/aboutVisionHandoff'
import { ScrollTrigger } from '@/lib/animations/gsap'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

export const FAQ_CARD_SHADOW =
    'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]'

export const VISION_MISSION_IMAGE_SHELL = 'box-border border border-black/8 p-1.5 sm:p-2'

export const DESKTOP_TRACK_INITIAL_MIN_H = 'lg:min-h-[300dvh]'

export const HEADING_CLASS = cn(
    'text-brand-charcoal [font-family:var(--font-halant)] font-normal tracking-[-0.04em]',
    'text-[clamp(2rem,3.5vw+1rem,4.375rem)] leading-[1.15] sm:leading-[1.2] xl:text-[70px] xl:leading-[88px]',
    'transition-colors duration-500'
)

export const BODY_CLASS = cn(
    '[font-family:var(--font-geist)] text-[#525252] leading-[1.65]',
    'text-[15px] sm:text-base',
    'min-w-0 break-words',
    'transition-[color,opacity] duration-500'
)

export const VISION_WORD_HIGHLIGHT_SPEED = 3.0

export const UPCOMING_TEXT_CLASS = cn(
    '[font-family:var(--font-geist)] text-about-intro-word-muted leading-[1.65] opacity-30',
    'text-[15px] sm:text-base'
)

export const MUTED_HEADING_CLASS = 'text-about-intro-word-muted opacity-30'

export const fadeInUpTight: typeof fadeInUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const STACKED_MOBILE_VIEWPORT = { once: true, amount: 0.14, margin: '0px 0px -8% 0px' } as const
export const STACKED_MOBILE_STAGGER = staggerContainer(0.12, 0.04)

export const STACKED_MOBILE_CONTENT_REVEAL: typeof fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1, delayChildren: 0.08 },
    },
}

// ─── Scroll metrics ────────────────────────────────────────────────────────────

export type ScrollMetrics = {
    visionProgress: number
    activeParagraphIndex: number
    scrollPastVision: boolean
    missionProgress: number
    activeBulletIndex: number
    scrollPastMission: boolean
    showMissionImage: boolean
    visionKenBurns: number
    missionKenBurns: number
}

export const INITIAL_METRICS: ScrollMetrics = {
    visionProgress: 0, activeParagraphIndex: 0, scrollPastVision: false,
    missionProgress: 0, activeBulletIndex: 0, scrollPastMission: false,
    showMissionImage: false, visionKenBurns: 0, missionKenBurns: 0,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function tokenizeParagraphText(text: string): string[] {
    return text.match(/\S+|\s+/g) ?? [text]
}

// ─── Sub-components ────────────────────────────────────────────────────────────

export function VisionMissionImageCard({
    src, alt, className, aspectClassName, imageScale = 1, isReducedMotion = false,
}: {
    src: string; alt: string; className?: string; aspectClassName?: string
    imageScale?: number; isReducedMotion?: boolean
}) {
    return (
        <article
            aria-hidden={className?.includes('opacity-0')}
            className={cn('pointer-events-none w-full overflow-hidden', 'rounded-card sm:rounded-3xl', 'transition-opacity duration-500 ease-out', className, VISION_MISSION_IMAGE_SHELL)}
        >
            <div className={cn(faqAccordionInnerClassName(), FAQ_CARD_SHADOW, 'relative w-full overflow-hidden p-0', aspectClassName ? cn('relative', aspectClassName) : 'h-full min-h-0')}>
                <m.div className="absolute inset-0 origin-center will-change-transform" style={{ transform: `scale(${imageScale})`, transition: isReducedMotion ? undefined : 'transform 0.1s linear' }}>
                    <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw" className="object-cover object-center" />
                </m.div>
            </div>
        </article>
    )
}

export function ScrollHighlightParagraph({
    paragraph, visionProgress, useScrollHighlight, isReducedMotion,
}: {
    paragraph: VisionParagraph; visionProgress: number
    useScrollHighlight: boolean; isReducedMotion: boolean
}) {
    const pRef = useRef<HTMLParagraphElement>(null)
    const showHighlight = useScrollHighlight && !isReducedMotion
    const [scrollProgress] = useState(0)
    const localProgress = showHighlight ? scrollProgress : 1

    useLayoutEffect(() => {
        if (!showHighlight || !pRef.current) return
        const el = pRef.current
        const words = el.querySelectorAll('[data-vision-word]')
        const st = ScrollTrigger.create({
            trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true,
            onUpdate: (self) => {
                const progress = self.progress * VISION_WORD_HIGHLIGHT_SPEED
                const wordCount = words.length
                words.forEach((word, idx) => {
                    const isRead = (idx + 1) / wordCount <= progress
                    const w = word as HTMLElement
                    if (isRead) { w.classList.remove('text-brand-muted'); w.classList.add('text-[#121F2F]') }
                    else { w.classList.remove('text-[#121F2F]'); w.classList.add('text-brand-muted') }
                })
            }
        })
        return () => st.kill()
    }, [showHighlight])

    const tokens = useMemo(() => tokenizeParagraphText(paragraph.text), [paragraph.text])

    if (!showHighlight) return <p className={cn(BODY_CLASS, 'text-[#121F2F]')}>{paragraph.text}</p>

    const wordCount = tokens.filter((t) => /\S/.test(t)).length
    const isActive = localProgress > 0 && localProgress < 1
    const isPast = localProgress >= 1
    const isUpcoming = localProgress <= 0
    let wordIndex = 0
    const highlightProgress = Math.min(1, localProgress * VISION_WORD_HIGHLIGHT_SPEED)

    return (
        <p ref={pRef} className={isUpcoming ? UPCOMING_TEXT_CLASS : BODY_CLASS}>
            {tokens.map((token, i) => {
                if (!/\S/.test(token)) return <span key={`${paragraph.id}-ws-${i}`}>{token}</span>
                const index = wordIndex++
                const readThrough = isPast || (isActive && (index + 1) / Math.max(wordCount, 1) <= highlightProgress)
                return (
                    <span key={`${paragraph.id}-w-${i}`} data-vision-word className={cn('transition-colors duration-150', readThrough ? 'text-[#121F2F]' : 'text-brand-muted')}>
                        {token}
                    </span>
                )
            })}
        </p>
    )
}

export function ScrollHighlightBullet({
    text, bulletIndex, useScrollHighlight, isReducedMotion,
}: {
    text: string; bulletIndex: number; useScrollHighlight: boolean; isReducedMotion: boolean
}) {
    const pRef = useRef<HTMLSpanElement>(null)
    const showHighlight = useScrollHighlight && !isReducedMotion
    const [scrollProgress] = useState(0)
    const localProgress = showHighlight ? scrollProgress : 1

    useLayoutEffect(() => {
        if (!showHighlight || !pRef.current) return
        const el = pRef.current
        const words = el.querySelectorAll('[data-mission-word]')
        const st = ScrollTrigger.create({
            trigger: el, start: 'top 50%', end: 'bottom 25%', scrub: true,
            onUpdate: (self) => {
                const progress = self.progress * VISION_WORD_HIGHLIGHT_SPEED
                const wordCount = words.length
                words.forEach((word, idx) => {
                    const isRead = (idx + 1) / wordCount <= progress
                    const w = word as HTMLElement
                    if (isRead) { w.classList.remove('text-brand-muted'); w.classList.add('text-[#121F2F]') }
                    else { w.classList.remove('text-[#121F2F]'); w.classList.add('text-brand-muted') }
                })
            }
        })
        return () => st.kill()
    }, [showHighlight])

    const tokens = useMemo(() => tokenizeParagraphText(text), [text])

    if (!showHighlight) return <span className={cn('min-w-0 flex-1', 'text-[#121F2F]')}>{text}</span>

    const wordCount = tokens.filter((t) => /\S/.test(t)).length
    const isActive = localProgress > 0 && localProgress < 1
    const isPast = localProgress >= 1
    const isUpcoming = localProgress <= 0
    let wordIndex = 0
    const highlightProgress = Math.min(1, localProgress * VISION_WORD_HIGHLIGHT_SPEED)

    return (
        <span ref={pRef} className={isUpcoming ? cn('min-w-0 flex-1', UPCOMING_TEXT_CLASS) : 'min-w-0 flex-1'}>
            {tokens.map((token, i) => {
                if (!/\S/.test(token)) return <span key={`mission-b${bulletIndex}-ws-${i}`}>{token}</span>
                const index = wordIndex++
                const readThrough = isPast || (isActive && (index + 1) / Math.max(wordCount, 1) <= highlightProgress)
                return (
                    <span key={`mission-b${bulletIndex}-w-${i}`} data-mission-word className={cn('transition-colors duration-300', readThrough ? 'text-[#121F2F]' : 'text-brand-muted')}>
                        {token}
                    </span>
                )
            })}
        </span>
    )
}

export function MissionBulletList({
    missionProgress: _mp, activeBulletIndex: _ab, scrollPastMission: _sp,
    isReducedMotion, useScrollHighlight = false, staggerEntrance = false, className,
}: {
    missionProgress: number; activeBulletIndex: number; scrollPastMission: boolean
    isReducedMotion: boolean; useScrollHighlight?: boolean; staggerEntrance?: boolean; className?: string
}) {
    const items = MISSION_BULLETS.map((bullet, index) => {
        const content = useScrollHighlight
            ? <ScrollHighlightBullet text={bullet} bulletIndex={index} useScrollHighlight={useScrollHighlight} isReducedMotion={isReducedMotion} />
            : <span>{bullet}</span>
        const row = (
            <>
                <Image src={VISION_MISSION_IMAGES.bullet.src} alt="" width={20} height={21} className="mt-0.5 h-5 w-5 shrink-0 object-contain sm:h-5.25" aria-hidden />
                {content}
            </>
        )
        if (staggerEntrance) {
            return <m.li key={index} variants={fadeInUpTight} className={cn(BODY_CLASS, 'flex gap-2.5 opacity-100 sm:gap-3')}>{row}</m.li>
        }
        return <li key={index} className={cn(BODY_CLASS, 'flex gap-2.5 opacity-100 sm:gap-3')}>{row}</li>
    })

    if (staggerEntrance) {
        return <m.ul variants={STACKED_MOBILE_CONTENT_REVEAL} className={cn('flex flex-col gap-4 sm:gap-5 lg:gap-6', className)}>{items}</m.ul>
    }
    return <ul className="flex flex-col gap-4 sm:gap-5 lg:gap-6">{items}</ul>
}

export function DesktopImagePanel({
    showMissionImage, visionKenBurns, missionKenBurns, isReducedMotion,
    handoffUsesMosaic, handoffComplete, handoffMorphing,
}: {
    showMissionImage: boolean; visionKenBurns: number; missionKenBurns: number
    isReducedMotion: boolean; handoffUsesMosaic: boolean; handoffComplete: boolean; handoffMorphing: boolean
}) {
    const showVisionPlaceholder = !handoffUsesMosaic && !handoffComplete && !handoffMorphing
    const visionScale = isReducedMotion ? 1 : 1 + visionKenBurns * 0.03
    const missionScale = isReducedMotion ? 1 : 1 + missionKenBurns * 0.03

    return (
        <div className="relative h-full min-h-0 w-full">
            <div {...{ [VISION_HANDOFF_TARGET_ATTR]: '' }} className="rounded-card absolute inset-0 overflow-hidden">
                {handoffUsesMosaic ? (
                    <div {...{ [VISION_HANDOFF_MOUNT_ATTR]: '' }} className={cn('absolute inset-0 z-1 min-h-full w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]', showMissionImage ? 'opacity-0 scale-[0.85]' : 'opacity-100 scale-100')} />
                ) : null}
                {showVisionPlaceholder ? (
                    <VisionMissionImageCard
                        src={VISION_MISSION_IMAGES.vision.src} alt={VISION_MISSION_IMAGES.vision.alt}
                        className={cn('absolute inset-0 z-0 h-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]', showMissionImage ? 'opacity-0 scale-[0.85]' : 'opacity-100 scale-100')}
                        imageScale={visionScale} isReducedMotion={isReducedMotion}
                    />
                ) : null}
                <VisionMissionImageCard
                    src={VISION_MISSION_IMAGES.mission.src} alt={VISION_MISSION_IMAGES.mission.alt}
                    className={cn('absolute inset-0 z-10 h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]', showMissionImage ? 'translate-y-0' : 'translate-y-full pointer-events-none')}
                    imageScale={missionScale} isReducedMotion={isReducedMotion}
                />
            </div>
        </div>
    )
}

export function useMissionInView(missionRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
    const [missionInView, setMissionInView] = useState(false)
    useEffect(() => {
        if (!enabled) return
        const el = missionRef.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => setMissionInView(entry?.isIntersecting ?? false), { threshold: 0, rootMargin: '0px' })
        observer.observe(el)
        return () => observer.disconnect()
    }, [enabled, missionRef])
    return missionInView
}