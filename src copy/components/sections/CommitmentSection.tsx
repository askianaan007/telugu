'use client'

import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { gsapEasings } from '@/lib/animations/easings'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'

const CLOUD_PARALLAX = [
  { yFrom: -20, yTo: 24, xFrom: -6, xTo: 10 },
  { yFrom: -12, yTo: 18, xFrom: 8, xTo: -12 },
  { yFrom: -16, yTo: 14, xFrom: -10, xTo: 8 },
  { yFrom: -8, yTo: 22, xFrom: 6, xTo: -14 },
] as const

const HEADER_LABEL = 'OUR COMMITMENT TO EXCELLENCE'

const HEADER_HEADLINE =
  'At Telugu Airlines, we view aviation as a vital catalyst for progress rather than merely a means of transportation.'

const HEADER_SUB =
  'Our mission extends beyond simply moving passengers and cargo. we are dedicated to fostering growth, optimizing time efficiency, and creating a web of interconnected opportunities  This philosophy drives us to enhance the travel experience, ensuring that every flight contributes to the broader goals of  our customers and partners.'

const BOTTOM_BODY =
  'As a result, Telugu Airlines has established itself as a trusted ally in the aviation sector. Our dedication to fostering strong partnerships and delivering exceptional service has earned us the confidence of our clients and stakeholders. We are proud to play a pivotal role in shaping the future of air travel, where every journey is an opportunity for growth and connection, ultimately transforming the way people and businesses engage with the world.'

const RING_TEXT = 'Telugu Airlines has established itself as a trusted ally in the aviation sector'

const RING_RADIUS = 310
const RING_CX = 311
const RING_CY = 311
const RING_CIRCLE_PATH = `M ${RING_CX} ${RING_CY - RING_RADIUS} A ${RING_RADIUS} ${RING_RADIUS} 0 1 1 ${RING_CX - 0.01} ${RING_CY - RING_RADIUS}`

const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const RING_TEXT_LENGTH = RING_CIRCUMFERENCE * 0.96
const RING_TEXT_START_OFFSET = '1%'

const RING_SCROLL_GAIN = 0.007
const FRICTION = 0.965           // low friction → ~2.5 s wind-out after scrolling stops
const EASE_IN_DRAIN = 0.30       // fraction of scroll buffer applied per normalised frame
const VELOCITY_EPS = 0.001
const MAX_SCROLL_DELTA = 100
const MAX_VELOCITY = 3.0         // slightly higher ceiling for dramatic spin

export function CommitmentSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useGSAP(
    (_, contextSafe) => {
      const root = sectionRef.current
      if (!root) return

      const reduceMotion =
        Boolean(prefersReducedMotion) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const ring = ringRef.current
      let rotationRafId: number | null = null
      let disconnectRotation: (() => void) | undefined

      if (ring && !reduceMotion) {
        let rotation = 0
        let velocity = 0
        let pendingScrollDelta = 0
        let lastScrollY = window.scrollY
        let lastFrameTime = performance.now()
        let isIntersecting = true

        const setRotation = gsap.quickSetter(ring, 'rotation', 'deg')

        const observer = new IntersectionObserver(
          ([entry]) => {
            isIntersecting = entry?.isIntersecting ?? false
            if (isIntersecting) {
              lastScrollY = window.scrollY
              pendingScrollDelta = 0
              return
            }
            velocity = 0
            pendingScrollDelta = 0
          },
          { threshold: 0.08, rootMargin: '40px 0px' }
        )
        observer.observe(root)

        const step = (now: number) => {
          const dt = Math.min((now - lastFrameTime) / 16.667, 2)
          lastFrameTime = now

          // ── Ease-in: drain scroll buffer gradually into velocity ──────────
          // Rather than applying the full delta in one frame, we drain a
          // fraction each frame so the ring accelerates smoothly.
          if (pendingScrollDelta !== 0) {
            const drainFraction = 1 - Math.pow(1 - EASE_IN_DRAIN, dt)
            const drain = pendingScrollDelta * drainFraction
            velocity += drain * RING_SCROLL_GAIN
            pendingScrollDelta -= drain
            if (Math.abs(pendingScrollDelta) < 0.5) pendingScrollDelta = 0
            velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity))
          }

          // ── Stop when both velocity and buffer are negligible ─────────────
          if (Math.abs(velocity) < VELOCITY_EPS && pendingScrollDelta === 0) {
            velocity = 0
            rotationRafId = null
            return
          }

          rotation += velocity * dt
          // ── Ease-out / wind effect: very gentle friction so the ring ──────
          // keeps spinning for ~2.5 s after scrolling stops, like a turbine
          // slowly winding down.
          velocity *= Math.pow(FRICTION, dt)
          setRotation(rotation)
          rotationRafId = requestAnimationFrame(step)
        }

        const ensureRaf = () => {
          if (rotationRafId == null) {
            lastFrameTime = performance.now()
            rotationRafId = requestAnimationFrame(step)
          }
        }

        const handleScroll = () => {
          const currentScrollY = window.scrollY
          if (!isIntersecting) {
            lastScrollY = currentScrollY
            return
          }

          const dy = currentScrollY - lastScrollY
          lastScrollY = currentScrollY
          if (dy === 0) return

          pendingScrollDelta += Math.max(-MAX_SCROLL_DELTA, Math.min(MAX_SCROLL_DELTA, dy))
          ensureRaf()
        }

        const onScroll = contextSafe?.(handleScroll) ?? handleScroll

        window.addEventListener('scroll', onScroll, { passive: true })

        disconnectRotation = () => {
          window.removeEventListener('scroll', onScroll)
          observer.disconnect()
          if (rotationRafId != null) cancelAnimationFrame(rotationRafId)
        }
      }

      const clouds = gsap.utils.toArray<HTMLElement>('[data-commit-cloud]')
      const headerBits = gsap.utils.toArray<HTMLElement>('[data-commit-header-item]')
      const guideV = root.querySelector<HTMLElement>('[data-commit-guide-v]')
      const guideH = root.querySelector<HTMLElement>('[data-commit-guide-h]')
      const guideDots = gsap.utils.toArray<HTMLElement>('[data-commit-guide-dot]')
      const ringInner = root.querySelector<HTMLElement>('[data-commit-ring-inner]')
      const logo = root.querySelector<HTMLElement>('[data-commit-logo]')
      const bottom = root.querySelector<HTMLElement>('[data-commit-bottom]')

      if (reduceMotion) {
        gsap.set(
          [...clouds, ...headerBits, guideV, guideH, ...guideDots, ringInner, logo, bottom].filter(
            Boolean
          ),
          { clearProps: 'all' }
        )
        return () => {
          disconnectRotation?.()
        }
      }

      const ctx = gsap.context(() => {
        clouds.forEach((cloud, i) => {
          const p = CLOUD_PARALLAX[i] ?? CLOUD_PARALLAX[0]
          gsap.fromTo(
            cloud,
            { yPercent: p.yFrom, xPercent: p.xFrom },
            {
              yPercent: p.yTo,
              xPercent: p.xTo,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.35,
                invalidateOnRefresh: true,
              },
            }
          )
        })

        gsap.set(clouds, { autoAlpha: 0, scale: 0.94, transformOrigin: '50% 50%' })

        if (guideV) gsap.set(guideV, { scaleY: 0, transformOrigin: '50% 50%' })
        if (guideH) gsap.set(guideH, { scaleX: 0, transformOrigin: '50% 50%' })
        gsap.set(guideDots, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' })
        gsap.set(headerBits, { y: 36, autoAlpha: 0, filter: 'blur(10px)' })
        gsap.set(ringInner, { scale: 0.9, autoAlpha: 0, transformOrigin: '50% 50%' })
        if (logo) gsap.set(logo, { scale: 0.82, autoAlpha: 0, transformOrigin: '50% 50%' })
        if (bottom) gsap.set(bottom, { y: 32, autoAlpha: 0, filter: 'blur(6px)' })

        const enter = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            once: true,
            invalidateOnRefresh: true,
          },
        })

        enter
          .to(
            clouds,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 1.2,
              stagger: 0.12,
              ease: gsapEasings.smooth,
            },
            0
          )
          .to(
            headerBits,
            {
              y: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
              duration: 1.05,
              stagger: 0.1,
              ease: gsapEasings.smooth,
            },
            0.05
          )
          .to(guideV, { scaleY: 1, duration: 1.1, ease: gsapEasings.expo }, 0.35)
          .to(guideH, { scaleX: 1, duration: 1.1, ease: gsapEasings.expo }, 0.42)
          .to(
            guideDots,
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.85,
              stagger: 0.09,
              ease: gsapEasings.back,
            },
            0.48
          )
          .to(ringInner, { scale: 1, autoAlpha: 1, duration: 1.15, ease: gsapEasings.smooth }, 0.52)
          .to(logo, { scale: 1, autoAlpha: 1, duration: 1.05, ease: gsapEasings.back }, 0.68)
          .to(
            bottom,
            {
              y: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
              duration: 0.95,
              ease: gsapEasings.smooth,
            },
            0.78
          )
      }, root)

      return () => {
        disconnectRotation?.()
        ctx.revert()
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  )

  return (
    <Section
      ref={sectionRef}
      variant="default"
      paddingY="none"
      // ✦ overflow-x-clip replaces overflow-x-hidden — avoids the CSS side-effect
      //   where overflow-x:hidden forces overflow-y to become "auto", collapsing
      //   the intentional overflow-y-visible on cloud decorations.
      className="relative min-h-[1253px] overflow-x-clip overflow-y-visible bg-[#F0F1F2] md:min-h-[1501px] lg:min-h-[1428px] xl:min-h-[1762px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-index-section-bg) h-full w-full bg-[linear-gradient(to_bottom,#F0F1F2_0%,#D6E8FA_50%,#F0F1F2_100%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-index-section-decor) overflow-hidden"
      >
        <div
          data-commit-cloud
          className="absolute top-[-6%] left-[-18%] h-[48%] w-[62%] will-change-transform max-[639px]:top-[0%] max-[639px]:h-[38%] max-[639px]:w-[78%]"
        >
          <div className="commitment-cloud-drift-a relative h-full w-full opacity-[0.88]">
            <Image
              src="/images/hero-cloud.png"
              alt=""
              fill
              sizes="(max-width: 768px) 90vw, 55vw"
              className="object-contain object-[85%_25%] opacity-20 brightness-130 contrast-[1.02]"
            />
          </div>
        </div>
        <div
          data-commit-cloud
          className="absolute top-[18%] left-[-42%] h-[56%] w-[70%] will-change-transform max-[639px]:top-[22%] max-[639px]:h-[48%]"
        >
          <div className="commitment-cloud-drift-b relative h-full w-full opacity-[0.88]">
            <Image
              src="/images/hero-cloud.png"
              alt=""
              fill
              sizes="(max-width: 768px) 95vw, 60vw"
              className="object-contain object-right opacity-20 brightness-130 contrast-[1.02]"
            />
          </div>
        </div>
        <div
          data-commit-cloud
          className="absolute top-[14%] right-[-16%] h-[46%] w-[58%] will-change-transform max-[639px]:top-[2%] max-[639px]:h-[36%]"
        >
          <div className="commitment-cloud-drift-c relative h-full w-full opacity-[0.88]">
            <Image
              src="/images/hero-cloud.png"
              alt=""
              fill
              sizes="(max-width: 768px) 85vw, 50vw"
              className="scale-x-[-1] object-contain object-[15%_20%] opacity-20 brightness-110 contrast-[1.02]"
            />
          </div>
        </div>
        <div
          data-commit-cloud
          className="absolute right-[-30%] bottom-[8%] h-[52%] w-[62%] will-change-transform max-[639px]:bottom-[0%] max-[639px]:h-[42%]"
        >
          <div className="commitment-cloud-drift-d relative h-full w-full opacity-[0.88]">
            <Image
              src="/images/hero-cloud.png"
              alt=""
              fill
              sizes="(max-width: 768px) 90vw, 55vw"
              className="object-contain object-left opacity-30 brightness-110 contrast-[1.02]"
            />
          </div>
        </div>
      </div>

      <Container className="max-w-base relative z-(--z-index-section-content) px-4 pb-16 sm:px-6 sm:pb-20 lg:px-0 lg:pb-24 xl:pb-28">
        <header className="xl:max-w-base mx-auto w-full max-w-full pt-36 text-center sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40 xl:pb-20">
          <div data-commit-header-item className="mb-2 flex flex-col items-center gap-2.5">
            <span className="inline-flex items-center gap-2">
              <Image
                src="/images/black-asterisk.svg"
                width={14}
                height={14}
                alt=""
                className="h-[14px] w-[14px] shrink-0"
                aria-hidden
              />
              <span className="text-brand-black [font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase">
                {HEADER_LABEL}
              </span>
            </span>
            <Image
              src="/images/header-line-transparent-lite.svg"
              width={364}
              height={12}
              alt=""
              className="h-auto w-[min(364px,calc(100vw-4rem))] max-w-full shrink-0"
              aria-hidden
            />
          </div>
          <h2
            data-commit-header-item
            className={cn(
              'text-brand-charcoal mt-4 text-center [font-family:var(--font-halant)] font-normal',
              'text-[28px] leading-[1.08] tracking-[-0.04em] sm:text-[36px] md:text-[40px] lg:text-[48px] lg:leading-[1.05] xl:text-[70px] xl:leading-[72px]',
              'xl:max-w-base mx-auto max-w-[28ch] text-pretty sm:max-w-[28ch] lg:max-w-[32ch]'
            )}
          >
            {HEADER_HEADLINE}
          </h2>
          <p
            data-commit-header-item
            className="text-brand-muted mx-auto mt-5 max-w-[min(100%,640px)] [font-family:var(--font-geist)] text-[15px] leading-relaxed font-normal sm:mt-6 sm:text-[16px] lg:max-w-[720px] lg:text-[18px] xl:max-w-[1028px]"
          >
            {HEADER_SUB}
          </p>
        </header>

        {/* Ring block
            ✦ lg:max-w-[580px] — caps the ring diameter at lg so the SVG text
              (overflow-visible) stays comfortably inside the viewport.
              xl:max-w-[840px] — narrower xl shell; guide line classes unchanged. */}
        <div className="relative mx-auto mt-12 mb-14 w-full sm:mt-14 sm:mb-16 lg:mt-20 lg:mb-0 lg:max-w-[580px] xl:mt-0 xl:max-w-[840px]">
          <div className="relative mx-auto aspect-square w-full">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            >
              <div className="relative h-[98%] w-[98%] sm:h-[62%] sm:w-[62%] md:h-[84%] md:w-[84%] lg:h-full lg:w-full xl:h-[98%] xl:w-[98%]">
                <div
                  data-commit-guide-v
                  className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,var(--color-brand-gold-start)_0%,var(--color-brand-gold-mid)_100%)]"
                />
                <div
                  data-commit-guide-h
                  className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,var(--color-brand-gold-start)_0%,var(--color-brand-gold-mid)_50%,var(--color-brand-gold-start)_100%)]"
                />
                <Image
                  data-commit-guide-dot
                  src="/images/gradient-gold-circle.png"
                  alt=""
                  width={64}
                  height={68}
                  className="absolute top-0 left-1/2 h-5 w-4 -translate-x-1/2 -translate-y-1/2 sm:h-8 sm:w-6 md:h-9 md:w-7 lg:h-10 lg:w-8 xl:h-11 xl:w-9"
                  aria-hidden
                />
                <Image
                  data-commit-guide-dot
                  src="/images/gradient-gold-circle.png"
                  alt=""
                  width={64}
                  height={68}
                  className="absolute top-1/2 left-0 h-5 w-4 -translate-x-1/2 -translate-y-1/2 sm:h-8 sm:w-6 md:h-9 md:w-7 lg:h-10 lg:w-8 xl:h-11 xl:w-9"
                  aria-hidden
                />
                <Image
                  data-commit-guide-dot
                  src="/images/gradient-gold-circle.png"
                  alt=""
                  width={64}
                  height={68}
                  className="absolute top-1/2 right-0 h-5 w-4 translate-x-1/2 -translate-y-1/2 sm:h-8 sm:w-6 md:h-9 md:w-7 lg:h-10 lg:w-8 xl:h-11 xl:w-9"
                  aria-hidden
                />
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div
                data-commit-ring-inner
                className="relative aspect-square w-full max-w-[min(88vw,265px)] sm:max-w-[min(84vw,355px)] md:max-w-[min(100%,440px)] lg:max-w-[min(100%,490px)] xl:max-w-[540px]"
              >
                <div
                  ref={ringRef}
                  className="absolute inset-0 z-0 origin-center will-change-transform"
                  style={{ transform: 'rotate(0deg)' }}
                >
                  <svg
                    className="h-full w-full overflow-visible"
                    viewBox="0 0 622 622"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <defs>
                      <path id="commitment-ring-circle" d={RING_CIRCLE_PATH} />
                      <linearGradient
                        id="commitment-ring-text-gradient"
                        gradientUnits="userSpaceOnUse"
                        x1="311"
                        y1="0"
                        x2="311"
                        y2="622"
                      >
                        <stop offset="0%" stopColor="#121F2F" />
                        <stop offset="100%" stopColor="#CB933C" />
                      </linearGradient>
                    </defs>
                    <text
                      fill="url(#commitment-ring-text-gradient)"
                      fontSize="60"
                      style={{ fontFamily: 'var(--font-halant)', lineHeight: '72px' }}
                      textLength={RING_TEXT_LENGTH}
                      lengthAdjust="spacing"
                    >
                      <textPath
                        href="#commitment-ring-circle"
                        startOffset={RING_TEXT_START_OFFSET}
                        textAnchor="start"
                        method="align"
                        spacing="auto"
                      >
                        {RING_TEXT}
                      </textPath>
                    </text>
                  </svg>
                </div>

                <div
                  data-commit-logo
                  className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center"
                >
                  <Image
                    src="/images/telugu-airlines-logo-3d.svg"
                    alt="Telugu Airlines"
                    width={370}
                    height={370}
                    className="h-auto max-h-[min(36vw,155px)] w-auto sm:max-h-[min(34vw,190px)] md:max-h-[225px] lg:max-h-[260px] xl:max-h-[320px]"
                    priority={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom body
            ✦ lg:px-8 xl:px-0 — restores horizontal padding at lg where the
              Container has lg:px-0, preventing edge-to-edge text overflow. */}
        <p
          data-commit-bottom
          className="text-brand-muted mx-auto max-w-[min(100%,1028px)] px-2 text-center [font-family:var(--font-geist)] text-[16px] leading-[22px] font-normal sm:px-0 sm:text-[17px] sm:leading-[23px] lg:px-8 lg:pt-20 lg:leading-normal xl:px-0 xl:text-[18px]"
        >
          {BOTTOM_BODY}
        </p>
      </Container>
    </Section>
  )
}
