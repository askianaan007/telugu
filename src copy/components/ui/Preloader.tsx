'use client'

/* Native <img> required for stacked PNG layers with filters and clip-path (per design). */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/images/telugu-airlines-logo-gold-text.png'
const PROGRESS_DURATION_MS = 4000
const EXIT_START_MS = 4300
const UNMOUNT_MS = 4800
const REDUCED_EXIT_MS = 200
const REDUCED_UNMOUNT_MS = 400
const REDUCED_PROGRESS_MS = 200

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

type Phase = 'visible' | 'exiting'

export function Preloader() {
  const isClient = useIsClient()
  const reduceMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>('visible')
  const [progress, setProgress] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!isClient) return

    const duration = reduceMotion ? REDUCED_PROGRESS_MS : PROGRESS_DURATION_MS
    const exitAt = reduceMotion ? REDUCED_EXIT_MS : EXIT_START_MS
    const unmountAt = reduceMotion ? REDUCED_UNMOUNT_MS : UNMOUNT_MS
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      setProgress(easeInOut(t) * 100)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    const exitTimer = window.setTimeout(() => setPhase('exiting'), exitAt)
    const unmountTimer = window.setTimeout(() => setDismissed(true), unmountAt)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(exitTimer)
      window.clearTimeout(unmountTimer)
    }
  }, [isClient, reduceMotion])

  useEffect(() => {
    if (!isClient || dismissed) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isClient, dismissed])

  if (!isClient || dismissed) return null

  const displayPercent = Math.round(progress)

  return (
    <div
      data-site-preloader
      data-reduced-motion={reduceMotion ? 'true' : undefined}
      data-exiting={phase === 'exiting' ? 'true' : undefined}
      role="status"
      aria-live="polite"
      aria-label="Loading Telugu Airlines"
      className={cn(
        'preloader-shell z-modal fixed inset-0 flex flex-col',
        'transition-opacity duration-500',
        phase === 'exiting' && 'opacity-0'
      )}
    >
      <div className="preloader-bg-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="preloader-bg-shine pointer-events-none absolute inset-0" aria-hidden />

      <div
        className="preloader-glow-gold pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div className="preloader-glow-gold-inner h-[min(520px,90vw)] w-[min(520px,90vw)] rounded-full" />
      </div>
      <div
        className="preloader-glow-pink pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div className="preloader-glow-pink-inner h-[min(480px,85vw)] w-[min(480px,85vw)] rounded-full" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{
          background: 'linear-gradient(90deg, transparent, #ca8b37, #f9e67e, #ca8b37, transparent)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, #ca2e79, #a9366d, transparent)',
        }}
        aria-hidden
      />

      <div className="preloader-corner preloader-corner-tl" aria-hidden />
      <div className="preloader-corner preloader-corner-tr" aria-hidden />
      <div className="preloader-corner preloader-corner-bl" aria-hidden />
      <div className="preloader-corner preloader-corner-br" aria-hidden />

      <div className="preloader-main relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="preloader-content-column flex w-full flex-col items-stretch">
          <div className="preloader-logo-stack w-full shrink-0">
            <img
              src={LOGO_SRC}
              alt=""
              aria-hidden
              width={300}
              height={320}
              className="preloader-ghost absolute inset-0 h-full w-full object-contain"
              decoding="async"
              fetchPriority="high"
            />
            <div className="preloader-shimmer absolute inset-0" aria-hidden />
            <img
              src={LOGO_SRC}
              alt="Telugu Airlines"
              width={300}
              height={320}
              className="preloader-reveal absolute inset-0 h-full w-full object-contain"
              decoding="async"
            />
            <div className="preloader-ring-gold" aria-hidden />
            <div className="preloader-ring-pink" aria-hidden />
          </div>

          <div className="preloader-progress-block w-full pt-8 sm:pt-10 lg:pt-12">
            <div className="mb-3.5 flex items-baseline justify-between gap-6">
              <p className="text-brand-navy/55 [font-family:var(--font-geist)] text-[11px] font-medium tracking-[0.22em] uppercase">
                Loading your experience
              </p>
              <p
                className="text-brand-navy [font-family:var(--font-halant)] text-[clamp(1.25rem,3.2vw,1.625rem)] leading-none font-semibold tabular-nums"
                aria-hidden
              >
                {displayPercent}
                <span className="text-brand-navy/40 ml-px text-[0.62em] font-normal">%</span>
              </p>
            </div>
            <div
              className="preloader-track"
              role="progressbar"
              aria-valuenow={displayPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Loading progress, ${displayPercent} percent`}
            >
              <div className="preloader-fill" style={{ width: `${displayPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
