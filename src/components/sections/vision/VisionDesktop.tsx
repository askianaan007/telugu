'use client'

import { m, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Section } from '@/components/layout/Section'
import {
    scheduleScrollTriggerRefresh,
    useAboutVisionHandoffOptional,
} from '@/components/sections/about/AboutVisionHandoffContext'
import { MISSION_BULLETS, MISSION_HEADING, VISION_HEADING, VISION_PARAGRAPHS } from '@/data/visionMission'
import { getActiveBulletIndex, getActiveParagraphIndex } from '@/data/visionMission'
import { VISION_HANDOFF_TRIGGER_ATTR, VISION_PANEL_SLOT_ATTR } from '@/lib/animations/aboutVisionHandoff'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import {
    clamp, DESKTOP_TRACK_INITIAL_MIN_H, DesktopImagePanel, HEADING_CLASS, INITIAL_METRICS,
    MissionBulletList, MUTED_HEADING_CLASS, ScrollHighlightParagraph, ScrollMetrics,
} from './visionShared'
import { cn } from '@/lib/utils'

function computeMetrics(scrollTop: number, visionHeight: number, missionHeight: number, contentTravel = 0): ScrollMetrics {
    const visionProgress = visionHeight > 0 ? Math.min(1, Math.max(0, scrollTop / visionHeight)) : 0
    const scrollPastVision = visionHeight > 0 && scrollTop >= visionHeight - 1
    const activeParagraphIndex = scrollPastVision ? VISION_PARAGRAPHS.length : getActiveParagraphIndex(visionProgress)
    const missionScrollTop = Math.max(0, scrollTop - visionHeight)
    const missionScrollRange = contentTravel > visionHeight ? contentTravel - visionHeight : Math.max(missionHeight, 1)
    const scrollPastMission = missionScrollRange > 0 && missionScrollTop >= missionScrollRange - 1
    const missionProgress = scrollPastMission ? 1 : missionScrollRange > 0 ? Math.min(1, missionScrollTop / missionScrollRange) : 0
    const activeBulletIndex = scrollPastMission ? MISSION_BULLETS.length : getActiveBulletIndex(missionProgress)
    const showMissionImage = scrollTop >= visionHeight * 0.6
    const visionLocal = showMissionImage ? 1 : visionHeight > 0 ? scrollTop / visionHeight : 0
    const missionLocal = missionScrollRange > 0 && missionScrollTop > 0
        ? Math.min(1, missionScrollTop / missionScrollRange)
        : scrollTop >= visionHeight * 0.5 ? (scrollTop - visionHeight * 0.5) / (visionHeight * 0.5) : 0
    return {
        visionProgress, activeParagraphIndex, scrollPastVision,
        missionProgress, activeBulletIndex, scrollPastMission, showMissionImage,
        visionKenBurns: Math.min(1, visionLocal),
        missionKenBurns: Math.min(1, Math.max(0, missionLocal)),
    }
}

export function VisionDesktop() {
    const scrollTrackRef = useRef<HTMLDivElement>(null)
    const stickyShellRef = useRef<HTMLDivElement>(null)
    const rightPanelRef = useRef<HTMLDivElement>(null)
    const rightContentRef = useRef<HTMLDivElement>(null)
    const visionSectionRef = useRef<HTMLElement>(null)
    const missionSectionRef = useRef<HTMLElement>(null)

    const handoffCtx = useAboutVisionHandoffOptional()
    const handoffCtxRef = useRef(handoffCtx)
    useLayoutEffect(() => { handoffCtxRef.current = handoffCtx })

    const reduceMotion = useReducedMotion()
    const isReducedMotion = reduceMotion === true
    const useDesktopScrollScrub = !isReducedMotion

    const handoffUsesMosaic = Boolean(handoffCtx) && !isReducedMotion
    const handoffComplete = handoffCtx?.handoffComplete ?? false
    const handoffMorphing = handoffCtx?.isHandoffMorphing() ?? false

    const setVisionPanelSlotRef = useCallback((el: HTMLDivElement | null) => {
        const ctx = handoffCtxRef.current
        if (!ctx) return
        if (!el) { ctx.registerVisionPanelSlot(null); return }
        const layout = el.dataset.visionLayout
        if (layout === 'lg' && window.matchMedia('(min-width: 1024px)').matches) {
            ctx.registerVisionPanelSlot(el)
        }
    }, [])

    useEffect(() => {
        if (!handoffCtx) return
        if (isReducedMotion) { handoffCtx.setHandoffPhase('slotted'); handoffCtx.setHandoffComplete(true); return }
    }, [isReducedMotion, handoffCtx])

    const contentTravelRef = useRef(0)
    const pinScrollRangeRef = useRef(0)
    const rawContentOffset = useMotionValue(0)
    const smoothContentOffset = useSpring(rawContentOffset, { stiffness: 400, damping: 40, mass: 1 })
    const contentY = useMotionValue(0)

    const [metrics, setMetrics] = useState<ScrollMetrics>(INITIAL_METRICS)
    const [visionEntered, setVisionEntered] = useState(false)
    const [missionEntered, setMissionEntered] = useState(false)
    const visionReveal = useDesktopScrollScrub || visionEntered
    const missionReveal = useDesktopScrollScrub || missionEntered

    const applyScrollMetrics = useCallback((virtualScrollTop: number) => {
        const visionEl = visionSectionRef.current
        const missionEl = missionSectionRef.current
        if (!visionEl) return
        setMetrics((prev) => {
            const next = computeMetrics(virtualScrollTop, visionEl.offsetHeight, missionEl?.offsetHeight ?? 0, contentTravelRef.current)
            if (prev.visionProgress === next.visionProgress && prev.activeParagraphIndex === next.activeParagraphIndex &&
                prev.scrollPastVision === next.scrollPastVision && prev.missionProgress === next.missionProgress &&
                prev.activeBulletIndex === next.activeBulletIndex && prev.scrollPastMission === next.scrollPastMission &&
                prev.showMissionImage === next.showMissionImage && prev.visionKenBurns === next.visionKenBurns &&
                prev.missionKenBurns === next.missionKenBurns) return prev
            return next
        })
    }, [])

    useMotionValueEvent(smoothContentOffset, 'change', (latest) => {
        contentY.set(-latest)
        applyScrollMetrics(latest)
    })

    const measureDesktopScrollLayout = useCallback(() => {
        const track = scrollTrackRef.current; const shell = stickyShellRef.current
        const rightPanel = rightPanelRef.current; const content = rightContentRef.current
        const missionEl = missionSectionRef.current
        if (!track || !shell || !content) return
        const viewportH = window.visualViewport?.height ?? window.innerHeight
        const clipH = rightPanel?.clientHeight ?? viewportH
        const contentH = content.scrollHeight
        const missionPb = missionEl ? parseFloat(getComputedStyle(missionEl).paddingBottom) || 128 : 128
        const baseTravel = contentH - clipH + missionPb + 32
        const travel = Math.max(viewportH * 2, baseTravel + viewportH)
        const pinScrollRange = travel / 2.4
        contentTravelRef.current = travel
        pinScrollRangeRef.current = pinScrollRange
        track.style.minHeight = `${viewportH + pinScrollRange}px`
    }, [])

    const syncDesktopScrollFromTrack = useCallback(() => {
        const track = scrollTrackRef.current
        if (!track) return
        const travel = contentTravelRef.current
        const pinScrollRange = pinScrollRangeRef.current
        if (pinScrollRange <= 0) { contentY.set(0); return }
        const rawScrolled = Math.max(0, -track.getBoundingClientRect().top)
        const contentOffset = clamp(rawScrolled * 1.6, 0, travel)
        rawContentOffset.set(contentOffset)
    }, [rawContentOffset])

    useEffect(() => {
        if (!useDesktopScrollScrub) {
            contentTravelRef.current = 0; pinScrollRangeRef.current = 0; contentY.set(0)
            if (scrollTrackRef.current) scrollTrackRef.current.style.minHeight = ''
            return
        }
        const shell = stickyShellRef.current; const content = rightContentRef.current
        const visionEl = visionSectionRef.current; const missionEl = missionSectionRef.current
        const rightPanel = rightPanelRef.current
        if (!shell || !content) return
        const runMeasure = () => { requestAnimationFrame(() => { requestAnimationFrame(() => { measureDesktopScrollLayout(); syncDesktopScrollFromTrack() }) }) }
        runMeasure()
        window.addEventListener('load', runMeasure)
        window.addEventListener('resize', runMeasure)
        const onScroll = () => requestAnimationFrame(syncDesktopScrollFromTrack)
        window.addEventListener('scroll', onScroll, { passive: true })
        const ro = new ResizeObserver(runMeasure)
        ro.observe(content); ro.observe(shell)
        if (rightPanel) ro.observe(rightPanel)
        if (visionEl) ro.observe(visionEl)
        if (missionEl) ro.observe(missionEl)
        void document.fonts.ready.then(runMeasure)
        return () => {
            window.removeEventListener('load', runMeasure); window.removeEventListener('resize', runMeasure)
            window.removeEventListener('scroll', onScroll); ro.disconnect()
        }
    }, [useDesktopScrollScrub, measureDesktopScrollLayout, syncDesktopScrollFromTrack, rawContentOffset])

    useEffect(() => {
        if (!handoffCtx || !useDesktopScrollScrub) return
        if (handoffCtx.handoffPhase !== 'slotted' && !handoffCtx.handoffComplete) return
        requestAnimationFrame(() => { requestAnimationFrame(() => { measureDesktopScrollLayout(); syncDesktopScrollFromTrack(); scheduleScrollTriggerRefresh() }) })
    }, [handoffCtx, handoffCtx?.handoffPhase, handoffCtx?.handoffComplete, useDesktopScrollScrub, measureDesktopScrollLayout, syncDesktopScrollFromTrack])

    useEffect(() => {
        if (!handoffCtx) return
        const syncPanelSlot = () => {
            const lgSlot = document.querySelector<HTMLDivElement>('[data-vision-layout="lg"]')
            if (window.matchMedia('(min-width: 1024px)').matches && lgSlot) handoffCtx.registerVisionPanelSlot(lgSlot)
        }
        syncPanelSlot()
        window.addEventListener('resize', syncPanelSlot)
        return () => window.removeEventListener('resize', syncPanelSlot)
    }, [handoffCtx])

    useEffect(() => {
        if (!useDesktopScrollScrub) return
        const shell = stickyShellRef.current
        if (!shell) return
        const revealAll = () => { setVisionEntered(true); setMissionEntered(true) }
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) revealAll() }, { threshold: 0.05 })
        observer.observe(shell); revealAll()
        return () => observer.disconnect()
    }, [useDesktopScrollScrub])

    const visionHeadingMuted = metrics.scrollPastVision

    return (
        <Section id="vision-mission" variant="default" paddingY="none"
            {...{ [VISION_HANDOFF_TRIGGER_ATTR]: '' }}
            className="bg-brand-surface overflow-visible relative z-45"
        >
            <m.div ref={scrollTrackRef} className={cn('relative hidden w-full lg:block', DESKTOP_TRACK_INITIAL_MIN_H)}>
                <m.div ref={stickyShellRef} data-vision-enter-shell className={cn(
                    'sticky top-0 isolate z-10',
                    'max-w-base mx-auto grid h-dvh max-h-dvh min-h-dvh w-full',
                    'grid-cols-[4.5fr_7.5fr] items-stretch overflow-hidden',
                    'px-4 sm:px-6 lg:px-8 xl:px-0',
                    'gap-6 xl:gap-10'
                )}>
                    {/* Left image panel */}
                    <div ref={setVisionPanelSlotRef} data-vision-layout="lg" {...{ [VISION_PANEL_SLOT_ATTR]: '' }}
                        className="relative h-full min-h-0 min-w-0 self-stretch py-6 lg:py-8 xl:translate-y-[4vh] 2xl:translate-y-[7vh] 2xl:h-[78vh]">
                        <DesktopImagePanel
                            showMissionImage={metrics.showMissionImage} visionKenBurns={metrics.visionKenBurns}
                            missionKenBurns={metrics.missionKenBurns} isReducedMotion={isReducedMotion}
                            handoffUsesMosaic={handoffUsesMosaic} handoffComplete={handoffComplete} handoffMorphing={handoffMorphing}
                        />
                    </div>

                    {/* Right content — virtual scroll driven */}
                    <div ref={rightPanelRef} className="relative h-full min-h-0 min-w-0 overflow-hidden">
                        <m.div ref={rightContentRef}
                            className={cn('flex min-w-0 flex-col will-change-transform', isReducedMotion && 'h-full overflow-y-auto overscroll-contain')}
                            style={useDesktopScrollScrub ? { y: contentY } : undefined}
                        >
                            {/* Vision section */}
                            <section ref={visionSectionRef} className="flex min-w-0 flex-col justify-start gap-6 pt-28 pb-8 lg:gap-8 lg:pt-32 xl:pt-36 xl:pb-0">
                                <m.h2
                                    initial={isReducedMotion ? false : { opacity: 0, y: 12 }}
                                    animate={visionReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn(HEADING_CLASS, visionHeadingMuted && MUTED_HEADING_CLASS)}
                                >{VISION_HEADING}</m.h2>
                                <div className="flex flex-col gap-6 lg:gap-8">
                                    {VISION_PARAGRAPHS.map((paragraph, index) => (
                                        <m.div key={paragraph.id}
                                            initial={isReducedMotion ? false : { opacity: 0, y: 12 }}
                                            animate={visionReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                            transition={{ duration: 0.6, delay: isReducedMotion ? 0 : 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <ScrollHighlightParagraph paragraph={paragraph} useScrollHighlight={useDesktopScrollScrub}
                                                visionProgress={metrics.visionProgress} isReducedMotion={isReducedMotion} />
                                        </m.div>
                                    ))}
                                </div>
                            </section>

                            {/* Mission section */}
                            <section ref={missionSectionRef} className="flex min-w-0 flex-col justify-start gap-6 pt-6 pb-[40vh] lg:gap-8 lg:pt-8 lg:pb-[50vh]">
                                <m.h2
                                    initial={isReducedMotion ? false : { opacity: 0, y: 12 }}
                                    animate={missionReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className={HEADING_CLASS}
                                >{MISSION_HEADING}</m.h2>
                                <MissionBulletList missionProgress={metrics.missionProgress} activeBulletIndex={metrics.activeBulletIndex}
                                    scrollPastMission={metrics.scrollPastMission} isReducedMotion={isReducedMotion} useScrollHighlight={useDesktopScrollScrub} />
                            </section>
                        </m.div>
                    </div>
                </m.div>
            </m.div>
        </Section>
    )
}