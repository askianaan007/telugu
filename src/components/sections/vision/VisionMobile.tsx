'use client'

import { m, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Section } from '@/components/layout/Section'
import { useAboutVisionHandoffOptional } from '@/components/sections/about/AboutVisionHandoffContext'
import { MISSION_BULLETS, MISSION_HEADING, VISION_HEADING, VISION_MISSION_IMAGES, VISION_PARAGRAPHS } from '@/data/visionMission'
import { VISION_HANDOFF_TRIGGER_ATTR } from '@/lib/animations/aboutVisionHandoff'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { scaleIn } from '@/lib/animations/motion'
import {
    HEADING_CLASS, MissionBulletList, ScrollHighlightParagraph,
    STACKED_MOBILE_CONTENT_REVEAL, STACKED_MOBILE_STAGGER, STACKED_MOBILE_VIEWPORT,
    VisionMissionImageCard, fadeInUpTight,
} from './visionShared'

export function VisionMobile() {
    const mobileVisionImageRef = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()
    const isReducedMotion = reduceMotion === true
    const handoffCtx = useAboutVisionHandoffOptional()

    useGSAP(
        () => {
            if (isReducedMotion) return
            const card = mobileVisionImageRef.current
            if (!card) return
            const tween = gsap.fromTo(card, { autoAlpha: 0, scale: 0.88 }, {
                autoAlpha: 1, scale: 1, ease: 'none',
                scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 55%', scrub: 0.85, invalidateOnRefresh: true },
            })
            return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(card, { clearProps: 'opacity,visibility,transform' }) }
        },
        { scope: mobileVisionImageRef, dependencies: [isReducedMotion] }
    )

    return (
        <Section id="vision-mission" variant="default" paddingY="none"
            {...{ [VISION_HANDOFF_TRIGGER_ATTR]: '' }}
            className="bg-brand-surface overflow-visible relative z-[45]"
        >
            <div className="max-w-base mx-auto w-full px-4 pt-4 pb-20 sm:px-6 sm:pt-16 sm:pb-24">
                <div className="flex flex-col gap-12 sm:gap-14">
                    {/* Vision */}
                    <m.div initial={isReducedMotion ? false : 'hidden'} whileInView={isReducedMotion ? undefined : 'visible'}
                        viewport={STACKED_MOBILE_VIEWPORT} variants={STACKED_MOBILE_STAGGER} className="flex flex-col">
                        <m.h2 variants={fadeInUpTight} className={HEADING_CLASS}>{VISION_HEADING}</m.h2>
                        <m.div variants={scaleIn} className="mt-4 sm:mt-5">
                            <div ref={mobileVisionImageRef} className="will-change-transform">
                                <VisionMissionImageCard src={VISION_MISSION_IMAGES.vision.src} alt={VISION_MISSION_IMAGES.vision.alt} aspectClassName="aspect-[4/5] sm:aspect-[5/6]" />
                            </div>
                        </m.div>
                        <m.div variants={STACKED_MOBILE_CONTENT_REVEAL} className="mt-5 flex flex-col gap-5 sm:mt-6 sm:gap-6">
                            {VISION_PARAGRAPHS.map((paragraph) => (
                                <m.div key={paragraph.id} variants={fadeInUpTight}>
                                    <ScrollHighlightParagraph paragraph={paragraph} useScrollHighlight={false} visionProgress={1} isReducedMotion={isReducedMotion} />
                                </m.div>
                            ))}
                        </m.div>
                    </m.div>

                    {/* Mission */}
                    <m.div initial={isReducedMotion ? false : 'hidden'} whileInView={isReducedMotion ? undefined : 'visible'}
                        viewport={STACKED_MOBILE_VIEWPORT} variants={STACKED_MOBILE_STAGGER}
                        className="flex flex-col border-t border-black/6 pt-12 sm:pt-14">
                        <m.h2 variants={fadeInUpTight} className={HEADING_CLASS}>{MISSION_HEADING}</m.h2>
                        <m.div variants={scaleIn} className="mt-4 sm:mt-5">
                            <VisionMissionImageCard src={VISION_MISSION_IMAGES.mission.src} alt={VISION_MISSION_IMAGES.mission.alt} aspectClassName="aspect-[4/5] sm:aspect-[5/6]" />
                        </m.div>
                        <MissionBulletList missionProgress={1} activeBulletIndex={MISSION_BULLETS.length} scrollPastMission
                            isReducedMotion={isReducedMotion} useScrollHighlight={false} staggerEntrance className="mt-5 sm:mt-6" />
                    </m.div>
                </div>
            </div>
        </Section>
    )
}