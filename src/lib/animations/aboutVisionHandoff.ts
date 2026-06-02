/** Shared About mosaic → Vision sticky panel handoff (reveal-06). */

/** Coordinator phases — only the bridge advances floating → morphing → slotted. */
export type HandoffPhase = 'mosaic' | 'floating' | 'morphing' | 'slotted'

export const HANDOFF_BRIDGE_FINISH_PROGRESS = 0.95
export const HANDOFF_BRIDGE_RESET_PROGRESS = 0.05

/** Bridge ST owns the shared card while progress is inside this band (exclusive endpoints). */
export function isBridgeMorphBand(progress: number): boolean {
  return progress > HANDOFF_BRIDGE_RESET_PROGRESS && progress < HANDOFF_BRIDGE_FINISH_PROGRESS
}

/** Canonical mosaic asset — only rendered once in AboutIntroSection. */
export const ABOUT_VISION_HANDOFF_IMAGE = '/images/about-us-reveal-06.png' as const

/** Do not load this path in the bridge or Vision panel; the mosaic card is the sole instance. */
export const ABOUT_VISION_HANDOFF_ALT = 'Aerial view of helicopter in flight' as const

export const ABOUT_HANDOFF_CARD_ATTR = 'data-about-handoff-card'
/** Stays in About column when the card is reparented — live reverse morph target. */
export const ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR = 'data-about-handoff-mosaic-anchor'
export const ABOUT_HANDOFF_PEER_ATTR = 'data-about-handoff-peer'
export const ABOUT_HANDOFF_IMAGE_ATTR = 'data-about-handoff-image'
export const VISION_PANEL_SLOT_ATTR = 'data-vision-panel-slot'
export const VISION_HANDOFF_MOUNT_ATTR = 'data-vision-handoff-mount'
/** Visible Our Vision frame — preferred rect for bridge landing (matches image card shell). */
export const VISION_HANDOFF_TARGET_ATTR = 'data-vision-handoff-target'
export const VISION_HANDOFF_BRIDGE_ATTR = 'data-vision-handoff-bridge'
export const VISION_HANDOFF_BRIDGE_INNER_ATTR = 'data-vision-handoff-bridge-inner'
/** ScrollTrigger target on VisionMissionSection (replaces empty spacer track). */
export const VISION_HANDOFF_TRIGGER_ATTR = 'data-vision-handoff-trigger'
export const VISION_HANDOFF_COMPLETE_ATTR = 'data-handoff-complete'

/** @deprecated Use VISION_HANDOFF_TRIGGER_ATTR — kept for grep compatibility. */
export const ABOUT_VISION_HANDOFF_TRACK_ATTR = 'data-vision-handoff-trigger'

/** Applied when the mosaic card is reparented into the Vision left panel (matches VisionMissionImageCard shell). */
export const HANDOFF_CARD_IN_SLOT_CLASS =
  'pointer-events-none absolute inset-0 z-0 !aspect-auto box-border h-full min-h-0 w-full max-w-none shrink overflow-hidden rounded-card border border-black/8 p-1.5 sm:p-2'

export type RectBox = {
  left: number
  top: number
  width: number
  height: number
}

/** Measure a visible element’s viewport rect for GSAP fixed bridge tweens. */
export function measureElementRect(el: HTMLElement | null): RectBox | null {
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

/** Vision left-panel slot — full column rect for bridge landing. */
export function measureVisionPanelSlot(el: HTMLElement | null): RectBox | null {
  return measureElementRect(el)
}

export function isHandoffComplete(el: HTMLElement | null): boolean {
  return el?.hasAttribute(VISION_HANDOFF_COMPLETE_ATTR) ?? false
}

export function getVisionHandoffMount(slot: HTMLElement | null): HTMLElement | null {
  if (!slot) return null
  return slot.querySelector<HTMLElement>(`[${VISION_HANDOFF_MOUNT_ATTR}]`)
}

/** Target rect for FLIP landing — frame shell, then mount, then slot. */
export function measureVisionHandoffTarget(slot: HTMLElement | null): RectBox | null {
  if (!slot) return null
  const frame = slot.querySelector<HTMLElement>(`[${VISION_HANDOFF_TARGET_ATTR}]`)
  if (frame) {
    const frameRect = measureElementRect(frame)
    if (frameRect) return frameRect
  }
  return measureElementRect(getVisionHandoffMount(slot))
}

/** @deprecated Prefer measureVisionHandoffTarget */
export function measureVisionHandoffMount(slot: HTMLElement | null): RectBox | null {
  return measureVisionHandoffTarget(slot)
}

/** Live mosaic landing rect from the in-column anchor (card may be on bridge). */
export function measureHandoffMosaicAnchor(
  anchor: HTMLElement | null,
  card: HTMLElement | null
): RectBox | null {
  if (card) {
    const parent = anchor?.parentElement
    if (parent?.contains(card)) {
      return measureElementRect(card)
    }
  }
  return measureElementRect(anchor)
}
