'use client'

// src/components/sections/about/AboutVisionHandoffContext.tsx
// ──────────────────────────────────────────────────────────
// Direct copy from old project. No changes required.
// Provides the shared state machine for the mosaic → Vision panel handoff.

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from 'react'

import {
    ABOUT_HANDOFF_IMAGE_ATTR,
    getVisionHandoffMount,
    HANDOFF_CARD_IN_SLOT_CLASS,
    type HandoffPhase,
    measureHandoffMosaicAnchor,
    measureVisionHandoffTarget,
    type RectBox,
    VISION_HANDOFF_COMPLETE_ATTR,
} from '@/lib/animations/aboutVisionHandoff'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'

let scrollTriggerRefreshRaf = 0
let bridgeRebindRaf = 0

export function scheduleScrollTriggerRefresh() {
    if (typeof window === 'undefined') return
    if (scrollTriggerRefreshRaf) cancelAnimationFrame(scrollTriggerRefreshRaf)
    scrollTriggerRefreshRaf = requestAnimationFrame(() => {
        scrollTriggerRefreshRaf = 0
        ScrollTrigger.refresh()
    })
}

type AboutVisionHandoffContextValue = {
    handoffCardRef: RefObject<HTMLDivElement | null>
    visionPanelSlotRef: RefObject<HTMLDivElement | null>
    bridgeRootRef: RefObject<HTMLDivElement | null>
    handoffStartRectRef: RefObject<RectBox | null>
    handoffComplete: boolean
    setHandoffComplete: (complete: boolean) => void
    handoffPhase: HandoffPhase
    getHandoffPhase: () => HandoffPhase
    setHandoffPhase: (phase: HandoffPhase) => void
    isBridgeHandoffActive: () => boolean
    isHandoffMorphing: () => boolean
    bridgeOwnsHandoffCard: () => boolean
    isCardInMosaicOrigin: () => boolean
    bridgeProgressRef: RefObject<number>
    setBridgeProgress: (progress: number) => void
    captureHandoffStartRect: () => boolean
    clearHandoffStartRect: () => void
    measureHandoffMountRect: () => RectBox | null
    measureHandoffMosaicTargetRect: () => RectBox | null
    registerBridgeRebind: (fn: (() => void) | null) => void
    registerHandoffCard: (el: HTMLDivElement | null) => void
    registerMosaicAnchor: (el: HTMLElement | null) => void
    registerVisionPanelSlot: (el: HTMLDivElement | null) => void
    registerAboutPinScrollTrigger: (st: ScrollTrigger | null) => void
    setAboutPinHandoffSuppressed: (suppressed: boolean) => void
    isHandoffInVisionSlot: () => boolean
    promoteHandoffCard: () => boolean
    floatHandoffCardAtCurrentRect: () => boolean
    detachHandoffFromVisionSlotForMorph: () => boolean
    reparentHandoffToVisionSlot: () => boolean
    restoreHandoffToAbout: () => boolean
}

const AboutVisionHandoffContext = createContext<AboutVisionHandoffContextValue | null>(null)

function styleHandoffImageInSlot(card: HTMLDivElement) {
    const inner = card.querySelector<HTMLElement>(`[${ABOUT_HANDOFF_IMAGE_ATTR}]`)
    if (inner) {
        inner.classList.add('relative', 'h-full', 'w-full')
    }
    const img = card.querySelector<HTMLImageElement>('img')
    if (img) {
        img.classList.add('object-cover', 'object-[center_35%]', 'h-full', 'w-full')
    }
}

function applyFixedHandoffRect(card: HTMLDivElement, rect: RectBox) {
    gsap.set(card, {
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        margin: 0,
        zIndex: 61,
        pointerEvents: 'none',
        transformOrigin: 'center center',
        x: 0,
        y: 0,
        scale: 1,
        force3D: true,
        autoAlpha: 1,
    })
}

export function AboutVisionHandoffProvider({ children }: { children: ReactNode }) {
    const handoffCardRef = useRef<HTMLDivElement | null>(null)
    const visionPanelSlotRef = useRef<HTMLDivElement | null>(null)
    const bridgeRootRef = useRef<HTMLDivElement | null>(null)
    const handoffMosaicAnchorRef = useRef<HTMLElement | null>(null)
    const handoffStartRectRef = useRef<RectBox | null>(null)
    const handoffOriginParentRef = useRef<HTMLElement | null>(null)
    const handoffOriginNextSiblingRef = useRef<ChildNode | null>(null)
    const handoffOriginClassNameRef = useRef<string | null>(null)
    const handoffInVisionSlotRef = useRef(false)
    const handoffPhaseRef = useRef<HandoffPhase>('mosaic')
    const bridgeProgressRef = useRef(0)
    const [handoffComplete, setHandoffCompleteState] = useState(false)
    const [handoffPhase, setHandoffPhaseState] = useState<HandoffPhase>('mosaic')
    const bridgeRebindRef = useRef<(() => void) | null>(null)
    const aboutPinScrollTriggerRef = useRef<ScrollTrigger | null>(null)
    const aboutPinSuppressedRef = useRef(false)

    const setHandoffPhase = useCallback((phase: HandoffPhase) => {
        if (handoffPhaseRef.current === phase) return
        handoffPhaseRef.current = phase
        if (phase === 'floating') return
        setHandoffPhaseState((prev) => (prev === phase ? prev : phase))
    }, [])

    const setHandoffComplete = useCallback((complete: boolean) => {
        setHandoffCompleteState((prev) => (prev === complete ? prev : complete))
    }, [])

    const getHandoffPhase = useCallback(() => handoffPhaseRef.current, [])

    const isBridgeHandoffActive = useCallback(() => {
        const phase = handoffPhaseRef.current
        return phase === 'floating' || phase === 'morphing'
    }, [])

    const isHandoffMorphing = useCallback(() => {
        const phase = handoffPhaseRef.current
        return phase === 'floating' || phase === 'morphing'
    }, [])

    const isCardInMosaicOrigin = useCallback(() => {
        const card = handoffCardRef.current
        const parent = handoffOriginParentRef.current
        return Boolean(card && parent?.isConnected && parent.contains(card))
    }, [])

    const bridgeOwnsHandoffCard = useCallback(() => {
        return !isCardInMosaicOrigin() && handoffPhaseRef.current !== 'mosaic'
    }, [isCardInMosaicOrigin])

    const setBridgeProgress = useCallback((progress: number) => {
        bridgeProgressRef.current = progress
    }, [])

    const registerHandoffCard = useCallback((el: HTMLDivElement | null) => {
        if (!el) {
            if (handoffCardRef.current === el) handoffCardRef.current = null
            return
        }
        const rail = el.closest('[data-about-parallax-col-desktop], [data-about-parallax-col-mobile]')
        if (!rail) return
        const { width, height } = rail.getBoundingClientRect()
        if (width < 1 || height < 1) return
        handoffCardRef.current = el
    }, [])

    const registerMosaicAnchor = useCallback((el: HTMLElement | null) => {
        handoffMosaicAnchorRef.current = el
    }, [])

    const registerBridgeRebind = useCallback((fn: (() => void) | null) => {
        bridgeRebindRef.current = fn
    }, [])

    const scheduleBridgeRebind = useCallback(() => {
        if (bridgeRebindRaf) cancelAnimationFrame(bridgeRebindRaf)
        bridgeRebindRaf = requestAnimationFrame(() => {
            bridgeRebindRaf = 0
            bridgeRebindRef.current?.()
            scheduleScrollTriggerRefresh()
        })
    }, [])

    const registerVisionPanelSlot = useCallback(
        (el: HTMLDivElement | null) => {
            if (visionPanelSlotRef.current === el) return
            visionPanelSlotRef.current = el
            if (el?.isConnected) scheduleBridgeRebind()
        },
        [scheduleBridgeRebind]
    )

    const registerAboutPinScrollTrigger = useCallback((st: ScrollTrigger | null) => {
        aboutPinScrollTriggerRef.current = st
        if (st && aboutPinSuppressedRef.current) {
            st.disable(false, false)
        }
    }, [])

    const setAboutPinHandoffSuppressed = useCallback((suppressed: boolean) => {
        if (aboutPinSuppressedRef.current === suppressed) return
        aboutPinSuppressedRef.current = suppressed
        const st = aboutPinScrollTriggerRef.current
        if (!st) return
        if (suppressed) {
            st.disable(false, false)
        } else {
            st.enable(false, false)
        }
    }, [])

    const isHandoffInVisionSlot = useCallback(() => handoffInVisionSlotRef.current, [])

    const captureHandoffStartRect = useCallback((): boolean => {
        const el = handoffCardRef.current
        if (!el) return false
        const rect = el.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return false
        handoffStartRectRef.current = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
        }
        return true
    }, [])

    const clearHandoffStartRect = useCallback(() => {
        handoffStartRectRef.current = null
    }, [])

    const measureHandoffMountRect = useCallback((): RectBox | null => {
        return measureVisionHandoffTarget(visionPanelSlotRef.current)
    }, [])

    const measureHandoffMosaicTargetRect = useCallback((): RectBox | null => {
        const live = measureHandoffMosaicAnchor(handoffMosaicAnchorRef.current, handoffCardRef.current)
        if (live) return live
        return handoffStartRectRef.current
    }, [])

    const promoteHandoffCard = useCallback((): boolean => {
        const card = handoffCardRef.current
        if (!card) return false
        // If origin info was already captured (during forward morph), we're good —
        // even if the card is currently in the vision slot (reverse detach path).
        if (handoffOriginParentRef.current) return true
        // First promotion: card must NOT already be in the vision slot.
        if (handoffInVisionSlotRef.current) return false
        const parent = card.parentElement
        if (!parent) return false
        handoffOriginParentRef.current = parent
        handoffOriginNextSiblingRef.current = card.nextSibling
        handoffOriginClassNameRef.current = card.className
        return true
    }, [])

    const floatHandoffCardAtCurrentRect = useCallback((): boolean => {
        const card = handoffCardRef.current
        if (!card || handoffInVisionSlotRef.current) return false
        const rect = card.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return false
        if (!promoteHandoffCard()) return false
        const host = bridgeRootRef.current ?? document.body
        host.appendChild(card)
        handoffStartRectRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
        applyFixedHandoffRect(card, handoffStartRectRef.current)
        setHandoffPhase('floating')
        return true
    }, [promoteHandoffCard, setHandoffPhase])

    const detachHandoffFromVisionSlotForMorph = useCallback((): boolean => {
        const card = handoffCardRef.current
        const slot = visionPanelSlotRef.current
        if (!card || !handoffInVisionSlotRef.current) return false
        const rect = card.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return false
        if (!promoteHandoffCard()) return false
        const host = bridgeRootRef.current ?? document.body
        host.appendChild(card)
        if (handoffOriginClassNameRef.current) card.className = handoffOriginClassNameRef.current
        handoffInVisionSlotRef.current = false
        slot?.removeAttribute(VISION_HANDOFF_COMPLETE_ATTR)
        applyFixedHandoffRect(card, { left: rect.left, top: rect.top, width: rect.width, height: rect.height })
        setHandoffPhase('morphing')
        return true
    }, [promoteHandoffCard, setHandoffPhase])

    const reparentHandoffToVisionSlot = useCallback((): boolean => {
        const card = handoffCardRef.current
        const slot = visionPanelSlotRef.current
        const mount = getVisionHandoffMount(slot)
        if (!card || !mount) return false
        mount.appendChild(card)
        card.className = HANDOFF_CARD_IN_SLOT_CLASS
        styleHandoffImageInSlot(card)
        handoffInVisionSlotRef.current = true
        setHandoffPhase('slotted')
        return true
    }, [setHandoffPhase])

    const restoreHandoffToAbout = useCallback((): boolean => {
        const card = handoffCardRef.current
        const parent = handoffOriginParentRef.current
        if (!card || !parent) return false
        if (card.parentNode === parent) return true
        const next = handoffOriginNextSiblingRef.current
        if (next && next.parentNode === parent) {
            parent.insertBefore(card, next)
        } else {
            parent.appendChild(card)
        }
        if (handoffOriginClassNameRef.current) card.className = handoffOriginClassNameRef.current
        handoffInVisionSlotRef.current = false
        setHandoffPhase('mosaic')
        return true
    }, [setHandoffPhase])

    const value = useMemo(
        () => ({
            handoffCardRef,
            visionPanelSlotRef,
            bridgeRootRef,
            handoffStartRectRef,
            handoffComplete,
            setHandoffComplete,
            handoffPhase,
            getHandoffPhase,
            setHandoffPhase,
            isBridgeHandoffActive,
            isHandoffMorphing,
            bridgeOwnsHandoffCard,
            isCardInMosaicOrigin,
            bridgeProgressRef,
            setBridgeProgress,
            captureHandoffStartRect,
            clearHandoffStartRect,
            measureHandoffMountRect,
            measureHandoffMosaicTargetRect,
            registerBridgeRebind,
            registerHandoffCard,
            registerMosaicAnchor,
            registerVisionPanelSlot,
            registerAboutPinScrollTrigger,
            setAboutPinHandoffSuppressed,
            isHandoffInVisionSlot,
            promoteHandoffCard,
            floatHandoffCardAtCurrentRect,
            detachHandoffFromVisionSlotForMorph,
            reparentHandoffToVisionSlot,
            restoreHandoffToAbout,
        }),
        [
            handoffComplete, handoffPhase, getHandoffPhase, setHandoffPhase,
            isBridgeHandoffActive, isHandoffMorphing, bridgeOwnsHandoffCard,
            isCardInMosaicOrigin, setBridgeProgress, captureHandoffStartRect,
            clearHandoffStartRect, measureHandoffMountRect, measureHandoffMosaicTargetRect,
            registerBridgeRebind, registerHandoffCard, registerMosaicAnchor,
            registerVisionPanelSlot, registerAboutPinScrollTrigger, setAboutPinHandoffSuppressed,
            isHandoffInVisionSlot, promoteHandoffCard, floatHandoffCardAtCurrentRect,
            detachHandoffFromVisionSlotForMorph, reparentHandoffToVisionSlot,
            restoreHandoffToAbout, setHandoffComplete,
        ]
    )

    return (
        <AboutVisionHandoffContext.Provider value={value}>
            {children}
        </AboutVisionHandoffContext.Provider>
    )
}

export function useAboutVisionHandoff() {
    const ctx = useContext(AboutVisionHandoffContext)
    if (!ctx) throw new Error('useAboutVisionHandoff must be used within AboutVisionHandoffProvider')
    return ctx
}

export function useAboutVisionHandoffOptional() {
    return useContext(AboutVisionHandoffContext)
}