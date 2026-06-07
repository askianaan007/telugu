'use client'

import { useMotionValueEvent, useScroll } from 'framer-motion'
import Image from 'next/image'
import { useLayoutEffect, useRef, useState } from 'react'

import { Section } from '@/components/layout/Section'
import { ActionButton } from '@/components/ui/ActionButton'
import { OUR_MODELS } from '@/data/ourModels'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SCROLL_TRIGGER_ID = 'our-models-scroll'

/** Scroll-linked parallax per cloud layer (back rail, front mist) */
const OUR_MODELS_CLOUD_PARALLAX = [
  { yFrom: -12, yTo: 22, xFrom: -6, xTo: 14, scaleFrom: 1, scaleTo: 1.06 },
  { yFrom: -18, yTo: 30, xFrom: 0, xTo: 0, scaleFrom: 1, scaleTo: 1.08 },
] as const

type RectBox = { left: number; top: number; width: number; height: number }

/** Scrubbed reveal for stacked model cards on sm/md (Charter / Heliport pattern). */
const OUR_MODELS_MOBILE_CARD_REVEAL_FROM: gsap.TweenVars = {
  autoAlpha: 0,
  y: 32,
  scale: 0.95,
  filter: 'blur(8px)',
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixed Backdrop
// ─────────────────────────────────────────────────────────────────────────────
function OurModelsFixedBackdrop({ ambientMotion }: { ambientMotion: boolean }) {
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
          'lg:opacity-[0.22] lg:blur-sm'
        )}
      >
        {/* Back clouds z-[1] — wide rail, scroll parallax on outer shell */}
        <div
          data-ourmodels-cloud
          className={cn(
            'absolute left-1/2 z-1 -translate-x-1/2 will-change-transform',
            'bottom-[-22%] h-[50%] w-[178%] max-w-none',
            'sm:bottom-[-20%] sm:h-[54%] sm:w-[188%]',
            'lg:bottom-[-8%] lg:h-[58%] lg:w-[198%]',
            'xl:bottom-[2%] xl:h-[62%] xl:w-[210%]'
          )}
        >
          <div className="relative flex h-full w-full lg:translate-y-[-4%] xl:translate-y-[-8%]">
            <div className="relative h-full min-h-0 min-w-0 flex-1 lg:translate-y-[-2%] xl:translate-x-[-10%] xl:translate-y-[10%]">
              <Image
                src="/images/hero-cloud.png"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 100vw"
                className="object-contain object-left opacity-45"
              />
            </div>
            <div className="relative h-full min-h-0 min-w-0 flex-1 lg:translate-y-[-2%] xl:translate-y-[-4%]">
              <Image
                src="/images/hero-cloud.png"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 100vw"
                className="scale-x-[-1] object-contain object-right opacity-45"
              />
            </div>
          </div>
        </div>

        {/* Front clouds z-[3] — scroll exit on outer shell; ambient drift on inner */}
        <div
          data-ourmodels-cloud
          className={cn(
            'absolute left-1/2 z-3 -translate-x-1/2 will-change-transform',
            'bottom-[58%] h-[68%] w-[98%] max-w-5xl min-w-[520px]',
            'sm:bottom-[54%] sm:h-[72%] sm:w-full sm:max-w-6xl',
            'md:bottom-[50%] md:h-[76%] md:max-w-7xl'
          )}
        >
          <div
            className={cn(
              'relative h-full w-full',
              ambientMotion && 'motion-safe:ourmodels-cloud-drift-c'
            )}
          >
            <Image
              src="/images/hero-cloud.png"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 100vw"
              className="object-contain object-bottom opacity-35"
            />
          </div>
        </div>

        {/* Bottom fade above clouds — Figma #F0F1F2 @ 0% / 87% @ 49% / 100% */}
        <div
          aria-hidden
          className="bg-hero-bottom-fade pointer-events-none absolute inset-x-0 bottom-0 z-4 h-[24%] sm:h-[28%] lg:h-[26%] xl:h-[32%]"
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatRow
// ─────────────────────────────────────────────────────────────────────────────
function StatRow({
  stat,
  side,
  className,
}: {
  stat: { value: string; label: string }
  side: 'left' | 'right'
  className?: string
}) {
  const lineBg =
    side === 'left'
      ? 'linear-gradient(to right, #121F2F, rgba(255,255,255,0))'
      : 'linear-gradient(to left, #121F2F, rgba(255,255,255,0))'
  return (
    <div
      className={cn(
        'flex max-w-full items-center gap-2 sm:gap-3',
        side === 'right' && 'flex-row-reverse',
        className
      )}
    >
      <div className="flex shrink-0 flex-row items-baseline gap-1.5">
        <span className="[font-family:var(--font-halant)] text-[clamp(2rem,4.2vw,4.375rem)] leading-none tracking-[-0.04em] text-[#121F2F] xl:text-[70px]">
          {stat.value}
        </span>
        <span className="[font-family:var(--font-geist)] text-base leading-normal text-[#3F3F3E] lg:text-xl">
          {stat.label}
        </span>
      </div>
      <div
        className="h-px min-w-6 flex-1 sm:min-w-8 md:min-w-20 lg:min-w-32 xl:min-w-40"
        style={{ maxWidth: '15rem', background: lineBg }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelProgressBadge
// ─────────────────────────────────────────────────────────────────────────────
function ModelProgressBadge({
  stepIndex,
  total,
  ringAngleDeg,
}: {
  stepIndex: number
  total: number
  ringAngleDeg: number
}) {
  const safe = Math.min(total - 1, Math.max(0, stepIndex))
  const arcDeg = 360 / total
  const progressConic = `
    radial-gradient(circle at center, #F0F1F2 40%, transparent 90%),
    conic-gradient(from ${ringAngleDeg}deg, #7EB8EA 0deg, #B6D1F3 ${arcDeg}deg, transparent ${arcDeg}deg, transparent 360deg)
  `
  return (
    <div
      className="relative box-border h-[72px] w-[72px] shrink-0 rounded-full border border-[#D9D9D9] xl:h-[100px] xl:w-[100px]"
      aria-hidden
    >
      {/* Progress arc layer - no background, only the conic gradient arc */}
      <div className="absolute inset-0 rounded-full" style={{ background: progressConic }} />

      {/* Inner circle with fill + inner shadow matching Figma */}
      <div className="absolute inset-[6px] flex items-center justify-center rounded-full border border-[#C9C9C9] bg-[rgba(240,241,242,0.2)] xl:inset-[10px]">
        <span className="[font-family:var(--font-halant)] text-xl leading-normal text-[#121F2F] tabular-nums xl:text-[30px]">
          {safe + 1}/{total}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared section CTA (one per viewport — not per model card)
// ─────────────────────────────────────────────────────────────────────────────
function OurModelsBookCta({ className }: { className?: string }) {
  const openBookingModal = useUiStore((s) => s.openBookingModal)
  return (
    <div className={cn('flex justify-center', className)}>
      <ActionButton onClick={openBookingModal} label="Book the flight" noShadow />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelDetailBody — stats/layout only; section CTA is rendered separately
// ─────────────────────────────────────────────────────────────────────────────
type ModelDetailBodyProps = {
  model: (typeof OUR_MODELS)[number]
  stepIndex: number
  ringAngleDeg: number
  imagePriority?: boolean
  /** When false, CTA is rendered once at section level (mobile + desktop scrub) */
  showCta?: boolean
  hideCenterImage?: boolean
}
function ModelDetailBody({
  model,
  stepIndex,
  ringAngleDeg,
  imagePriority,
  showCta = false,
  hideCenterImage = false,
}: ModelDetailBodyProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-3 lg:gap-2">
      {/* Top bar */}
      <div
        className={cn(
          'grid w-full shrink-0 grid-cols-1 gap-4',
          'md:max-lg:grid md:max-lg:grid-cols-[1fr_auto] md:max-lg:gap-6',
          'lg:grid-cols-[minmax(0,1.35fr)_auto] lg:items-start lg:gap-6'
        )}
      >
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
        <div
          className={cn(
            'flex flex-col items-stretch gap-3',
            'max-lg:flex-row max-lg:items-start max-lg:justify-between max-lg:gap-4',
            'lg:flex-row lg:items-start lg:justify-end lg:gap-8'
          )}
        >
          <ModelProgressBadge
            stepIndex={stepIndex}
            total={OUR_MODELS.length}
            ringAngleDeg={ringAngleDeg}
          />
          <p className="max-w-[380px] self-start text-left [font-family:var(--font-geist)] text-base leading-snug text-[#3F3F3E] max-lg:text-left lg:max-w-[min(100%,20rem)] lg:self-end lg:text-right lg:text-sm">
            {model.shortDescription}
          </p>
        </div>
      </div>

      {/* Helicopter — detail hero slot (Stage B bridge lands here on panel 0) */}
      <div
        data-detail-hero
        className={cn(
          'relative z-30 mx-auto flex min-h-0 w-full max-w-[min(100%,600px)] flex-1 flex-col items-center justify-center overflow-hidden',
          'max-lg:max-h-[min(48vh,22rem)] max-lg:min-h-[clamp(11rem,36vw,16rem)] max-lg:flex-none',
          'lg:max-h-[min(40svh,420px)] lg:max-w-[min(100%,840px)] xl:max-h-[min(50svh,560px)] xl:max-w-[min(100%,1080px)]',
          hideCenterImage && 'lg:hidden'
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

      {/* Stats row — mobile/tablet: optional CTA below; lg+: 2-col stats only (CTA is section-level) */}
      <div
        className={cn(
          'relative z-31 mt-auto w-full shrink-0',
          showCta
            ? cn(
              'grid gap-5',
              'max-lg:grid-cols-2 max-lg:gap-x-6 max-lg:gap-y-5',
              'md:max-lg:gap-x-8 md:max-lg:gap-y-6'
            )
            : cn(
              'grid gap-5',
              'max-lg:grid-cols-2 max-lg:gap-x-6 max-lg:gap-y-5',
              'md:max-lg:gap-x-8 md:max-lg:gap-y-6',
              'lg:grid-cols-2 lg:items-start lg:gap-x-10',
              hideCenterImage
                ? 'lg:mt-4 lg:translate-y-0'
                : 'lg:-mt-8 lg:-translate-y-14 xl:-mt-10 xl:-translate-y-18 2xl:-translate-y-20'
            )
        )}
      >
        {/* Left stats */}
        <div className="flex flex-col gap-3 max-lg:col-start-1 sm:gap-5 lg:items-start lg:gap-3">
          <StatRow stat={model.seats} side="left" />
          <StatRow stat={model.kts} side="left" className="pl-6 sm:pl-8 lg:pl-12 xl:pl-16" />
        </div>

        {showCta ? (
          <div className="flex max-lg:col-span-2 max-lg:justify-center">
            <OurModelsBookCta />
          </div>
        ) : null}

        {/* Right stats */}
        <div className="flex flex-col gap-3 max-lg:col-start-2 max-lg:items-end sm:gap-5 lg:col-start-2 lg:items-end lg:gap-3">
          <StatRow stat={model.ft} side="right" />
          <StatRow stat={model.nm} side="right" className="pr-6 sm:pr-8 lg:pr-12 xl:pr-16" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile stacked layout
// ─────────────────────────────────────────────────────────────────────────────
function OurModelsMobileStack({ showOnLarge }: { showOnLarge: boolean }) {
  return (
    <div
      className={cn('flex flex-col gap-14 pt-20 sm:gap-16 sm:py-12', !showOnLarge && 'lg:hidden')}
    >
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
            'will-change-[transform,opacity,filter]'
          )}
        >
          <ModelDetailBody
            model={model}
            stepIndex={index}
            ringAngleDeg={(index + 1) * 100}
            imagePriority={index === 0}
            showCta={false}
          />
        </article>
      ))}
      <OurModelsBookCta className="pt-2 sm:pt-4" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OurModelsSection
// ─────────────────────────────────────────────────────────────────────────────
export function OurModelsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const cardsLayerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ['start start', 'end end'],
  })
  const [ringDeg, setRingDeg] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setRingDeg(v * 360))

  // Hide scrub layers before first paint (GSAP runs after hydration; without this all panels flash).
  useLayoutEffect(() => {
    const root = sectionRef.current
    if (!root) return

    if (reduceMotion) {
      gsap.set(root.querySelectorAll('[data-ourmodels-cloud]'), {
        clearProps: 'transform,opacity',
      })
      return
    }

    if (window.matchMedia('(max-width: 1023px)').matches) {
      gsap.set(
        root.querySelectorAll('[data-ourmodels-mobile-card]'),
        OUR_MODELS_MOBILE_CARD_REVEAL_FROM
      )
    }

    if (!window.matchMedia('(min-width: 1024px)').matches) return

    const details = root.querySelectorAll('[data-ourmodels-detail]')
    const cardsLayer = root.querySelector('[data-ourmodels-cards-layer]')
    const backdropDim = root.querySelector('[data-ourmodels-backdrop-dim]')
    const words = textLayerRef.current?.querySelectorAll('span')
    const cards = cardsLayerRef.current?.querySelectorAll('[data-reveal-card]')

    gsap.set(details, { autoAlpha: 0, pointerEvents: 'none' })
    if (cardsLayer) gsap.set(cardsLayer, { autoAlpha: 0 })
    const staticCta = root.querySelector('[data-ourmodels-static-cta]')
    if (staticCta) gsap.set(staticCta, { autoAlpha: 0, pointerEvents: 'none' })
    if (backdropDim) gsap.set(backdropDim, { opacity: 0.22, filter: 'blur(8px)' })
    if (words) gsap.set(words, { x: 0, opacity: 1, scale: 1 })
    if (cards) {
      cards.forEach((card) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          opacity: 0,
          scale: 0.5,
          zIndex: 10,
        })
        const frame = card.querySelector('[data-card-frame]')
        if (frame) gsap.set(frame, { opacity: 0 })
      })
    }
  }, [reduceMotion])

  useGSAP(
    () => {
      if (reduceMotion) return
      const root = sectionRef.current
      if (!root) return

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia()

        const bindMobileModelCards = (from: gsap.TweenVars, scrub: number) => {
          const mobileCards = root.querySelectorAll<HTMLElement>('[data-ourmodels-mobile-card]')
          const tweens: gsap.core.Tween[] = []

          mobileCards.forEach((card) => {
            tweens.push(
              gsap.fromTo(card, from, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 88%',
                  end: 'top 44%',
                  scrub,
                  invalidateOnRefresh: true,
                },
              })
            )
          })

          return () => {
            tweens.forEach((tween) => {
              tween.scrollTrigger?.kill()
              tween.kill()
            })
            mobileCards.forEach((card) =>
              gsap.set(card, { clearProps: 'opacity,visibility,transform,filter' })
            )
          }
        }

        mm.add('(max-width: 767px)', () =>
          bindMobileModelCards({ autoAlpha: 0, y: 44, scale: 0.94, filter: 'blur(10px)' }, 0.85)
        )
        mm.add('(min-width: 768px) and (max-width: 1023px)', () =>
          bindMobileModelCards(OUR_MODELS_MOBILE_CARD_REVEAL_FROM, 0.82)
        )

        mm.add('(min-width: 1024px)', () => {
          const track = scrollTrackRef.current
          const textLayer = textLayerRef.current
          const cardsLayer = cardsLayerRef.current
          if (!track || !textLayer || !cardsLayer) return () => { }

          const backdropDim = root.querySelector<HTMLElement>('[data-ourmodels-backdrop-dim]')
          const details = [...root.querySelectorAll<HTMLDivElement>('[data-ourmodels-detail]')]
          const wordOur = textLayer.querySelector<HTMLElement>('[data-word-our]')
          const wordModels = textLayer.querySelector<HTMLElement>('[data-word-models]')
          const cards = [...cardsLayer.querySelectorAll<HTMLElement>('[data-reveal-card]')]
          const staticCta = root.querySelector<HTMLElement>('[data-ourmodels-static-cta]')

          if (
            !backdropDim ||
            !wordOur ||
            !wordModels ||
            cards.length !== OUR_MODELS.length ||
            details.length !== OUR_MODELS.length
          ) {
            return () => { }
          }

          const [cardLeft, cardCenter, cardRight] = cards

          // ── Initial setup ──
          gsap.set(textLayer, { autoAlpha: 1 })
          gsap.set(cardsLayer, { autoAlpha: 1 })
          gsap.set(backdropDim, { opacity: 0.22, filter: 'blur(8px)' })

          // ── Scrub timeline ──
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: SCROLL_TRIGGER_ID,
              trigger: track,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.9,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
            },
          })

          // ==========================================
          // BEAT 1 (0.00 – 0.20): Separation & Reveal
          // ==========================================

          // Words separate and scale down
          tl.to(wordOur, { x: '-14vw', scale: 0.5, transformOrigin: 'left center', duration: 0.20 }, 0)
          tl.to(wordModels, { x: '14vw', scale: 0.5, transformOrigin: 'right center', duration: 0.20 }, 0)

          // Helicopter cards fade in and scale up from center
          // Left card (Robinson, index 0)
          tl.fromTo(
            cardLeft,
            { xPercent: -50, yPercent: -50, x: 0, opacity: 0, scale: 0.5, zIndex: 10 },
            { xPercent: -50, yPercent: -50, x: '-20vw', opacity: 0.5, scale: 0.85, zIndex: 10, duration: 0.20 },
            0
          )
          // Center card (Airbus, index 1)
          tl.fromTo(
            cardCenter,
            { xPercent: -50, yPercent: -50, x: 0, opacity: 0, scale: 0.5, zIndex: 30 },
            { xPercent: -50, yPercent: -50, x: 0, opacity: 1, scale: 1, zIndex: 30, duration: 0.20 },
            0
          )
          // Right card (Bell, index 2)
          tl.fromTo(
            cardRight,
            { xPercent: -50, yPercent: -50, x: 0, opacity: 0, scale: 0.5, zIndex: 10 },
            { xPercent: -50, yPercent: -50, x: '18vw', opacity: 0.5, scale: 0.85, zIndex: 10, duration: 0.20 },
            0
          )

          // ==========================================
          // BEAT 1 DWELL (0.20 – 0.24): Hold Layout
          // ==========================================
          tl.to({}, { duration: 0.04 }, 0.20)

          // ==========================================
          // BEAT 2 (0.24 – 0.42): Collapse to center vertical stack + Card 0 Active
          // ==========================================

          // Text layer fades out gradually as detail cards activate — no watermark bleed-through
          tl.to(textLayer, { opacity: 0, duration: 0.22 }, 0.20)

          // Background dim transitions to full focus
          tl.to(backdropDim, { opacity: 1, filter: 'blur(0px)', duration: 0.12 }, 0.24)

          // Glass frames fade in
          cards.forEach((card) => {
            const frame = card.querySelector('[data-card-frame]')
            if (frame) {
              tl.to(frame, { opacity: 1, duration: 0.12 }, 0.24)
            }
          })

          // Collapse cards horizontally and set stacked deck offsets:
          // Card 0 (Robinson) - Active (Centered)
          tl.to(cardLeft, { xPercent: -50, yPercent: -50, x: 0, scale: 1.0, opacity: 1.0, zIndex: 30, duration: 0.18 }, 0.24)
          // Card 1 (Airbus) - Next: only its top edge peeks below the active card (~18 px)
          tl.to(cardCenter, { xPercent: -50, yPercent: -42, x: 0, scale: 0.93, opacity: 1.0, zIndex: 20, duration: 0.18 }, 0.24)
          // Card 2 (Bell) - Third: barely visible behind Airbus (~10 px)
          tl.to(cardRight, { xPercent: -50, yPercent: -36, x: 0, scale: 0.86, opacity: 1.0, zIndex: 10, duration: 0.18 }, 0.24)

          // Details block 0 fades in
          tl.fromTo(
            details[0],
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.12, ease: 'power2.out' },
            0.28
          )
          // Title 0 slides up and fades in
          const title0 = details[0].querySelector('[data-detail-title]')
          if (title0) {
            tl.fromTo(
              title0,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' },
              0.28
            )
          }

          // ==========================================
          // BEAT 2 DWELL (0.42 – 0.46): Hold Card 0 Active
          // ==========================================
          tl.to({}, { duration: 0.04 }, 0.42)

          // ==========================================
          // BEAT 3 (0.46 – 0.68): Transition to Card 1 Active (Airbus)
          // ==========================================

          // Text layer fades out completely when moving to the next active card section (Airbus)
          tl.to(textLayer, { opacity: 0, duration: 0.12 }, 0.46)

          // Card 0 exits by sliding UP (Previous card — clear of the viewport)
          tl.to(cardLeft, { xPercent: -50, yPercent: -85, scale: 0.93, opacity: 1.0, zIndex: 20, duration: 0.18 }, 0.46)
          // Card 1 slides UP to center focus (Active card, yPercent: -50)
          tl.to(cardCenter, { xPercent: -50, yPercent: -50, scale: 1.0, opacity: 1.0, zIndex: 30, duration: 0.18 }, 0.46)
          // Card 2 slides UP (Next card — subtle top-edge peek only)
          tl.to(cardRight, { xPercent: -50, yPercent: -42, scale: 0.93, opacity: 1.0, zIndex: 20, duration: 0.18 }, 0.46)

          // Specs fade out 0 and fade in 1
          tl.to(details[0], { autoAlpha: 0, duration: 0.10 }, 0.46)
          tl.to(details[1], { autoAlpha: 1, duration: 0.12 }, 0.54)

          // Title transitions (contrasting vertical slide)
          if (title0) {
            tl.to(title0, { y: -40, opacity: 0, duration: 0.12 }, 0.46)
          }
          const title1 = details[1].querySelector('[data-detail-title]')
          if (title1) {
            tl.fromTo(
              title1,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' },
              0.54
            )
          }

          // ==========================================
          // BEAT 3 DWELL (0.68 – 0.72): Hold Card 1 Active
          // ==========================================
          tl.to({}, { duration: 0.04 }, 0.68)

          // ==========================================
          // BEAT 4 (0.72 – 0.90): Transition to Card 2 Active (Bell)
          // ==========================================

          // Card 0 slides further UP (exits completely, yPercent: -50 - 70 = -120)
          tl.to(cardLeft, { xPercent: -50, yPercent: -120, scale: 0.86, opacity: 1.0, zIndex: 10, duration: 0.18 }, 0.72)
          // Card 1 slides UP (Previous card, yPercent: -50 - 35 = -85)
          tl.to(cardCenter, { xPercent: -50, yPercent: -85, scale: 0.93, opacity: 1.0, zIndex: 20, duration: 0.18 }, 0.72)
          // Card 2 slides UP into center focus (Active card, yPercent: -50)
          tl.to(cardRight, { xPercent: -50, yPercent: -50, scale: 1.0, opacity: 1.0, zIndex: 30, duration: 0.18 }, 0.72)

          // Specs fade out 1 and fade in 2
          tl.to(details[1], { autoAlpha: 0, duration: 0.10 }, 0.72)
          tl.to(details[2], { autoAlpha: 1, duration: 0.12 }, 0.80)

          // Title transitions
          if (title1) {
            tl.to(title1, { y: -40, opacity: 0, duration: 0.12 }, 0.72)
          }
          const title2 = details[2].querySelector('[data-detail-title]')
          if (title2) {
            tl.fromTo(
              title2,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' },
              0.80
            )
          }

          // ==========================================
          // BEAT 5 (0.90 – 1.00): Dwell Card 2 Active until track end
          // ==========================================
          tl.to({}, { duration: 0.10 }, 0.90)

          // ── Cloud scroll exit (when track leaves viewport) ─────────────
          const clouds = [...root.querySelectorAll<HTMLElement>('[data-ourmodels-cloud]')]
          const cloudExitTweens: gsap.core.Tween[] = []

          if (clouds.length >= 2) {
            gsap.set(clouds, {
              yPercent: 0,
              xPercent: 0,
              scale: 1,
              opacity: 1,
              transformOrigin: '50% 100%',
            })

            clouds.forEach((cloud, i) => {
              const p = OUR_MODELS_CLOUD_PARALLAX[i] ?? OUR_MODELS_CLOUD_PARALLAX[0]
              const tween = gsap.fromTo(
                cloud,
                {
                  yPercent: 0,
                  xPercent: 0,
                  scale: p.scaleFrom,
                  opacity: 1,
                },
                {
                  yPercent: p.yTo,
                  xPercent: p.xTo,
                  scale: p.scaleTo,
                  opacity: 0,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: track,
                    start: 'bottom bottom',
                    end: 'bottom top',
                    scrub: 0.9,
                    invalidateOnRefresh: true,
                  },
                }
              )
              cloudExitTweens.push(tween)
            })
          }

          // ── Pointer-events & CTA sync ─────────────────────────
          const syncScrubState = () => {
            const p = tl.progress()
            const stageD = p >= 0.28
            details.forEach((el, i) => {
              const active =
                (i === 0 && p >= 0.28 && p < 0.46) ||
                (i === 1 && p >= 0.46 && p < 0.72) ||
                (i === 2 && p >= 0.72)
              gsap.set(el, { pointerEvents: active ? 'auto' : 'none' })
            })
            if (staticCta) {
              gsap.set(staticCta, {
                autoAlpha: stageD ? 1 : 0,
                pointerEvents: stageD ? 'auto' : 'none',
              })
            }
          }
          tl.eventCallback('onUpdate', syncScrubState)
          syncScrubState()

          // Apply current scroll position immediately
          if (tl.scrollTrigger) {
            tl.progress(tl.scrollTrigger.progress)
          }

          void document.fonts?.ready?.then(() => {
            tl.invalidate()
            ScrollTrigger.refresh()
            if (tl.scrollTrigger) {
              tl.progress(tl.scrollTrigger.progress)
            }
            syncScrubState()
          })

          return () => {
            cloudExitTweens.forEach((tween) => {
              tween.scrollTrigger?.kill()
              tween.kill()
            })
            tl.scrollTrigger?.kill()
            tl.kill()
          }
        })
      }, sectionRef)

      return () => ctx.revert()
    },
    { scope: sectionRef, dependencies: [reduceMotion] }
  )

  const showDesktopScrub = !reduceMotion

  return (
    <Section
      ref={sectionRef}
      id="our-models"
      variant="default"
      paddingY="none"
      className="overflow-visible bg-transparent"
    >
      {/* Scroll track: 520vh on lg+ */}
      <div
        ref={scrollTrackRef}
        className={cn('relative w-full', showDesktopScrub && 'lg:min-h-[520vh]')}
        data-ourmodels-track
      >
        <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,#F0F1F2_0%,#D6E8FA_49.52%,#F0F1F2_100%)]" />

        {/* Sticky viewport */}
        <div
          className={cn(
            'relative z-10 flex min-h-svh w-full flex-col max-lg:min-h-0',
            'lg:sticky lg:top-0 lg:h-svh lg:min-h-0 lg:overflow-hidden'
          )}
        >
          <OurModelsFixedBackdrop ambientMotion={!reduceMotion} />

          {/* Mobile */}
          <div className="max-w-base relative z-20 mx-auto w-full px-4 sm:px-6 lg:hidden lg:px-8">
            <OurModelsMobileStack showOnLarge={reduceMotion} />
          </div>

          {showDesktopScrub && (
            <div className="hidden lg:contents" aria-hidden>
              <h2 className="sr-only">Our Models</h2>

              {/*
               * ── CARDS LAYER (Stage B) ─────────────────────────────────
               * Portrait helicopter cards; centered absolutely.
               * z-[30]: behind details layer (z-[40]).
               * Initial hide via GSAP sets.
               */}
              <div
                ref={cardsLayerRef}
                data-ourmodels-cards-layer
                className="absolute inset-0 z-30 opacity-0 pointer-events-none"
              >
                <div className="relative h-full w-full">
                  {OUR_MODELS.map((model, index) => {
                    return (
                      <div
                        key={model.id}
                        data-reveal-card
                        data-card-index={index}
                        className={cn(
                          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                          'flex items-center justify-center overflow-visible will-change-[transform,opacity]',
                          'h-[clamp(16rem,32vh,26rem)] w-[clamp(11rem,22vh,18rem)] lg:h-[clamp(22rem,38vh,32rem)] lg:w-[clamp(15rem,28vh,24rem)] xl:h-[clamp(26rem,48vh,42rem)] xl:w-[clamp(20rem,34vh,32rem)]'
                        )}
                      >
                        {/* Solid off-white premium background card frame */}
                        <div
                          data-card-frame
                          className="absolute inset-0 rounded-2xl border border-white/80 bg-[#F8F9FA] shadow-2xl opacity-0 transition-opacity duration-300"
                        />

                        {/* Transparent helicopter image */}
                        <div className="relative h-[80%] w-[90%] z-10" aria-hidden>
                          <Image
                            src={model.overviewImageSrc}
                            alt=""
                            fill
                            sizes="(max-width: 1024px) 24vw, (max-width: 1536px) 32vw, 420px"
                            className="object-contain object-center drop-shadow-[0_10px_28px_rgba(0,0,0,0.18)] select-none"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* TEXT LAYER — Stage A centred; Stage B words pin to viewport edges */}
              <div
                ref={textLayerRef}
                data-ourmodels-text-layer
                className={cn(
                  'absolute inset-0 z-20',
                  'text-brand-charcoal [font-family:var(--font-halant)] text-[clamp(5rem,18vw,20rem)] leading-none tracking-[0.02em] lg:text-[clamp(6rem,12vw,12rem)]',
                  'flex items-center justify-center gap-x-[0.32em]',
                  'pointer-events-none overflow-visible'
                )}
              >
                <span
                  data-word-our
                  className="inline-block shrink-0 will-change-[transform,font-size]"
                >
                  Our
                </span>
                <span
                  data-word-models
                  className="inline-block shrink-0 will-change-[transform,font-size]"
                >
                  Models
                </span>
              </div>

              {/*
               * ── STAGE D: Detail panels ────────────────────────────────
               * z-[40] topmost. Outer fills viewport; inner caps at 1280px.
               * Shared static CTA outside animated panels. All hidden at mount.
               * Center image is hidden to let the vertical scrolling cards stack show through.
               */}
              <div className="pointer-events-none absolute inset-0 z-40">
                {OUR_MODELS.map((model, index) => (
                  <div
                    key={model.id}
                    data-ourmodels-detail
                    className={cn(
                      'absolute inset-0 flex h-full min-h-0 flex-col overflow-hidden',
                      'pointer-events-none opacity-0 will-change-[opacity]'
                    )}
                  >
                    <div className="max-w-base mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:pt-[calc(50px+63px+1rem)] lg:pb-4">
                      <ModelDetailBody
                        model={model}
                        stepIndex={index}
                        ringAngleDeg={ringDeg}
                        imagePriority={index === 0}
                        showCta={false}
                        hideCenterImage
                      />
                    </div>
                  </div>
                ))}

                <div
                  data-ourmodels-static-cta
                  className={cn(
                    'pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-center opacity-0',
                    'px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8'
                  )}
                >
                  <div className="max-w-base mx-auto flex w-full justify-center max-lg:hidden">
                    <OurModelsBookCta />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reduced-motion fallback */}
          {reduceMotion && (
            <div className="max-w-base relative z-20 mx-auto hidden w-full px-4 sm:px-6 lg:block lg:px-8">
              <OurModelsMobileStack showOnLarge />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
