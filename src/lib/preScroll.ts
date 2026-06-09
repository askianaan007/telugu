/**
 */

const TAG = '[preScroll]'

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Single RAF tick, abortable. */
function nextFrame(signal?: AbortSignal): Promise<DOMHighResTimeStamp> {
    return new Promise((resolve, reject) => {
        const id = requestAnimationFrame((ts) => {
            if (signal?.aborted) {
                reject(new DOMException('Aborted', 'AbortError'))
            } else {
                resolve(ts)
            }
        })
        signal?.addEventListener('abort', () => {
            cancelAnimationFrame(id)
            reject(new DOMException('Aborted', 'AbortError'))
        }, { once: true })
    })
}

/** Wait N animation frames. */
async function waitFrames(n: number, signal?: AbortSignal): Promise<void> {
    for (let i = 0; i < n; i++) {
        await nextFrame(signal)
    }
}

/** Fonts ready, capped at 3 s. */
function waitForFonts(): Promise<void> {
    return Promise.race([
        document.fonts.ready
            .then(() => { console.log(`${TAG} ✓ fonts ready`) })
            .catch(() => { console.warn(`${TAG} ✗ fonts.ready rejected, continuing`) }),
        new Promise<void>(r => setTimeout(() => {
            console.warn(`${TAG} ✗ fonts timed out after 3 s, continuing`)
            r()
        }, 3_000)),
    ])
}

/**
 * Wait for high-priority images (no loading="lazy") that haven't decoded yet.
 * Capped at 5 s total so a broken image never blocks the reveal.
 */
function waitForCriticalImages(): Promise<void> {
    const imgs = Array.from(
        document.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])')
    ).filter(img => !img.complete)

    if (!imgs.length) {
        console.log(`${TAG} ✓ no pending critical images`)
        return Promise.resolve()
    }

    console.log(`${TAG} waiting for ${imgs.length} critical image(s)…`, imgs.map(i => i.src))

    const settled = imgs.map(img =>
        new Promise<void>(resolve => {
            img.addEventListener('load', () => {
                console.log(`${TAG} ✓ image loaded:`, img.src)
                resolve()
            }, { once: true })
            img.addEventListener('error', () => {
                console.warn(`${TAG} ✗ image error:`, img.src)
                resolve()
            }, { once: true })
        })
    )

    return Promise.race([
        Promise.all(settled).then(() => { console.log(`${TAG} ✓ all critical images settled`) }),
        new Promise<void>(r => setTimeout(() => {
            console.warn(`${TAG} ✗ critical images timed out after 5 s, continuing`)
            r()
        }, 5_000)),
    ])
}

// ─── Scroll helpers ───────────────────────────────────────────────────────────

/**
 * Imperatively scroll window in viewport-sized steps using requestAnimationFrame.
 *
 * Step = 1× window.innerHeight guarantees every possible IntersectionObserver
 * threshold (the common ones are 0.1, 0.2, 0.3, 0.5, 1.0) and every
 * ScrollTrigger start/end marker is crossed before we arrive.
 *
 * We bypass Lenis entirely and write directly to the native scroll position.
 */
async function driveScrollTo(target: number, signal?: AbortSignal): Promise<void> {
    const step = window.innerHeight
    const direction = target > (window.scrollY ?? 0) ? 1 : -1
    let pos = window.scrollY ?? 0
    let frames = 0

    console.log(`${TAG} driveScrollTo → target=${target} from pos=${Math.round(pos)} step=${step}`)

    while (true) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

        const remaining = target - pos
        if (Math.abs(remaining) < 1) break

        pos += Math.min(Math.abs(remaining), step) * direction
        frames++

        window.scrollTo({ top: pos, behavior: 'instant' as ScrollBehavior })
        document.documentElement.scrollTop = pos

        await nextFrame(signal)
    }

    window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior })
    document.documentElement.scrollTop = target
    console.log(`${TAG} ✓ driveScrollTo done — arrived at ${Math.round(target)} in ${frames} frame(s)`)
}

// ─── Lenis pause / resume ─────────────────────────────────────────────────────

/**
 * Lenis is driven by gsap.ticker in this project.
 * lenis.stop() sets an internal flag but the GSAP ticker still calls lenis.raf()
 * every frame and overrides window.scroll position.
 *
 * Fix: remove the ticker callback entirely during pre-scroll, then re-add it.
 * LenisProvider stores the callback reference on window.__lenisTicker.
 */
function pauseLenis(): void {
    const lenis = window.__lenis
    const ticker = window.__lenisTicker

    if (!lenis) {
        console.warn(`${TAG} ✗ window.__lenis not found — Lenis may not be mounted yet`)
    }
    if (!ticker) {
        console.warn(`${TAG} ✗ window.__lenisTicker not found — ticker removal skipped`)
    }

    if (lenis) {
        lenis.stop()
        console.log(`${TAG} ✓ lenis.stop() called`)
    }

    if (ticker) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { gsap } = require('@/lib/animations/gsap') as typeof import('@/lib/animations/gsap')
            gsap.ticker.remove(ticker)
            console.log(`${TAG} ✓ gsap.ticker.remove(lenisTicker) called`)
        } catch (e) {
            console.error(`${TAG} ✗ gsap.ticker.remove failed:`, e)
        }
    }
}

function resumeLenis(): void {
    const lenis = window.__lenis
    const ticker = window.__lenisTicker

    if (ticker) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { gsap } = require('@/lib/animations/gsap') as typeof import('@/lib/animations/gsap')
            gsap.ticker.add(ticker)
            console.log(`${TAG} ✓ gsap.ticker.add(lenisTicker) called — Lenis RAF restored`)
        } catch (e) {
            console.error(`${TAG} ✗ gsap.ticker.add failed:`, e)
        }
    }

    if (lenis) {
        lenis.scrollTo(0, { immediate: true })
        lenis.start()
        lenis.resize()
        console.log(`${TAG} ✓ lenis.scrollTo(0) + start() + resize() called`)
    }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Run the full hidden pre-scroll sequence.
 * Call this while the loader is still covering the viewport.
 */
export async function preScrollPage(signal?: AbortSignal): Promise<void> {
    if (typeof window === 'undefined') return

    console.log(`${TAG} ─── preScrollPage START ───`)
    const t0 = performance.now()

    // 1. Wait for fonts + images
    console.log(`${TAG} [1/9] waiting for fonts + critical images…`)
    await Promise.all([waitForFonts(), waitForCriticalImages()])
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    // 2. Let browser finish pending layout
    console.log(`${TAG} [2/9] waiting 3 layout frames…`)
    await waitFrames(3, signal)

    // 3. Measure page height (forces reflow — intentional)
    const pageHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
    )
    const scrollMax = Math.max(0, pageHeight - window.innerHeight)
    console.log(`${TAG} [3/9] page height=${pageHeight} innerHeight=${window.innerHeight} scrollMax=${scrollMax}`)

    if (scrollMax < 1) {
        console.log(`${TAG} ✓ page fits in viewport — skipping scroll, refreshing ST`)
        window.__ScrollTrigger?.refresh(true)
        return
    }

    // 4. Hard-reset to top
    console.log(`${TAG} [4/9] hard-reset scroll to 0`)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    document.documentElement.scrollTop = 0

    // 5. Pause Lenis + remove its gsap.ticker callback
    console.log(`${TAG} [5/9] pausing Lenis + removing gsap ticker…`)
    pauseLenis()

    try {
        // 6. Scroll DOWN
        console.log(`${TAG} [6/9] scrolling DOWN to ${scrollMax}…`)
        await driveScrollTo(scrollMax, signal)
        await waitFrames(2, signal)

        // 7. Scroll back UP to 0
        console.log(`${TAG} [7/9] scrolling UP to 0…`)
        await driveScrollTo(0, signal)
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
        document.documentElement.scrollTop = 0
        await waitFrames(2, signal)
        console.log(`${TAG} ✓ back at top — window.scrollY=${window.scrollY}`)

        // 8. Refresh ScrollTrigger
        console.log(`${TAG} [8/9] refreshing ScrollTrigger…`)
        const ST = window.__ScrollTrigger
        if (ST) {
            ST.refresh(true)
            await waitFrames(2, signal)
            console.log(`${TAG} ✓ ScrollTrigger.refresh(true) done`)
        } else {
            console.warn(`${TAG} ✗ window.__ScrollTrigger not found — refresh skipped`)
        }

    } finally {
        // 9. Always resume Lenis
        console.log(`${TAG} [9/9] resuming Lenis…`)
        resumeLenis()

        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
        document.documentElement.scrollTop = 0

        const elapsed = (performance.now() - t0).toFixed(1)
        console.log(`${TAG} ─── preScrollPage DONE in ${elapsed}ms — final scrollY=${window.scrollY} ───`)
    }
}