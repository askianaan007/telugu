/**
 * src/types/global.d.ts
 *
 * Extend the Window interface to type the bridge properties used by
 * preScroll.ts to communicate with LenisProvider without React context.
 *
 * Add this file to your src/types/ directory (create it if it doesn't exist).
 */

import type Lenis from 'lenis'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'

declare global {
    interface Window {
        /** Lenis instance, set by LenisProvider on mount. */
        __lenis?: Lenis
        /**
         * The exact function reference added to gsap.ticker.
         * preScroll.ts removes this during pre-scroll and re-adds it after.
         */
        __lenisTicker?: (time: number) => void
        /**
         * GSAP ScrollTrigger static, set by LenisProvider after import.
         * preScroll.ts calls .refresh(true) after the pre-scroll completes.
         */
        __ScrollTrigger?: typeof ScrollTrigger
    }
}

export {}