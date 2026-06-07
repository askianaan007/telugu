'use client'

import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { FooterPresenceCard } from '@/data/footerPresence'
import { cn } from '@/lib/utils'

const SCROLL_PX_PER_SEC = 38

type FooterPresenceCityTickerProps = {
  cards: FooterPresenceCard[]
  /** Used when `prefers-reduced-motion` is on (static list). */
  activePresenceId?: string
}

export function FooterPresenceCityTicker({
  cards,
  activePresenceId,
}: FooterPresenceCityTickerProps) {
  const reduceMotion = useReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const itemHeightRef = useRef(44)
  const yRef = useRef(0)
  const lastTsRef = useRef<number | null>(null)
  const lastSlotRef = useRef(-1)
  const [currentSlot, setCurrentSlot] = useState(0)
  const [itemHeight, setItemHeight] = useState(44)

  const n = cards.length
  const tripled = n > 0 ? [...cards, ...cards, ...cards] : []

  const measureFirstRow = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const first = track.querySelector<HTMLElement>('[data-ticker-row]')
    if (!first) return
    const h = Math.max(1, Math.round(first.getBoundingClientRect().height))
    itemHeightRef.current = h
    setItemHeight(h)
  }, [])

  useLayoutEffect(() => {
    measureFirstRow()
  }, [measureFirstRow, cards])

  useEffect(() => {
    if (reduceMotion) return
    const tr = trackRef.current
    if (!tr) return
    const ro = new ResizeObserver(() => measureFirstRow())
    ro.observe(tr)
    return () => ro.disconnect()
  }, [measureFirstRow, reduceMotion])

  useEffect(() => {
    if (reduceMotion || n === 0) return

    let raf = 0
    let cancelled = false
    const loop = (ts: number) => {
      if (cancelled) return
      const seg = n * itemHeightRef.current
      if (seg <= 0) {
        if (!cancelled) raf = requestAnimationFrame(loop)
        return
      }

      if (lastTsRef.current === null) lastTsRef.current = ts
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000)
      lastTsRef.current = ts

      yRef.current -= SCROLL_PX_PER_SEC * dt
      while (yRef.current <= -seg) {
        yRef.current += seg
      }

      const track = trackRef.current
      if (track) {
        track.style.transform = `translate3d(0,${yRef.current}px,0)`
      }

      const H = viewportRef.current?.clientHeight ?? 0
      const centerCoord = H / 2 - yRef.current
      const rawSlot = Math.floor(centerCoord / itemHeightRef.current)
      const slot = Math.max(0, Math.min(3 * n - 1, rawSlot))

      if (slot !== lastSlotRef.current) {
        lastSlotRef.current = slot
        setCurrentSlot(slot)
      }

      if (!cancelled) {
        raf = requestAnimationFrame(loop)
      }
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      lastTsRef.current = null
    }
  }, [reduceMotion, n])

  if (n === 0) return null

  if (reduceMotion) {
    return (
      <div className="flex w-full min-w-0 flex-col items-stretch gap-0.5">
        {cards.map((c) => (
          <span
            key={c.id}
            className={cn(
              'flex h-11 w-full shrink-0 cursor-default items-center justify-center text-center text-xl leading-none tracking-[-0.02em] whitespace-nowrap transition-colors sm:h-12 sm:text-2xl md:h-11 md:justify-start md:text-left md:text-[26px]',
              '[font-family:var(--font-geist)]',
              activePresenceId === c.id ? 'font-bold text-white' : 'font-normal text-white/30'
            )}
          >
            {c.title}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="footer-presence-ticker flex w-full min-w-0 flex-col items-stretch">
      <div
        ref={viewportRef}
        className={cn(
          'relative w-full min-w-0 overflow-hidden',
          'mask-[linear-gradient(to_bottom,transparent_0%,#000_14%,#000_86%,transparent_100%)]',
          '[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_14%,#000_86%,transparent_100%)]'
        )}
        style={{
          height: Math.max(120, Math.round(itemHeight * 2.65)),
        }}
      >
        <div
          ref={trackRef}
          className="flex w-full min-w-0 flex-col will-change-transform"
          style={{
            transform: 'translate3d(0,0,0)',
          }}
        >
          {tripled.map((c, i) => (
            <span
              key={`${c.id}-${i}`}
              data-ticker-row
              className={cn(
                'flex h-11 w-full shrink-0 cursor-default items-center justify-center text-center text-xl leading-none tracking-[-0.02em] whitespace-nowrap transition-[color,font-weight] duration-150 sm:h-12 sm:text-2xl md:h-11 md:justify-start md:text-left md:text-[26px]',
                '[font-family:var(--font-geist)]',
                i === currentSlot ? 'current font-bold text-white' : 'font-normal text-white/30'
              )}
            >
              {c.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
