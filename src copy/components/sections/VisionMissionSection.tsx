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
import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const FAQ_CARD_SHADOW =
  'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]'

/** Outer FAQ-style frame — matches FaqSection / TaglineScrollSection shell. */
const VISION_MISSION_IMAGE_SHELL = 'box-border border border-black/8 p-1.5 sm:p-2'

/**
 * SSR / first-paint fallback min-height on the scroll track.
 * Prevents the next section from colliding before JS measures the exact value.
 * 300dvh covers Vision + Mission content + full viewport release buffer.
 */
const DESKTOP_TRACK_INITIAL_MIN_H = 'lg:min-h-[300dvh]'

// ─── Text style constants ──────────────────────────────────────────────────────

const HEADING_CLASS = cn(
  'text-brand-charcoal [font-family:var(--font-halant)] font-normal tracking-[-0.04em]',
  'text-[clamp(2rem,3.5vw+1rem,4.375rem)] leading-[1.15] sm:leading-[1.2] xl:text-[70px] xl:leading-[88px]',
  'transition-colors duration-500'
)

/**
 * Body text for active / past paragraphs.
 * Base color #525252 — highlighted words override to #121F2F.
 */
const BODY_CLASS = cn(
  '[font-family:var(--font-geist)] text-[#525252] leading-[1.65]',
  'text-[15px] sm:text-base',
  'min-w-0 break-words',
  'transition-[color,opacity] duration-500'
)

/**
 * Upcoming (not-yet-active) paragraphs.
 * text-about-intro-word-muted resolves to #737373 via CSS variable.
 */
/** Scroll multiplier — >1 fills #121F2F across words sooner within each paragraph band. */
const VISION_WORD_HIGHLIGHT_SPEED = 3.0

const UPCOMING_TEXT_CLASS = cn(
  '[font-family:var(--font-geist)] text-about-intro-word-muted leading-[1.65] opacity-30',
  'text-[15px] sm:text-base'
)

/** Applied to headings that should dim when scrolled past. */
const MUTED_HEADING_CLASS = 'text-about-intro-word-muted opacity-30'

const fadeInUpTight: typeof fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

/** Stacked mobile / sm — section enter + child stagger. */
const STACKED_MOBILE_VIEWPORT = { once: true, amount: 0.14, margin: '0px 0px -8% 0px' } as const
const STACKED_MOBILE_STAGGER = staggerContainer(0.12, 0.04)

/** Content block: fades in as a section child, then staggers each item. */
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function subscribeLg(callback: () => void) {
  if (typeof window === 'undefined') return () => { }
  const mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}
function getLgSnapshot() {
  return window.matchMedia('(min-width: 1024px)').matches
}
function getLgServerSnapshot() {
  return false
}

function subscribeMd(callback: () => void) {
  if (typeof window === 'undefined') return () => { }
  const mq = window.matchMedia('(min-width: 768px)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}
function getMdSnapshot() {
  return window.matchMedia('(min-width: 768px)').matches
}
function getMdServerSnapshot() {
  return false
}

// ─── Scroll metrics ────────────────────────────────────────────────────────────

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
  /** Total content translate travel — mission highlight maps to scroll range, not DOM height alone. */
  contentTravel = 0
): ScrollMetrics {
  const visionProgress = visionHeight > 0 ? Math.min(1, Math.max(0, scrollTop / visionHeight)) : 0
  const scrollPastVision = visionHeight > 0 && scrollTop >= visionHeight - 1
  const activeParagraphIndex = scrollPastVision
    ? VISION_PARAGRAPHS.length
    : getActiveParagraphIndex(visionProgress)

  const missionScrollTop = Math.max(0, scrollTop - visionHeight)
  const missionScrollRange =
    contentTravel > visionHeight ? contentTravel - visionHeight : Math.max(missionHeight, 1)
  const scrollPastMission = missionScrollRange > 0 && missionScrollTop >= missionScrollRange - 1
  const missionProgress = scrollPastMission
    ? 1
    : missionScrollRange > 0
      ? Math.min(1, missionScrollTop / missionScrollRange)
      : 0
  const activeBulletIndex = scrollPastMission
    ? MISSION_BULLETS.length
    : getActiveBulletIndex(missionProgress)

  const showMissionImage = scrollTop >= visionHeight * 0.6

  const visionLocal = showMissionImage ? 1 : visionHeight > 0 ? scrollTop / visionHeight : 0
  const missionLocal =
    missionScrollRange > 0 && missionScrollTop > 0
      ? Math.min(1, missionScrollTop / missionScrollRange)
      : scrollTop >= visionHeight * 0.5
        ? (scrollTop - visionHeight * 0.5) / (visionHeight * 0.5)
        : 0

  return {
    visionProgress,
    activeParagraphIndex,
    scrollPastVision,
    missionProgress,
    activeBulletIndex,
    scrollPastMission,
    showMissionImage,
    visionKenBurns: Math.min(1, visionLocal),
    missionKenBurns: Math.min(1, Math.max(0, missionLocal)),
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Image card.
 *
 * Stacked layouts (mobile / tablet):
 *   Pass `aspectClassName` (e.g. "aspect-[4/3]") — the inner div gets a natural
 *   aspect-ratio height with no min-h. The card has no leftover white space below
 *   the image because height is purely driven by the ratio.
 *
 * Desktop sticky panel:
 *   Pass `className="absolute inset-0 h-full ..."` — no aspect ratio needed;
 *   the card fills its absolutely-positioned container.
 */
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
  /** Aspect-ratio Tailwind class for stacked layouts (e.g. "aspect-[4/3]"). */
  aspectClassName?: string
  imageScale?: number
  isReducedMotion?: boolean
}) {
  return (
    <article
      aria-hidden={className?.includes('opacity-0')}
      className={cn(
        'pointer-events-none w-full overflow-hidden',
        'rounded-card sm:rounded-[24px]',
        'transition-opacity duration-500 ease-out',
        className,
        // Applied last so layout classNames (e.g. absolute/inset) cannot strip the shell border.
        VISION_MISSION_IMAGE_SHELL
      )}
    >
      <div
        className={cn(
          faqAccordionInnerClassName(),
          FAQ_CARD_SHADOW,
          'relative w-full overflow-hidden p-0',
          // Stacked: aspect ratio drives height — no extra min-h, no leftover space.
          // Fill mode (absolute inset-0 parent): h-full at all breakpoints.
          aspectClassName ? cn('relative', aspectClassName) : 'h-full min-h-0'
        )}
      >
        <m.div
          className="absolute inset-0 origin-center will-change-transform"
          style={{
            transform: `scale(${imageScale})`,
            transition: isReducedMotion ? undefined : 'transform 0.1s linear',
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
            className="object-cover object-center"
          />
        </m.div>
      </div>
    </article>
  )
}

/** Word-by-word left-to-right scroll highlight paragraph. */
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
        if (!/\S/.test(token)) {
          return <span key={`${paragraph.id}-ws-${i}`}>{token}</span>
        }
        const index = wordIndex++
        const readThrough =
          isPast || (isActive && (index + 1) / Math.max(wordCount, 1) <= highlightProgress)

        return (
          <span
            key={`${paragraph.id}-w-${i}`}
            data-vision-word
            className={cn(
              'transition-colors duration-150',
              readThrough ? 'text-[#121F2F]' : 'text-brand-muted'
            )}
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
    return <span className={cn('min-w-0 flex-1', 'text-[#121F2F]')}>{text}</span>
  }

  const tokens = tokenizeParagraphText(text)
  const wordCount = tokens.filter((t) => /\S/.test(t)).length
  const isActive = localProgress > 0 && localProgress < 1
  const isPast = localProgress >= 1
  const isUpcoming = localProgress <= 0

  let wordIndex = 0

  const highlightProgress = Math.min(1, localProgress * VISION_WORD_HIGHLIGHT_SPEED)

  return (
    <span ref={pRef} className={isUpcoming ? cn("min-w-0 flex-1", UPCOMING_TEXT_CLASS) : "min-w-0 flex-1"}>
      {tokens.map((token, i) => {
        if (!/\S/.test(token)) {
          return <span key={`mission-b${bulletIndex}-ws-${i}`}>{token}</span>
        }
        const index = wordIndex++
        const readThrough =
          isPast || (isActive && (index + 1) / Math.max(wordCount, 1) <= highlightProgress)

        return (
          <span
            key={`mission-b${bulletIndex}-w-${i}`}
            data-mission-word
            className={cn(
              'transition-colors duration-300',
              readThrough ? 'text-[#121F2F]' : 'text-brand-muted'
            )}
          >
            {token}
          </span>
        )
      })}
    </span>
  )
}

function MissionBulletList({
  missionProgress,
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
  /** Desktop scroll-scrub: word highlight. Stacked: pass progress 1 when in view. */
  useScrollHighlight?: boolean
  /** Stacked mobile: stagger each bullet on section reveal. */
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
      <span>{bullet}</span>
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
        <m.li
          key={index}
          variants={fadeInUpTight}
          className={cn(BODY_CLASS, 'flex gap-2.5 opacity-100 sm:gap-3')}
        >
          {row}
        </m.li>
      )
    }

    return (
      <li key={index} className={cn(BODY_CLASS, 'flex gap-2.5 opacity-100 sm:gap-3')}>
        {row}
      </li>
    )
  })

  if (staggerEntrance) {
    return (
      <m.ul
        variants={STACKED_MOBILE_CONTENT_REVEAL}
        className={cn('flex flex-col gap-4 sm:gap-5 lg:gap-6', className)}
      >
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
        className="rounded-card absolute inset-0 overflow-hidden"
      >
        {handoffUsesMosaic ? (
          <div
            {...{ [VISION_HANDOFF_MOUNT_ATTR]: '' }}
            className={cn(
              'absolute inset-0 z-1 min-h-full w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
              showMissionImage ? 'opacity-0 scale-[0.85]' : 'opacity-100 scale-100'
            )}
          />
        ) : null}
        {showVisionPlaceholder ? (
          <VisionMissionImageCard
            src={VISION_MISSION_IMAGES.vision.src}
            alt={VISION_MISSION_IMAGES.vision.alt}
            className={cn(
              'absolute inset-0 z-0 h-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
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
            'absolute inset-0 z-10 h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
            showMissionImage
              ? 'translate-y-0'
              : 'translate-y-full pointer-events-none'
          )}
          imageScale={missionScale}
          isReducedMotion={isReducedMotion}
        />
      </div>
    </div>
  )
}

/**
 * Watches whether the mobile / tablet Mission block has entered the viewport.
 *
 * threshold: 0   — fires as soon as 1px of the element enters (not cut off)
 * rootMargin: '' — no negative margin; previous -12% was hiding it too early
 */
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

// ─── Main component ────────────────────────────────────────────────────────────

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
  useLayoutEffect(() => {
    handoffCtxRef.current = handoffCtx
  })
  const reduceMotion = useReducedMotion()
  const isLg = useSyncExternalStore(subscribeLg, getLgSnapshot, getLgServerSnapshot)
  const isMd = useSyncExternalStore(subscribeMd, getMdSnapshot, getMdServerSnapshot)
  const isReducedMotion = reduceMotion === true
  const useDesktopScrollScrub = isLg && !isReducedMotion
  /** md+: mosaic reveal-06 FLIP into left panel (reveal-06 only — no duplicate while active). */
  const handoffUsesMosaic = Boolean(handoffCtx) && !isReducedMotion && isMd
  const handoffComplete = handoffCtx?.handoffComplete ?? false
  const handoffMorphing = handoffCtx?.isHandoffMorphing() ?? false
  const setVisionPanelSlotRef = useCallback((el: HTMLDivElement | null) => {
    const ctx = handoffCtxRef.current
    if (!ctx) return
    if (!el) {
      ctx.registerVisionPanelSlot(null)
      return
    }
    const layout = el.dataset.visionLayout
    if (layout === 'lg' && window.matchMedia('(min-width: 1024px)').matches) {
      ctx.registerVisionPanelSlot(el)
    } else if (
      layout === 'md' &&
      window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
    ) {
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
    if (!isMd) {
      handoffCtx.setHandoffComplete(false)
    }
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
          autoAlpha: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            end: 'top 55%',
            scrub: 0.85,
            invalidateOnRefresh: true,
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
  const rawContentOffset = useMotionValue(0)
  const smoothContentOffset = useSpring(rawContentOffset, { stiffness: 400, damping: 40, mass: 1 })
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

  const [visionEntered, setVisionEntered] = useState(false)
  const [missionEntered, setMissionEntered] = useState(false)

  /** Desktop scroll-scrub: copy always visible; word highlight is the reveal. */
  const visionReveal = useDesktopScrollScrub || visionEntered
  const missionReveal = useDesktopScrollScrub || missionEntered

  const mobileMissionInView = useMissionInView(mobileMissionRef, !isLg)
  /** Stacked layouts show mission bullets without waiting on IO (avoids hidden content on sm/md). */
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
        contentTravelRef.current
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
      ) {
        return prev
      }
      return next
    })
  }, [])

  useMotionValueEvent(smoothContentOffset, 'change', (latest) => {
    contentY.set(-latest)
    applyScrollMetrics(latest)
  })

  /**
   * track.minHeight = viewportH + travel + viewportH
   *
   * [viewportH]  Shell fills the screen on entry (sticky top:0, h:100dvh).
   * [travel]     px to translateY content from start to fully revealed.
   * [viewportH]  Full release buffer — the next section cannot appear until
   *              the sticky shell has scrolled completely off-screen.
   *
   * DESKTOP_TRACK_INITIAL_MIN_H (300dvh Tailwind class) is the SSR fallback
   * that prevents next-section collision before this JS runs.
   */
  const measureDesktopScrollLayout = useCallback(() => {
    const track = scrollTrackRef.current
    const shell = stickyShellRef.current
    const rightPanel = rightPanelRef.current
    const content = rightContentRef.current
    const missionEl = missionSectionRef.current
    if (!track || !shell || !content) return

    const viewportH = window.visualViewport?.height ?? window.innerHeight
    const clipH = rightPanel?.clientHeight ?? viewportH
    const contentH = content.scrollHeight

    const missionPb = missionEl ? parseFloat(getComputedStyle(missionEl).paddingBottom) || 128 : 128
    const baseTravel = contentH - clipH + missionPb + 32
    const travel = Math.max(viewportH * 2, baseTravel + viewportH)

    const SCROLL_SPEED_MULTIPLIER = 2.4
    const pinScrollRange = travel / SCROLL_SPEED_MULTIPLIER

    contentTravelRef.current = travel
    pinScrollRangeRef.current = pinScrollRange
    track.style.minHeight = `${viewportH + pinScrollRange}px`
  }, [])

  const syncDesktopScrollFromTrack = useCallback(() => {
    const track = scrollTrackRef.current
    if (!track) return

    const travel = contentTravelRef.current
    const pinScrollRange = pinScrollRangeRef.current
    if (pinScrollRange <= 0) {
      contentY.set(0)
      return
    }

    const SCROLL_SPEED_MULTIPLIER = 1.6
    const rawScrolled = Math.max(0, -track.getBoundingClientRect().top)
    const contentOffset = clamp(rawScrolled * SCROLL_SPEED_MULTIPLIER, 0, travel)

    rawContentOffset.set(contentOffset)
  }, [rawContentOffset])

  // ── Desktop scroll scrub ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!useDesktopScrollScrub) {
      contentTravelRef.current = 0
      pinScrollRangeRef.current = 0
      contentY.set(0)
      if (scrollTrackRef.current) scrollTrackRef.current.style.minHeight = ''
      return
    }

    const shell = stickyShellRef.current
    const rightPanel = rightPanelRef.current
    const content = rightContentRef.current
    const visionEl = visionSectionRef.current
    const missionEl = missionSectionRef.current
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

  // ── Desktop section-enter detection (scroll-scrub only) ─────────────────────
  useEffect(() => {
    if (!useDesktopScrollScrub) return

    const shell = stickyShellRef.current
    if (!shell) return

    const revealAll = () => {
      setVisionEntered(true)
      setMissionEntered(true)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) revealAll()
      },
      { threshold: 0.05 }
    )

    observer.observe(shell)
    revealAll()
    return () => observer.disconnect()
  }, [useDesktopScrollScrub])

  // ── Re-measure on breakpoint change ─────────────────────────────────────────
  useEffect(() => {
    if (!isLg) {
      contentTravelRef.current = 0
      pinScrollRangeRef.current = 0
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
  }, [
    isLg,
    useDesktopScrollScrub,
    measureDesktopScrollLayout,
    syncDesktopScrollFromTrack,
    rawContentOffset,
  ])

  const visionHeadingMuted = isLg && metrics.scrollPastVision

  return (
    <Section
      id="vision-mission"
      variant="default"
      paddingY="none"
      {...{ [VISION_HANDOFF_TRIGGER_ATTR]: '' }}
      className="bg-brand-surface overflow-visible relative z-[45]"
    >
      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP lg+
          Left: sticky image panel (Ken Burns + Vision ↔ Mission crossfade).
          Right: content scrolled via page-scroll-driven translateY.
          Shell: px-* matches site Container; grid gap stays inside max-w-base.
          ════════════════════════════════════════════════════════════════════ */}
      <m.div
        ref={scrollTrackRef}
        className={cn('relative hidden w-full lg:block', DESKTOP_TRACK_INITIAL_MIN_H)}
      >
        <m.div
          ref={stickyShellRef}
          data-vision-enter-shell
          className={cn(
            'sticky top-0 isolate z-10',
            'max-w-base mx-auto grid h-dvh max-h-dvh min-h-dvh w-full',
            'grid-cols-[4.5fr_7.5fr] items-stretch overflow-hidden',
            'px-4 sm:px-6 lg:px-8 xl:px-0',
            'gap-6 xl:gap-10'
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
          <div ref={rightPanelRef} className="relative h-full min-h-0 min-w-0 overflow-hidden">
            <m.div
              ref={rightContentRef}
              className={cn(
                'flex min-w-0 flex-col will-change-transform',
                isReducedMotion && 'h-full overflow-y-auto overscroll-contain'
              )}
              style={useDesktopScrollScrub ? { y: contentY } : undefined}
            >
              {/* Vision section */}
              <section
                ref={visionSectionRef}
                className="flex min-w-0 flex-col justify-start gap-6 pt-28 pb-8 lg:gap-8 lg:pt-32 xl:pt-36 xl:pb-0"
              >
                <m.h2
                  initial={isReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={visionReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(HEADING_CLASS, visionHeadingMuted && MUTED_HEADING_CLASS)}
                >
                  {VISION_HEADING}
                </m.h2>

                <div className="flex flex-col gap-6 lg:gap-8">
                  {VISION_PARAGRAPHS.map((paragraph, index) => (
                    <m.div
                      key={paragraph.id}
                      initial={isReducedMotion ? false : { opacity: 0, y: 12 }}
                      animate={visionReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                      transition={{
                        duration: 0.6,
                        delay: isReducedMotion ? 0 : 0.1 + index * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <ScrollHighlightParagraph
                        paragraph={paragraph}
                        useScrollHighlight={useDesktopScrollScrub}
                        visionProgress={metrics.visionProgress}
                        isReducedMotion={isReducedMotion}
                      />
                    </m.div>
                  ))}
                </div>
              </section>

              {/* Mission section */}
              <section
                ref={missionSectionRef}
                className="flex min-w-0 flex-col justify-start gap-6 pt-6 pb-[40vh] lg:gap-8 lg:pt-8 lg:pb-[50vh]"
              >
                <m.h2
                  initial={isReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={missionReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={HEADING_CLASS}
                >
                  {MISSION_HEADING}
                </m.h2>

                <MissionBulletList
                  missionProgress={metrics.missionProgress}
                  activeBulletIndex={metrics.activeBulletIndex}
                  scrollPastMission={metrics.scrollPastMission}
                  isReducedMotion={isReducedMotion}
                  useScrollHighlight={useDesktopScrollScrub}
                />
              </section>
            </m.div>
          </div>
        </m.div>
      </m.div>

      {/* ════════════════════════════════════════════════════════════════════
          STACKED < md (0–767px)
          Order: heading → image → body per section.
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-base mx-auto w-full px-4 pt-4 pb-20 sm:px-6 sm:pt-16 sm:pb-24 md:hidden">
        <div className="flex flex-col gap-12 sm:gap-14">
          {/* Vision: heading → image → paragraphs (staggered reveal) */}
          <m.div
            initial={isReducedMotion ? false : 'hidden'}
            whileInView={isReducedMotion ? undefined : 'visible'}
            viewport={STACKED_MOBILE_VIEWPORT}
            variants={STACKED_MOBILE_STAGGER}
            className="flex flex-col"
          >
            <m.h2 variants={fadeInUpTight} className={HEADING_CLASS}>
              {VISION_HEADING}
            </m.h2>
            <m.div variants={scaleIn} className="mt-4 sm:mt-5">
              <div ref={mobileVisionImageRef} className="will-change-transform">
                <VisionMissionImageCard
                  src={VISION_MISSION_IMAGES.vision.src}
                  alt={VISION_MISSION_IMAGES.vision.alt}
                  aspectClassName="aspect-[4/5] sm:aspect-[5/6]"
                />
              </div>
            </m.div>
            <m.div
              variants={STACKED_MOBILE_CONTENT_REVEAL}
              className="mt-5 flex flex-col gap-5 sm:mt-6 sm:gap-6"
            >
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

          {/* Mission: heading → image → bullets (staggered reveal) */}
          <m.div
            ref={mobileMissionRef}
            initial={isReducedMotion ? false : 'hidden'}
            whileInView={isReducedMotion ? undefined : 'visible'}
            viewport={STACKED_MOBILE_VIEWPORT}
            variants={STACKED_MOBILE_STAGGER}
            className="flex flex-col border-t border-black/6 pt-12 sm:pt-14"
          >
            <m.h2 variants={fadeInUpTight} className={HEADING_CLASS}>
              {MISSION_HEADING}
            </m.h2>
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

      {/* ════════════════════════════════════════════════════════════════════
          TABLET md (768–1023px)
          2-col sticky grid. Left: sticky image crossfades Vision ↔ Mission.
          Right: each section is min-h-dvh + justify-center so the sticky
          image is always vertically centered against the active section.
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-base mx-auto hidden w-full px-8 md:block lg:hidden">
        <div className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] items-start gap-x-8">
          {/* Sticky image — same full-height fill as lg desktop left panel */}
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

          {/* Scrolling content */}
          <m.div
            variants={staggerContainer(0.1, 0.05)}
            initial={isReducedMotion ? false : 'hidden'}
            whileInView={isReducedMotion ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.08 }}
            className="col-start-2 row-start-1 flex flex-col"
          >
            {/* Vision — pt-24 pushes heading up toward the top of the viewport
                so "Our Vision" appears at the same visual height as the image top.
                min-h-dvh + justify-center keeps image centered while reading. */}
            <m.div
              variants={fadeInUpTight}
              className="flex min-h-dvh flex-col justify-center gap-6 pt-32 pb-16"
            >
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

            {/* Mission — min-h-dvh keeps sticky image centered while reading */}
            <m.div
              ref={mobileMissionRef}
              variants={fadeInUpTight}
              className="flex min-h-dvh flex-col justify-center gap-6 border-t border-black/6 pt-16 pb-16"
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
