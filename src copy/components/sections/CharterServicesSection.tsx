'use client'

import { m } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { CHARTER_SERVICES, type CharterServiceCard as CharterServiceItem } from '@/data/services'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { charterServiceRevealInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

/** GeniAI testimonial wrappers: alternating ±3° on stacked cards. */
function charterCardRotationDeg(index: number): number {
  return index % 2 === 0 ? 3 : -3
}

function charterCardTiltClass(index: number): string {
  return index % 2 === 0 ? 'rotate-[3deg]' : '-rotate-[3deg]'
}

/** Final vertical peek so lower cards show at edges (px). */
function charterStackFinalY(index: number): number {
  return -10 * index
}

type CharterStackMeasure = {
  stageHeight: number
  cardHeight: number
  /** px from stage center down to viewport bottom */
  belowViewportCenter: number
  /** Y offset so card center starts below the viewport bottom */
  enterFromViewportBottom: number
}

/** Measure stack stage against the viewport so reveals begin off-screen at the bottom. */
function measureCharterStackContext(
  stage: HTMLElement,
  cards: NodeListOf<HTMLElement> | HTMLElement[]
): CharterStackMeasure {
  const stageRect = stage.getBoundingClientRect()
  const vh = window.innerHeight
  const stageCenterY = stageRect.top + stageRect.height / 2
  // Minimum: 40 % of viewport height. The old 160 px floor was measured before the
  // section is pinned (stageCenterY >> vh → vh - stageCenterY < 0), so belowViewportCenter
  // collapsed to 160 px, leaving the card top only ~9 px below the viewport once pinned.
  const belowViewportCenter = Math.max(vh - stageCenterY, Math.round(vh * 0.4))
  const sample = cards[0]?.querySelector<HTMLElement>('[data-service-card]')
  const cardHeight = sample?.offsetHeight ?? 210
  // full cardHeight ensures the card *top* (center − cardHeight/2) starts below viewport.
  const enterFromViewportBottom = Math.round(belowViewportCenter + cardHeight + 80)

  return {
    stageHeight: stage.offsetHeight || Math.min(vh * 0.68, 760),
    cardHeight,
    belowViewportCenter,
    enterFromViewportBottom,
  }
}

/** Initial Y for stacked cards before scroll reveal (index 0 = resting stack). */
function charterStackHiddenStartY(index: number, metrics: CharterStackMeasure): number {
  if (index === 0) return charterStackFinalY(0)
  return metrics.enterFromViewportBottom + Math.max(0, index - 1) * 36
}

/** Scroll travel shared by stacked cards and the background (first → last card). */
function charterStackBgTravelPx(cardCount: number, metrics: CharterStackMeasure): number {
  if (cardCount < 1) return 320
  const lastStart = charterStackHiddenStartY(cardCount - 1, metrics)
  const lastFinal = charterStackFinalY(cardCount - 1)
  return Math.max(lastStart - lastFinal, 320)
}

/** Scrubbed Y-reveal for stacked cards on sm/md (HeliportSolutionsSection pattern). */
const charterMobileRevealFrom: gsap.TweenVars = {
  autoAlpha: 0,
  y: 32,
  scale: 0.95,
  filter: 'blur(8px)',
}

function CharterServiceCard({ service, stack }: { service: CharterServiceItem; stack?: boolean }) {
  return (
    <article
      data-service-card
      className={cn(
        'group/card shrink-0',
        stack
          ? 'w-full'
          : 'w-[min(85vw,calc(100vw-2.5rem))] sm:w-[min(520px,calc(100vw-3rem))] md:w-[min(600px,90vw)] lg:w-[min(660px,92vw)]',
        'border-about-reveal-frame-outer-border rounded-[22px] border bg-white/30 p-2 shadow-[0_14px_44px_-18px_rgba(9,9,11,0.22)] backdrop-blur-sm',
        'h-auto min-h-[168px] xl:h-44.5 xl:min-h-44.5',
        stack ? 'xl:max-w-[728px]' : 'xl:max-w-181.75',
        !stack && 'xl:w-full'
      )}
    >
      <div className={charterServiceRevealInnerClassName()}>
        <div
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden',
            'h-14 w-14 sm:h-16 sm:w-16',
            'md:h-20 md:w-20 lg:h-[128px] lg:w-[128px]'
          )}
        >
          <Image
            src={service.image}
            alt=""
            fill
            className="object-contain object-center"
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 80px, 128px"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center pr-1">
          <h3
            className={cn(
              'text-brand-black [font-family:var(--font-satoshi)] font-semibold tracking-[-0.02em]',
              'text-[15px] leading-snug sm:text-base sm:leading-snug',
              'md:text-[17px] md:leading-[1.35] xl:text-[20px] xl:leading-[26px]'
            )}
          >
            {service.title}
          </h3>
          <p
            className={cn(
              'text-brand-gray [font-family:var(--font-satoshi)] font-normal',
              'text-[13px] leading-snug sm:text-sm sm:leading-relaxed',
              'md:text-[15px] md:leading-relaxed xl:text-[20px] xl:leading-[26px]'
            )}
          >
            {service.summary}
          </p>
        </div>
      </div>
    </article>
  )
}

export function CharterServicesSection() {
  const reduceMotion = usePrefersReducedMotion()
  const scopeRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = scopeRef.current
      const pinRoot = pinRef.current
      if (!root || !pinRoot || reduceMotion) return

      const bgFigure = root.querySelector<HTMLElement>('[data-charter-bg-figure]')

      const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mqReduce.matches) return

      const mm = gsap.matchMedia()

      mm.add('(max-width: 1023px)', () => {
        const mobileCards = pinRoot.querySelectorAll<HTMLElement>('[data-charter-mobile-card]')
        const mobileTweens: gsap.core.Tween[] = []

        // Set hidden state synchronously so no card is partially visible before GSAP evaluates
        // scroll progress (scrub would compute a non-zero opacity for cards already near-viewport).
        gsap.set(mobileCards, charterMobileRevealFrom)
        mobileCards.forEach((card) => {
          mobileTweens.push(
            gsap.to(card, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.72,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 75%',
                toggleActions: 'play none none none',
                invalidateOnRefresh: true,
              },
            })
          )
        })

        if (bgFigure) {
          gsap.set(bgFigure, { transformOrigin: '50% 22%', force3D: true })
          mobileTweens.push(
            gsap.fromTo(
              bgFigure,
              { y: 20, scale: 1 },
              {
                y: -44,
                scale: 1.045,
                ease: 'none',
                scrollTrigger: {
                  trigger: root,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.05,
                  invalidateOnRefresh: true,
                },
              }
            )
          )
        }

        return () => {
          mobileTweens.forEach((t) => t.kill())
          mobileCards.forEach((card) =>
            gsap.set(card, { clearProps: 'opacity,visibility,transform,filter' })
          )
          if (bgFigure) gsap.set(bgFigure, { clearProps: 'transform' })
        }
      })

      mm.add('(min-width: 1024px)', () => {
        const stage = pinRoot.querySelector<HTMLElement>('[data-charter-stack-stage]')
        const cards = pinRoot.querySelectorAll<HTMLElement>('[data-charter-stack-card]')
        if (!stage || !cards.length) return
        const n = cards.length
        let stackMetrics = measureCharterStackContext(stage, cards)
        let bgTravel = charterStackBgTravelPx(n, stackMetrics)

        const applyStackMetrics = () => {
          stackMetrics = measureCharterStackContext(stage, cards)
          bgTravel = charterStackBgTravelPx(n, stackMetrics)
          root.style.setProperty('--charter-stack-bg-travel', `${bgTravel}px`)
          return stackMetrics
        }

        applyStackMetrics()

        stage.removeAttribute('data-ready')
        gsap.set(stage, { autoAlpha: 0 })

        const setCardPositions = (metrics: CharterStackMeasure) => {
          cards.forEach((card, i) => {
            gsap.set(card, {
              xPercent: -50,
              yPercent: -50,
              x: 0,
              y: charterStackHiddenStartY(i, metrics),
              rotation: charterCardRotationDeg(i),
              zIndex: 10 + i,
              force3D: true,
            })
          })
        }

        setCardPositions(stackMetrics)

        const scrollPct = 260 + Math.max(0, n - 1) * 34

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: `+=${scrollPct}%`,
            pin: root,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.88,
            invalidateOnRefresh: true,
          },
        })

        if (bgFigure) {
          gsap.set(bgFigure, {
            transformOrigin: '50% 52%',
            force3D: true,
            y: bgTravel * 0.52,
            scale: 1,
          })
        }

        // Hold card-1 parked below the viewport for the first 14 % of the scroll
        // range before any stacked card starts rising.  Without this, startT=0 causes
        // card-1 to move the instant the pin fires, making it appear at the viewport
        // bottom after only ~100 px of scroll.
        const INITIAL_HOLD = 0.14
        const segment = (0.9 - INITIAL_HOLD) / Math.max(1, n - 1)
        for (let i = 1; i < n; i++) {
          const startT = INITIAL_HOLD + (i - 1) * segment
          const progress = i / (n - 1)
          const bgY = gsap.utils.interpolate(bgTravel * 0.52, -bgTravel * 0.24, progress)
          const bgScale = gsap.utils.interpolate(1, 1.055, progress)

          tl.to(
            cards[i],
            {
              y: () => charterStackFinalY(i),
              duration: segment * 0.95,
              ease: 'none',
              immediateRender: false,
            },
            startT
          )

          if (bgFigure) {
            tl.to(
              bgFigure,
              {
                y: bgY,
                scale: bgScale,
                duration: segment * 0.95,
                ease: 'none',
                immediateRender: false,
              },
              startT
            )
          }
        }

        if (bgFigure && n === 1) {
          tl.to(bgFigure, { y: 0, scale: 1.03, duration: 0.35, ease: 'none' }, 0)
        }

        const revealStack = () => {
          const metrics = applyStackMetrics()
          setCardPositions(metrics)
          ScrollTrigger.refresh(true)
          gsap.set(stage, { autoAlpha: 1 })
          stage.setAttribute('data-ready', '')
        }

        const refreshLayout = () => {
          const progress = tl.scrollTrigger?.progress ?? 0
          if (progress <= 0.001) {
            setCardPositions(applyStackMetrics())
          } else {
            applyStackMetrics()
          }
          ScrollTrigger.refresh(true)
        }
        window.addEventListener('resize', refreshLayout)
        const bgImg = bgFigure?.querySelector('img')
        if (bgImg instanceof HTMLImageElement && !bgImg.complete) {
          bgImg.addEventListener('load', revealStack, { once: true })
        }
        requestAnimationFrame(() => requestAnimationFrame(revealStack))

        return () => {
          window.removeEventListener('resize', refreshLayout)
          root.style.removeProperty('--charter-stack-bg-travel')
          stage.removeAttribute('data-ready')
          gsap.set(stage, { clearProps: 'opacity,visibility' })
          gsap.set(cards, { clearProps: 'transform,zIndex' })
          if (bgFigure) gsap.set(bgFigure, { clearProps: 'transform' })
          tl.scrollTrigger?.kill()
          tl.kill()
        }
      })

      return () => {
        mm.revert()
      }
    },
    { scope: scopeRef, dependencies: [reduceMotion] }
  )

  return (
    <Section
      id="services"
      paddingY="none"
      variant="default"
      className="overflow-visible! bg-transparent! p-0!"
    >
      <div ref={scopeRef} className="relative isolate min-h-svh w-full overflow-visible">
        <div
          aria-hidden
          className="bg-brand-surface pointer-events-none absolute inset-0 z-0 min-h-svh overflow-hidden"
        >
          <div
            data-charter-bg-figure
            className={cn(
              'absolute inset-0 w-full origin-[50%_52%] will-change-transform',
              'min-h-svh lg:min-h-[calc(100svh+var(--charter-stack-bg-travel,0))]'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 left-1/2 w-screen max-w-none -translate-x-1/2',
                'min-h-svh lg:min-h-[calc(100svh+var(--charter-stack-bg-travel,0))]'
              )}
            >
              <Image
                src="/images/charter-services-bg.avif"
                alt=""
                fill
                priority
                className={cn(
                  'size-full min-w-full object-cover object-top sm:object-[center_35%] xl:object-[center_90%]',
                  'min-h-svh lg:min-h-[calc(100svh+var(--charter-stack-bg-travel,0))]'
                )}
                sizes="100vw"
              />
              <div
                aria-hidden
                className="from-brand-surface via-brand-surface/72 pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b to-transparent"
              />
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 min-h-svh bg-linear-to-b from-transparent via-white/10 to-transparent"
          />
        </div>

        <div
          ref={pinRef}
          data-charter-pin-root
          className={cn(
            'relative z-10 flex w-full flex-col',
            'pt-[max(5.5rem,calc(110px+env(safe-area-inset-top)))] pb-24 sm:pb-28',
            'lg:min-h-svh lg:pt-[max(3rem,calc(72px+env(safe-area-inset-top)))] lg:pb-20',
            'xl:justify-between xl:pt-[max(3.25rem,calc(76px+env(safe-area-inset-top)))] xl:pb-0',
            '2xl:pb-16'
          )}
        >
          <Container className="max-w-base relative z-10">
            <m.div
              variants={staggerContainer(0.12, 0.08)}
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: true, amount: 0.42, margin: '0px 0px -12% 0px' }}
              className={cn(
                'grid gap-10 mb-36 lg:grid-cols-[minmax(0,1fr)_minmax(0,27.0625rem)] lg:items-end lg:gap-x-16 xl:gap-x-20',
                'lg:-mt-12 lg:gap-8 xl:mt-10 xl:gap-x-20 2xl:-mt-8'
              )}
            >
              <div className="flex max-w-3xl flex-col gap-3 lg:max-w-none">
                <m.div variants={fadeInUp} className="flex flex-col gap-2.5">
                  <span className="text-brand-black inline-flex items-center gap-2">
                    <Image
                      src="/images/black-asterisk.svg"
                      width={14}
                      height={14}
                      alt=""
                      className="h-[14px] w-[14px] shrink-0"
                      aria-hidden
                    />
                    <span
                      className={cn(
                        '[font-family:var(--font-geist)] text-[14px] leading-[normal] font-semibold tracking-[0.2em] uppercase'
                      )}
                    >
                      Services
                    </span>
                  </span>
                  <Image
                    src="/images/header-line-transparent-left-new.svg"
                    width={364}
                    height={8}
                    alt=""
                    className="h-auto w-full max-w-[280px] shrink-0"
                    aria-hidden
                  />
                </m.div>

                <m.h2
                  variants={fadeInUp}
                  className={cn(
                    'text-brand-black  [font-family:var(--font-halant)] font-normal text-balance',
                    'text-[clamp(2rem,4vw+1rem,3.25rem)] leading-[1.08] tracking-[-0.03em]',
                    'sm:text-[clamp(2.25rem,3.2vw+1.25rem,3.5rem)]'
                  )}
                >
                  Premium Air Charter &amp; Aviation Services
                </m.h2>
              </div>

              <m.p
                variants={fadeInUp}
                className={cn(
                  'text-brand-gray [font-family:var(--font-geist)] font-normal',
                  'max-w-108.25 pb-8 text-[18px] leading-[23px] lg:justify-self-end'
                )}
              >
                We provide exceptional helicopter charter services tailored to meet the needs of our
                diverse clientele, emphasizing flexibility, speed, and convenience
              </m.p>
            </m.div>
          </Container>

          <div className="relative z-10 mt-12 w-full overflow-visible sm:mt-14 lg:-mt-10 xl:-mt-12 xl:shrink-0 2xl:-mt-14">
            <div className="lg:hidden">
              <div className="flex flex-col items-center gap-8 px-4 pb-16 sm:px-6 md:gap-10">
                {CHARTER_SERVICES.map((service, i) => (
                  <div
                    key={service.id}
                    data-charter-mobile-card
                    className="w-full max-w-[min(520px,calc(100vw-2rem))] will-change-transform"
                  >
                    <div className={charterCardTiltClass(i)}>
                      <CharterServiceCard service={service} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {reduceMotion ? (
              <div className="relative mx-auto hidden max-w-[min(660px,calc(100vw-3rem))] pb-28 lg:-mt-20 lg:block xl:-mt-24 xl:max-w-[728px] 2xl:-mt-28">
                <div className="relative mx-auto min-h-[min(52vh,520px)] w-full">
                  {CHARTER_SERVICES.map((service, i) => (
                    <div
                      key={service.id}
                      className="absolute top-1/2 left-1/2 w-full max-w-[min(660px,calc(100vw-3rem))] xl:max-w-[728px]"
                      style={{
                        transform: `translate(-50%, calc(-50% + ${charterStackFinalY(i)}px)) rotate(${charterCardRotationDeg(i)}deg)`,
                        zIndex: 10 + i,
                      }}
                    >
                      <CharterServiceCard service={service} stack />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative mx-auto hidden min-h-[min(76svh,720px)] w-full max-w-[min(720px,calc(100vw-2rem))] overflow-visible lg:-mt-20 lg:block lg:min-h-[min(76svh,460px)] xl:-mt-24 xl:min-h-[min(76svh,460px)] xl:max-w-[728px] 2xl:-mt-28">
                <div
                  data-charter-stack-stage
                  className="invisible relative h-full min-h-[inherit] w-full overflow-visible pt-0 pb-2 opacity-0 data-ready:visible data-ready:opacity-100 lg:translate-y-2 xl:-translate-y-10"
                >
                  {CHARTER_SERVICES.map((service, i) => (
                    <div
                      key={service.id}
                      data-charter-stack-card
                      className="absolute top-1/2 left-1/2 w-full max-w-[min(660px,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 will-change-transform xl:max-w-[728px]"
                      style={{
                        rotate: `${charterCardRotationDeg(i)}deg`,
                        zIndex: 10 + i,
                      }}
                    >
                      <CharterServiceCard service={service} stack />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
