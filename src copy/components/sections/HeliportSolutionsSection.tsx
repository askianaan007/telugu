'use client'

import { m } from 'framer-motion'
import Image from 'next/image'
import { useMemo, useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import {
  HELIPORT_SOLUTIONS,
  heliportSolutionsByColumn,
  heliportSolutionsByMdColumn,
  type HeliportCardVariant,
  type HeliportSolution,
} from '@/data/heliportSolutions'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'

function heliportCardSurface(variant: HeliportCardVariant) {
  switch (variant) {
    case 'bg1':
      return 'border border-white/12 bg-[radial-gradient(circle_8rem_at_0_0,rgba(255,255,255,0.07)_0%,transparent_60%),rgba(255,255,255,0.02)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_24px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl'
    case 'bg2':
      return 'border border-white/40 bg-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_24px_60px_-15px_rgba(9,9,11,0.15)] backdrop-blur-xl'
    case 'bg3':
      return 'border border-white/25 bg-linear-to-r from-brand-gold-start/85 via-brand-gold-mid/90 to-brand-gold-start/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_24px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl'
    default:
      return ''
  }
}

function heliportTitleClass(variant: HeliportCardVariant) {
  if (variant === 'bg1') return 'text-brand-white'
  return 'text-brand-black'
}

function heliportDescriptionClass(variant: HeliportCardVariant) {
  if (variant === 'bg1') return 'text-[#D2D1D1]'
  return 'text-brand-muted'
}

function HeliportSolutionCard({
  solution,
  enableScrollReveal,
}: {
  solution: HeliportSolution
  enableScrollReveal?: boolean
}) {
  return (
    <article
      {...(enableScrollReveal ? { 'data-heliport-card': true } : {})}
      className={cn(
        'rounded-hero flex h-auto w-full max-w-[min(100%,326px)] flex-col items-start gap-5 px-[30px] py-[40px] md:max-w-none lg:w-[300px] lg:max-w-none xl:w-[326px]',
        enableScrollReveal && 'will-change-[transform]',
        heliportCardSurface(solution.variant)
      )}
    >
      <div className="relative h-20 w-[85px] shrink-0">
        <Image
          src={solution.iconSrc}
          alt=""
          fill
          sizes="85px"
          className="object-contain object-left"
        />
      </div>

      <h3
        className={cn(
          '[font-family:var(--font-halant)] text-[28px] leading-[30px] font-normal text-balance uppercase',
          heliportTitleClass(solution.variant)
        )}
      >
        {solution.title}
      </h3>

      <p
        className={cn(
          '[font-family:var(--font-geist)] text-[18px] leading-normal font-normal',
          heliportDescriptionClass(solution.variant)
        )}
      >
        {solution.description}
      </p>
    </article>
  )
}

export function HeliportSolutionsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  const orderedMobile = useMemo(() => [...HELIPORT_SOLUTIONS].sort((a, b) => a.index - b.index), [])

  useGSAP(
    () => {
      const root = gridRef.current
      if (!root || reduceMotion) return

      const from: gsap.TweenVars = {
        y: 48,
        scale: 0.96,
      }

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia()

        const bindCardsForRegion = (regionAttr: string) => {
          const cards = root.querySelectorAll<HTMLElement>(
            `[data-heliport-region="${regionAttr}"] [data-heliport-card]`
          )
          cards.forEach((card) => {
            gsap.fromTo(card, from, {
              y: 0,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'top 42%',
                scrub: 0.75,
                invalidateOnRefresh: true,
              },
            })
          })
        }

        mm.add('(max-width: 767px)', () => bindCardsForRegion('sm'))
        mm.add('(min-width: 768px) and (max-width: 1023px)', () => bindCardsForRegion('md'))
        mm.add('(min-width: 1024px)', () => bindCardsForRegion('lg'))
      }, root)

      return () => ctx.revert()
    },
    { scope: sectionRef, dependencies: [reduceMotion] }
  )

  return (
    // ─── Section ───────────────────────────────────────────────────────────────
    // • paddingY="none"  — we manage all spacing manually so Section's py-* map
    //   never clips the tallest card column.
    // • overflow-visible — overrides Section's base `overflow-hidden` so sticky
    //   header and tall card columns are never clipped by the section boundary.
    // • pt-20/sm:pt-24/lg:pt-28 — top breathing room before the sticky header.
    // • NO pb-* — bottom of section expands to fit card content naturally.
    // • min-h-[200vh] — guarantees enough scroll room for the sticky effect.
    <Section
      ref={sectionRef}
      variant="default"
      paddingY="none"
      className={cn(
        'bg-brand-navy! text-brand-white overflow-visible rounded-t-[50px]',
        'min-h-[200vh]',
        // pt = navbar height + breathing gap so the header is never born under the nav.
        // Adjust --navbar-height in your CSS root (or replace 4rem with your exact nav px).
        // pt matches sticky top-[72/80/88px] + a 2rem gap so the heading starts visibly below the navbar on load.
        'pt-[140px] sm:pt-[160px] lg:pt-[180px]'
      )}
    >
      <Container className="max-w-base z-section-content relative">
        {/* ── Sticky Header ─────────────────────────────────────────────────
            • sticky top-0 — pins the header at the top of the viewport.
            • z-10         — sits BELOW the cards grid (z-20) so cards scroll
                             visually over the header.
            • pb-8/sm:pb-10/lg:pb-14 — space between pinned header and the
                             leading edge of the cards grid.
            • bg-brand-navy/95 + backdrop-blur — prevent the header text from
                             being illegible while cards overlap it.
        ───────────────────────────────────────────────────────────────────── */}
        {/* top-[72px] sm:top-[80px] lg:top-[88px]
            = responsive navbar height so the sticky header pins just below the nav bar.
            Adjust these values to match your actual navbar height if it differs. */}
        <div className="bg-brand-navy/95 sticky top-[108px] z-10 pt-6 pb-8 backdrop-blur-sm sm:top-[120px] sm:pb-10 lg:top-[132px] lg:pb-80">
          <m.header
            variants={staggerContainer(0.1, 0.06)}
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: false, amount: 0.35, margin: '0px 0px -8% 0px' }}
            className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 text-center sm:gap-5"
          >
            <m.div variants={fadeInUp} className="flex flex-col items-center gap-2.5">
              <span className="text-brand-white inline-flex items-center gap-2">
                <Image
                  src="/images/gold-asterisk.svg"
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
                  Solution
                </span>
              </span>
              <Image
                src="/images/header-line-transparent.svg"
                width={364}
                height={12}
                alt=""
                className="h-auto w-full max-w-[220px] shrink-0"
                aria-hidden
              />
            </m.div>

            <m.h2
              variants={fadeInUp}
              className={cn(
                'text-brand-white [font-family:var(--font-halant)] font-normal tracking-[-0.02em] text-balance uppercase',
                'text-[clamp(1.75rem,3.5vw+1rem,2.75rem)] leading-[1.08] sm:text-[clamp(2rem,3vw+1.1rem,3.25rem)]'
              )}
            >
              <span className="block">Comprehensive</span>
              <span className="block">Heliport Solutions</span>
            </m.h2>

            <m.p
              variants={fadeInUp}
              className={cn(
                'max-w-[711px] [font-family:var(--font-geist)] text-[16px] leading-relaxed font-normal text-white/80 sm:text-[18px]'
              )}
            >
              Telugu Airlines specializes in providing end-to-end heliport solutions, encompassing
              everything from initial concept design to final execution and certification processes.
            </m.p>
          </m.header>
        </div>

        {/* ── Cards Grid ────────────────────────────────────────────────────
            • z-20         — sits ABOVE the sticky header so cards scroll over it.
            • relative     — establishes stacking context for z-20 to take effect.
            • pb-24/sm:pb-28/lg:pb-32 — bottom breathing room after last card row;
                             lives here (not on Section) so it's inside the scroll
                             area and never clips the cards themselves.
        ───────────────────────────────────────────────────────────────────── */}
        <div ref={gridRef} className="relative z-20 pb-24 sm:pb-28 lg:pb-32">
          {/* Below md: single column */}
          <div data-heliport-region="sm" className="flex flex-col items-center gap-8 md:hidden">
            {orderedMobile.map((solution) => (
              <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
            ))}
          </div>

          {/* md–lg: 2 columns, staggered */}
          <div
            data-heliport-region="md"
            className="max-w-base mx-auto hidden w-full flex-row justify-between px-0 md:flex lg:hidden"
          >
            <div className="flex w-[calc(50%-0.75rem)] max-w-[340px] shrink-0 flex-col gap-6 pt-0 md:gap-8">
              {heliportSolutionsByMdColumn(1).map((solution) => (
                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
              ))}
            </div>
            <div className="flex w-[calc(50%-0.75rem)] max-w-[340px] shrink-0 flex-col gap-6 pt-32 md:gap-32 md:pt-60">
              {heliportSolutionsByMdColumn(2).map((solution) => (
                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
              ))}
            </div>
          </div>

          {/* lg+: 3 columns */}
          <div
            data-heliport-region="lg"
            className="mx-auto hidden w-full flex-row justify-between lg:flex"
          >
            {/* COL 1 — left edge, no top offset */}
            <div className="flex w-[300px] shrink-0 flex-col gap-8 pt-0 lg:gap-60 xl:w-[326px]">
              {heliportSolutionsByColumn(1).map((solution) => (
                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
              ))}
            </div>

            {/* COL 2 — center, largest top drop */}
            <div className="flex w-[300px] shrink-0 flex-col gap-8 pt-28 lg:gap-60 lg:pt-[500px] xl:w-[326px]">
              {heliportSolutionsByColumn(2).map((solution) => (
                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
              ))}
            </div>

            {/* COL 3 — right edge, half step top drop */}
            <div className="flex w-[300px] shrink-0 flex-col gap-8 pt-14 lg:gap-60 lg:pt-[200px] xl:w-[326px]">
              {heliportSolutionsByColumn(3).map((solution) => (
                <HeliportSolutionCard key={solution.index} solution={solution} enableScrollReveal />
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* ── Gradient decorators ───────────────────────────────────────────────
          Placed AFTER <Container> in the DOM so they sit above it in the paint
          order. z-30 > cards z-20 > sticky header z-10, but pointer-events-none
          ensures they never block clicks on cards or the header.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[min(420px,55%)] bg-[radial-gradient(ellipse_55%_45%_at_12%_100%,rgba(202,46,121,0.22),transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[min(420px,55%)] bg-[radial-gradient(ellipse_55%_45%_at_88%_100%,rgba(169,54,109,0.2),transparent_68%)]"
      />
    </Section>
  )
}
