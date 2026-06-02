'use client'

import { forwardRef } from 'react'
import { ConcentricGlowRings } from '@/components/sections/about/ConcentricGlowRings'
import { cn } from '@/lib/utils'

interface AboutHelicopterRingsProps {
    className?: string
}

export const AboutHelicopterRings = forwardRef<HTMLDivElement, AboutHelicopterRingsProps>(
    function AboutHelicopterRings({ className }, ref) {
        return (
            <div
                aria-hidden
                className={cn(
                    'pointer-events-none relative z-0 flex h-full min-h-svh w-full max-w-[min(100%,100vw)] flex-col items-center justify-center overflow-hidden px-2 sm:px-4 md:px-0',
                    className
                )}
            >
                <div className="relative isolate size-[min(76vw,260px)] shrink-0 sm:size-[min(76vw,260px)] md:size-[min(82vw,570px)] lg:size-[min(84vw,510px)] xl:size-[min(86vw,560px)] contain-layout">
                    <div
                        ref={ref}
                        data-about-rings-layer
                        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center will-change-[opacity,transform]"
                    >
                        <ConcentricGlowRings className="max-h-full max-w-full" />
                    </div>
                </div>
            </div>
        )
    }
)