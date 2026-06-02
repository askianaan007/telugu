'use client'

import { m, useMotionValue, useSpring, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    useSyncExternalStore,
    type RefObject,
} from 'react'

import { Section } from '@/components/layout/Section'
import {
    scheduleScrollTriggerRefresh,
    useAboutVisionHandoffOptional,
} from '@/components/sections/about/AboutVisionHandoffContext'
import {
    MISSION_BULLETS,
    MISSION_HEADING,
    VISION_HEADING,
    VISION_MISSION_IMAGES,
    VISION_PARAGRAPHS,
    getActiveBulletIndex,
    getActiveParagraphIndex,
    type VisionParagraph,
} from '@/data/visionMission'
import {
    VISION_HANDOFF_MOUNT_ATTR,
    VISION_HANDOFF_TARGET_ATTR,
    VISION_HANDOFF_TRIGGER_ATTR,
    VISION_PANEL_SLOT_ATTR,
} from '@/lib/animations/aboutVisionHandoff'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { fadeInUp, scaleIn, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'

const FAQ_CARD_SHADOW =
    'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]'

const VISION_MISSION_IMAGE_SHELL = 'box-border border border-black/8 p-1.5 sm:p-2'

const DESKTOP_TRACK_INITIAL_MIN_H = 'lg:min-h-[600dvh]'

const HEADING_CLASS = cn(
    'text-brand-charcoal [font-family:var(--font-halant)] font-normal tracking-[-0.04em]',
    'text-[clamp(2rem,3.5vw+1rem,4.375rem)] leading-[1.15] sm:leading-[1.2] xl:text-[70px] xl:leading-[88px]',
)

const BODY_CLASS = cn(
    '[font-family:var(--font-geist)] text-[#525252] leading-[1.65]',
    'text-[15px] sm:text-base',
    'min-w-0 break-words',
)

const VISION_WORD_HIGHLIGHT_SPEED = 3.0

const UPCOMING_TEXT_CLASS = cn(
    '[font-family:var(--font-geist)] text-[#737373] leading-[1.65] opacity-30',
    'text-[15px] sm:text-base'
)

const IMAGE_INNER_CLASS = cn(
    'bg-white flex flex-col items-stretch justify-center gap-0 rounded-[16px] border-4 border-white',
    'relative min-h-[72px] w-full overflow-hidden p-0'
)

const fadeInUpTight: typeof fadeInUp = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
}

const STACKED_MOBILE_VIEWPORT = { once: true, amount: 0.14, margin: '0px 0px -8% 0px' } as const
const STACKED_MOBILE_STAGGER = staggerContainer(0.12, 0.04)

const STACKED_MOBILE_CONTENT_REVEAL: typeof fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.1,
            delayChildren: 0.08,
        },
    },
}

// ─── Scroll budget constants ────────────────────────────────────────────────
/** Scroll distance (in viewport heights) allocated per vision paragraph. */
const VISION_SCROLL_PER_PARAGRAPH = 1.4
/** Scroll distance (in viewport heights) allocated per mission bullet. */
const MISSION_SCROLL_PER_BULLET = 1.0
/** Total number of vision paragraphs. */
const VISION_PARAGRAPH_COUNT = VISION_PARAGRAPHS.length
/** Total number of mission bullets. */
const MISSION_BULLET_COUNT = MISSION_BULLETS.length

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function subscribeLg(callback: () => void) {
    if (typeof window === 'undefined') return () => { }
    const mq = window.matchMedia('(min-width: 1024px)')
    mq.addEventListener('change', callback)
    return () => mq.removeEventListener('change', callback)
}
function getLgSnapshot() { return window.matchMedia('(min-width: 1024px)').matches }
function getLgServerSnapshot() { return false }

function subscribeMd(callback: () => void) {
    if (typeof window === 'undefined') return () => { }
    const mq = window.matchMedia('(min-width: 768px)')
    mq.addEventListener('change', callback)
    return () => mq.removeEventListener('change', callback)
}
function getMdSnapshot() { return window.matchMedia('(min-width: 768px)').matches }
function getMdServerSnapshot() { return false }

type ScrollMetrics = {
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

function computeMetrics(
    scrollTop: number,
    visionHeight: number,
    missionHeight: number,
    contentTravel = 0,
    /** Explicit scroll budget for vision section (px). 0 = fall back to visionHeight. */
    visionBudget = 0,
    /** Explicit scroll budget for mission bullets (px). 0 = fall back to old logic. */
    missionBudget = 0,
): ScrollMetrics {
    // ── Vision progress ──────────────────────────────────────────────────────
    const visionScrollRange = visionBudget > 0 ? visionBudget : Math.max(visionHeight, 1)
    const visionProgress = clamp(scrollTop / visionScrollRange, 0, 1)
    const scrollPastVision = scrollTop >= visionScrollRange - 1
    const activeParagraphIndex = scrollPastVision
        ? VISION_PARAGRAPHS.length
        : getActiveParagraphIndex(visionProgress)

    // ── Mission progress ─────────────────────────────────────────────────────
    const missionScrollTop = Math.max(0, scrollTop - visionScrollRange)
    const missionScrollRange = missionBudget > 0
        ? missionBudget
        : contentTravel > 0
            ? Math.max(contentTravel - visionScrollRange, missionHeight, 1)
            : Math.max(missionHeight, 1)

    const scrollPastMission = missionScrollRange > 0 && missionScrollTop >= missionScrollRange - 1
    const missionProgress = scrollPastMission
        ? 1
        : missionScrollRange > 0
            ? clamp(missionScrollTop / missionScrollRange, 0, 1)
            : 0
    const activeBulletIndex = scrollPastMission
        ? MISSION_BULLETS.length
        : getActiveBulletIndex(missionProgress)

    const showMissionImage = visionProgress >= 0.85

    const visionLocal = clamp(scrollTop / Math.max(visionScrollRange, 1), 0, 1)
    const missionLocal = missionScrollRange > 0 && missionScrollTop > 0
        ? clamp(missionScrollTop / missionScrollRange, 0, 1)
        : 0

    return {
        visionProgress,
        activeParagraphIndex,
        scrollPastVision,
        missionProgress,
        activeBulletIndex,
        scrollPastMission,
        showMissionImage,
        visionKenBurns: visionLocal,
        missionKenBurns: missionLocal,
    }
}

function VisionMissionImageCard({
    src,
    alt,
    className,
    aspectClassName,
    imageScale = 1,
    isReducedMotion = false,
}: {
    src: string
    alt: string
    className?: string
    aspectClassName?: string
    imageScale?: number
    isReducedMotion?: boolean
}) {
    return (
        <article
            className={cn(
                'pointer-events-none w-full overflow-hidden',
                'rounded-[20px] sm:rounded-[24px]',
                className,
                VISION_MISSION_IMAGE_SHELL
            )}
        >
            <div
                className={cn(
                    IMAGE_INNER_CLASS,
                    FAQ_CARD_SHADOW,
                    'relative w-full overflow-hidden p-0',
                    aspectClassName ? cn('relative', aspectClassName) : 'h-full min-h-0'
                )}
            >
                <div
                    className="absolute inset-0 origin-center will-change-transform"
                    style={{
                        transform: `scale(${imageScale})`,
                        transition: isReducedMotion ? undefined : 'transform 0.3s cubic-bezier(0.25,1,0.5,1)',
                    }}
                >
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                        className="object-cover object-center"
                    />
                </div>
            </div>
        </article>
    )
}

function tokenizeParagraphText(text: string): string[] {
    return text.match(/\S+|\s+/g) ?? [text]
}

function ScrollHighlightParagraph({
    paragraph,
    visionProgress,
    useScrollHighlight,
    isReducedMotion,
}: {
    paragraph: VisionParagraph
    visionProgress: number
    useScrollHighlight: boolean
    isReducedMotion: boolean
}) {
    const pRef = useRef<HTMLParagraphElement>(null)
    const showHighlight = useScrollHighlight && !isReducedMotion
    const [scrollProgress, setScrollProgress] = useState(0)
    const localProgress = showHighlight ? scrollProgress : 1

    useEffect(() => {
        if (!showHighlight) return
        const el = pRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        const startPoint = vh * 0.75
        const endPoint = vh * 0.45
        const distanceToTravel = rect.height + (startPoint - endPoint)
        const progress = clamp((startPoint - rect.top) / Math.max(1, distanceToTravel), 0, 1)
        setScrollProgress(progress)
    }, [visionProgress, showHighlight])

    if (!showHighlight) {
        return <p className={cn(BODY_CLASS, 'text-[#121F2F]')}>{paragraph.text}</p>
    }

    const tokens = tokenizeParagraphText(paragraph.text)
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
                    <span
                        key={`${paragraph.id}-w-${i}`}
                        className={cn('transition-colors duration-200', readThrough ? 'text-[#121F2F]' : 'text-[#525252]')}
                    >
                        {token}
                    </span>
                )
            })}
        </p>
    )
}

function ScrollHighlightBullet({
    text,
    bulletIndex,
    useScrollHighlight,
    isReducedMotion,
}: {
    text: string
    bulletIndex: number
    useScrollHighlight: boolean
    isReducedMotion: boolean
}) {
    const pRef = useRef<HTMLSpanElement>(null)
    const showHighlight = useScrollHighlight && !isReducedMotion
    const [scrollProgress, setScrollProgress] = useState(0)
    const localProgress = showHighlight ? scrollProgress : 1

    useEffect(() => {
        if (!showHighlight) return
        const el = pRef.current
        if (!el) return
        const compute = () => {
            const rect = el.getBoundingClientRect()
            const vh = window.innerHeight
            const startPoint = vh * 0.5
            const endPoint = vh * 0.25
            const distanceToTravel = rect.height + (startPoint - endPoint)
            const progress = clamp((startPoint - rect.top) / Math.max(1, distanceToTravel), 0, 1)
            setScrollProgress(progress)
        }
        compute()
        window.addEventListener('scroll', compute, { passive: true })
        return () => window.removeEventListener('scroll', compute)
    }, [showHighlight])

    if (!showHighlight) {
        return <span className="min-w-0 flex-1 text-[#121F2F]">{text}</span>
    }

    const tokens = tokenizeParagraphText(text)
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
                    <span
                        key={`mission-b${bulletIndex}-w-${i}`}
                        className={cn('transition-colors duration-200', readThrough ? 'text-[#121F2F]' : 'text-[#525252]')}
                    >
                        {token}
                    </span>
                )
            })}
        </span>
    )
}

function MissionBulletList({
    missionProgress: _missionProgress,
    activeBulletIndex: _activeBulletIndex,
    scrollPastMission: _scrollPastMission,
    isReducedMotion,
    useScrollHighlight = false,
    staggerEntrance = false,
    className,
}: {
    missionProgress: number
    activeBulletIndex: number
    scrollPastMission: boolean
    isReducedMotion: boolean
    useScrollHighlight?: boolean
    staggerEntrance?: boolean
    className?: string
}) {
    const items = MISSION_BULLETS.map((bullet, index) => {
        const content = useScrollHighlight ? (
            <ScrollHighlightBullet
                text={bullet}
                bulletIndex={index}
                useScrollHighlight={useScrollHighlight}
                isReducedMotion={isReducedMotion}
            />
        ) : (
            <span className="min-w-0 flex-1 text-[#121F2F]">{bullet}</span>
        )

        const row = (
            <>
                <Image
                    src={VISION_MISSION_IMAGES.bullet.src}
                    alt=""
                    width={20}
                    height={21}
                    className="mt-0.5 h-5 w-5 shrink-0 object-contain sm:h-[21px]"
                    aria-hidden
                />
                {content}
            </>
        )

        if (staggerEntrance) {
            return (
                <m.li key={index} variants={fadeInUpTight} className={cn(BODY_CLASS, 'flex gap-2.5 sm:gap-3')}>
                    {row}
                </m.li>
            )
        }

        return (
            <li key={index} className={cn(BODY_CLASS, 'flex gap-2.5 sm:gap-3')}>
                {row}
            </li>
        )
    })

    if (staggerEntrance) {
        return (
            <m.ul variants={STACKED_MOBILE_CONTENT_REVEAL} className={cn('flex flex-col gap-4 sm:gap-5 lg:gap-6', className)}>
                {items}
            </m.ul>
        )
    }

    return <ul className="flex flex-col gap-4 sm:gap-5 lg:gap-6">{items}</ul>
}

function DesktopImagePanel({
    showMissionImage,
    visionKenBurns,
    missionKenBurns,
    isReducedMotion,
    handoffUsesMosaic,
    handoffComplete,
    handoffMorphing,
}: {
    showMissionImage: boolean
    visionKenBurns: number
    missionKenBurns: number
    isReducedMotion: boolean
    handoffUsesMosaic: boolean
    handoffComplete: boolean
    handoffMorphing: boolean
}) {
    const showVisionPlaceholder = !handoffUsesMosaic && !handoffComplete && !handoffMorphing
    const visionScale = isReducedMotion ? 1 : 1 + visionKenBurns * 0.03
    const missionScale = isReducedMotion ? 1 : 1 + missionKenBurns * 0.03

    return (
        <div className="relative h-full min-h-0 w-full">
            <div
                {...{ [VISION_HANDOFF_TARGET_ATTR]: '' }}
                className="rounded-[20px] absolute inset-0 overflow-hidden"
            >
                {handoffUsesMosaic ? (
                    <div
                        {...{ [VISION_HANDOFF_MOUNT_ATTR]: '' }}
                        className={cn(
                            'absolute inset-0 z-[1] min-h-full w-full will-change-[opacity,transform]',
                            'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
                            showMissionImage ? 'opacity-0 scale-[0.85]' : 'opacity-100 scale-100'
                        )}
                    />
                ) : null}
                {showVisionPlaceholder ? (
                    <VisionMissionImageCard
                        src={VISION_MISSION_IMAGES.vision.src}
                        alt={VISION_MISSION_IMAGES.vision.alt}
                        className={cn(
                            'absolute inset-0 z-0 h-full will-change-[opacity,transform]',
                            'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
                            showMissionImage ? 'opacity-0 scale-[0.85]' : 'opacity-100 scale-100'
                        )}
                        imageScale={visionScale}
                        isReducedMotion={isReducedMotion}
                    />
                ) : null}
                <VisionMissionImageCard
                    src={VISION_MISSION_IMAGES.mission.src}
                    alt={VISION_MISSION_IMAGES.mission.alt}
                    className={cn(
                        'absolute inset-0 z-10 h-full will-change-[opacity,transform]',
                        'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
                        showMissionImage
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-full pointer-events-none'
                    )}
                    imageScale={missionScale}
                    isReducedMotion={isReducedMotion}
                />
            </div>
        </div>
    )
}

function useMissionInView(missionRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
    const [missionInView, setMissionInView] = useState(false)
    useEffect(() => {
        if (!enabled) return
        const el = missionRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => setMissionInView(entry?.isIntersecting ?? false),
            { threshold: 0, rootMargin: '0px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [enabled, missionRef])
    return missionInView
}

export function VisionMissionSection() {
    const scrollTrackRef = useRef<HTMLDivElement>(null)
    const stickyShellRef = useRef<HTMLDivElement>(null)
    const rightPanelRef = useRef<HTMLDivElement>(null)
    const rightContentRef = useRef<HTMLDivElement>(null)
    const visionSectionRef = useRef<HTMLElement>(null)
    const missionSectionRef = useRef<HTMLElement>(null)
    const mobileMissionRef = useRef<HTMLDivElement>(null)
    const mobileVisionImageRef = useRef<HTMLDivElement>(null)

    const handoffCtx = useAboutVisionHandoffOptional()
    const handoffCtxRef = useRef(handoffCtx)
    useLayoutEffect(() => { handoffCtxRef.current = handoffCtx })

    const reduceMotion = useReducedMotion()
    const isLg = useSyncExternalStore(subscribeLg, getLgSnapshot, getLgServerSnapshot)
    const isMd = useSyncExternalStore(subscribeMd, getMdSnapshot, getMdServerSnapshot)
    const isReducedMotion = reduceMotion === true
    const useDesktopScrollScrub = isLg && !isReducedMotion
    const handoffUsesMosaic = Boolean(handoffCtx) && !isReducedMotion && isMd
    const handoffComplete = handoffCtx?.handoffComplete ?? false
    const handoffMorphing = handoffCtx?.isHandoffMorphing() ?? false

    const setVisionPanelSlotRef = useCallback((el: HTMLDivElement | null) => {
        const ctx = handoffCtxRef.current
        if (!ctx) return
        if (!el) { ctx.registerVisionPanelSlot(null); return }
        const layout = el.dataset.visionLayout
        if (layout === 'lg' && window.matchMedia('(min-width: 1024px)').matches) {
            ctx.registerVisionPanelSlot(el)
        } else if (layout === 'md' && window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches) {
            ctx.registerVisionPanelSlot(el)
        }
    }, [])

    useEffect(() => {
        if (!handoffCtx) return
        if (isReducedMotion) {
            handoffCtx.setHandoffPhase('slotted')
            handoffCtx.setHandoffComplete(true)
            return
        }
        if (!isMd) handoffCtx.setHandoffComplete(false)
    }, [isMd, isReducedMotion, handoffCtx])

    useGSAP(
        () => {
            if (isMd || isReducedMotion) return
            const card = mobileVisionImageRef.current
            if (!card) return
            const tween = gsap.fromTo(
                card,
                { autoAlpha: 0, scale: 0.88 },
                {
                    autoAlpha: 1, scale: 1, ease: 'none',
                    scrollTrigger: {
                        trigger: card, start: 'top 92%', end: 'top 55%',
                        scrub: 0.85, invalidateOnRefresh: true,
                    },
                }
            )
            return () => {
                tween.scrollTrigger?.kill()
                tween.kill()
                gsap.set(card, { clearProps: 'opacity,visibility,transform' })
            }
        },
        { scope: mobileVisionImageRef, dependencies: [isMd, isReducedMotion] }
    )

    const contentTravelRef = useRef(0)
    const pinScrollRangeRef = useRef(0)
    // Explicit scroll budgets for vision and mission sections
    const visionBudgetRef = useRef(0)
    const missionBudgetRef = useRef(0)

    const rawContentOffset = useMotionValue(0)
    const smoothContentOffset = useSpring(rawContentOffset, { stiffness: 180, damping: 42, mass: 0.6 })
    const contentY = useMotionValue(0)

    const [metrics, setMetrics] = useState<ScrollMetrics>({
        visionProgress: 0,
        activeParagraphIndex: 0,
        scrollPastVision: false,
        missionProgress: 0,
        activeBulletIndex: 0,
        scrollPastMission: false,
        showMissionImage: false,
        visionKenBurns: 0,
        missionKenBurns: 0,
    })

    const mobileMissionInView = useMissionInView(mobileMissionRef, !isLg)
    const stackedMissionBulletsInView = !isLg || isReducedMotion || mobileMissionInView

    const applyScrollMetrics = useCallback((virtualScrollTop: number) => {
        const visionEl = visionSectionRef.current
        const missionEl = missionSectionRef.current
        if (!visionEl) return
        setMetrics((prev) => {
            const next = computeMetrics(
                virtualScrollTop,
                visionEl.offsetHeight,
                missionEl?.offsetHeight ?? 0,
                contentTravelRef.current,
                visionBudgetRef.current,
                missionBudgetRef.current,
            )
            if (
                prev.visionProgress === next.visionProgress &&
                prev.activeParagraphIndex === next.activeParagraphIndex &&
                prev.scrollPastVision === next.scrollPastVision &&
                prev.missionProgress === next.missionProgress &&
                prev.activeBulletIndex === next.activeBulletIndex &&
                prev.scrollPastMission === next.scrollPastMission &&
                prev.showMissionImage === next.showMissionImage &&
                prev.visionKenBurns === next.visionKenBurns &&
                prev.missionKenBurns === next.missionKenBurns
            ) return prev
            return next
        })
    }, [])

    useMotionValueEvent(smoothContentOffset, 'change', (latest) => {
        contentY.set(-latest)
        applyScrollMetrics(latest)
    })

    const SCROLL_SPEED_MULTIPLIER = 1.2

    const measureDesktopScrollLayout = useCallback(() => {
        const track = scrollTrackRef.current
        const shell = stickyShellRef.current
        const rightPanel = rightPanelRef.current
        const content = rightContentRef.current
        const missionEl = missionSectionRef.current
        if (!track || !shell || !content) return

        const viewportH = window.visualViewport?.height ?? window.innerHeight
        const clipH = rightPanel?.clientHeight ?? viewportH

        // ── Compute explicit scroll budgets ────────────────────────────────
        // Give each vision paragraph its own generous scroll band
        const visionBudget = Math.round(VISION_PARAGRAPH_COUNT * VISION_SCROLL_PER_PARAGRAPH * viewportH)
        // Give each mission bullet its own scroll band
        const missionBudget = Math.round(MISSION_BULLET_COUNT * MISSION_SCROLL_PER_BULLET * viewportH)

        visionBudgetRef.current = visionBudget
        missionBudgetRef.current = missionBudget

        // ── Measure mission bullets overflow (for physical content scroll) ─
        const missionBulletsEl = rightPanel?.querySelector<HTMLElement>('[data-mission-bullets]')
        const missionBulletsScrollH = missionBulletsEl?.scrollHeight ?? 0
        const missionBulletsClientH = missionBulletsEl?.clientHeight ?? 0
        const missionBulletsOverflow = Math.max(0, missionBulletsScrollH - missionBulletsClientH)

        const contentH = content.scrollHeight
        const missionPb = missionEl ? parseFloat(getComputedStyle(missionEl).paddingBottom) || 128 : 128

        // Total virtual content travel must accommodate both budgets plus
        // whatever the actual content height needs, whichever is larger.
        const budgetBasedTravel = visionBudget + missionBudget + viewportH
        const contentBasedTravel = contentH - clipH + missionPb + 32 + missionBulletsOverflow + viewportH
        const travel = Math.max(viewportH * 2, budgetBasedTravel, contentBasedTravel)
        const pinScrollRange = travel / SCROLL_SPEED_MULTIPLIER

        contentTravelRef.current = travel
        pinScrollRangeRef.current = pinScrollRange
        track.style.minHeight = `${viewportH + pinScrollRange}px`
    }, [SCROLL_SPEED_MULTIPLIER])

    const syncDesktopScrollFromTrack = useCallback(() => {
        const track = scrollTrackRef.current
        if (!track) return
        const travel = contentTravelRef.current
        const pinScrollRange = pinScrollRangeRef.current
        if (pinScrollRange <= 0) { contentY.set(0); return }
        const rawScrolled = Math.max(0, -track.getBoundingClientRect().top)
        const contentOffset = clamp(rawScrolled * SCROLL_SPEED_MULTIPLIER, 0, travel)
        rawContentOffset.set(contentOffset)
    }, [rawContentOffset, SCROLL_SPEED_MULTIPLIER])

    useEffect(() => {
        if (!useDesktopScrollScrub) {
            contentTravelRef.current = 0
            pinScrollRangeRef.current = 0
            visionBudgetRef.current = 0
            missionBudgetRef.current = 0
            contentY.set(0)
            if (scrollTrackRef.current) scrollTrackRef.current.style.minHeight = ''
            return
        }
        const shell = stickyShellRef.current
        const content = rightContentRef.current
        if (!shell || !content) return

        const runMeasure = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    measureDesktopScrollLayout()
                    syncDesktopScrollFromTrack()
                })
            })
        }

        runMeasure()
        window.addEventListener('load', runMeasure)
        window.addEventListener('resize', runMeasure)
        const onScroll = () => requestAnimationFrame(syncDesktopScrollFromTrack)
        window.addEventListener('scroll', onScroll, { passive: true })

        const ro = new ResizeObserver(runMeasure)
        ro.observe(content)
        ro.observe(shell)
        const rightPanel = rightPanelRef.current
        const visionEl = visionSectionRef.current
        const missionEl = missionSectionRef.current
        if (rightPanel) ro.observe(rightPanel)
        if (visionEl) ro.observe(visionEl)
        if (missionEl) ro.observe(missionEl)
        void document.fonts.ready.then(runMeasure)

        return () => {
            window.removeEventListener('load', runMeasure)
            window.removeEventListener('resize', runMeasure)
            window.removeEventListener('scroll', onScroll)
            ro.disconnect()
        }
    }, [useDesktopScrollScrub, measureDesktopScrollLayout, syncDesktopScrollFromTrack, rawContentOffset])

    useEffect(() => {
        if (!handoffCtx || !useDesktopScrollScrub) return
        if (handoffCtx.handoffPhase !== 'slotted' && !handoffCtx.handoffComplete) return
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                measureDesktopScrollLayout()
                syncDesktopScrollFromTrack()
                scheduleScrollTriggerRefresh()
            })
        })
    }, [
        handoffCtx,
        handoffCtx?.handoffPhase,
        handoffCtx?.handoffComplete,
        useDesktopScrollScrub,
        measureDesktopScrollLayout,
        syncDesktopScrollFromTrack,
    ])

    useEffect(() => {
        if (!handoffCtx) return
        const syncPanelSlot = () => {
            const lgSlot = document.querySelector<HTMLDivElement>('[data-vision-layout="lg"]')
            const mdSlot = document.querySelector<HTMLDivElement>('[data-vision-layout="md"]')
            if (window.matchMedia('(min-width: 1024px)').matches && lgSlot) {
                handoffCtx.registerVisionPanelSlot(lgSlot)
            } else if (window.matchMedia('(min-width: 768px)').matches && mdSlot) {
                handoffCtx.registerVisionPanelSlot(mdSlot)
            }
        }
        syncPanelSlot()
        window.addEventListener('resize', syncPanelSlot)
        return () => window.removeEventListener('resize', syncPanelSlot)
    }, [handoffCtx, isLg, isMd])

    useEffect(() => {
        if (!isLg) {
            contentTravelRef.current = 0
            pinScrollRangeRef.current = 0
            visionBudgetRef.current = 0
            missionBudgetRef.current = 0
            rawContentOffset.set(0)
            if (scrollTrackRef.current) scrollTrackRef.current.style.minHeight = ''
            return
        }
        const runMeasure = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    measureDesktopScrollLayout()
                    syncDesktopScrollFromTrack()
                })
            })
        }
        runMeasure()
        window.addEventListener('resize', runMeasure)
        return () => window.removeEventListener('resize', runMeasure)
    }, [isLg, useDesktopScrollScrub, measureDesktopScrollLayout, syncDesktopScrollFromTrack, rawContentOffset])

    return (
        <Section
            id="vision-mission"
            variant="default"
            paddingY="none"
            {...{ [VISION_HANDOFF_TRIGGER_ATTR]: '' }}
            className="bg-brand-surface overflow-visible relative z-[45]"
        >
            {/* DESKTOP lg+ */}
            <m.div
                ref={scrollTrackRef}
                className={cn('relative hidden w-full lg:block', DESKTOP_TRACK_INITIAL_MIN_H)}
            >
                <m.div
                    ref={stickyShellRef}
                    className={cn(
                        'sticky top-0 isolate z-10',
                        'mx-auto grid h-dvh max-h-dvh min-h-dvh w-full max-w-[1280px]',
                        'grid-cols-[4.5fr_7.5fr] items-stretch',
                        'px-4 sm:px-6 lg:px-8 xl:px-0',
                        'gap-6 xl:gap-10',
                        'overflow-clip'
                    )}
                >
                    {/* Left sticky image */}
                    <div
                        ref={setVisionPanelSlotRef}
                        data-vision-layout="lg"
                        {...{ [VISION_PANEL_SLOT_ATTR]: '' }}
                        className="relative h-full min-h-0 min-w-0 self-stretch py-6 lg:py-8"
                    >
                        <DesktopImagePanel
                            showMissionImage={metrics.showMissionImage}
                            visionKenBurns={metrics.visionKenBurns}
                            missionKenBurns={metrics.missionKenBurns}
                            isReducedMotion={isReducedMotion}
                            handoffUsesMosaic={handoffUsesMosaic}
                            handoffComplete={handoffComplete}
                            handoffMorphing={handoffMorphing}
                        />
                    </div>

                    {/* Right clip panel */}
                    <div ref={rightPanelRef} className="relative h-full min-h-0 min-w-0 overflow-clip">
                        <m.div
                            ref={rightContentRef}
                            className={cn(
                                'flex min-w-0 flex-col will-change-transform h-full',
                                isReducedMotion && 'overflow-y-auto overscroll-contain'
                            )}
                            style={useDesktopScrollScrub ? { y: contentY } : undefined}
                        >
                            <div className="flex flex-col gap-1 pt-8 lg:pt-10 xl:pt-14">
                                <h2
                                    style={{
                                        opacity: metrics.scrollPastVision ? 0.28 : 1,
                                        transition: 'opacity 0.45s cubic-bezier(0.25,1,0.5,1)',
                                        willChange: 'opacity',
                                    }}
                                    className={HEADING_CLASS}
                                >
                                    {VISION_HEADING}
                                </h2>
                                <h2
                                    style={{
                                        opacity: metrics.scrollPastVision ? 1 : 0.28,
                                        transition: 'opacity 0.45s cubic-bezier(0.25,1,0.5,1)',
                                        willChange: 'opacity',
                                    }}
                                    className={HEADING_CLASS}
                                >
                                    {MISSION_HEADING}
                                </h2>
                            </div>

                            <section
                                ref={visionSectionRef}
                                className="relative min-w-0 flex-1 min-h-0 pt-8 pb-8 xl:pb-0"
                            >
                                {/* Vision paragraphs */}
                                <div
                                    className="flex flex-col gap-6 lg:gap-8"
                                    style={{
                                        opacity: metrics.scrollPastVision ? 0 : 1,
                                        transition: 'opacity 0.6s ease',
                                        willChange: 'opacity',
                                        pointerEvents: metrics.scrollPastVision ? 'none' : 'auto',
                                        visibility: metrics.scrollPastVision ? 'hidden' : 'visible',
                                    }}
                                >
                                    {VISION_PARAGRAPHS.map((paragraph) => (
                                        <ScrollHighlightParagraph
                                            key={paragraph.id}
                                            paragraph={paragraph}
                                            useScrollHighlight={useDesktopScrollScrub}
                                            visionProgress={metrics.visionProgress}
                                            isReducedMotion={isReducedMotion}
                                        />
                                    ))}
                                </div>

                                {/* Mission bullets — always absolutely positioned, fades in */}
                                <div
                                    data-mission-bullets
                                    className="absolute inset-x-0 top-8 bottom-0 overflow-y-auto overflow-x-hidden"
                                    style={{
                                        opacity: metrics.scrollPastVision ? 1 : 0,
                                        transition: 'opacity 0.6s ease',
                                        willChange: 'opacity',
                                        pointerEvents: metrics.scrollPastVision ? 'auto' : 'none',
                                        visibility: metrics.scrollPastVision ? 'visible' : 'hidden',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'rgba(0,0,0,0.12) transparent',
                                    }}
                                >
                                    <MissionBulletList
                                        missionProgress={metrics.missionProgress}
                                        activeBulletIndex={metrics.activeBulletIndex}
                                        scrollPastMission={metrics.scrollPastMission}
                                        isReducedMotion={isReducedMotion}
                                        useScrollHighlight={useDesktopScrollScrub}
                                    />
                                </div>
                            </section>

                            {/* Mission spacer — sized to the mission budget so the
                                virtual scroll range has a physical anchor in the
                                content column. aria-hidden so it doesn't affect a11y. */}
                            <section
                                ref={missionSectionRef}
                                className="pb-[40vh] lg:pb-[50vh]"
                                aria-hidden
                            />
                        </m.div>
                    </div>
                </m.div>
            </m.div>

            {/* STACKED mobile < md */}
            <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 pb-20 sm:px-6 sm:pt-16 sm:pb-24 md:hidden">
                <div className="flex flex-col gap-12 sm:gap-14">
                    <m.div
                        initial={isReducedMotion ? false : 'hidden'}
                        whileInView={isReducedMotion ? undefined : 'visible'}
                        viewport={STACKED_MOBILE_VIEWPORT}
                        variants={STACKED_MOBILE_STAGGER}
                        className="flex flex-col"
                    >
                        <m.h2 variants={fadeInUpTight} className={HEADING_CLASS}>{VISION_HEADING}</m.h2>
                        <m.div variants={scaleIn} className="mt-4 sm:mt-5">
                            <div ref={mobileVisionImageRef} className="will-change-transform">
                                <VisionMissionImageCard
                                    src={VISION_MISSION_IMAGES.vision.src}
                                    alt={VISION_MISSION_IMAGES.vision.alt}
                                    aspectClassName="aspect-[4/5] sm:aspect-[5/6]"
                                />
                            </div>
                        </m.div>
                        <m.div variants={STACKED_MOBILE_CONTENT_REVEAL} className="mt-5 flex flex-col gap-5 sm:mt-6 sm:gap-6">
                            {VISION_PARAGRAPHS.map((paragraph) => (
                                <m.div key={paragraph.id} variants={fadeInUpTight}>
                                    <ScrollHighlightParagraph
                                        paragraph={paragraph}
                                        useScrollHighlight={false}
                                        visionProgress={1}
                                        isReducedMotion={isReducedMotion}
                                    />
                                </m.div>
                            ))}
                        </m.div>
                    </m.div>

                    <m.div
                        ref={mobileMissionRef}
                        initial={isReducedMotion ? false : 'hidden'}
                        whileInView={isReducedMotion ? undefined : 'visible'}
                        viewport={STACKED_MOBILE_VIEWPORT}
                        variants={STACKED_MOBILE_STAGGER}
                        className="flex flex-col border-t border-black/6 pt-12 sm:pt-14"
                    >
                        <m.h2 variants={fadeInUpTight} className={HEADING_CLASS}>{MISSION_HEADING}</m.h2>
                        <m.div variants={scaleIn} className="mt-4 sm:mt-5">
                            <VisionMissionImageCard
                                src={VISION_MISSION_IMAGES.mission.src}
                                alt={VISION_MISSION_IMAGES.mission.alt}
                                aspectClassName="aspect-[4/5] sm:aspect-[5/6]"
                            />
                        </m.div>
                        <MissionBulletList
                            missionProgress={1}
                            activeBulletIndex={MISSION_BULLETS.length}
                            scrollPastMission
                            isReducedMotion={isReducedMotion}
                            useScrollHighlight={false}
                            staggerEntrance
                            className="mt-5 sm:mt-6"
                        />
                    </m.div>
                </div>
            </div>

            {/* TABLET md 768–1023px */}
            <div className="mx-auto hidden w-full max-w-[1280px] px-8 md:block lg:hidden">
                <div className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] items-start gap-x-8">
                    <div className="sticky top-0 col-start-1 row-start-1 h-dvh self-start py-10">
                        <div
                            ref={setVisionPanelSlotRef}
                            data-vision-layout="md"
                            {...{ [VISION_PANEL_SLOT_ATTR]: '' }}
                            className="relative h-full min-h-0 w-full"
                        >
                            <DesktopImagePanel
                                showMissionImage={mobileMissionInView}
                                visionKenBurns={metrics.visionKenBurns}
                                missionKenBurns={metrics.missionKenBurns}
                                isReducedMotion={isReducedMotion}
                                handoffUsesMosaic={handoffUsesMosaic}
                                handoffComplete={handoffComplete}
                                handoffMorphing={handoffMorphing}
                            />
                        </div>
                    </div>

                    <m.div
                        variants={staggerContainer(0.1, 0.05)}
                        initial={isReducedMotion ? false : 'hidden'}
                        whileInView={isReducedMotion ? undefined : 'visible'}
                        viewport={{ once: true, amount: 0.08 }}
                        className="col-start-2 row-start-1 flex flex-col"
                    >
                        <m.div variants={fadeInUpTight} className="flex min-h-dvh flex-col justify-center gap-7 pt-32 pb-16">
                            <h2 className={HEADING_CLASS}>{VISION_HEADING}</h2>
                            <div className="flex flex-col gap-6">
                                {VISION_PARAGRAPHS.map((paragraph) => (
                                    <ScrollHighlightParagraph
                                        key={paragraph.id}
                                        paragraph={paragraph}
                                        useScrollHighlight={false}
                                        visionProgress={1}
                                        isReducedMotion={isReducedMotion}
                                    />
                                ))}
                            </div>
                        </m.div>

                        <m.div
                            ref={mobileMissionRef}
                            variants={fadeInUpTight}
                            className="flex min-h-dvh flex-col justify-center gap-7 border-t border-black/6 pt-16 pb-16"
                        >
                            <h2 className={HEADING_CLASS}>{MISSION_HEADING}</h2>
                            <MissionBulletList
                                missionProgress={stackedMissionBulletsInView ? 1 : 0}
                                activeBulletIndex={stackedMissionBulletsInView ? MISSION_BULLETS.length : 0}
                                scrollPastMission={stackedMissionBulletsInView}
                                isReducedMotion={isReducedMotion}
                                useScrollHighlight
                            />
                        </m.div>
                    </m.div>
                </div>
            </div>
        </Section>
    )
}