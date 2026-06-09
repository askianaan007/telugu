'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'

import { Section } from '@/components/layout/Section'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { OUR_MODELS } from '@/data/ourModels'
import { cn } from '@/lib/utils'
import {
    ModelDetailBody,
    ModelProgressBadge,
    OurModelsBookCta,
    OurModelsFixedBackdrop,
    OurModelsMobileStack,
    OUR_MODELS_CLOUD_PARALLAX,
    OUR_MODELS_MOBILE_CARD_REVEAL_FROM,
} from './modelsShared'

const SCROLL_TRIGGER_ID = 'our-models-scroll'

export function OurModelsDesktop() {
    const sectionRef = useRef<HTMLElement>(null)
    const scrollTrackRef = useRef<HTMLDivElement>(null)
    const textLayerRef = useRef<HTMLDivElement>(null)
    const cardsLayerRef = useRef<HTMLDivElement>(null)
    const reduceMotion = usePrefersReducedMotion()
    // Ref-based ring degree — avoids React re-renders on every scroll tick
    const ringDegRef = useRef(0)

    useLayoutEffect(() => {
        const root = sectionRef.current
        if (!root) return

        if (reduceMotion) {
            gsap.set(root.querySelectorAll('[data-ourmodels-cloud]'), { clearProps: 'transform,opacity' })
            return
        }

        const details = root.querySelectorAll('[data-ourmodels-detail]')
        const cardsLayer = root.querySelector('[data-ourmodels-cards-layer]')
        const backdropDim = root.querySelector('[data-ourmodels-backdrop-dim]')
        const words = textLayerRef.current?.querySelectorAll('span')
        const cards = cardsLayerRef.current?.querySelectorAll('[data-reveal-card]')

        gsap.set(details, { autoAlpha: 0, pointerEvents: 'none' })
        if (cardsLayer) gsap.set(cardsLayer, { autoAlpha: 0 })
        const staticCta = root.querySelector('[data-ourmodels-static-cta]')
        if (staticCta) gsap.set(staticCta, { autoAlpha: 0, pointerEvents: 'none' })
        if (backdropDim) gsap.set(backdropDim, { opacity: 0.22, filter: 'blur(8px)' })
        if (words) gsap.set(words, { x: 0, opacity: 1, scale: 1 })
        if (cards) {
            cards.forEach((card) => {
                gsap.set(card, { xPercent: -50, yPercent: -50, x: 0, opacity: 0, scale: 0.5, zIndex: 10 })
                const frame = card.querySelector('[data-card-frame]')
                if (frame) gsap.set(frame, { opacity: 0 })
            })
        }
    }, [reduceMotion])

    useGSAP(
        () => {
            if (reduceMotion) return
            const root = sectionRef.current
            if (!root) return

            const ctx = gsap.context(() => {
                const mm = gsap.matchMedia()

                mm.add('(min-width: 1024px)', () => {
                    const track = scrollTrackRef.current
                    const textLayer = textLayerRef.current
                    const cardsLayer = cardsLayerRef.current
                    if (!track || !textLayer || !cardsLayer) return () => { }

                    const backdropDim = root.querySelector<HTMLElement>('[data-ourmodels-backdrop-dim]')
                    const details = [...root.querySelectorAll<HTMLDivElement>('[data-ourmodels-detail]')]
                    const wordOur = textLayer.querySelector<HTMLElement>('[data-word-our]')
                    const wordModels = textLayer.querySelector<HTMLElement>('[data-word-models]')
                    const cards = [...cardsLayer.querySelectorAll<HTMLElement>('[data-reveal-card]')]
                    const staticCta = root.querySelector<HTMLElement>('[data-ourmodels-static-cta]')

                    if (!backdropDim || !wordOur || !wordModels || cards.length !== OUR_MODELS.length || details.length !== OUR_MODELS.length) return () => { }

                    const [cardLeft, cardCenter, cardRight] = cards

                    gsap.set(textLayer, { autoAlpha: 1 })
                    gsap.set(cardsLayer, { autoAlpha: 1 })
                    gsap.set(backdropDim, { opacity: 0.22, filter: 'blur(8px)' })

                    // quickSetter mutates badge CSS var directly — zero React renders during scroll
                    const ringSetters = [...root.querySelectorAll<HTMLElement>('[data-progress-badge]')]

                    const tl = gsap.timeline({
                        defaults: { ease: 'none' },
                        scrollTrigger: {
                            id: SCROLL_TRIGGER_ID,
                            trigger: track,
                            start: 'top top',
                            end: 'bottom bottom',
                            scrub: 0.9,
                            invalidateOnRefresh: true,
                            fastScrollEnd: true,
                            onUpdate(self) {
                                ringDegRef.current = self.progress * 360
                                // Directly update CSS custom property on badge elements
                                ringSetters.forEach((el) => {
                                    el.style.setProperty('--ring-deg', `${ringDegRef.current}deg`)
                                })
                            },
                        },
                    })

                    tl.to(wordOur, { x: '-14vw', scale: 0.5, transformOrigin: 'left center', duration: 0.20 }, 0)
                    tl.to(wordModels, { x: '14vw', scale: 0.5, transformOrigin: 'right center', duration: 0.20 }, 0)


                    tl.fromTo(cardLeft, { xPercent: -50, yPercent: -50, x: 0, opacity: 0, scale: 0.5, zIndex: 10 }, { xPercent: -50, yPercent: -50, x: '-20vw', opacity: 1, scale: 0.4, zIndex: 10, duration: 0.20 }, 0)


                    tl.fromTo(cardCenter, { xPercent: -50, yPercent: -50, x: 0, opacity: 0, scale: 0.5, zIndex: 30 }, { xPercent: -50, yPercent: -50, x: 0, opacity: 1, scale: 0.4, zIndex: 30, duration: 0.20 }, 0)
                    tl.fromTo(cardRight, { xPercent: -50, yPercent: -50, x: 0, opacity: 0, scale: 0.5, zIndex: 10 }, { xPercent: -50, yPercent: -50, x: '18vw', opacity: 1, scale: 0.4, zIndex: 10, duration: 0.20 }, 0)
                    tl.to({}, { duration: 0.04 }, 0.20)
                    tl.to(textLayer, { opacity: 0, duration: 0.22 }, 0.20)


                    tl.to(backdropDim, { opacity: 1, filter: 'blur(0px)', duration: 0.12 }, 0.24)
                    cards.forEach((card) => { const frame = card.querySelector('[data-card-frame]'); if (frame) tl.to(frame, { opacity: 1, duration: 0.12 }, 0.24) })
                    tl.to(cardLeft, {
                        xPercent: -50,
                        yPercent: -30,
                        x: 0,
                        scale: 1,
                        opacity: 0,
                        zIndex: 10,
                        duration: 0.18,
                    }, 0.24)

                    tl.to(cardCenter, {
                        xPercent: -50,
                        yPercent: -40,
                        x: 0,
                        scale: 1,
                        opacity: 1,
                        zIndex: 30,
                        duration: 0.18,
                    }, 0.24)

                    tl.to(cardRight, {
                        xPercent: -50,
                        yPercent: -0,
                        x: 0,
                        scale: 0.70,
                        opacity: 0,
                        zIndex: 20,
                        duration: 0.18,
                    }, 0.24)
                    tl.fromTo(details[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: 'power2.out' }, 0.28)
                    const title0 = details[0].querySelector('[data-detail-title]')
                    if (title0) tl.fromTo(title0, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' }, 0.28)
                    tl.to({}, { duration: 0.04 }, 0.42)
                    tl.to(textLayer, { opacity: 0, duration: 0.12 }, 0.46)
                    tl.to(cardLeft, {
                        opacity: 1,
                        scale: 1,
                        zIndex: 30,
                        duration: 0.18,
                        xPercent: -50,
                        yPercent: -40,
                    }, 0.46)

                    tl.to(cardCenter, {
                        opacity: 0,
                        scale: 0.85,
                        duration: 0.18,
                    }, 0.46)

                    tl.to(cardRight, {
                        opacity: 0,
                        scale: 0.85,
                        duration: 0.18,
                    }, 0.46)
                    tl.to(details[0], { autoAlpha: 0, duration: 0.10 }, 0.46)
                    tl.to(details[1], { autoAlpha: 1, duration: 0.12 }, 0.54)
                    if (title0) tl.to(title0, { y: -40, opacity: 0, duration: 0.12 }, 0.46)
                    const title1 = details[1].querySelector('[data-detail-title]')
                    if (title1) tl.fromTo(title1, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' }, 0.54)
                    tl.to({}, { duration: 0.04 }, 0.68)
                    tl.to(cardLeft, {
                        opacity: 0,
                        scale: 0.85,
                        zIndex: 30,
                        duration: 0.18,
                    }, 0.72)

                    tl.to(cardCenter, {
                        opacity: 0,
                        scale: 0.85,
                        duration: 0.18,
                    }, 0.72)

                    tl.to(cardRight, {
                        opacity: 1,
                        scale: 0.90,
                        zIndex: 30,
                        duration: 0.18,
                        xPercent: -50,
                        yPercent: -40,
                    }, 0.72)
                    tl.to(details[1], { autoAlpha: 0, duration: 0.10 }, 0.72)
                    tl.to(details[2], { autoAlpha: 1, duration: 0.12 }, 0.80)
                    if (title1) tl.to(title1, { y: -40, opacity: 0, duration: 0.12 }, 0.72)
                    const title2 = details[2].querySelector('[data-detail-title]')
                    if (title2) tl.fromTo(title2, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' }, 0.80)
                    tl.to({}, { duration: 0.10 }, 0.90)

                    const clouds = [...root.querySelectorAll<HTMLElement>('[data-ourmodels-cloud]')]
                    const cloudExitTweens: gsap.core.Tween[] = []
                    if (clouds.length >= 2) {
                        gsap.set(clouds, { yPercent: 0, xPercent: 0, scale: 1, opacity: 1, transformOrigin: '50% 100%' })
                        clouds.forEach((cloud, i) => {
                            const p = OUR_MODELS_CLOUD_PARALLAX[i] ?? OUR_MODELS_CLOUD_PARALLAX[0]
                            cloudExitTweens.push(gsap.fromTo(cloud,
                                { yPercent: 0, xPercent: 0, scale: p.scaleFrom, opacity: 1 },
                                {
                                    yPercent: p.yTo, xPercent: p.xTo, scale: p.scaleTo, opacity: 0, ease: 'none',
                                    scrollTrigger: { trigger: track, start: 'bottom bottom', end: 'bottom top', scrub: 0.9, invalidateOnRefresh: true }
                                }
                            ))
                        })
                    }

                    const syncScrubState = () => {
                        const p = tl.progress()
                        const stageD = p >= 0.28
                        details.forEach((el, i) => {
                            const active = (i === 0 && p >= 0.28 && p < 0.46) || (i === 1 && p >= 0.46 && p < 0.72) || (i === 2 && p >= 0.72)
                            gsap.set(el, { pointerEvents: active ? 'auto' : 'none' })
                        })
                        if (staticCta) gsap.set(staticCta, { autoAlpha: stageD ? 1 : 0, pointerEvents: stageD ? 'auto' : 'none' })
                    }
                    tl.eventCallback('onUpdate', syncScrubState)
                    syncScrubState()
                    if (tl.scrollTrigger) tl.progress(tl.scrollTrigger.progress)

                    void document.fonts?.ready?.then(() => {
                        tl.invalidate()
                        ScrollTrigger.refresh()
                        if (tl.scrollTrigger) tl.progress(tl.scrollTrigger.progress)
                        syncScrubState()
                    })

                    return () => {
                        cloudExitTweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill() })
                        tl.scrollTrigger?.kill()
                        tl.kill()
                    }
                })
            }, sectionRef)

            return () => ctx.revert()
        },
        { scope: sectionRef, dependencies: [reduceMotion] },
    )

    return (
        <Section
            ref={sectionRef}
            id="our-models"
            variant="default"
            paddingY="none"
            className="overflow-visible bg-transparent"
        >
            <div ref={scrollTrackRef} className="relative w-full lg:min-h-[520vh]" data-ourmodels-track>
                <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,#F0F1F2_0%,#CAE4F3_52%)]" />
                <div className={cn('relative z-10 flex min-h-svh w-full flex-col max-lg:min-h-0', 'lg:sticky lg:top-0 lg:h-svh lg:min-h-0 lg:overflow-hidden')}>
                    <OurModelsFixedBackdrop ambientMotion={!reduceMotion} />

                    <div className="max-w-base relative z-20 mx-auto w-full px-4 sm:px-6 lg:hidden lg:px-8">
                        <OurModelsMobileStack showOnLarge={reduceMotion} />
                    </div>

                    <div className="hidden lg:contents" aria-hidden>
                        <h2 className="sr-only">Our Models</h2>

                        <div ref={cardsLayerRef} data-ourmodels-cards-layer className="absolute inset-0 z-30 opacity-0 pointer-events-none">
                            <div className="relative h-full w-full">
                                {OUR_MODELS.map((model, index) => (
                                    <div
                                        key={model.id}
                                        data-reveal-card
                                        data-card-index={index}
                                        className={cn(
                                            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                                            'flex items-center justify-center overflow-visible will-change-[transform,opacity]',
                                            // Figma: helicopter fills ~55% of viewport width at center
                                            'h-[clamp(24rem,52vh,40rem)] w-[clamp(20rem,48vw,38rem)]',
                                            'lg:h-[clamp(28rem,58vh,46rem)] lg:w-[clamp(24rem,52vw,42rem)]',
                                            'xl:h-[clamp(32rem,64vh,52rem)] xl:w-[clamp(28rem,56vw,48rem)]',
                                        )}
                                    >
                                        {/* Frame intentionally transparent — helicopter floats on gradient bg */}
                                        <div data-card-frame className="absolute inset-0 rounded-2xl opacity-0" />
                                        <div className="relative h-full w-full z-10" aria-hidden>
                                            <Image
                                                src={model.overviewImageSrc}
                                                alt=""
                                                fill
                                                sizes="(max-width: 1280px) 52vw, 48rem"
                                                className="object-contain object-center drop-shadow-[0_24px_48px_rgba(0,0,0,0.22)] select-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            ref={textLayerRef}
                            data-ourmodels-text-layer
                            className={cn(
                                'absolute inset-0 z-20',
                                'text-brand-charcoal [font-family:var(--font-halant)] text-[clamp(5rem,18vw,20rem)] leading-none tracking-[0.02em] lg:text-[clamp(6rem,12vw,12rem)]',
                                'flex items-center justify-center gap-x-[0.32em]',
                                'pointer-events-none overflow-visible',
                            )}
                        >
                            <span data-word-our className="inline-block shrink-0 will-change-[transform,font-size]">Our</span>
                            <span data-word-models className="inline-block shrink-0 will-change-[transform,font-size]">Models</span>
                        </div>

                        <div className="pointer-events-none absolute inset-0 z-40 2xl:translate-y-16">
                            {OUR_MODELS.map((model, index) => (
                                <div
                                    key={model.id}
                                    data-ourmodels-detail
                                    className="absolute inset-0 flex h-full min-h-0 flex-col overflow-hidden pointer-events-none opacity-0 will-change-[opacity]"
                                >
                                    <div className="max-w-base mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden px-6 py-6 lg:px-10 lg:pt-32 lg:pb-6">
                                        <ModelDetailBody
                                            model={model}
                                            stepIndex={index}
                                            imagePriority={index === 0}
                                            showCta={false}
                                            hideCenterImage
                                        />
                                    </div>
                                </div>
                            ))}

                            <div
                                data-ourmodels-static-cta
                                className="pointer-events-none absolute inset-x-0 z-50 flex justify-center opacity-0 px-4 lg:px-8 bottom-[5%] 2xl:bottom-[10%]"

                            >
                                <div className="max-w-base mx-auto flex w-full justify-center max-lg:hidden">
                                    <OurModelsBookCta />
                                </div>
                            </div>
                        </div>
                    </div>

                    {reduceMotion && (
                        <div className="max-w-base relative z-20 mx-auto hidden w-full px-4 sm:px-6 lg:block lg:px-8">
                            <OurModelsMobileStack showOnLarge />
                        </div>
                    )}
                </div>
            </div>
        </Section>
    )
}