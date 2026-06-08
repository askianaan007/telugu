'use client'

// src/components/sections/HeliportSolutionsSection.tsx
// ──────────────────────────────────────────────────────
// Fix: replaced useSyncExternalStore (causes hydration flash + re-render) with
// CSS-driven visibility. All three tiers render in the DOM; only the correct one
// is visible via Tailwind responsive prefixes. This eliminates the mount-time
// layout shift and the brief wrong-tier flash.

import { HeliportSolutionsDesktop } from './heliport/HeliportSolutionsDesktop'
import { HeliportSolutionsTablet } from './heliport/HeliportSolutionsTablet'
import { HeliportSolutionsMobile } from './heliport/HeliportSolutionsMobile'

export function HeliportSolutionsSection() {
    return (
        <>
            {/* Mobile  : visible below 768px */}
            <div className="block md:hidden">
                <HeliportSolutionsMobile />
            </div>
            {/* Tablet  : visible 768px – 1023px */}
            <div className="hidden md:block lg:hidden">
                <HeliportSolutionsTablet />
            </div>
            {/* Desktop : visible 1024px+ */}
            <div className="hidden lg:block">
                <HeliportSolutionsDesktop />
            </div>
        </>
    )
}