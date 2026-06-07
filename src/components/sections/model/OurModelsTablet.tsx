'use client'

import { useRef } from 'react'
import { Section } from '@/components/layout/Section'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import {
    OurModelsFixedBackdrop,
    OurModelsMobileStack,
    OUR_MODELS_MOBILE_CARD_REVEAL_FROM,
} from './modelsShared'

export function OurModelsTablet() {
    const sectionRef = useRef<HTMLElement>(null)
    const reduceMotion = usePrefersReducedMotion()

    useGSAP(
        () => {
            if (reduceMotion) return
            const root = sectionRef.current
            if (!root) return

            const ctx = gsap.context(() => {
                const cards = root.querySelectorAll<HTMLElement>('[data-ourmodels-mobile-card]')
                gsap.set(cards, OUR_MODELS_MOBILE_CARD_REVEAL_FROM)

                const tweens: gsap.core.Tween[] = []
                cards.forEach((card) => {
                    tweens.push(gsap.fromTo(card, OUR_MODELS_MOBILE_CARD_REVEAL_FROM, {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 88%',
                            end: 'top 44%',
                            scrub: 0.82,
                            invalidateOnRefresh: true,
                        },
                    }))
                })

                return () => {
                    tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill() })
                    gsap.set(cards, { clearProps: 'opacity,visibility,transform,filter' })
                }
            }, root)

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
            <div className="relative w-full">
                <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,#F0F1F2_0%,#D6E8FA_49.52%,#F0F1F2_100%)]" />
                <div className="relative z-10 flex min-h-svh w-full flex-col">
                    <OurModelsFixedBackdrop ambientMotion={!reduceMotion} />
                    <div className="max-w-base relative z-20 mx-auto w-full px-5 sm:px-6">
                        <OurModelsMobileStack showOnLarge={false} />
                    </div>
                </div>
            </div>
        </Section>
    )
}