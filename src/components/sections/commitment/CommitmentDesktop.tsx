'use client'

import { useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { gsapEasings } from '@/lib/animations/easings'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import {
    CommitmentClouds,
    CommitmentHeader,
    CommitmentRingBlock,
    CommitmentBottomBody,
    CLOUD_PARALLAX,
    RING_SCROLL_GAIN,
    FRICTION,
    EASE_IN_DRAIN,
    VELOCITY_EPS,
    MAX_SCROLL_DELTA,
    MAX_VELOCITY,
} from './commitmentShared'

export function CommitmentDesktop() {
    const sectionRef = useRef<HTMLElement>(null)
    const ringRef = useRef<HTMLDivElement>(null)
    const prefersReducedMotion = useReducedMotion()

    useGSAP(
        (_, contextSafe) => {
            const root = sectionRef.current
            if (!root) return

            const reduceMotion = Boolean(prefersReducedMotion) || window.matchMedia('(prefers-reduced-motion: reduce)').matches
            const ring = ringRef.current
            let rotationRafId: number | null = null
            let disconnectRotation: (() => void) | undefined

            if (ring && !reduceMotion) {
                let rotation = 0, velocity = 0, pendingScrollDelta = 0
                let lastScrollY = window.scrollY, lastFrameTime = performance.now(), isIntersecting = true
                const setRotation = gsap.quickSetter(ring, 'rotation', 'deg')

                const observer = new IntersectionObserver(([entry]) => {
                    isIntersecting = entry?.isIntersecting ?? false
                    if (isIntersecting) { lastScrollY = window.scrollY; pendingScrollDelta = 0; return }
                    velocity = 0; pendingScrollDelta = 0
                }, { threshold: 0.08, rootMargin: '40px 0px' })
                observer.observe(root)

                const step = (now: number) => {
                    const dt = Math.min((now - lastFrameTime) / 16.667, 2)
                    lastFrameTime = now
                    if (pendingScrollDelta !== 0) {
                        const drainFraction = 1 - Math.pow(1 - EASE_IN_DRAIN, dt)
                        const drain = pendingScrollDelta * drainFraction
                        velocity += drain * RING_SCROLL_GAIN
                        pendingScrollDelta -= drain
                        if (Math.abs(pendingScrollDelta) < 0.5) pendingScrollDelta = 0
                        velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity))
                    }
                    if (Math.abs(velocity) < VELOCITY_EPS && pendingScrollDelta === 0) { velocity = 0; rotationRafId = null; return }
                    rotation += velocity * dt
                    velocity *= Math.pow(FRICTION, dt)
                    setRotation(rotation)
                    rotationRafId = requestAnimationFrame(step)
                }

                const ensureRaf = () => { if (rotationRafId == null) { lastFrameTime = performance.now(); rotationRafId = requestAnimationFrame(step) } }

                const handleScroll = () => {
                    const currentScrollY = window.scrollY
                    if (!isIntersecting) { lastScrollY = currentScrollY; return }
                    const dy = currentScrollY - lastScrollY
                    lastScrollY = currentScrollY
                    if (dy === 0) return
                    pendingScrollDelta += Math.max(-MAX_SCROLL_DELTA, Math.min(MAX_SCROLL_DELTA, dy))
                    ensureRaf()
                }

                const onScroll = contextSafe?.(handleScroll) ?? handleScroll
                window.addEventListener('scroll', onScroll, { passive: true })
                disconnectRotation = () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); if (rotationRafId != null) cancelAnimationFrame(rotationRafId) }
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
                gsap.set([...clouds, ...headerBits, guideV, guideH, ...guideDots, ringInner, logo, bottom].filter(Boolean), { clearProps: 'all' })
                return () => { disconnectRotation?.() }
            }

            const ctx = gsap.context(() => {
                clouds.forEach((cloud, i) => {
                    const p = CLOUD_PARALLAX[i] ?? CLOUD_PARALLAX[0]
                    gsap.fromTo(cloud, { yPercent: p.yFrom, xPercent: p.xFrom }, {
                        yPercent: p.yTo, xPercent: p.xTo, ease: 'none',
                        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1.35, invalidateOnRefresh: true },
                    })
                })

                gsap.set(clouds, { autoAlpha: 0, scale: 0.94, transformOrigin: '50% 50%' })
                if (guideV) gsap.set(guideV, { scaleY: 0, transformOrigin: '50% 50%' })
                if (guideH) gsap.set(guideH, { scaleX: 0, transformOrigin: '50% 50%' })
                gsap.set(guideDots, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' })
                gsap.set(headerBits, { y: 36, autoAlpha: 0 })
                gsap.set(ringInner, { scale: 0.9, autoAlpha: 0, transformOrigin: '50% 50%' })
                if (logo) gsap.set(logo, { scale: 0.82, autoAlpha: 0, transformOrigin: '50% 50%' })
                if (bottom) gsap.set(bottom, { y: 32, autoAlpha: 0 })

                gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 80%', once: true, invalidateOnRefresh: true } })
                    .to(clouds, { autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.12, ease: gsapEasings.smooth }, 0)
                    .to(headerBits, { y: 0, autoAlpha: 1, duration: 1.05, stagger: 0.1, ease: gsapEasings.smooth }, 0.05)
                    .to(guideV, { scaleY: 1, duration: 1.1, ease: gsapEasings.expo }, 0.35)
                    .to(guideH, { scaleX: 1, duration: 1.1, ease: gsapEasings.expo }, 0.42)
                    .to(guideDots, { scale: 1, autoAlpha: 1, duration: 0.85, stagger: 0.09, ease: gsapEasings.back }, 0.48)
                    .to(ringInner, { scale: 1, autoAlpha: 1, duration: 1.15, ease: gsapEasings.smooth }, 0.52)
                    .to(logo, { scale: 1, autoAlpha: 1, duration: 1.05, ease: gsapEasings.back }, 0.68)
                    .to(bottom, { y: 0, autoAlpha: 1, duration: 0.95, ease: gsapEasings.smooth }, 0.78)
            }, root)

            return () => { disconnectRotation?.(); ctx.revert() }
        },
        { scope: sectionRef, dependencies: [prefersReducedMotion] },
    )

    return (
        <Section
            ref={sectionRef}
            variant="default"
            paddingY="none"
            className="relative min-h-[1253px] overflow-x-clip overflow-y-visible bg-[#F0F1F2] lg:min-h-[1428px] xl:min-h-[1762px]"
        >
            <div aria-hidden className="pointer-events-none absolute inset-0 z-(--z-index-section-bg) h-full w-full bg-[linear-gradient(to_bottom,#F0F1F2_0%,#D6E8FA_50%,#F0F1F2_100%)]" />
            <CommitmentClouds />

            <Container className="max-w-base relative z-(--z-index-section-content) px-4 pb-24 sm:px-6 lg:px-0 xl:pb-28">
                <div className="pt-36 lg:pt-36 xl:pt-40 xl:pb-20 text-center">
                    <CommitmentHeader />
                </div>
                <CommitmentRingBlock ringRef={ringRef} />
                <CommitmentBottomBody />
            </Container>
        </Section>
    )
}