'use client'

// src/components/sections/about/AboutVisionHandoffBridge.tsx

import { useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'

import {
    scheduleScrollTriggerRefresh,
    useAboutVisionHandoff,
} from '@/components/sections/about/AboutVisionHandoffContext'
import {
    HANDOFF_BRIDGE_FINISH_PROGRESS,
    HANDOFF_BRIDGE_RESET_PROGRESS,
    measureElementRect,
    measureVisionHandoffTarget,
    measureVisionPanelSlot,
    type RectBox,
    VISION_HANDOFF_COMPLETE_ATTR,
    VISION_PANEL_SLOT_ATTR,
} from '@/lib/animations/aboutVisionHandoff'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'

const FINISH_PROGRESS = HANDOFF_BRIDGE_FINISH_PROGRESS
const RESET_PROGRESS = HANDOFF_BRIDGE_RESET_PROGRESS

function lerpRect(start: RectBox, end: RectBox, t: number): RectBox {
    return {
        left: gsap.utils.interpolate(start.left, end.left, t),
        top: gsap.utils.interpolate(start.top, end.top, t),
        width: gsap.utils.interpolate(start.width, end.width, t),
        height: gsap.utils.interpolate(start.height, end.height, t),
    }
}

export function AboutVisionHandoffTrack() {
    return null
}

type BridgeApi = ReturnType<typeof useAboutVisionHandoff>

function resolveBridgeTrigger(api: BridgeApi): HTMLElement | null {
    const slot = api.visionPanelSlotRef.current
    if (slot?.isConnected) return slot
    if (typeof window === 'undefined') return null
    if (window.matchMedia('(min-width: 1024px)').matches) {
        return document.querySelector<HTMLElement>(`[${VISION_PANEL_SLOT_ATTR}][data-vision-layout="lg"]`)
    }
    if (window.matchMedia('(min-width: 768px)').matches) {
        return document.querySelector<HTMLElement>(`[${VISION_PANEL_SLOT_ATTR}][data-vision-layout="md"]`)
    }
    return null
}

function createBridgeScrollHandler(api: BridgeApi) {
    const {
        handoffCardRef, visionPanelSlotRef, handoffStartRectRef,
        setHandoffComplete, setHandoffPhase, getHandoffPhase, setBridgeProgress,
        captureHandoffStartRect, clearHandoffStartRect, measureHandoffMountRect,
        measureHandoffMosaicTargetRect, floatHandoffCardAtCurrentRect,
        detachHandoffFromVisionSlotForMorph, reparentHandoffToVisionSlot,
        restoreHandoffToAbout, isHandoffInVisionSlot,
    } = api

    const getCard = () => handoffCardRef.current
    const getSlot = () => visionPanelSlotRef.current

    let slottedDetachDone = false
    let softResetDone = false
    let lastHandledProgress = -1

    const readMountRect = (): RectBox | null => {
        const slot = getSlot()
        return (
            measureHandoffMountRect() ??
            measureVisionHandoffTarget(slot) ??
            measureElementRect(slot) ??
            measureVisionPanelSlot(slot)
        )
    }

    const readMosaicRect = (): RectBox | null =>
        measureHandoffMosaicTargetRect() ?? handoffStartRectRef.current

    const ensureMosaicStartRect = (progress: number): boolean => {
        if (handoffStartRectRef.current) return true
        if (progress <= RESET_PROGRESS) return false
        return captureHandoffStartRect()
    }

    const ensureFloatingForMorph = (): boolean => {
        const card = getCard()
        if (!card) return false

        const phase = getHandoffPhase()
        const inSlot = isHandoffInVisionSlot()

        if (phase === 'slotted' && inSlot) {
            if (slottedDetachDone) return card.style.position === 'fixed'
            if (detachHandoffFromVisionSlotForMorph()) { slottedDetachDone = true; return true }
            return false
        }

        slottedDetachDone = false
        if (card.style.position === 'fixed') { setHandoffPhase('morphing'); return true }
        if (floatHandoffCardAtCurrentRect()) { setHandoffPhase('morphing'); return true }
        return false
    }

    const setFixedMorphRect = (box: RectBox, radius: number) => {
        const card = getCard()
        if (!card) return
        gsap.set(card, {
            position: 'fixed', left: box.left, top: box.top,
            width: box.width, height: box.height,
            margin: 0, zIndex: 61, pointerEvents: 'none',
            transformOrigin: 'center center',
            x: 0, y: 0, scale: 1, autoAlpha: 1,
            borderRadius: radius, clearProps: 'transform',
        })
    }

    const applyMorphAtProgress = (p: number): boolean => {
        const card = getCard()
        const mosaic = readMosaicRect()
        const mount = readMountRect()
        if (!card || !mosaic || !mount) return false
        if (!ensureFloatingForMorph()) return false
        const tRaw = gsap.utils.clamp(0, 1, gsap.utils.mapRange(RESET_PROGRESS, FINISH_PROGRESS, 0, 1, p))
        const t = 1 - (1 - tRaw) * (1 - tRaw)
        const box = lerpRect(mosaic, mount, t)
        const radius = gsap.utils.interpolate(16, 24, t)
        setFixedMorphRect(box, radius)
        if (getHandoffPhase() !== 'morphing') setHandoffPhase('morphing')
        return true
    }

    const finishHandoff = () => {
        if (getHandoffPhase() === 'slotted') return
        const card = getCard()
        if (card) gsap.set(card, { clearProps: 'all' })
        const reparented = reparentHandoffToVisionSlot()
        const slot = getSlot()
        if (slot) slot.setAttribute(VISION_HANDOFF_COMPLETE_ATTR, '')
        setHandoffComplete(reparented)
        slottedDetachDone = false
        softResetDone = false
    }

    // ─────────────────────────────────────────────────────────────────────────
    // softResetHandoff
    //
    // Called when progress drops back to ≤ RESET_PROGRESS (the About section
    // is back on screen and the morph should be fully reversed).
    //
    // Root cause of the original bug (confirmed by logs):
    //   The old code called applyFinalMosaicPosition() BEFORE restoreHandoffToAbout().
    //   applyFinalMosaicPosition tried detachHandoffFromVisionSlotForMorph() which
    //   always returns false after a completed reparentHandoffToVisionSlot() because
    //   handoffInVisionSlotRef is true and getBoundingClientRect() returns zero when
    //   the About section has scrolled off-screen.
    //
    // Second issue (why even the reordered version wasn't enough):
    //   Even after restoreHandoffToAbout(), calling floatHandoffCardAtCurrentRect()
    //   fails because the About section is scrolled out of the viewport — the card's
    //   getBoundingClientRect() returns a zero rect, so floatHandoffCardAtCurrentRect
    //   returns false and the card is left with stale GSAP inline styles.
    //
    // Correct approach:
    //   1. restoreHandoffToAbout()   — moves card back into About's DOM tree
    //   2. clearProps: 'all' on card — strips ALL GSAP inline styles unconditionally
    //      so the card re-flows naturally in its restored DOM position
    //   3. clearHandoffStartRect     — resets start rect so next forward pass recaptures
    //   No floating needed — the card is back in normal document flow.
    // ─────────────────────────────────────────────────────────────────────────
    const softResetHandoff = () => {
        if (getHandoffPhase() === 'mosaic') return
        if (softResetDone) return

        // Step 1: move card back into About's DOM tree.
        // This also sets handoffInVisionSlotRef = false and phase = 'mosaic'.
        restoreHandoffToAbout()

        // Step 2: clean up slot marker attribute.
        const slot = getSlot()
        if (slot) slot.removeAttribute(VISION_HANDOFF_COMPLETE_ATTR)

        // Step 3: strip all GSAP inline styles unconditionally.
        // Do NOT attempt to float or measure — the About section may be off-screen,
        // making getBoundingClientRect() return zero. clearProps: 'all' is sufficient:
        // the card is back in normal document flow and will re-flow to its natural position.
        const card = getCard()
        if (card) gsap.set(card, { clearProps: 'all' })

        // Step 4: reset shared state.
        clearHandoffStartRect()
        setHandoffComplete(false)
        setHandoffPhase('mosaic')
        slottedDetachDone = false
        softResetDone = true
    }

    return (progress: number) => {
        setBridgeProgress(progress)
        if (Math.abs(progress - lastHandledProgress) < 0.0001) return
        lastHandledProgress = progress

        if (progress > RESET_PROGRESS + 0.02) softResetDone = false

        if (progress <= RESET_PROGRESS) { softResetHandoff(); return }

        if (!ensureMosaicStartRect(progress)) {
            if (getHandoffPhase() === 'floating') setHandoffPhase('mosaic')
            return
        }

        if (progress >= FINISH_PROGRESS) { applyMorphAtProgress(1); finishHandoff(); return }

        applyMorphAtProgress(progress)
    }
}

function setupHandoffBridge(api: BridgeApi, scroll: { start: string; end: string }) {
    const trigger = resolveBridgeTrigger(api)
    if (!trigger) return () => { }
    const onHandoffScroll = createBridgeScrollHandler(api)
    const st = ScrollTrigger.create({
        trigger,
        start: scroll.start,
        end: scroll.end,
        scrub: true,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate(self) { onHandoffScroll(self.progress) },
    })
    requestAnimationFrame(() => { onHandoffScroll(st.progress) })
    return () => { st.kill() }
}

export function AboutVisionHandoffBridge() {
    const prefersReducedMotion = useReducedMotion()
    const api = useAboutVisionHandoff()
    const apiRef = useRef(api)
    useLayoutEffect(() => { apiRef.current = api })

    const {
        bridgeRootRef, visionPanelSlotRef,
        setHandoffComplete, setHandoffPhase,
        registerBridgeRebind,
    } = api

    useEffect(() => {
        if (prefersReducedMotion) {
            setHandoffPhase('slotted')
            setHandoffComplete(true)
            const slot = visionPanelSlotRef.current
            if (slot) slot.setAttribute(VISION_HANDOFF_COMPLETE_ATTR, '')
        }
    }, [prefersReducedMotion, setHandoffComplete, setHandoffPhase, visionPanelSlotRef])

    useGSAP(
        () => {
            if (prefersReducedMotion) return
            let activeCleanup: (() => void) | null = null
            const killActive = () => { activeCleanup?.(); activeCleanup = null }
            const bind = () => {
                killActive()
                const currentApi = apiRef.current
                if (!resolveBridgeTrigger(currentApi)) return
                if (window.matchMedia('(min-width: 1024px)').matches) {
                    activeCleanup = setupHandoffBridge(currentApi, { start: 'top 100%', end: 'top 0%' })
                } else if (window.matchMedia('(min-width: 768px)').matches) {
                    activeCleanup = setupHandoffBridge(currentApi, { start: 'top 100%', end: 'top 0%' })
                }
            }
            registerBridgeRebind(bind)
            bind()
            const onResize = () => { bind(); scheduleScrollTriggerRefresh() }
            window.addEventListener('resize', onResize)
            void document.fonts.ready.then(() => scheduleScrollTriggerRefresh())
            return () => {
                window.removeEventListener('resize', onResize)
                registerBridgeRebind(null)
                killActive()
            }
        },
        { scope: bridgeRootRef, dependencies: [prefersReducedMotion, registerBridgeRebind], revertOnUpdate: true }
    )

    if (prefersReducedMotion) return null

    return (
        <div
            ref={bridgeRootRef}
            className="pointer-events-none fixed inset-0 h-0 w-0 overflow-visible"
            style={{ zIndex: 61 }}
            aria-hidden
        />
    )
}