// src/components/sections/about/aboutShared.ts
// ─────────────────────────────────────────────
// Shared data, types, CSS helpers used by all About tier components.

import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

// ─── Content ──────────────────────────────────────────────────────────────────

export const ABOUT_PARAGRAPH =
    'Our dedication to safety, reliability, and innovation is at the core of our operations, allowing us to deliver customized aviation solutions that cater to the diverse needs of corporate clients, government entities, and private individuals alike. By prioritizing these values, we ensure that our clients receive not only efficient transportation but also peace of mind during their aerial journeys.'

export const REVEAL_IMAGES = [
    { src: '/images/about-us-reveal-01.png', alt: 'Telugu Airlines helicopter in flight',       sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-02.png', alt: 'Professional beside aircraft on the tarmac', sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-03.png', alt: 'Helicopter on helipad under blue sky',       sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-04.png', alt: 'Helicopter in flight at dusk',               sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-05.png', alt: 'Helicopter charter on the runway',           sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-06.png', alt: 'Aerial view of helicopter in flight',        sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-07.png', alt: 'Aviation team beside a charter aircraft',   sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-08.png', alt: 'Helicopter landing at a private helipad',   sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-09.png', alt: 'Helicopter flying over open landscape',     sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-10.png', alt: 'Premium charter helicopter on the tarmac',  sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-11.png', alt: 'Helicopter in flight against a clear sky',  sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
    { src: '/images/about-us-reveal-12.png', alt: 'Charter helicopter ready for departure',    sizes: '(max-width: 639px) 100px, (max-width: 1023px) 140px, 190px' },
] as const

export type RevealImage = (typeof REVEAL_IMAGES)[number]
export type MosaicStagger = 'outer' | 'inner'

export type DesktopMosaicColumn = {
    key: string
    imageIndices: readonly [number, number, number]
    stagger: MosaicStagger
}

export const DESKTOP_MOSAIC_COLUMNS = [
    { key: 'far-left',   imageIndices: [0, 1, 2] as const,  stagger: 'outer' as const },
    { key: 'inner-left', imageIndices: [3, 4, 5] as const,  stagger: 'inner' as const },
    { key: 'inner-right',imageIndices: [6, 7, 8] as const,  stagger: 'inner' as const },
    { key: 'far-right',  imageIndices: [9, 10, 11] as const, stagger: 'outer' as const },
] satisfies readonly DesktopMosaicColumn[]

export const DESKTOP_MOSAIC_SLOTS = DESKTOP_MOSAIC_COLUMNS.map(
    (col) => col.imageIndices.map((i) => REVEAL_IMAGES[i])
)

// Mobile: left rail = cols 0+1, right rail = cols 2+3
export const MOBILE_LEFT_RAIL_SLOTS  = [...DESKTOP_MOSAIC_SLOTS[0], ...DESKTOP_MOSAIC_SLOTS[1]]
export const MOBILE_RIGHT_RAIL_SLOTS = [...DESKTOP_MOSAIC_SLOTS[2], ...DESKTOP_MOSAIC_SLOTS[3]]

// 4 image grid for the static mobile section (first 4 images)
export const MOBILE_GRID_IMAGES = REVEAL_IMAGES.slice(0, 4)

// ─── Parallax ranges ──────────────────────────────────────────────────────────

export const OUTER_PARALLAX: readonly [number, number] = [500, -500]
export const INNER_PARALLAX: readonly [number, number] = [300, -300]
export const COLUMN_PARALLAX_Y_RANGE = [
    OUTER_PARALLAX, INNER_PARALLAX, INNER_PARALLAX, OUTER_PARALLAX,
] as const

export const MOBILE_LEFT_PARALLAX_Y:  readonly [number, number] = [80, 0]
export const ABOUT_PIN_SCRUB_SMOOTH = 2

// ─── CSS vars for orbit ───────────────────────────────────────────────────────

export const ABOUT_REVEAL_ORBIT_VARS = {
    '--about-card': 'clamp(3.25rem, 9vw, 8.5rem)',
    '--about-stack-gap': 'max(6rem, 24vh)',
    '--about-col-pad': 'max(0.5rem, 2vh)',
    '--about-stagger-outer': 'calc(-0.35 * var(--about-card))',
    '--about-stagger-inner': 'calc(0.5 * var(--about-card) + 0.5 * var(--about-stack-gap))',
} as CSSProperties

export const MOSAIC_STAGGER_MARGIN_TOP: Record<MosaicStagger, string> = {
    outer: 'var(--about-stagger-outer)',
    inner: 'var(--about-stagger-inner)',
}

// ─── Card class (shared between desktop and orbit mobile rail) ────────────────

export const CARD_CLASS = cn(
    'pointer-events-none relative aspect-square w-(--about-card) shrink-0 overflow-visible',
    'rounded-[14px] border-2 border-[#090202]/8 p-1',
    'sm:rounded-[20px] sm:p-1.5 lg:rounded-[16px] lg:p-2 xl:rounded-[22px]',
    'shadow-[0_10px_32px_-12px_rgba(9,9,11,0.18)]',
    'backdrop-blur-none md:backdrop-blur-md lg:backdrop-blur-xl',
)

// ─── Props shared by all About tier components ────────────────────────────────

export type AboutSectionProps = {
    fixedHelicopterOpacityRef?: React.RefObject<HTMLDivElement | null>
    fixedRingsRef?: React.RefObject<HTMLDivElement | null>
    sectionRef?: React.RefObject<HTMLElement | null>
}