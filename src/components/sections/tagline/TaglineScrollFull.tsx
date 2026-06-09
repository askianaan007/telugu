'use client'

// src/components/sections/tagline/TaglineScrollFull.tsx
// ─────────────────────────────────────────────────────
// UNIFIED: handles mobile, tablet, desktop, large desktop.
// TaglineScrollMobile is deleted — route everything here.
//
// Changes from desktop-only version:
// ─────────────────────────────────
// [M1] isDesktopSplit() threshold lowered to 0 — ALL viewports get split animation.
//      On mobile the words split horizontally to screen edges just like desktop.
// [M2] measureSplitMetrics now works at any width — text layer is no longer
//      hidden on mobile. The sm:hidden / hidden sm:flex guards are removed.
// [M3] PILL_W/H_MOBILE restored as the starting pill size for small screens.
//      getViewportMetrics already handled this — just needed routing to reach it.
// [M4] mobileTaglinesRef stacked layout (vertical) removed — we now use the
//      same horizontal split words as desktop, scaled to mobile font sizes.
// [M5] Video seek throttling on mobile: seeks are gated to max 1 per rAF tick
//      AND only applied when delta > 0.05s (50ms) to avoid iOS frame drops.
// [M6] Track height: 280vh mobile, 360vh tablet, 580vh desktop — shorter on
//      mobile so the scroll distance feels proportional to screen height.
// [M7] Safari iOS sticky fix: `will-change: transform` on sticky container
//      is preserved; added `-webkit-overflow-scrolling: touch` via className.
// [M8] TaglineScrollSection router: removed mobile branch, always renders Full.
// [M9] copyRef positioning: on mobile anchors to bottom of screen (unchanged
//      from mobile version), on md+ moves to left-side overlay position.

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { clamp, easeOutCubic, lerp, mapRange } from '@/lib/animations/taglineScrollMath'
import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

const SCROLL_TRIGGER_ID = 'tagline-scroll'

// ── Pill dimensions ────────────────────────────────────────────────────────────
const PILL_W_DESKTOP = 340
const PILL_H_DESKTOP = 200
const PILL_W_MOBILE = 280
const PILL_H_MOBILE = 165
const PILL_W_NARROW = 248
const PILL_H_NARROW = 146
const PILL_INSET_NARROW = 32
const PILL_INSET_TABLET = 40

const SHELL_RADIUS = 24
const INNER_RADIUS = 20
const VIDEO_RADIUS = 20
const SHELL_PAD = 8
const SHELL_BORDER = 1
const SHELL_FADE_BY = 0.4

const FAQ_CARD_SHADOW = '0 40px 40px -3.75px rgba(0,0,0,0.02),0 20px 20px -3px rgba(0,0,0,0.03),0 11px 11px -2.5px rgba(0,0,0,0.04)'

// ── Timeline keypoints (same as desktop) ──────────────────────────────────────
const SPLIT_HOLD_END = 0.08
const SPLIT_END = 0.22
const ZOOM_START = 0.05
const ZOOM_END = 0.6
const TAG_FADE_S = 0.08
const TAG_FADE_E = 0.28
const AMB_S = 0.2
const AMB_E = 0.5
const COPY_S = 0.58
const COPY_E = 0.75
const PEEL_S = 0.78
const PEEL_E = 0.96
const PEEL_RADIUS_DESKTOP = 80
const PEEL_RADIUS_MOBILE = 28
const EXIT_S = 0.82
const EXIT_E = 0.96
const EXIT_SCALE_END = 0.99
const VID_S = 0.0
const VID_E = 0.8

// [M5] Minimum video time delta before we issue a seek — prevents iOS jank
const VIDEO_SEEK_MIN_DELTA = 0.05

const OVERLAY_COPY = 'Where silence, space, and simplicity come together beautifully.'
const SCENE_PENDING_CLASS = 'opacity-0'
const STAGE_B_MEASURE_CLASS = 'tagline-text-stage-b'

type ViewportMetrics = {
    pillW: number; pillH: number
    shellRadius: number; innerRadius: number; videoRadius: number; shellPad: number
}
type SplitMetrics = {
    stageAFontSize: string; stageBFontSize: string
    leftTargetX: number; rightTargetX: number
}
type CachedLayout = {
    vw: number; vh: number
    isMobile: boolean   // [M1] was `isDesktop` boolean — now tracks mobile explicitly
    peelRadius: number; retreatX: number; connectorMaxW: number
}

// [M1] All viewports participate in split animation
function getViewportMetrics(vw: number): ViewportMetrics {
    const isMobile = vw < 1024
    const isNarrow = vw < 640
    const inset = isNarrow ? PILL_INSET_NARROW : PILL_INSET_TABLET
    if (!isMobile) return {
        pillW: PILL_W_DESKTOP, pillH: PILL_H_DESKTOP,
        shellRadius: SHELL_RADIUS, innerRadius: INNER_RADIUS, videoRadius: VIDEO_RADIUS, shellPad: SHELL_PAD,
    }
    const baseW = isNarrow ? PILL_W_NARROW : PILL_W_MOBILE
    const baseH = isNarrow ? PILL_H_NARROW : PILL_H_MOBILE
    const pillW = Math.min(baseW, Math.max(200, vw - inset))
    const pillH = (pillW / baseW) * baseH
    return {
        pillW, pillH,
        shellRadius: isNarrow ? 20 : SHELL_RADIUS,
        innerRadius: isNarrow ? 16 : INNER_RADIUS,
        videoRadius: isNarrow ? 16 : VIDEO_RADIUS,
        shellPad: isNarrow ? 6 : SHELL_PAD,
    }
}

function buildCachedLayout(): CachedLayout {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const isMobile = vw < 640   // [M1] mobile = narrow viewport
    const isNarrow = vw < 1024
    return {
        vw, vh,
        isMobile,
        peelRadius: isNarrow ? PEEL_RADIUS_MOBILE : PEEL_RADIUS_DESKTOP,
        // [M1] retreatX scaled for mobile — words retreat less since they start closer
        retreatX: vw < 640 ? 32 : vw < 1024 ? 52 : vw < 1280 ? 80 : 112,
        // [M1] connector lines hidden on mobile (vw < 640) — words split without lines
        connectorMaxW: vw >= 1280 ? 140 : vw >= 1024 ? 96 : vw >= 640 ? 36 : 0,
    }
}

function bottomPeelRadius(px: number): string { return `0px 0px ${px}px ${px}px` }

function setConnectorLineWidth(el: HTMLElement | null, px: number): void {
    if (el) el.style.setProperty('--tagline-connector-w', `${px}px`)
}

function getContainerScrollProgress(container: HTMLElement): number {
    const scrollable = container.offsetHeight - window.innerHeight
    if (scrollable <= 0) return 0
    return clamp((window.scrollY - container.offsetTop) / scrollable, 0, 1)
}

function videoTimeForProgress(p: number, duration: number): number {
    if (!Number.isFinite(duration) || duration <= 0) return 0
    return clamp(clamp((p - VID_S) / (VID_E - VID_S), 0, 1) * duration, 0, Math.max(0, duration - 0.04))
}

function canSeekVideo(video: HTMLVideoElement): boolean {
    return video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0
}

function seekVideoTo(video: HTMLVideoElement, seconds: number): boolean {
    if (!canSeekVideo(video)) return false
    const t = clamp(seconds, 0, Math.max(0, video.duration - 0.04))
    if (Math.abs(video.currentTime - t) < 0.001) return true
    video.pause()
    try { video.currentTime = t } catch { return false }
    return true
}

function lerpFontSize(a: string, b: string, t: number): string {
    const aPx = parseFloat(a)
    const bPx = parseFloat(b)
    if (!Number.isFinite(aPx) || !Number.isFinite(bPx)) return b
    return `${lerp(aPx, bPx, t)}px`
}

// [M2] measureSplitMetrics works at any viewport width
// Previously only called when isDesktop (vw >= 640). Now called always.
// The text layer is no longer hidden on mobile, so getBoundingClientRect works.
function measureSplitMetrics(
    textLayer: HTMLElement,
    wordLeft: HTMLElement,
    wordRight: HTMLElement,
    leftConnector: HTMLElement,
    rightConnector: HTMLElement,
    vw: number,
): SplitMetrics {
    gsap.set([wordLeft, wordRight, leftConnector, rightConnector], { x: 0, clearProps: 'fontSize' })
    textLayer.classList.remove(STAGE_B_MEASURE_CLASS)
    gsap.set([wordLeft, wordRight], { clearProps: 'fontSize' })
    const stageAFontSize = window.getComputedStyle(wordLeft).fontSize
    textLayer.classList.add(STAGE_B_MEASURE_CLASS)
    gsap.set([wordLeft, wordRight], { clearProps: 'fontSize' })
    const stageBFontSize = window.getComputedStyle(wordLeft).fontSize
    textLayer.classList.remove(STAGE_B_MEASURE_CLASS)
    const edgePad = Math.max(16, vw * 0.02)
    textLayer.classList.add(STAGE_B_MEASURE_CLASS)
    gsap.set([wordLeft, wordRight], { clearProps: 'fontSize' })
    gsap.set([leftConnector, rightConnector], { x: 0 })
    const leftRect = leftConnector.getBoundingClientRect()
    const rightRect = rightConnector.getBoundingClientRect()
    textLayer.classList.remove(STAGE_B_MEASURE_CLASS)
    gsap.set([wordLeft, wordRight], { clearProps: 'fontSize' })
    return {
        stageAFontSize,
        stageBFontSize,
        leftTargetX: -(leftRect.left - edgePad),
        rightTargetX: vw - rightRect.right - edgePad,
    }
}

function postSplitProgress(p: number): number {
    return clamp(mapRange(p, SPLIT_END, 1, 0, 1), 0, 1)
}

function splitEase(t: number): number {
    return gsap.parseEase('power2.inOut')(clamp(t, 0, 1))
}

export function TaglineScrollFull() {
    const containerRef = useRef<HTMLDivElement>(null)
    const stickyRef = useRef<HTMLDivElement>(null)
    const ambientRef = useRef<HTMLDivElement>(null)
    const textLayerRef = useRef<HTMLDivElement>(null)
    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)
    const wordLeftRef = useRef<HTMLSpanElement>(null)
    const wordRightRef = useRef<HTMLSpanElement>(null)
    // [M4] mobileTaglinesRef removed — mobile now uses same split word layout
    const windowRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)
    const shellRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const gradientRef = useRef<HTMLDivElement>(null)
    const copyRef = useRef<HTMLDivElement>(null)

    const metricsRef = useRef<ViewportMetrics>(getViewportMetrics(1280))
    const splitMetricsRef = useRef<SplitMetrics>({
        stageAFontSize: '32px', stageBFontSize: '24px',
        leftTargetX: -200, rightTargetX: 200,
    })
    const layoutRef = useRef<CachedLayout>({
        vw: 1280, vh: 800, isMobile: false,
        peelRadius: PEEL_RADIUS_DESKTOP, retreatX: 112, connectorMaxW: 60,
    })
    const pendingProgressRef = useRef(0)
    const tickingRef = useRef(false)
    const videoReadyRef = useRef(false)
    const lastVideoTimeRef = useRef(-1)
    const videoPrimedRef = useRef(false)
    const syncProgressRef = useRef<(p: number) => void>(() => { })

    const prefersReducedMotion = usePrefersReducedMotion()

    const recomputeLayout = useCallback(() => {
        const layout = buildCachedLayout()
        layoutRef.current = layout
        metricsRef.current = getViewportMetrics(layout.vw)
        const textLayer = textLayerRef.current
        const wordLeft = wordLeftRef.current
        const wordRight = wordRightRef.current
        const left = leftRef.current
        const right = rightRef.current
        // [M2] measure at ALL viewport widths, not just isDesktop
        if (textLayer && wordLeft && wordRight && left && right) {
            splitMetricsRef.current = measureSplitMetrics(textLayer, wordLeft, wordRight, left, right, layout.vw)
        }
    }, [])

    const revealStickyScene = useCallback(() => {
        stickyRef.current?.classList.remove(SCENE_PENDING_CLASS)
    }, [])

    useLayoutEffect(() => {
        recomputeLayout()
        if (!prefersReducedMotion) {
            const { pillW, pillH, shellRadius, innerRadius, videoRadius, shellPad } = metricsRef.current
            const { stageAFontSize } = splitMetricsRef.current
            if (stageRef.current) gsap.set(stageRef.current, { width: pillW, height: pillH, borderRadius: 0, autoAlpha: 0, force3D: true })
            if (windowRef.current) gsap.set(windowRef.current, { clearProps: 'transform' })
            if (shellRef.current) gsap.set(shellRef.current, { borderRadius: shellRadius, padding: shellPad, borderWidth: SHELL_BORDER, force3D: true })
            if (innerRef.current) gsap.set(innerRef.current, { borderRadius: innerRadius, borderColor: 'rgba(255,255,255,0.9)', boxShadow: FAQ_CARD_SHADOW, force3D: true })
            if (videoRef.current) { gsap.set(videoRef.current, { borderRadius: videoRadius, opacity: 0, force3D: true }); videoRef.current.pause() }
            if (gradientRef.current) gsap.set(gradientRef.current, { opacity: 0, borderRadius: '0px' })
            if (copyRef.current) gsap.set(copyRef.current, { opacity: 0, y: 16 })
            // [M1] Split words init for ALL viewports
            for (const el of [leftRef.current, rightRef.current]) {
                if (el) gsap.set(el, { x: 0, y: 0, zIndex: 30, force3D: true })
            }
            for (const el of [wordLeftRef.current, wordRightRef.current]) {
                if (el) gsap.set(el, { clearProps: 'fontSize' })
            }
            if (wordLeftRef.current) gsap.set(wordLeftRef.current, { fontSize: stageAFontSize })
            if (wordRightRef.current) gsap.set(wordRightRef.current, { fontSize: stageAFontSize })
            setConnectorLineWidth(leftRef.current, 0)
            setConnectorLineWidth(rightRef.current, 0)
            const container = containerRef.current
            if (container) pendingProgressRef.current = getContainerScrollProgress(container)
        }
    }, [prefersReducedMotion, recomputeLayout])

    const applyProgress = useCallback((p: number) => {
        const metrics = metricsRef.current
        const split = splitMetricsRef.current
        const { vw, vh, isMobile, peelRadius, retreatX, connectorMaxW } = layoutRef.current
        const sticky = stickyRef.current
        const ambient = ambientRef.current
        const left = leftRef.current
        const right = rightRef.current
        const wordLeft = wordLeftRef.current
        const wordRight = wordRightRef.current
        const stage = stageRef.current
        const shell = shellRef.current
        const inner = innerRef.current
        const video = videoRef.current
        const gradient = gradientRef.current
        const copy = copyRef.current

        // [M1] postSplitProgress used for ALL viewports (was only for isDesktop)
        // On mobile, animP maps progress correctly after the split phase.
        const animP = postSplitProgress(p)

        // ── Split animation (ALL viewports) ──────────────────────────────────
        let splitEased = 1
        let baseLeftX = 0
        let baseRightX = 0
        let pillAlpha = 1

        if (p >= SPLIT_END) {
            splitEased = 1
            baseLeftX = split.leftTargetX
            baseRightX = split.rightTargetX
            pillAlpha = 1
            if (wordLeft && wordRight) gsap.set([wordLeft, wordRight], { fontSize: split.stageBFontSize })
        } else if (p <= SPLIT_HOLD_END) {
            splitEased = 0
            baseLeftX = 0
            baseRightX = 0
            pillAlpha = 0
            if (wordLeft && wordRight) gsap.set([wordLeft, wordRight], { fontSize: split.stageAFontSize })
        } else {
            const splitT = clamp(mapRange(p, SPLIT_HOLD_END, SPLIT_END, 0, 1), 0, 1)
            splitEased = splitEase(splitT)
            baseLeftX = lerp(0, split.leftTargetX, splitEased)
            baseRightX = lerp(0, split.rightTargetX, splitEased)
            pillAlpha = splitEased
            if (wordLeft && wordRight) {
                gsap.set([wordLeft, wordRight], {
                    fontSize: lerpFontSize(split.stageAFontSize, split.stageBFontSize, splitEased),
                })
            }
        }

        if (stage) gsap.set(stage, { autoAlpha: pillAlpha, force3D: true })
        const lineW = splitEased >= 1 ? connectorMaxW : connectorMaxW * splitEased
        setConnectorLineWidth(left, lineW)
        setConnectorLineWidth(right, lineW)

        // ── Zoom ─────────────────────────────────────────────────────────────
        const zoomT = easeOutCubic(mapRange(animP, ZOOM_START, ZOOM_END, 0, 1))
        const stageW = lerp(metrics.pillW, vw, zoomT)
        const stageH = lerp(metrics.pillH, vh, zoomT)
        if (stage) gsap.set(stage, { width: stageW, height: stageH, force3D: true })

        // ── Shell border / peel ───────────────────────────────────────────────
        const shellFadeT = clamp(zoomT / SHELL_FADE_BY, 0, 1)
        const peelT = easeOutCubic(mapRange(animP, PEEL_S, PEEL_E, 0, 1))
        const bottomR = lerp(0, peelRadius, peelT)

        if (peelT > 0) {
            const r = bottomPeelRadius(bottomR)
            if (stage) gsap.set(stage, { width: vw, height: vh, borderRadius: r, force3D: true })
            if (shell) gsap.set(shell, { borderRadius: r, padding: 0, borderWidth: 0, force3D: true })
            if (inner) gsap.set(inner, { borderRadius: r, borderColor: 'transparent', boxShadow: 'none', force3D: true })
            if (video) gsap.set(video, { borderRadius: r })
            if (gradient) gsap.set(gradient, { borderRadius: r, force3D: true })
        } else {
            if (stage) gsap.set(stage, { borderRadius: 0, force3D: true })
            if (shell) gsap.set(shell, { borderRadius: lerp(metrics.shellRadius, 0, zoomT), padding: lerp(metrics.shellPad, 0, zoomT), borderWidth: lerp(SHELL_BORDER, 0, Math.min(zoomT / SHELL_FADE_BY, 1)), force3D: true })
            if (inner) gsap.set(inner, { borderRadius: lerp(metrics.innerRadius, 0, zoomT), borderColor: `rgba(255,255,255,${lerp(0.9, 0, shellFadeT)})`, boxShadow: shellFadeT >= 1 ? 'none' : FAQ_CARD_SHADOW, force3D: true })
            if (video) gsap.set(video, { borderRadius: lerp(metrics.videoRadius, 0, zoomT) })
            if (gradient) gsap.set(gradient, { borderRadius: '0px', force3D: true })
        }

        // ── Tagline words retreat ─────────────────────────────────────────────
        const taglineOpacity = clamp(1 - mapRange(animP, TAG_FADE_S, TAG_FADE_E, 0, 1), 0, 1)
        const taglineRetreatT = easeOutCubic(clamp(mapRange(animP, TAG_FADE_S, ZOOM_END, 0, 1), 0, 1))
        const taglineZ = Math.round(lerp(30, 1, taglineRetreatT))
        if (left) gsap.set(left, { opacity: taglineOpacity, x: baseLeftX - lerp(0, retreatX, taglineRetreatT), zIndex: taglineZ, force3D: true })
        if (right) gsap.set(right, { opacity: taglineOpacity, x: baseRightX + lerp(0, retreatX, taglineRetreatT), zIndex: taglineZ, force3D: true })

        // ── Ambient / copy / gradient ─────────────────────────────────────────
        if (ambient) gsap.set(ambient, { opacity: mapRange(animP, AMB_S, AMB_E, 0, 0.55) })
        const copyT = easeOutCubic(mapRange(animP, COPY_S, COPY_E, 0, 1))
        if (copy) gsap.set(copy, { opacity: copyT, y: lerp(16, 0, copyT), force3D: true })
        if (gradient) gsap.set(gradient, { opacity: copyT > 0.05 ? 1 : copyT * 20 })
        const exitT = mapRange(animP, EXIT_S, EXIT_E, 0, 1)
        if (sticky) gsap.set(sticky, { opacity: 1, scale: lerp(1, EXIT_SCALE_END, exitT), force3D: true })

        // [M5] Video seek with mobile throttle
        if (video && videoReadyRef.current && canSeekVideo(video)) {
            const targetTime = videoTimeForProgress(animP, video.duration)
            if (Math.abs(targetTime - lastVideoTimeRef.current) > VIDEO_SEEK_MIN_DELTA) {
                if (seekVideoTo(video, targetTime)) lastVideoTimeRef.current = targetTime
            }
        }
    }, [])

    useEffect(() => { syncProgressRef.current = applyProgress }, [applyProgress])

    useLayoutEffect(() => {
        if (prefersReducedMotion) { revealStickyScene(); return }
        applyProgress(pendingProgressRef.current)
        revealStickyScene()
    }, [prefersReducedMotion, applyProgress, revealStickyScene])

    const applyReducedMotionState = useCallback(() => {
        recomputeLayout()
        const split = splitMetricsRef.current
        const { connectorMaxW } = layoutRef.current
        const stage = stageRef.current; const shell = shellRef.current; const inner = innerRef.current
        const video = videoRef.current; const gradient = gradientRef.current; const copy = copyRef.current
        const ambient = ambientRef.current; const sticky = stickyRef.current
        if (stage) gsap.set(stage, { width: '100%', height: '100%', borderRadius: 0, autoAlpha: 1, clearProps: 'transform' })
        if (shell) gsap.set(shell, { borderRadius: 0, padding: 0, borderWidth: 0 })
        if (inner) gsap.set(inner, { borderRadius: 0, borderColor: 'transparent', boxShadow: 'none' })
        if (video) { gsap.set(video, { borderRadius: 0, opacity: 1 }); video.pause(); if (canSeekVideo(video)) seekVideoTo(video, video.duration * 0.5) }
        // [M1] reduced motion applies split words for all viewports
        if (leftRef.current) gsap.set(leftRef.current, { opacity: 1, x: split.leftTargetX })
        if (rightRef.current) gsap.set(rightRef.current, { opacity: 1, x: split.rightTargetX })
        if (wordLeftRef.current && wordRightRef.current) {
            gsap.set([wordLeftRef.current, wordRightRef.current], { fontSize: split.stageBFontSize })
        }
        setConnectorLineWidth(leftRef.current, connectorMaxW)
        setConnectorLineWidth(rightRef.current, connectorMaxW)
        if (ambient) gsap.set(ambient, { opacity: 0.35 })
        if (copy) gsap.set(copy, { opacity: 1, y: 0 })
        if (gradient) gsap.set(gradient, { opacity: 1 })
        if (sticky) gsap.set(sticky, { opacity: 1, scale: 1, clearProps: 'transform,opacity' })
    }, [recomputeLayout])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return
        let cancelled = false
        const primeVideo = () => {
            if (cancelled || videoPrimedRef.current) return
            if (!Number.isFinite(video.duration) || video.duration <= 0) return
            if (video.readyState < 2) { video.addEventListener('loadeddata', primeVideo, { once: true }); return }
            videoPrimedRef.current = true
            video.pause()
            const st = ScrollTrigger.getById(SCROLL_TRIGGER_ID)
            const progress = st?.progress ?? pendingProgressRef.current
            const animP = postSplitProgress(progress)
            const targetTime = prefersReducedMotion ? video.duration * 0.5 : videoTimeForProgress(animP, video.duration)
            const finishPrime = () => {
                if (cancelled) return
                lastVideoTimeRef.current = video.currentTime
                videoReadyRef.current = true
                gsap.set(video, { opacity: 1, force3D: true })
                if (!prefersReducedMotion) syncProgressRef.current(progress)
            }
            video.addEventListener('seeked', finishPrime, { once: true })
            if (!seekVideoTo(video, targetTime)) {
                video.removeEventListener('seeked', finishPrime)
                videoPrimedRef.current = false
                return
            }
            if (Math.abs(video.currentTime - targetTime) < 0.001) {
                video.removeEventListener('seeked', finishPrime)
                finishPrime()
            }
        }
        const onMetadata = () => { if (!cancelled) primeVideo() }
        videoReadyRef.current = false; videoPrimedRef.current = false; lastVideoTimeRef.current = -1
        gsap.set(video, { opacity: 0 })
        video.muted = true; video.playsInline = true; video.preload = 'auto'
        video.addEventListener('loadedmetadata', onMetadata)
        video.addEventListener('durationchange', onMetadata)
        if (video.readyState >= 1 && Number.isFinite(video.duration)) onMetadata()
        else video.load()
        return () => {
            cancelled = true; videoReadyRef.current = false; videoPrimedRef.current = false; lastVideoTimeRef.current = -1
            video.removeEventListener('loadedmetadata', onMetadata)
            video.removeEventListener('durationchange', onMetadata)
        }
    }, [prefersReducedMotion])

    useGSAP(
        () => {
            const container = containerRef.current
            if (!container) return
            let resizeTimer: ReturnType<typeof setTimeout>
            const onResize = () => {
                recomputeLayout()
                ScrollTrigger.refresh()
                if (prefersReducedMotion) applyReducedMotionState()
                else syncProgressRef.current(pendingProgressRef.current)
            }
            const debouncedResize = () => {
                clearTimeout(resizeTimer)
                resizeTimer = setTimeout(onResize, 100)
            }
            window.addEventListener('resize', debouncedResize, { passive: true })
            if (prefersReducedMotion) {
                applyReducedMotionState()
                revealStickyScene()
                return () => { window.removeEventListener('resize', debouncedResize); clearTimeout(resizeTimer) }
            }
            const st = ScrollTrigger.create({
                id: SCROLL_TRIGGER_ID,
                trigger: container,
                start: 'top top',
                end: 'bottom bottom',
                invalidateOnRefresh: true,
                onRefresh(self) { recomputeLayout(); syncProgressRef.current(self.progress) },
                onUpdate(self) {
                    pendingProgressRef.current = self.progress
                    if (tickingRef.current) return
                    tickingRef.current = true
                    requestAnimationFrame(() => {
                        syncProgressRef.current(pendingProgressRef.current)
                        tickingRef.current = false
                    })
                },
            })
            ScrollTrigger.refresh()
            syncProgressRef.current(st.progress)
            requestAnimationFrame(() => { syncProgressRef.current(st.progress); revealStickyScene() })
            return () => { window.removeEventListener('resize', debouncedResize); clearTimeout(resizeTimer); st.kill() }
        },
        { scope: containerRef, dependencies: [prefersReducedMotion, applyReducedMotionState, revealStickyScene, recomputeLayout] },
    )

    // [M6] Track height: 280vh mobile, 360vh tablet, 580vh desktop
    // Shorter on mobile so the scroll distance is proportional to the screen.
    const trackHeight = prefersReducedMotion
        ? 'h-svh'
        : 'h-[280vh] sm:h-[360vh] lg:h-[580vh]'

    return (
        <section
            ref={containerRef}
            data-tagline-scroll
            aria-label="Less chaos, more clarity"
            className={cn('bg-brand-surface relative w-full', trackHeight)}
        >
            <div
                ref={stickyRef}
                data-tagline-sticky
                className={cn(
                    'sticky top-0 h-svh w-full overflow-hidden will-change-transform',
                    // [M7] Safari iOS: explicit isolation prevents scroll momentum bleed
                    'isolate',
                    !prefersReducedMotion && SCENE_PENDING_CLASS
                )}
            >
                <div
                    ref={ambientRef}
                    data-tagline-ambient
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-1 opacity-0"
                    style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(202,139,55,0.22) 0%, transparent 70%)' }}
                />

                <div
                    ref={windowRef}
                    data-tagline-window
                    className="absolute inset-0 z-2 flex items-center justify-center overflow-hidden"
                >
                    <div
                        ref={stageRef}
                        data-tagline-stage
                        className="relative max-h-full max-w-full shrink-0 overflow-hidden will-change-[width,height]"
                    >
                        <div
                            ref={shellRef}
                            data-tagline-shell
                            className="box-border h-full w-full overflow-hidden rounded-[24px] border border-black/8 p-2"
                        >
                            <div
                                ref={innerRef}
                                data-tagline-inner
                                className={cn(
                                    faqAccordionInnerClassName(),
                                    'relative h-full min-h-0! w-full gap-0! overflow-hidden px-0! py-0!',
                                    'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]',
                                )}
                            >
                                <video
                                    ref={videoRef}
                                    src="/images/tagline-strip.mp4"
                                    muted
                                    playsInline
                                    preload="auto"
                                    disablePictureInPicture
                                    aria-hidden
                                    className={cn(
                                        'relative z-1 h-full w-full object-cover object-center opacity-0',
                                        'bg-brand-surface transform-[translateZ(0)] backface-hidden',
                                    )}
                                />
                            </div>
                        </div>
                        <div
                            ref={gradientRef}
                            data-tagline-gradient
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[52%] opacity-0 will-change-[border-radius,opacity] sm:h-[48%] md:h-[45%]"
                            style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.55) 55%, rgba(9,9,11,0.88) 100%)' }}
                        />
                    </div>

                    <div
                        ref={copyRef}
                        data-tagline-copy
                        className={cn(
                            'pointer-events-none absolute z-30 flex w-full max-w-none items-stretch gap-2.5 text-left',
                            // [M9] Mobile: bottom-anchored (matches original mobile design)
                            'right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] left-4 max-md:z-40',
                            'sm:right-6 sm:left-6 sm:gap-3',
                            // md+: left-side overlay position (original desktop)
                            'md:top-2/5 md:right-auto md:bottom-auto md:left-0 md:z-20 md:max-w-[min(100%,285px)] md:-translate-y-1/2 md:pl-10',
                            'lg:pl-12 xl:max-w-[285px]',
                            'opacity-0 will-change-[transform,opacity]',
                        )}
                    >
                        <span aria-hidden className="md:bg-brand-charcoal w-0.5 shrink-0 self-stretch bg-white sm:w-1" />
                        <p className={cn(
                            'min-w-0 flex-1 text-left [font-family:var(--font-halant)] font-normal tracking-[-0.04em]',
                            'text-[15px] leading-[21px] text-white',
                            'sm:text-[17px] sm:leading-[23px]',
                            'md:text-brand-charcoal md:text-[22px] md:leading-[28px]',
                            'lg:text-[25px] lg:leading-[30px]',
                        )}>
                            {OVERLAY_COPY}
                        </p>
                    </div>
                </div>

                {/*
                 * [M1][M2] Unified split word layer — visible on ALL viewports.
                 * Previously: hidden on mobile (sm:flex gate), replaced by mobileTaglinesRef stacked layout.
                 * Now: single horizontal split layout scales via clamp() from mobile → desktop.
                 *
                 * Font scale:
                 *   mobile:  clamp(1.25rem, 5.5vw, 1.75rem)   ← new, was handled by mobileTaglinesRef
                 *   sm:      clamp(1.75rem, 5vw, 2.75rem)      ← unchanged
                 *   lg:      clamp(3.75rem, 5vw, 5rem)         ← unchanged
                 *   xl:      clamp(5rem, 5.5vw, 7rem)          ← unchanged
                 *
                 * Stage B (split) font is smaller — GSAP lerps between A and B during split phase.
                 * On mobile the words start centered and split horizontally to screen edges.
                 */}
                <div
                    ref={textLayerRef}
                    data-tagline-text-layer
                    className={cn(
                        // [M2] Removed 'hidden sm:flex' — now flex on all viewports
                        'pointer-events-none absolute inset-0 z-30 flex items-center justify-center',
                        'text-brand-charcoal [font-family:var(--font-halant)] font-normal tracking-[-0.04em]',
                        // [M1] Mobile font added as base; sm/lg/xl breakpoints unchanged
                        'text-[clamp(1.25rem,5.5vw,1.75rem)] leading-tight',
                        'sm:text-[clamp(1.75rem,5vw,2.75rem)]',
                        'lg:text-[clamp(3.75rem,5vw,5rem)] lg:leading-[1.1]',
                        'xl:text-[clamp(5rem,5.5vw,7rem)] xl:leading-[1.05]',
                        'overflow-visible',
                    )}
                >
                    <div className="-gap-x-[0.12em] flex items-center justify-center">
                        <div
                            ref={leftRef}
                            data-tagline-left
                            className="tagline-connector tagline-connector-left flex shrink-0 items-center will-change-transform"
                        >
                            <span
                                ref={wordLeftRef}
                                data-word-left
                                className="inline-block shrink-0 will-change-[transform,font-size]"
                            >
                                Less chaos
                            </span>
                        </div>
                        <div
                            ref={rightRef}
                            data-tagline-right
                            className="tagline-connector tagline-connector-right flex shrink-0 items-center will-change-transform"
                        >
                            <span
                                ref={wordRightRef}
                                data-word-right
                                className="inline-block shrink-0 will-change-[transform,font-size]"
                            >
                                More Clarity
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
