'use client'

import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Section } from '@/components/layout/Section'
import { useAboutVisionHandoffOptional } from '@/components/sections/about/AboutVisionHandoffContext'
import { MISSION_BULLETS, MISSION_HEADING, VISION_HEADING, VISION_PARAGRAPHS } from '@/data/visionMission'
import { VISION_HANDOFF_TRIGGER_ATTR, VISION_PANEL_SLOT_ATTR } from '@/lib/animations/aboutVisionHandoff'
import { staggerContainer } from '@/lib/animations/motion'
import {
    DesktopImagePanel, HEADING_CLASS, INITIAL_METRICS, MissionBulletList,
    ScrollHighlightParagraph, ScrollMetrics, fadeInUpTight, useMissionInView,
} from './visionShared'

export function VisionTablet() {
    const mobileMissionRef = useRef<HTMLDivElement>(null)
    const handoffCtx = useAboutVisionHandoffOptional()
    const reduceMotion = useReducedMotion()
    const isReducedMotion = reduceMotion === true
    const [metrics] = useState<ScrollMetrics>(INITIAL_METRICS)

    const handoffUsesMosaic = Boolean(handoffCtx) && !isReducedMotion
    const handoffComplete = handoffCtx?.handoffComplete ?? false
    const handoffMorphing = handoffCtx?.isHandoffMorphing() ?? false

    const mobileMissionInView = useMissionInView(mobileMissionRef, true)
    const stackedMissionBulletsInView = mobileMissionInView

    const setVisionPanelSlotRef = (el: HTMLDivElement | null) => {
        if (!handoffCtx || !el) return
        if (window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches) {
            handoffCtx.registerVisionPanelSlot(el)
        }
    }

    useEffect(() => {
        if (!handoffCtx) return
        if (isReducedMotion) { handoffCtx.setHandoffPhase('slotted'); handoffCtx.setHandoffComplete(true) }
    }, [isReducedMotion, handoffCtx])

    return (
        <Section id="vision-mission" variant="default" paddingY="none"
            {...{ [VISION_HANDOFF_TRIGGER_ATTR]: '' }}
            className="bg-brand-surface overflow-visible relative z-45"
        >
            <div className="max-w-base mx-auto hidden w-full px-8 md:block lg:hidden">
                <div className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] items-start gap-x-8">
                    {/* Sticky left image */}
                    <div className="sticky top-0 col-start-1 row-start-1 h-dvh self-start py-10">
                        <div ref={setVisionPanelSlotRef} data-vision-layout="md" {...{ [VISION_PANEL_SLOT_ATTR]: '' }} className="relative h-full min-h-0 w-full">
                            <DesktopImagePanel showMissionImage={mobileMissionInView}
                                visionKenBurns={metrics.visionKenBurns} missionKenBurns={metrics.missionKenBurns}
                                isReducedMotion={isReducedMotion} handoffUsesMosaic={handoffUsesMosaic}
                                handoffComplete={handoffComplete} handoffMorphing={handoffMorphing} />
                        </div>
                    </div>

                    {/* Right scrolling content */}
                    <m.div variants={staggerContainer(0.1, 0.05)} initial={isReducedMotion ? false : 'hidden'}
                        whileInView={isReducedMotion ? undefined : 'visible'} viewport={{ once: true, amount: 0.08 }}
                        className="col-start-2 row-start-1 flex flex-col">
                        {/* Vision */}
                        <m.div variants={fadeInUpTight} className="flex min-h-dvh flex-col justify-center gap-6 pt-32 pb-16">
                            <h2 className={HEADING_CLASS}>{VISION_HEADING}</h2>
                            <div className="flex flex-col gap-6">
                                {VISION_PARAGRAPHS.map((paragraph) => (
                                    <ScrollHighlightParagraph key={paragraph.id} paragraph={paragraph}
                                        useScrollHighlight={false} visionProgress={1} isReducedMotion={isReducedMotion} />
                                ))}
                            </div>
                        </m.div>
                        {/* Mission */}
                        <m.div ref={mobileMissionRef} variants={fadeInUpTight}
                            className="flex min-h-dvh flex-col justify-center gap-6 border-t border-black/6 pt-16 pb-16">
                            <h2 className={HEADING_CLASS}>{MISSION_HEADING}</h2>
                            <MissionBulletList
                                missionProgress={stackedMissionBulletsInView ? 1 : 0}
                                activeBulletIndex={stackedMissionBulletsInView ? MISSION_BULLETS.length : 0}
                                scrollPastMission={stackedMissionBulletsInView}
                                isReducedMotion={isReducedMotion} useScrollHighlight />
                        </m.div>
                    </m.div>
                </div>
            </div>
        </Section>
    )
}