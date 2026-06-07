'use client'

import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef, useSyncExternalStore } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ActionButton } from '@/components/ui/ActionButton'
import { OFFICE_LOCATIONS } from '@/data/offices'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { globalPresenceRevealInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

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

function GlobalOfficeCard({ office }: { office: (typeof OFFICE_LOCATIONS)[number] }) {
  return (
    <article
      id={`presence-${office.id}`}
      data-office-card
      className={cn(
        'w-full shrink-0 overflow-hidden rounded-[24px] border border-black/8 p-2',
        'xl:w-[650px] xl:max-w-[650px]'
      )}
    >
      <div
        className={cn(
          globalPresenceRevealInnerClassName(),
          'rounded-[16px] border-4 border-white bg-transparent',
          'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]'
        )}
      >
        <Image
          src="/images/gradient-bg-card.svg"
          alt=""
          fill
          sizes="(min-width: 1280px) 650px, 100vw"
          className="pointer-events-none absolute inset-0 z-0 rounded-[16px] object-cover object-top-left"
          aria-hidden
        />
        <div className="relative z-10 flex w-[60%] min-w-0 shrink-0 flex-col gap-3 self-start pr-4 pb-5 text-left sm:pr-5 sm:pb-6">
          <h3 className="text-brand-black [font-family:var(--font-halant)] text-[clamp(1.5rem,2vw+1rem,2rem)] leading-tight font-medium tracking-[-0.02em]">
            {office.cardHeading}
          </h3>
          {office.cardSubtitle ? (
            <p className="text-brand-navy [font-family:var(--font-geist)] text-sm font-semibold">
              {office.cardSubtitle}
            </p>
          ) : null}
          <p className="text-brand-muted [font-family:var(--font-geist)] text-base leading-relaxed font-normal">
            {office.description}
          </p>
        </div>
        <div
          aria-hidden
          className="office-card-flag-container pointer-events-none absolute inset-y-0 right-0 z-0 w-[56%] sm:w-[48%] md:w-[48%] lg:w-[46%] xl:w-[56%]"
        >
          <Image
            src={office.flagSvg}
            alt=""
            width={504}
            height={638}
            sizes="(min-width: 1280px) 260px, (min-width: 1024px) 40vw, (min-width: 768px) 38vw, 42vw"
            style={{
              clipPath: 'polygon(10.5% 0%, 100% 0%, 100% 100%, 10.5% 100%)',
              transform: 'translate(var(--flag-tx), var(--flag-ty)) scale(var(--flag-scale)) scaleX(-1) rotate(35deg)',
              transformOrigin: 'bottom right',
            }}
            className="absolute right-0 bottom-0 h-full w-auto max-w-none object-contain drop-shadow-[0_18px_36px_-12px_rgba(9,9,11,0.35)] min-h-[140px] sm:min-h-[160px] md:min-h-[300px] lg:min-h-[220px] xl:min-h-[280px]"
          />
        </div>
      </div>
    </article>
  )
}

export function GlobalPresenceSection() {
  /** Scroll driver on lg — ~1.6× viewport; parallax uses spring-smoothed Y for fluid motion. */
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const isLg = useSyncExternalStore(subscribeLg, getLgSnapshot, getLgServerSnapshot)

  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ['start start', 'end end'],
  })

  /** 3 tall office cards — more Y travel + taller track than the old 160vh / -42% so the last card clears before the section ends. */
  const rawCardsY = useTransform(scrollYProgress, [0, 1], ['4%', '-56%'])
  const cardsY = useSpring(rawCardsY, { stiffness: 90, damping: 18, mass: 0.6 })

  return (
    <Section
      id="global-presence"
      variant="default"
      paddingY="none"
      className="bg-brand-surface overflow-visible"
    >
      {/* Scroll driver on lg: ~2× viewport — sticky rail + spring-driven card Y */}
      <div ref={scrollTrackRef} className="relative w-full lg:min-h-[200vh]">
        {/* Wireframe: sticky shell — pins to viewport while the track scrolls */}
        <div
          className={cn(
            'flex w-full flex-col pt-16 pb-4 sm:pt-32 sm:pb-24 md:pb-28 xl:pb-0',
            'lg:sticky lg:top-0 lg:flex lg:h-dvh lg:max-h-dvh lg:min-h-0 lg:overflow-hidden lg:pt-28 lg:pb-40 xl:pb-0'
          )}
        >
          <Container className="max-w-base flex min-h-0 w-full flex-1 flex-col gap-12 lg:flex-row lg:items-start lg:gap-[90px]">
            {/* Left: ~40% — fade-in-up + stagger (HeliportSolutionsSection header pattern) */}
            <m.aside
              variants={staggerContainer(0.1, 0.06)}
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: false, amount: 0.35, margin: '0px 0px -8% 0px' }}
              className="flex w-full shrink-0 flex-col gap-5 lg:w-[40%] lg:max-w-[min(100%,480px)] lg:self-start lg:pt-2"
            >
              <m.div variants={fadeInUp} className="flex flex-col items-start gap-2.5">
                <span className="text-brand-black inline-flex items-center gap-2">
                  <Image
                    src="/images/black-asterisk.svg"
                    width={14}
                    height={14}
                    alt=""
                    className="h-[14px] w-[14px] shrink-0"
                    aria-hidden
                  />
                  <span className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.2em] uppercase">
                    Global Presence
                  </span>
                </span>
                <Image
                  src="/images/header-line-transparent-left.svg"
                  width={364}
                  height={12}
                  alt=""
                  className="h-auto w-full max-w-[364px] shrink-0"
                  aria-hidden
                />
              </m.div>

              <m.h2
                variants={fadeInUp}
                className="text-brand-black text-left [font-family:var(--font-halant)] text-[clamp(2rem,3vw+1.25rem,3.25rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance"
              >
                Our Global Presence
              </m.h2>

              <m.p
                variants={fadeInUp}
                className="text-brand-muted max-w-xl text-left [font-family:var(--font-geist)] text-base leading-relaxed sm:text-lg"
              >
                Telugu Airlines maintains a robust international footprint through strategically
                located offices in major global cities.
              </m.p>

              <m.div variants={fadeInUp} className="mt-2 w-fit">
                <ActionButton href="/#services" className="w-fit" />
              </m.div>
            </m.aside>

            {/* Right: ~60% — cards move on Y via scroll progress; extra pb on lg so the rail clears the viewport bottom */}
            <div className="relative w-full min-w-0 flex-1 sm:pb-4 md:pb-6 lg:min-h-0 lg:pb-24 xl:pb-4">
              <m.div
                className={cn(
                  'flex w-full flex-col gap-5 sm:gap-6 md:gap-7',
                  'pb-12 sm:pb-16 md:pb-20',
                  'lg:gap-[26px] lg:pb-48 lg:will-change-transform xl:pb-56'
                )}
                style={reduceMotion || !isLg ? undefined : { y: cardsY }}
              >
                {OFFICE_LOCATIONS.map((office) => (
                  <GlobalOfficeCard key={office.id} office={office} />
                ))}
              </m.div>
            </div>
          </Container>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .office-card-flag-container {
          --flag-tx: -50px;
          --flag-ty: 20px;
          --flag-scale: 1.2;
        }
        @media (min-width: 640px) {
          .office-card-flag-container {
            --flag-tx: -60px;
            --flag-ty: 25px;
            --flag-scale: 1.2;
          }
        }
        @media (min-width: 768px) {
          .office-card-flag-container {
            --flag-tx: -80px;
            --flag-ty: 35px;
            --flag-scale: 1.3;
          }
        }
        @media (min-width: 1024px) {
          .office-card-flag-container {
            --flag-tx: -120px;
            --flag-ty: 45px;
            --flag-scale: 0.85;
          }
        }
        @media (min-width: 1280px) {
          .office-card-flag-container {
            --flag-tx: -140px;
            --flag-ty: 70px;
            --flag-scale: 1.0;
          }
        }
      ` }} />
    </Section>
  )
}
