'use client'

import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Container } from '@/components/layout/Container'
import { FooterPresenceCityTicker } from '@/components/layout/FooterPresenceCityTicker'
import { useSiteNavScroll } from '@/components/providers/SiteNavScrollProvider'
import { FOOTER_PRESENCE_CARDS } from '@/data/footerPresence'
import { SITE_BRAND } from '@/lib/constants/site'
import { cn } from '@/lib/utils'

const FooterRotatingEarth = dynamic(() => import('@/components/ui/RotatingEarth'), {
  ssr: false,
  loading: () => (
    <div
      className="mx-auto size-[min(92vw,800px)] max-h-[800px] shrink-0 rounded-lg border border-white/10 bg-[#162a40]/50"
      style={{ aspectRatio: '1', minHeight: 280 }}
      aria-hidden
    />
  ),
})

const FOOTER_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact Us', href: '/#contact' },
] as const

const CARD_PARALLAX_Y: readonly [string, string, string][] = [
  ['5%', '0%', '-26%'],
  ['7%', '0%', '-36%'],
  ['10%', '0%', '-48%'],
]

function ContactLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-[15px]">
      <span aria-hidden className="h-[21px] w-px shrink-0 bg-[#8E8E8E]" style={{ width: '1px' }} />
      <span className="text-brand-navy [font-family:var(--font-geist)] text-base leading-normal font-normal tracking-[-0.0051em]">
        {children}
      </span>
    </div>
  )
}

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const footerScrollTrackRef = useRef<HTMLDivElement>(null)
  const watermarkRevealRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const { isNavLinkActive, activePresenceId } = useSiteNavScroll()
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: footerScrollTrackRef,
    offset: ['start start', 'end end'],
  })

  /** Watermark gradient swap when text center crosses viewport center */
  const { scrollYProgress: watermarkGradientProgress } = useScroll({
    target: watermarkRevealRef,
    offset: ['center end', 'center start'],
  })

  const springConfig = { stiffness: 72, damping: 28, mass: 0.55 }
  const smoothProgress = useSpring(scrollYProgress, springConfig)

  /* ── Phase 1 (0–0.25): Cards + Global Presence visible ── */
  const headerOpacityRaw = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0])
  const headerYRaw = useTransform(smoothProgress, [0, 0.15, 0.25], ['0%', '0%', '-12%'])
  const headerOpacity = useSpring(headerOpacityRaw, springConfig)
  const headerY = useSpring(headerYRaw, springConfig)

  const cardY0Raw = useTransform(smoothProgress, [0, 0.25, 0.45], CARD_PARALLAX_Y[0])
  const cardY1Raw = useTransform(smoothProgress, [0, 0.25, 0.45], CARD_PARALLAX_Y[1])
  const cardY2Raw = useTransform(smoothProgress, [0, 0.25, 0.45], CARD_PARALLAX_Y[2])
  const cardY0 = useSpring(cardY0Raw, springConfig)
  const cardY1 = useSpring(cardY1Raw, springConfig)
  const cardY2 = useSpring(cardY2Raw, springConfig)
  const cardParallaxY = [cardY0, cardY1, cardY2]

  // Cards fade out (direct transform on smoothProgress for zero-lag perfect reversal)
  const cardsOpacity = useTransform(smoothProgress, [0.15, 0.35], [1, 0])

  /* ── Phase 2 (0.25–0.6): Watermark slides up and sticks top, globe scales down + centers ── */

  // Watermark: fade in and slide up only after cards start clearing
  const wmOpacityRaw = useTransform(smoothProgress, [0.2, 0.4], [0, 1])
  const wmOpacity = useSpring(wmOpacityRaw, springConfig)

  const wmYRaw = useTransform(smoothProgress, [0.2, 0.45], ['50vh', '0vh'])
  const wmY = useSpring(wmYRaw, { stiffness: 60, damping: 26, mass: 0.5 })

  // Globe: scale from full to ~52% as it centers
  const globeScaleRaw = useTransform(smoothProgress, [0.25, 0.55], [1.1, 0.4])
  const globeScale = useSpring(globeScaleRaw, { stiffness: 60, damping: 26, mass: 0.5 })

  // Globe: translate from well below viewport (90vh) up to center (0vh)
  const globeYRaw = useTransform(smoothProgress, [0.22, 0.55], ['90vh', '11vh'])
  const globeY = useSpring(globeYRaw, { stiffness: 60, damping: 26, mass: 0.5 })

  /* ── Phase 3 (0.5–0.8): Nav/contact slides up below globe ── */
  const navContentYRaw = useTransform(
    scrollYProgress,
    [0.5, 0.68, 0.82, 1],
    ['50vh', '20vh', '0vh', '-8vh']
  )
  const navContentY = useSpring(navContentYRaw, {
    stiffness: 76,
    damping: 24,
    mass: 0.48,
  })
  const navContentOpacityRaw = useTransform(scrollYProgress, [0.48, 0.62], [0, 1])
  const navContentOpacity = useSpring(navContentOpacityRaw, springConfig)

  const wmGradientPosRaw = useTransform(
    watermarkGradientProgress,
    [0.32, 0.5, 0.68],
    ['0%', '100%', '100%']
  )
  const wmGradientPos = useSpring(wmGradientPosRaw, {
    stiffness: 52,
    damping: 34,
    mass: 0.7,
  })

  const motionEnabled = reduceMotion !== true

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <footer
      ref={footerRef}
      data-site-footer
      data-in-view={inView ? 'true' : 'false'}
      className="relative overflow-x-clip text-white"
      style={{
        background: 'linear-gradient(0deg, #0E1825 7%, #1D3350 100%)',
      }}
    >
      {/* Extended scroll track for multi-phase animation */}
      <div ref={footerScrollTrackRef} className="relative min-h-[320vh] w-full">
        {/* ═══ Sticky viewport layer — watermark + globe + nav pinned to screen ═══ */}
        <div className="sticky top-0 z-10 h-dvh w-full overflow-hidden">

          {/* ── Watermark: flush at very top ── */}
          <m.div
            className="absolute inset-x-0 top-0 z-0 flex items-start justify-center pt-[1vh]"
            style={motionEnabled ? { opacity: wmOpacity, y: wmY } : undefined}
          >
            <div ref={watermarkRevealRef} className="footer-reveal-watermark-wrap w-full">
              <m.p
                className={cn(
                  'footer-reveal-watermark pointer-events-none relative z-0 w-full max-w-full text-center [font-family:var(--font-geist)] font-bold tracking-[-0.04em] select-none',
                  'leading-[0.92]',
                  'text-[clamp(3rem,13vw,6rem)] sm:text-[clamp(3.25rem,12vw,7rem)]',
                  'lg:text-[clamp(7rem,13vw,9rem)] xl:text-[clamp(9rem,12vw,10rem)] 2xl:text-[11rem]'
                )}
                style={
                  motionEnabled
                    ? {
                      backgroundPositionX: 'center',
                      backgroundPositionY: wmGradientPos,
                    }
                    : undefined
                }
              >
                {SITE_BRAND.name}
              </m.p>
            </div>
          </m.div>

          {/* ── Globe: large, centered behind everything ── */}
          <m.div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={
              motionEnabled
                ? {
                  scale: globeScale,
                  y: globeY,
                }
                : undefined
            }
          >
            <div className="footer-reveal-globe-wrap w-full">
              <div className="footer-reveal-globe relative flex justify-center px-2">
                <div className="relative w-full max-w-[min(96vw,860px)] overflow-hidden sm:max-w-[min(94vw,920px)] lg:max-w-[min(92vw,1000px)] xl:max-w-[min(90vw,1100px)] 2xl:max-w-[1180px]">
                  <FooterRotatingEarth
                    className="mx-auto"
                    oceanColor="transparent"
                    dotColor="rgba(255,255,255,0.5)"
                    gridColor="rgba(255,255,255,0.06)"
                    rotationSpeed={0.25}
                  />
                </div>
              </div>
            </div>
          </m.div>

          {/* ── Nav (left) + Contact (right): two-column row at ~62% from top ── */}
          <m.div
            className="absolute inset-x-0 z-30 px-6 sm:px-8 lg:px-12"
            style={
              motionEnabled
                ? { y: navContentY, opacity: navContentOpacity, top: '62%' }
                : { top: '62%' }
            }
          >
            <div className="mx-auto flex w-full max-w-[1200px] flex-row items-start justify-between">
              {/* Left — nav links stacked */}
              <nav aria-label="Footer">
                <ul className="flex flex-col gap-2 sm:gap-3">
                  {FOOTER_NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          '[font-family:var(--font-geist)] text-[16px] font-medium text-white/80 transition-colors hover:text-white sm:text-[18px] md:text-[20px]',
                          isNavLinkActive(link.href) && 'font-semibold text-white'
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Right — contact stacked, right-aligned */}
              <div className="flex flex-col items-end gap-1.5 text-right">
                <a
                  href={`mailto:${SITE_BRAND.contactEmail}`}
                  className="[font-family:var(--font-geist)] text-[16px] font-medium text-white/80 transition-colors hover:text-white sm:text-[18px] md:text-[20px]"
                >
                  {SITE_BRAND.contactEmail}
                </a>
                <a
                  href={`tel:${SITE_BRAND.contactPhone.replace(/\s/g, '')}`}
                  className="[font-family:var(--font-geist)] text-[16px] font-medium text-white/80 transition-colors hover:text-white sm:text-[18px] md:text-[20px]"
                >
                  {SITE_BRAND.contactPhone}
                </a>
              </div>
            </div>
          </m.div>

          {/* ── Copyright: pinned at very bottom center ── */}
          <m.div
            className="absolute inset-x-0 bottom-0 z-30 flex justify-center pb-4 sm:pb-5"
            style={motionEnabled ? { opacity: navContentOpacity } : undefined}
          >
            <p className="footer-reveal-copyright [font-family:var(--font-satoshi)] text-[12px] font-normal text-white/40 sm:text-[13px]">
              © {new Date().getFullYear()} {SITE_BRAND.name}. All Rights Reserved.
            </p>
          </m.div>

        </div>


        {/* ═══ Scrollable content layer — cards on top during Phase 1 ═══ */}
        <div className="absolute inset-x-0 top-0 z-20 min-h-[100vh] w-full">
          <div className="sticky top-0 min-h-dvh">
            <Container className="max-w-base relative px-4 pt-14 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16">
              {/* Global Presence header — scroll ease-away */}
              <m.div
                className="relative z-20 mb-10 flex flex-col items-center gap-4 sm:mb-12 lg:mb-14"
                style={motionEnabled ? { opacity: headerOpacity, y: headerY } : undefined}
              >
                <div
                  className={cn(
                    'mx-auto grid w-full max-w-full grid-cols-1 items-center justify-items-center gap-y-3 sm:gap-y-4',
                    'md:w-max md:max-w-full md:grid-cols-[auto_auto_13.5rem] md:items-center md:gap-x-6 md:gap-y-0 lg:grid-cols-[auto_auto_14rem] lg:gap-x-8'
                  )}
                >
                  <span className="text-center [font-family:var(--font-geist)] text-xs font-medium tracking-[0.18em] text-white/90 uppercase sm:text-[15px] lg:text-[18px] xl:text-[22px]">
                    Global Presence
                  </span>
                  <div className="flex shrink-0 items-center justify-center gap-[10px]" aria-hidden>
                    <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 origin-center scale-x-[-1] bg-[linear-gradient(90deg,rgba(255,255,255)_0%,rgb(255,255,255,0)_100%)] md:w-[65px]" />
                    <Image
                      src="/images/footer-plane.svg"
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 shrink-0"
                    />
                    <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 origin-center scale-x-[-1] bg-[linear-gradient(90deg,rgb(255,255,255,0)_0%,rgba(255,255,255)_100%)] md:w-[65px]" />
                  </div>
                  <div className="mx-auto flex w-full max-w-[min(100%,13.5rem)] justify-center justify-self-center md:block md:w-54 md:max-w-none lg:w-56">
                    <FooterPresenceCityTicker
                      cards={FOOTER_PRESENCE_CARDS}
                      activePresenceId={activePresenceId}
                    />
                  </div>
                </div>
              </m.div>

              {/* Location cards */}
              <m.div
                style={motionEnabled ? { opacity: cardsOpacity } : undefined}
              >
                <div
                  className={cn(
                    'max-w-base mx-auto grid grid-cols-1 gap-5',
                    'md:relative md:block md:gap-0 md:pb-4',
                    'md:min-h-[calc(10.5rem+20rem+20rem+2rem)]',
                    'lg:min-h-[calc(200px+300px+300px+2rem)]',
                    'xl:min-h-[clamp(28rem,50vw,42rem)]'
                  )}
                >
                  {FOOTER_PRESENCE_CARDS.map((card, index) => {
                    const cascade =
                      index === 0
                        ? cn(
                          'md:absolute md:left-0 md:top-0 md:z-[1]',
                          'md:w-[min(100%,calc(50%-0.75rem))] md:max-w-md',
                          'lg:w-[min(100%,22rem)]',
                          'xl:absolute xl:w-[min(100%,22rem)] xl:max-w-md'
                        )
                        : index === 1
                          ? cn(
                            'md:absolute md:right-0 md:z-[2]',
                            'md:top-[clamp(8.5rem,20vw,10.5rem)]',
                            'md:w-[min(100%,calc(50%-0.75rem))] md:max-w-md',
                            'lg:top-[200px] lg:w-[min(100%,22rem)]',
                            'xl:absolute xl:left-1/2 xl:right-auto xl:top-[320px] xl:z-[2] xl:w-[min(100%,22rem)] xl:max-w-md'
                          )
                          : cn(
                            'md:absolute md:left-1/2 md:z-[3] md:-translate-x-1/2',
                            'md:top-[calc(10.5rem+20rem+1.25rem)]',
                            'md:w-[min(100%,20rem)] md:max-w-md',
                            'lg:top-[calc(200px+300px+1.5rem)] lg:w-[min(100%,22rem)]',
                            'xl:absolute xl:left-auto xl:right-0 xl:top-[180px] xl:z-[3] xl:translate-x-0 xl:w-[min(100%,22rem)] xl:max-w-md'
                          )

                    const parallaxY = cardParallaxY[index] ?? cardY0

                    const cardInner = (
                      <div
                        role="article"
                        aria-label={`${card.title}, ${card.address}`}
                        className={cn(
                          'footer-reveal-card border-about-reveal-frame-outer-border bg-about-reveal-frame-outer/95 flex h-full min-h-0 w-full cursor-default flex-col rounded-[28px] border p-2 text-left shadow-[0_14px_44px_-18px_rgba(9,9,11,0.16)] backdrop-blur-sm',
                          'h-full md:h-[320px] md:shrink-0 lg:h-[300px] xl:h-[387px]'
                        )}
                      >
                        <div className="border-about-reveal-inner-border bg-about-reveal-inner-bg relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border-2 p-6 sm:p-4">
                          <div
                            aria-hidden
                            className="bg-global-presence-inner-sky-radial pointer-events-none absolute inset-0 z-0 rounded-2xl"
                          />
                          <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-0">
                            <div className="relative flex shrink-0 items-start justify-between gap-3">
                              <h3
                                className={cn(
                                  'text-brand-navy relative z-20 min-w-0 flex-1 overflow-visible [font-family:var(--font-halant)] font-normal whitespace-nowrap',
                                  'text-[2rem] leading-[2.35rem] tracking-[-0.02em]',
                                  'sm:text-[2.25rem] sm:leading-10 sm:tracking-[-0.03em]',
                                  'md:text-[2.5rem] md:leading-[2.85rem] md:tracking-[-0.035em]',
                                  'lg:text-[3rem] lg:leading-13 lg:tracking-[-0.04em]',
                                  'xl:text-[70px] xl:leading-[84.5px] xl:tracking-[-5.68px]'
                                )}
                              >
                                {card.title}
                              </h3>
                              <div className="relative z-10 h-[72px] w-10 shrink-0 sm:h-[84px] sm:w-11">
                                <Image
                                  src="/images/footer-card-bar-code.svg"
                                  alt=""
                                  fill
                                  className="object-contain object-top"
                                />
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col gap-5 pt-8 pb-2 sm:gap-6 sm:pt-8 md:pt-0 xl:pt-8">
                              <div className="relative h-[58px] w-[58px] shrink-0 drop-shadow-[0_12px_20px_-8px_rgba(88,28,135,0.35)]">
                                <Image
                                  src="/images/gradient-gold-circle.png"
                                  alt=""
                                  width={58}
                                  height={58}
                                  className="h-[58px] w-[58px] object-contain"
                                />
                              </div>
                              <div className="flex min-w-0 flex-col gap-2.5">
                                <ContactLine>{card.address}</ContactLine>
                                <ContactLine>{card.phone}</ContactLine>
                                <ContactLine>{card.email}</ContactLine>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )

                    return (
                      <m.div
                        key={card.id}
                        className={cn('h-full min-h-0 w-full will-change-transform', cascade)}
                        style={motionEnabled ? { y: parallaxY } : undefined}
                      >
                        {index === 1 ? (
                          <div className="h-full min-h-0 w-full xl:-translate-x-1/2">{cardInner}</div>
                        ) : (
                          cardInner
                        )}
                      </m.div>
                    )
                  })}
                </div>
              </m.div>
            </Container>
          </div>
        </div>
      </div>
    </footer>
  )
}
