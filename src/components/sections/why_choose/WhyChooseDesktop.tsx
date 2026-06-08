'use client'

// src/components/sections/whychoose/WhyChooseDesktop.tsx
// Desktop (1024px+): bento board with animated SVG connector lines and center logo card.
// Exact replica of the original WhyChooseUsSection desktop branch.

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { cn } from '@/lib/utils'
import {
    WHY_CHOOSE_ITEMS,
    WhyChooseCard,
} from './whyChooseShared'

// ─── Connector geometry ────────────────────────────────────────────────────────

type Point = { x: number; y: number }
type Connector = { id: string; start: Point; end: Point; delay: number }

function buildCurve(start: Point, end: Point) {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const side = dx >= 0 ? 1 : -1
    const cp1x = start.x + side * Math.max(58, Math.abs(dx) * 0.32)
    const cp1y = start.y + dy * 0.12
    const cp2x = end.x - side * Math.max(56, Math.abs(dx) * 0.26)
    const cp2y = end.y - dy * 0.12
    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WhyChooseDesktop() {
    const desktopBoardRef = useRef<HTMLDivElement>(null)
    const centerCardRef = useRef<HTMLDivElement>(null)
    const [connectors, setConnectors] = useState<Connector[]>([])

    const topCards = useMemo(() => WHY_CHOOSE_ITEMS.slice(0, 2), [])
    const middleLeftCards = useMemo(() => WHY_CHOOSE_ITEMS.slice(2, 5), [])
    const middleRightCards = useMemo(() => WHY_CHOOSE_ITEMS.slice(5, 8), [])
    const bottomCards = useMemo(() => WHY_CHOOSE_ITEMS.slice(8), [])

    useEffect(() => {
        const board = desktopBoardRef.current
        const center = centerCardRef.current
        if (!board || !center) return

        const computeConnectors = () => {
            const boardRect = board.getBoundingClientRect()
            const centerRect = center.getBoundingClientRect()
            const centerPoint: Point = {
                x: centerRect.left - boardRect.left + centerRect.width / 2,
                y: centerRect.top - boardRect.top + centerRect.height / 2,
            }

            const cardEls = Array.from(board.querySelectorAll<HTMLElement>('[data-why-card]'))
            const next: Connector[] = cardEls.map((card, index) => {
                const cardRect = card.getBoundingClientRect()
                const side = (card.dataset.side ?? 'left') as 'left' | 'right' | 'top' | 'bottom'

                let endPoint: Point
                if (side === 'top') {
                    endPoint = { x: cardRect.left - boardRect.left + cardRect.width / 2, y: cardRect.bottom - boardRect.top - 10 }
                } else if (side === 'bottom') {
                    endPoint = { x: cardRect.left - boardRect.left + cardRect.width / 2, y: cardRect.top - boardRect.top + 10 }
                } else if (side === 'left') {
                    endPoint = { x: cardRect.right - boardRect.left - 14, y: cardRect.top - boardRect.top + cardRect.height / 2 }
                } else {
                    endPoint = { x: cardRect.left - boardRect.left + 14, y: cardRect.top - boardRect.top + cardRect.height / 2 }
                }

                return { id: `${side}-${index}`, start: centerPoint, end: endPoint, delay: index * 0.15 }
            })

            setConnectors(next)
        }

        computeConnectors()
        const ro = new ResizeObserver(computeConnectors)
        ro.observe(board)
        ro.observe(center)
        window.addEventListener('resize', computeConnectors)
        return () => { ro.disconnect(); window.removeEventListener('resize', computeConnectors) }
    }, [])

    return (
        <Section variant="default" paddingY="xl" className="bg-brand-surface">
            <Container className="max-w-base xl:px-0!">
                {/* Header — no AnimatedReveal; direct visible render */}
                <div className="mx-auto max-w-3xl space-y-5 text-center">
                    <span className="text-brand-black inline-flex items-center justify-center gap-2">
                        <Image src="/images/black-asterisk.svg" width={14} height={14} alt=""
                            className="h-[14px] w-[14px] shrink-0" aria-hidden />
                        <span className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.2em] uppercase">
                            Why Choose
                        </span>
                    </span>
                    <Image
                        src="/images/header-line-center-transparent.svg"
                        width={364} height={12} alt=""
                        className="mx-auto h-auto w-[min(364px,calc(100vw-4rem))] max-w-full shrink-0" aria-hidden
                    />
                    <h2 className="text-brand-black [font-family:var(--font-halant)] text-[clamp(2.2rem,4vw+0.8rem,4rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance">
                        Why Choose Telugu Airlines?
                    </h2>
                    <p className="text-brand-muted [font-family:var(--font-geist)] text-base leading-relaxed sm:text-lg">
                        Telugu Airlines maintains a robust international footprint through strategically located
                        offices in major global cities.
                    </p>
                </div>

                <div className="mt-16">
                    <div ref={desktopBoardRef} className="max-w-base relative z-10 mx-auto w-full">
                        {/* SVG connector layer */}
                        <svg
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient id="why-choose-pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="transparent" />
                                    <stop offset="24%" stopColor="rgba(56, 189, 248, 0.55)" />
                                    <stop offset="50%" stopColor="rgba(255, 255, 255, 0.95)" />
                                    <stop offset="76%" stopColor="rgba(56, 189, 248, 0.65)" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                            {connectors.map((connector) => {
                                const d = buildCurve(connector.start, connector.end)
                                return (
                                    <g key={connector.id}>
                                        <path d={d} fill="none" stroke="rgba(20,32,47,0.12)" strokeWidth="1.6" />
                                        <path
                                            d={d} pathLength={1} fill="none"
                                            stroke="url(#why-choose-pulse-gradient)"
                                            strokeWidth="3" strokeLinecap="round"
                                            className="why-choose-path-pulse"
                                            style={{ animationDelay: `${connector.delay}s` }}
                                        />
                                        <circle cx={connector.end.x} cy={connector.end.y} r="2.4"
                                            fill="rgba(56, 189, 248, 0.8)"
                                            className="why-choose-arrival-core"
                                            style={{ animationDelay: `${connector.delay}s` }} />
                                        <circle cx={connector.end.x} cy={connector.end.y} r="2.4"
                                            fill="none" stroke="rgba(56, 189, 248, 0.65)" strokeWidth="1.3"
                                            className="why-choose-arrival-ring"
                                            style={{ animationDelay: `${connector.delay}s` }} />
                                    </g>
                                )
                            })}
                        </svg>

                        <div className="relative z-10">
                            {/* Top row: 4/9 + 5/9 */}
                            <div className="grid grid-cols-[4fr_5fr] items-stretch gap-5">
                                {topCards.map((item) => (
                                    <WhyChooseCard key={item.title} item={item} side="top" />
                                ))}
                            </div>

                            {/* Middle: 3-col — left cards | center logo | right cards */}
                            <div className="mx-auto mt-5 grid w-full grid-cols-[minmax(0,1fr)_194px_minmax(0,1fr)] gap-x-8 lg:gap-x-24 xl:gap-x-40">
                                <div className="flex flex-col gap-5">
                                    {middleLeftCards.map((item) => (
                                        <WhyChooseCard key={item.title} item={item} side="left" />
                                    ))}
                                </div>

                                <div className="flex items-center justify-center">
                                    <div
                                        ref={centerCardRef}
                                        className="relative h-[194px] w-[194px] shrink-0 overflow-hidden rounded-[24px] border border-black/8 p-2"
                                    >
                                        <div className="border-about-reveal-inner-border bg-about-reveal-inner-bg flex h-full w-full items-center justify-center rounded-2xl border-2 p-3">
                                            <Image
                                                src="/images/telugu-air-logo.png"
                                                alt="Telugu Airlines logo"
                                                width={194} height={194}
                                                className="relative z-10 h-full w-full object-contain"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                    {middleRightCards.map((item) => (
                                        <WhyChooseCard key={item.title} item={item} side="right" />
                                    ))}
                                </div>
                            </div>

                            {/* Bottom row: 5/9 + 4/9 */}
                            <div className="mt-5 grid grid-cols-[5fr_4fr] items-stretch gap-5">
                                {bottomCards.map((item) => (
                                    <WhyChooseCard key={item.title} item={item} side="bottom" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

        </Section>
    )
}